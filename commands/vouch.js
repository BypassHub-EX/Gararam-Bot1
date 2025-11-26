const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');

const VOUCH_CHANNEL_ID = '1442871787930124439';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vouch')
    .setDescription('Submit a vouch with an image and your comment')
    .addAttachmentOption(opt =>
      opt.setName('image')
        .setDescription('Upload an image of your item or delivery')
        .setRequired(true))
    .addBooleanOption(opt =>
      opt.setName('customorder')
        .setDescription('Was this a custom order?')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('customname')
        .setDescription('Enter the custom order name (leave empty if not custom)')
        .setRequired(false))
    .addStringOption(opt =>
      opt.setName('item')
        .setDescription('What item did you purchase?')
        .setRequired(true)
        .addChoices(
          // PLANTS
          { name: 'Mango - $0.40', value: 'Mango' },
          { name: 'Gold Mango - $0.50', value: 'Gold Mango' },
          { name: 'Shroombino - $0.30', value: 'Shroombino' },
          { name: 'Gold Shroombino - $0.80', value: 'Gold Shroombino' },
          { name: 'Tomatrio - $0.20', value: 'Tomatrio' },
          { name: 'Mr. Carrot - $0.17', value: 'Mr. Carrot' },
          { name: 'Gold Mr. Carrot - $0.20', value: 'Gold Mr. Carrot' },
          { name: 'King Limone - $0.60', value: 'King Limone' },
          { name: 'Star Fruit - $0.60', value: 'Star Fruit' },
          { name: 'Neon Tomatrio - $3.00', value: 'Neon Tomatrio' },

          // BRAINROTS
          { name: 'Upsidedown 67 - $0.60', value: 'Upsidedown 67' },
          { name: 'Neon Lemowzlo - $2.00', value: 'Neon Lemowzlo' },
          { name: 'Mr. Carrotitos - $0.20', value: 'Mr. Carrotitos' }
        ))
    .addStringOption(opt =>
      opt.setName('comment')
        .setDescription('Say something about your experience')
        .setRequired(true)),

  async execute(interaction) {
    const image = interaction.options.getAttachment('image');
    const item = interaction.options.getString('item');
    const comment = interaction.options.getString('comment');
    const customOrder = interaction.options.getBoolean('customorder');
    const customName = interaction.options.getString('customname');

    const finalItemName = customOrder
      ? (customName || 'Custom Order')
      : item;

    const embed = new EmbedBuilder()
      .setTitle(`New Vouch for ${finalItemName}`)
      .setDescription(`"${comment}"`)
      .setColor(0x2ECC71)
      .setTimestamp()
      .setImage(image.url)
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL()
      });

    try {
      const channel = await interaction.client.channels.fetch(VOUCH_CHANNEL_ID);
      await channel.send({ embeds: [embed] });

      await interaction.reply({
        content: 'Thanks for your vouch. It has been posted.',
        ephemeral: true
      });
    } catch (err) {
      console.error('Failed to send vouch:', err);
      await interaction.reply({
        content: 'Something went wrong while posting your vouch.',
        ephemeral: true
      });
    }
  }
};
