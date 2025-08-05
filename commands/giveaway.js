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

    const message = await interaction.reply({ embeds: [embed], fetchReply: true });

    await message.react('🎉');

    // Wait for giveaway duration
    setTimeout(async () => {
      try {
        const fetched = await message.fetch(); // fetch full message
        const reaction = fetched.reactions.cache.get('🎉');
        if (!reaction) {
          return await interaction.followUp('❌ No one entered the giveaway.');
        }

        const users = await reaction.users.fetch();
        const validUsers = users.filter(u => !u.bot && u.id !== interaction.client.user.id);

        if (validUsers.size === 0) {
          await message.edit({
            embeds: [embed.setDescription(`${description}\n\n🎉 **Prize:** ${prize}\n❌ No one joined the giveaway.`)],
          });
          return await interaction.followUp('❌ No valid users reacted. Giveaway ended with no winner.');
        }

        const winner = validUsers.random();

        const updatedEmbed = EmbedBuilder.from(embed)
          .setDescription(`${description}\n\n🎉 **Prize:** ${prize}\n🏆 **Winner:** <@${winner.id}>`);

        await message.edit({ embeds: [updatedEmbed] });

        await interaction.followUp(`🎉 <@${winner.id}> has won **${prize}**!`);
      } catch (err) {
        console.error('Error finishing giveaway:', err);
        await interaction.followUp('⚠️ An error occurred while ending the giveaway.');
      }
    }, time * 1000);
  }
};
