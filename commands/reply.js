const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reply')
    .setDescription('Send a manual reply to a user through bot DM')
    .addStringOption(option =>
      option.setName('user')
        .setDescription('User ID to send the message to')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message you want to send')
        .setRequired(true)),

  async execute(interaction) {
    const userId = interaction.options.getString('user');
    const msg = interaction.options.getString('message');

    try {
      const user = await interaction.client.users.fetch(userId);

      await user.send(
`You have received a message:

${msg}`
      );

      await interaction.reply({
        content: `Message sent to <@${userId}>`,
        ephemeral: true
      });

    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: `Couldn't send a message to <@${userId}>. They may have DMs disabled.`,
        ephemeral: true
      });
    }
  }
};
