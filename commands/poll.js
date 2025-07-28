const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('📊 Create a poll and auto-end it')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Poll question')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('options')
        .setDescription('Comma-separated choices (up to 25)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration in seconds (default 30)')
        .setRequired(false)),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const optionString = interaction.options.getString('options');
    const duration = interaction.options.getInteger('duration') || 30;
    const options = optionString.split(',').map(o => o.trim()).slice(0, 25);

    if (options.length < 2) {
      return interaction.reply({ content: '❌ Minimum 2 options required.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('📊 Poll')
      .setDescription(`**${question}**\n\nVote by clicking below!`)
      .setColor(0x5865f2);

    const rows = [];
    let row = new ActionRowBuilder();
    options.forEach((opt, i) => {
      const btn = new ButtonBuilder()
        .setCustomId(`poll_${i}`)
        .setLabel(opt.slice(0, 80))
        .setStyle(ButtonStyle.Secondary);
      row.addComponents(btn);
      if ((i + 1) % 5 === 0 || i === options.length - 1) {
        rows.push(row);
        row = new ActionRowBuilder();
      }
    });

    const sent = await interaction.reply({ embeds: [embed], components: rows, fetchReply: true });

    const pollData = {
      question,
      options,
      votes: {}, // userId → index
      message: sent,
      channelId: sent.channel.id,
    };

    interaction.client.pollData = interaction.client.pollData || {};
    interaction.client.pollData[sent.id] = pollData;

    // ⏱️ End the poll after duration
    setTimeout(async () => {
      const voteCounts = Array(options.length).fill(0);
      for (const idx of Object.values(pollData.votes)) voteCounts[idx]++;

      const maxVotes = Math.max(...voteCounts);
      const winnerIndex = voteCounts.indexOf(maxVotes);
      const winnerLabel = options[winnerIndex];
      const voterId = Object.keys(pollData.votes).find(k => pollData.votes[k] === winnerIndex);
      const winnerMention = voterId ? `<@${voterId}>` : 'No voters';

      const endEmbed = new EmbedBuilder()
        .setTitle('📊 Poll Ended')
        .setDescription(`**${question}**\n\n🏆 Winner: **${winnerLabel}**\n🎉 Voted by: ${winnerMention}`)
        .setColor(0x2ecc71)
        .setFooter({ text: 'Poll closed' });

      await sent.edit({ embeds: [endEmbed], components: [] });
    }, duration * 1000);
  }
};
