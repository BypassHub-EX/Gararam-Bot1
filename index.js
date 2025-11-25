require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ENV
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// CLIENT
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel]
});

// -------- LOAD COMMANDS --------
client.commands = new Map();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

// -------- REGISTER SLASH COMMANDS --------
const { REST, Routes } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    const body = [...client.commands.values()].map(cmd => cmd.data.toJSON());
    console.log('Registering slash commands...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body });
    console.log('Slash commands registered!');
  } catch (err) {
    console.error('Failed to register commands:', err);
  }
})();

// -------- INTERACTION HANDLER --------
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      interaction.reply({ content: 'Error executing command.', ephemeral: true });
    }
  }
});

// -------- READY --------
client.once('ready', () => {
  console.log(`Bot is online as ${client.user.tag}`);
});

// -------- LOGIN --------
client.login(TOKEN);
