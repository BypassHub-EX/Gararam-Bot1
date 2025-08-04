require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Events, PermissionFlagsBits } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

const PORT = process.env.PORT || 8080;
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

app.use(bodyParser.json());

const sentOrders = new Set();
const messageMap = {};

app.post('/shopify-webhook', async (req, res) => {
  const order = req.body;

  const robloxUsername = order?.customer?.first_name || 'Unknown';
  const discordID = order?.customer?.last_name || null;
  const orderID = order?.id?.toString().slice(-4) || 'Unknown';
  const items = order?.line_items?.map(item => `${item.name} x${item.quantity}`).join(', ') || 'None';
  const total = order?.total_price || 'Unknown';
  const method = order?.payment_gateway_names?.[0] || 'Unknown';
  const landing = order?.landing_site?.toLowerCase() || '';
  const isArabic = landing.includes('/ar') || landing.includes('bloomhaven.store/ar');
  const language = isArabic ? 'Arabic' : 'English';

  if (sentOrders.has(orderID)) return res.sendStatus(200);
  sentOrders.add(orderID);

  const userMention = discordID ? `<@${discordID}>` : 'Unknown';

  const embed = new EmbedBuilder()
    .setTitle('📦 New Order')
    .addFields(
      { name: 'User', value: userMention, inline: true },
      { name: 'Order ID', value: `#${orderID}`, inline: true },
      { name: 'Items', value: items },
      { name: 'Total', value: `$${total}`, inline: true },
      { name: 'Payment Method', value: method, inline: true },
      { name: 'Language', value: isArabic ? '🇸🇦 Arabic' : '🇺🇸 English', inline: true }
    )
    .setTimestamp()
    .setColor('Blue');

  const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
  if (logChannel) logChannel.send({ embeds: [embed] });

  if (discordID) {
    const dmContent = await generateDM({ language, orderID, robloxUsername, method, total });
    const refundButton = new ButtonBuilder()
      .setCustomId(`refund_${orderID}_${discordID}`)
      .setLabel('Request Refund')
      .setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(refundButton);

    try {
      const user = await client.users.fetch(discordID);
      const dm = await user.send({ content: dmContent, components: [row] });
      messageMap[orderID] = dm.id;
      if (logChannel) logChannel.send(`✅ DM sent to <@${discordID}>`);
    } catch {
      if (logChannel) logChannel.send(`❌ Failed to DM <@${discordID}>`);
    }
  }

  res.sendStatus(200);
});

function generateDM({ language, orderID, robloxUsername, method, total }) {
  const links = {
    'PayPal': 'https://www.paypal.com/paypalme/oilmoney001',
    'Ko-fi': 'https://ko-fi.com/oilmoney01',
    'Trade With Us': 'http://discord.gg/bloomhaven1'
  };
  const link = links[method] || 'Unavailable';

  const instructions = method === 'Trade With Us'
    ? `Please open a ticket in our Discord: ${link}\nSelect "Pay By Trading" to proceed.`
    : `Send $${total} via the link below:\n${link}\nMake sure your name matches the order.`;

  return (
`✅ **Order Confirmed**
🧾 Order ID: \`#${orderID}\`
🎮 Roblox Username: \`${robloxUsername}\`
💳 Payment Method: ${method}

${instructions}

Your order will be prepared after verification.
Thanks for ordering from Bloom Haven.

_Type AR for Arabic translation 🙂_`
  );
}

client.on(Events.InteractionCreate, async interaction => {
  // Refund Button
  if (interaction.isButton() && interaction.customId.startsWith('refund_')) {
    const [_, orderID, userID] = interaction.customId.split('_');
    if (interaction.user.id !== userID) return interaction.reply({ content: '❌ Only the original buyer can request a refund.', ephemeral: true });

    const refundEmbed = new EmbedBuilder()
      .setTitle('🔁 Refund Requested')
      .setDescription(`Order \`#${orderID}\` has been refunded by <@${userID}>.`)
      .setColor('Red')
      .setTimestamp();

    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
    if (logChannel) logChannel.send({ embeds: [refundEmbed] });

    await interaction.reply({ content: '✅ Your refund request has been submitted. Staff will process it shortly.', ephemeral: true });
  }

  // Ticket Select
  if (interaction.isStringSelectMenu() && interaction.customId === 'ptbuy_select') {
    const topicValue = interaction.values[0];
    const user = interaction.user;
    const categoryId = '1401962962515918868';

    const channel = await interaction.guild.channels.create({
      name: `ticket-${user.username}`.toLowerCase(),
      type: 0,
      parent: categoryId,
      permissionOverwrites: [
        { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
        { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: 'FounderRoleID', allow: [PermissionFlagsBits.ViewChannel] },
        { id: 'CoFounderRoleID', allow: [PermissionFlagsBits.ViewChannel] },
        { id: 'ModsRoleID', allow: [PermissionFlagsBits.ViewChannel] }
      ],
    });

    const claimBtn = new ButtonBuilder()
      .setCustomId('claim_ticket')
      .setLabel('🎟 Claim')
      .setStyle(ButtonStyle.Primary);
    const unclaimBtn = new ButtonBuilder()
      .setCustomId('unclaim_ticket')
      .setLabel('🛑 Unclaim')
      .setStyle(ButtonStyle.Secondary);
    const closeBtn = new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('❌ Close')
      .setStyle(ButtonStyle.Danger);
    const btnRow = new ActionRowBuilder().addComponents(claimBtn, unclaimBtn, closeBtn);

    const embed = new EmbedBuilder()
      .setTitle(`📩 New Ticket: ${topicValue}`)
      .setDescription(`Hello <@${user.id}>!\nA staff member will assist you shortly.\n\n<@FounderID> <@CoFounderID> <@ModsID>`)
      .setColor('Blue')
      .setTimestamp();

    await channel.send({ content: `<@${user.id}>`, embeds: [embed], components: [btnRow] });
    await interaction.reply({ content: `✅ Ticket created: ${channel}`, ephemeral: true });
  }

  // Claim/Unclaim/Close Logic
  if (interaction.isButton()) {
    const channel = interaction.channel;

    if (interaction.customId === 'claim_ticket') {
      await channel.permissionOverwrites.edit(interaction.user.id, {
        SendMessages: true,
        ViewChannel: true,
      });
      await interaction.reply({ content: `🎟 Ticket claimed by <@${interaction.user.id}>`, ephemeral: false });
    }

    if (interaction.customId === 'unclaim_ticket') {
      await channel.permissionOverwrites.edit(interaction.user.id, {
        SendMessages: false,
        ViewChannel: false,
      });
      await interaction.reply({ content: `🛑 Ticket unclaimed by <@${interaction.user.id}>`, ephemeral: false });
    }

    if (interaction.customId === 'close_ticket') {
      await interaction.reply({ content: '❌ Ticket will be closed in 5 seconds.', ephemeral: true });
      setTimeout(() => channel.delete().catch(console.error), 5000);
    }
  }
});

client.on('messageCreate', async message => {
  if (!message.guild && message.content.trim().toLowerCase() === 'ar') {
    const orderID = Object.entries(messageMap).find(([_, msgId]) => msgId === message.reference?.messageId)?.[0];
    if (!orderID) return;
    const userID = message.author.id;
    const user = await client.users.fetch(userID);
    const content = await generateDM({ language: 'Arabic', orderID, robloxUsername: 'مستخدم', method: 'PayPal', total: '??' });
    user.send(content);
  }
});

client.once('ready', () => {
  console.log(`✅ Bloom Haven Bot is online as ${client.user.tag}`);
  app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));
});

// Slash Command Registration
const { REST, Routes } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(TOKEN);
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if ('data' in command && 'execute' in command) commands.push(command.data.toJSON());
}

(async () => {
  try {
    console.log('📡 Registering slash commands...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('✅ Slash commands registered!');
  } catch (err) {
    console.error('❌ Error registering commands:', err);
  }
})();

client.login(TOKEN);
