require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers
  ],
  partials: ['CHANNEL']
});

// === SLASH COMMAND LOADER ===
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
  console.log(`✅ Bloom Haven Bot is online as ${client.user.tag}`);
  const { REST, Routes } = require('discord.js');
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const commands = commandFiles.map(file => require(`./commands/${file}`).data.toJSON());

  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('✅ Slash commands registered.');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
});

// === Handle DM forwarding to log channel ===
client.on('messageCreate', async message => {
  if (message.author.bot || message.guild) return;
  const logChannelId = '1399416161631993866';
  const logChannel = await client.channels.fetch(logChannelId).catch(() => null);
  if (!logChannel) return;
  const content = message.content || '[No text]';
  const attachments = message.attachments.map(att => att.url);
  const log = `📨 **DM from ${message.author.tag}** (\`${message.author.id}\`)\n> ${content}\n\n🛠️ To reply use:\n\`/reply user:${message.author.id} message:<your message>\``;
  await logChannel.send({ content: log, files: attachments.length > 0 ? attachments : undefined });
});

// === EXPRESS SERVER FOR SHOPIFY WEBHOOK ===
const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('🌸 Bloom Haven Bot is online and accepting webhooks!');
});

app.post('/shopify-webhook', async (req, res) => {
  const order = req.body;
  console.log('🔔 New order webhook received!');
  const isArabic = order?.landing_site?.includes('/ar');

  const userDiscordId = order?.note_attributes?.find(attr =>
    attr.name.toLowerCase().includes('discord')
  )?.value;

  if (!userDiscordId) {
    console.warn('⚠️ Discord ID not found in note_attributes');
    return res.status(400).send('Missing Discord ID');
  }

  const user = await client.users.fetch(userDiscordId).catch(() => null);
  if (!user) {
    console.warn('⚠️ User not found on Discord:', userDiscordId);
    return res.status(404).send('User not found');
  }

  const itemNames = order?.line_items?.map(i => i.name).join(', ') || 'Unknown';
  const total = order?.total_price || '?';
  const orderId = order?.order_number || '?';

  const message = isArabic
    ? `🧾 **تم استلام طلبك في بلوم هيفن!**\n\n🛍️ المنتجات: ${itemNames}\n💵 المبلغ: ${total}$\n📦 رقم الطلب: #${orderId}\n\nيرجى إتمام الدفع حسب الطريقة المحددة.\n– فريق بلوم هيفن`
    : `🧾 **Your Bloom Haven order has been received!**\n\n🛍️ Items: ${itemNames}\n💵 Total: $${total}\n📦 Order ID: #${orderId}\n\nPlease proceed with payment.\n– Bloom Haven Team`;

  const logChannel = await client.channels.fetch('1397212138753495062');

  try {
    await user.send(message);
    const embed = new EmbedBuilder()
      .setTitle(isArabic ? '📦 تم استلام طلب جديد' : '📦 New Order Received')
      .setDescription(`**User:** <@${user.id}>\n**Order ID:** #${orderId}\n**Items:** ${itemNames}\n**Total:** $${total}\n**Lang:** ${isArabic ? '🇸🇦 Arabic' : '🇺🇸 English'}`)
      .setColor(isArabic ? 0xf1c40f : 0x5865f2)
      .setTimestamp();
    await logChannel.send({ embeds: [embed] });
    await logChannel.send(`✅ DM sent to <@${user.id}>`);
    return res.status(200).send('✅ Order DM sent and logged');
  } catch (err) {
    console.error('❌ Failed to DM or log:', err);
    if (err.code === 50007) {
      return res.status(403).send('❌ Cannot DM this user (privacy settings)');
    }
    return res.status(500).send('❌ Internal error');
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN);
