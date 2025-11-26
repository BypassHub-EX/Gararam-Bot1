const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('send')
    .setDescription('Send a DM with an optional message, media, or embed formatting')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to send the message to')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to send (optional)'))
    .addAttachmentOption(option =>
      option.setName('media')
        .setDescription('Image or file to attach (optional)'))
    .addBooleanOption(option =>
      option.setName('embed')
        .setDescription('Send as an embed instead of a plain message'))
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Embed color (hex code, e.g. #00ff00)')),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const message = interaction.options.getString('message') || '';
    const media = interaction.options.getAttachment('media');
    const asEmbed = interaction.options.getBoolean('embed');
    const colorInput = interaction.options.getString('color');

    // default color
    let color = 0x00b0f4;
    if (colorInput && /^#?[0-9A-Fa-f]{6}$/.test(colorInput)) {
      color = parseInt(colorInput.replace('#', ''), 16);
    }

    try {
      if (asEmbed) {
        const embed = new EmbedBuilder()
          .setDescription(message || '')
          .setColor(color)
          .setTimestamp();

        if (media && media.contentType?.startsWith('image')) {
          embed.setImage(media.url);
        }

        await user.send({ embeds: [embed] });
      } else {
        const content = message || '';
        const options = media ? { content, files: [media.url] } : { content };
        await user.send(options);
      }

      await interaction.reply({
        content: `Message sent to <@${user.id}>`,
        ephemeral: true
      });

    } catch (error) {
      console.error('Failed to send DM:', error);
      await interaction.reply({
        content: 'Could not send the message. The user may have private messages disabled.',
        ephemeral: true
      });
    }
  }
};
