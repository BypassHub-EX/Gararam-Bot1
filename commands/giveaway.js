const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('🎉 Create a giveaway embed')
    .addAttachmentOption(option =>
      option.setName('media')
        .setDescription('Upload an image')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Giveaway title')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Giveaway description')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('Prize being given away')
        .setRequired(true)),

  async execute(interaction) {
    const media = interaction.options.getAttachment('media');
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const prize = interaction.options.getString('prize');

    // Only accept image types
    if (!media.contentType.startsWith('image/')) {
      return interaction.reply({ content: '❌ Please upload a valid image file.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎁 ${title}`)
      .setDescription(`${description}\n\n🎉 **Prize:** ${prize}`)
      .setColor('#d9bb07')
      .setImage(media.url)
      .setTimestamp()
      .setFooter({ text: `Hosted by ${interaction.user.username}` });

    await interaction.reply({ embeds: [embed] });
  }
};
