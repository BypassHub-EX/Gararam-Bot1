const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('🎉 Create a timed giveaway embed')
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
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('time')
        .setDescription('Time in seconds until giveaway ends')
        .setRequired(true)),

  async execute(interaction) {
    const media = interaction.options.getAttachment('media');
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const prize = interaction.options.getString('prize');
    const time = interaction.options.getInteger('time');

    if (!media || !media.contentType || !media.contentType.startsWith('image/')) {
      return await interaction.reply({ content: '❌ Please upload a valid image file.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎁 ${title}`)
      .setDescription(`${description}\n\n🎉 **Prize:** ${prize}\n⏰ Ends in **${time} seconds**`)
      .setColor('#d9bb07')
      .setImage(media.url)
      .setTimestamp()
      .setFooter({ text: `Hosted by ${interaction.user.username}` });

    // Defer reply to avoid timeout
    const message = await interaction.deferReply({ fetchReply: true });

    // Send the giveaway embed
    const sentMessage = await interaction.editReply({ embeds: [embed] });

    // React with 🎉
    await sentMessage.react('🎉');

    // Wait for the time to end
    setTimeout(async () => {
      try {
        const updatedMessage = await interaction.fetchReply();
        const reaction = updatedMessage.reactions.cache.get('🎉');
        if (!reaction) return await interaction.followUp('❌ No one entered the giveaway.');

        const users = await reaction.users.fetch();
        const validUsers = users.filter(u => !u.bot && u.id !== interaction.client.user.id);

        if (validUsers.size === 0) {
          const failedEmbed = EmbedBuilder.from(embed)
            .setDescription(`${description}\n\n🎉 **Prize:** ${prize}\n❌ **No valid entries.**`);

          await interaction.editReply({ embeds: [failedEmbed] });
          return await interaction.followUp('❌ Giveaway ended with no winner.');
        }

        const winner = validUsers.random();

        const winnerEmbed = EmbedBuilder.from(embed)
          .setDescription(`${description}\n\n🎉 **Prize:** ${prize}\n🏆 **Winner:** <@${winner.id}>`);

        await interaction.editReply({ embeds: [winnerEmbed] });
        await interaction.followUp(`🎉 <@${winner.id}> has won **${prize}**!`);

      } catch (err) {
        console.error('Giveaway error:', err);
        await interaction.followUp('⚠️ Something went wrong ending the giveaway.');
      }
    }, time * 1000);
  }
};
