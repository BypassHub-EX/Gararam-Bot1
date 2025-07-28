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
    .setDescription('📊 Create a custom poll with up to 25 options')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Your poll question')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('options')
        .setDescription('Comma-separated options (e.g. Apple,Banana,Mango)')
        .setRequired(true)),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const optionString = interaction.options.getString('options');
    const options = optionString.split(',').map(o => o.trim()).filter(o => o.length > 0);

    if (options.length < 2 || options.length > 25) {
      return interaction.reply({
        content: '❌ You must provide between 2 and 25 options, separated by commas.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('📊 Poll')
      .setDescription(`**${question}**\n\nVote by clicking a button below.`)
      .setColor(0x5865f2)
      .setTimestamp();

    const rows = [];
    let row = new ActionRowBuilder();

    options.forEach((option, index) => {
      const button = new ButtonBuilder()
        .setCustomId(`poll_${index}`)
        .setLabel(option.slice(0, 80)) // Discord limit
        .setStyle(ButtonStyle.Secondary);

      row.addComponents(button);

      // 5 buttons per row max
      if ((index + 1) % 5 === 0 || index === options.length - 1) {
        rows.push(row);
        row = new ActionRowBuilder();
      }
    });

    // Store question and options temporarily in cache (or database if needed)
    const voteData = {
      question,
      options,
      votes: {} // userID: index
    };
    interaction.client.pollData = interaction.client.pollData || {};
    interaction.client.pollData[interaction.id] = voteData;

    await interaction.reply({ embeds: [embed], components: rows });
  }
};
