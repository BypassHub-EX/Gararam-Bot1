const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pollresults')
    .setDescription('📊 Show who voted for what in a poll')
    .addStringOption(option =>
      option.setName('messageid')
        .setDescription('The message ID of the poll')
        .setRequired(true)),

  async execute(interaction) {
    const messageId = interaction.options.getString('messageid');
    const poll = interaction.client.pollData?.[messageId];

    if (!poll) {
      return interaction.reply({ content: '❌ Poll not found.', ephemeral: true });
    }

    const lines = Object.entries(poll.votes).map(([userId, index]) =>
      `• <@${userId}> → **${poll.options[index]}**`
    );

    const resultText = lines.length > 0 ? lines.join('\n') : 'No votes yet.';

    await interaction.reply({
      content: `🗳️ **Poll Results: ${poll.question}**\n${resultText}`,
      ephemeral: true
    });
  }
};
