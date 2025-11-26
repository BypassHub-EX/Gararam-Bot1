const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whois')
    .setDescription('Get the Discord tag of a user by their ID')
    .addStringOption(opt =>
      opt.setName('id')
        .setDescription('Discord user ID')
        .setRequired(true)
    ),

  async execute(interaction) {
    const id = interaction.options.getString('id');

    try {
      const user = await interaction.client.users.fetch(id);

      await interaction.reply({
        content: `<@${id}> is ${user.tag}`,
        ephemeral: true
      });

    } catch (err) {
      console.error('Error fetching user:', err);

      await interaction.reply({
        content: 'Could not find a user with that ID.',
        ephemeral: true
      });
    }
  }
};
