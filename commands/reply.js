const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reply')
    .setDescription('📬 Reply to a user via bot DM')
    .addStringOption(option =>
      option.setName('user')
        .setDescription('User ID to reply to')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Your message')
        .setRequired(true)),

  async execute(interaction) {
    const userId = interaction.options.getString('user');
    const msg = interaction.options.getString('message');

    try {
      const user = await interaction.client.users.fetch(userId);
      await user.send(`💬 **Message from Bloom Haven Support:**\n\n${msg}`);
      await interaction.reply({ content: `✅ Message sent to <@${userId}>`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: `❌ Couldn't DM <@${userId}>. They may have DMs off.`, ephemeral: true });
    }
  }
};
