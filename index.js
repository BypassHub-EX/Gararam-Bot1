// index.js - Bloom Haven Bot (Full Merged with Ticket System)
require('dotenv').config();
const {
  Client, GatewayIntentBits, Partials, EmbedBuilder, ButtonBuilder, ButtonStyle,
  ActionRowBuilder, StringSelectMenuBuilder, ChannelType, PermissionsBitField, Events
} = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const PORT = process.env.PORT || 8080;
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const TICKET_CATEGORY_ID = "1401962962515918868";

const sentOrders = new Set();
const messageMap = {};

app.use(bodyParser.json());

// Shopify webhook order DM + log logic
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
    const refundButton = new ButtonBuilder().setCustomId(`refund_${orderID}_${discordID}`).setLabel('Request Refund').setStyle(ButtonStyle.Danger);
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

  return `✅ **Order Confirmed**
🧾 Order ID: \`#${orderID}\`
🎮 Roblox Username: \`${robloxUsername}\`
💳 Payment Method: ${method}

${instructions}

Your order will be prepared after verification.
Thanks for ordering from Bloom Haven.

_Type AR for Arabic translation 🙂_`;
}

// Refund button interaction
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  const [action, orderID, userID] = interaction.customId.split('_');
  if (action !== 'refund') return;
  if (interaction.user.id !== userID) return interaction.reply({ content: '❌ Only the original buyer can request a refund.', ephemeral: true });
  const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
  const refundEmbed = new EmbedBuilder()
    .setTitle('🔁 Refund Requested')
    .setDescription(`Order \`#${orderID}\` has been refunded by <@${userID}>.`)
    .setColor('Red').setTimestamp();
  if (logChannel) logChannel.send({ embeds: [refundEmbed] });
  await interaction.reply({ content: '✅ Your refund request has been submitted.', ephemeral: true });
});

// AR reply logic
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

// Ticket command /ptbuy
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'ptbuy') {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('select_topic')
      .setPlaceholder('Choose a topic')
      .addOptions([
        { label: 'Order Help', value: 'order_help' },
        { label: 'Trade Inquiry', value: 'trade_inquiry' },
        { label: 'Report Issue', value: 'report_issue' }
      ]);
    const row = new ActionRowBuilder().addComponents(menu);
    await interaction.reply({ content: 'Choose your topic to open a ticket:', components: [row], ephemeral: true });
  } else if (interaction.isStringSelectMenu() && interaction.customId === 'select_topic') {
    const topic = interaction.values[0];
    const guild = interaction.guild;
    const user = interaction.user;

    const channel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: ChannelType.GuildText,
      parent: TICKET_CATEGORY_ID,
      permissionOverwrites: [
        { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: '1390980326964072560', allow: [PermissionsBitField.Flags.ViewChannel] }, // Founder
        { id: '1390980398556909690', allow: [PermissionsBitField.Flags.ViewChannel] }, // Co-Founder
        { id: '1401961773166362794', allow: [PermissionsBitField.Flags.ViewChannel] }  // Mods
      ]
    });

    const claim = new ButtonBuilder().setCustomId('claim').setLabel('Claim').setStyle(ButtonStyle.Primary);
    const unclaim = new ButtonBuilder().setCustomId('unclaim').setLabel('Unclaim').setStyle(ButtonStyle.Secondary);
    const close = new ButtonBuilder().setCustomId('close').setLabel('Close').setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(claim, unclaim, close);

    await channel.send({
      content: `Welcome <@${user.id}>! <@&1390980326964072560> <@&1390980398556909690> <@&1401961773166362794>`,
      components: [row]
    });

    await interaction.update({ content: `✅ Ticket created: <#${channel.id}>`, components: [] });
  } else if (interaction.isButton()) {
    const channel = interaction.channel;
    if (interaction.customId === 'claim') {
      await interaction.reply({ content: `🔒 Claimed by <@${interaction.user.id}>`, ephemeral: false });
    } else if (interaction.customId === 'unclaim') {
      await interaction.reply({ content: `🔓 Unclaimed.`, ephemeral: false });
    } else if (interaction.customId === 'close') {
      await interaction.reply({ content: `🛑 Closing ticket in 5 seconds...`, ephemeral: false });
      setTimeout(() => channel.delete().catch(console.error), 5000);
    }
  }
});

client.once('ready', () => {
  console.log(`✅ Bloom Haven Bot is online as ${client.user.tag}`);
  app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));
});

// Slash command register
const { REST, Routes } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(TOKEN);
const commands = [
  {
    name: 'ptbuy',
    description: 'Open a support ticket to buy or trade'
  }
];
(async () => {
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('✅ Slash commands registered!');
  } catch (err) {
    console.error('❌ Error registering commands:', err);
  }
})();
client.login(TOKEN);
