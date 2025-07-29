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

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
  console.log(`✅ Bloom Haven Bot is online as ${client.user.tag}`);

  setTimeout(async () => {
    const { REST, Routes } = require('discord.js');
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    const commands = [];

    for (const file of commandFiles) {
      const command = require(`./commands/${file}`);
      commands.push(command.data.toJSON());
    }

    try {
      await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
      console.log('✅ Slash commands registered.');
    } catch (error) {
      console.error('❌ Error registering commands:', error);
    }
  }, 2000);
});

// Handle slash command execution
client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
    }
  }

  // Poll voting
  if (interaction.isButton()) {
    const [prefix, index] = interaction.customId.split('_');
    if (prefix !== 'poll') return;

    const pollData = Object.values(client.pollData || {}).find(data =>
      data.options[parseInt(index)] !== undefined
    );
    if (!pollData) {
      return interaction.reply({ content: '❌ Poll no longer active.', ephemeral: true });
    }

    const userId = interaction.user.id;
    if (pollData.votes[userId]) {
      return interaction.reply({
        content: `❌ You already voted for **${pollData.options[pollData.votes[userId]]}**.`,
        ephemeral: true
      });
    }

    pollData.votes[userId] = parseInt(index);
    const selected = pollData.options[parseInt(index)];

    await interaction.reply({
      content: `✅ You voted for **${selected}**.`,
      ephemeral: true
    });
  }
});

// DM relay system
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

// Express Web Server (for Shopify, etc.)
const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('🌸 Bloom Haven Bot is alive and speaking Arabic too!');
});

// Webhook handler for Shopify (Arabic detection)
app.post('/webhook', async (req, res) => {
  const order = req.body;
  const isArabic = order?.landing_site?.includes('/ar');
  const userDiscordId = order?.note_attributes?.find(attr => attr.name === 'discord')?.value;

  if (!userDiscordId) return res.status(400).send('Missing Discord ID');

  const user = await client.users.fetch(userDiscordId).catch(() => null);
  if (!user) return res.status(404).send('User not found');

  const itemNames = order?.line_items?.map(i => i.name).join(', ') || 'منتج';
  const total = order?.total_price || '?';
  const orderId = order?.order_number || '؟';

  const message = isArabic
    ? `🧾 **تم استلام طلبك في بلوم هيفن!**\n\n🛍️ المنتجات: ${itemNames}\n💵 المبلغ: ${total}$\n📦 رقم الطلب: #${orderId}\n\nيرجى إتمام الدفع حسب الطريقة المحددة.\n– فريق بلوم هيفن`
    : `🧾 **Your Bloom Haven order has been received!**\n\n🛍️ Items: ${itemNames}\n💵 Total: $${total}\n📦 Order ID: #${orderId}\n\nPlease proceed with payment.\n– Bloom Haven Team`;

  try {
    await user.send(message);
    res.status(200).send('Message sent');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to DM user');
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// Load messageMap if used
const messageMapPath = './messageMap.json';
if (fs.existsSync(messageMapPath)) {
  global.messageMap = JSON.parse(fs.readFileSync(messageMapPath, 'utf8'));
}

// Login bot
client.login(process.env.DISCORD_TOKEN);
