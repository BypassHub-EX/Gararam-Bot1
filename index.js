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
    console.log('⌛ Waiting to register slash commands...');
    const commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(`./commands/${file}`);
      commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
      await rest.put(
        Routes.applicationCommands('1396258538460020856'),
        { body: commands }
      );
      console.log('✅ Slash commands registered successfully.');
    } catch (error) {
      console.error('❌ Failed to register commands:', error);
    }
  }, 2000);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ There was an error executing this command.', ephemeral: true });
    }
  }

  // 🗳️ Poll vote handling
  if (interaction.isButton()) {
    const [prefix, index] = interaction.customId.split('_');
    if (prefix !== 'poll') return;

    const pollData = Object.values(client.pollData || {}).find(data =>
      data.options[parseInt(index)] !== undefined
    );

    if (!pollData) {
      return interaction.reply({ content: '❌ This poll is no longer active.', ephemeral: true });
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

// 💬 DM Relay
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

client.login(process.env.DISCORD_TOKEN);

// 💾 Load existing messageMap
const messageMapPath = './messageMap.json';
let messageMap = {};
if (fs.existsSync(messageMapPath)) {
  messageMap = JSON.parse(fs.readFileSync(messageMapPath, 'utf8'));
}

// 🌐 Express App
const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Bloom Haven Bot is alive"));

// Shopify webhook handler remains unchanged...
