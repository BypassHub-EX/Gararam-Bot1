const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ptbuy')
    .setDescription('🎫 Open a purchase ticket'),

  async execute(interaction) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('ptbuy_select')
      .setPlaceholder('Select a topic')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Support Team')
          .setDescription('Ask for help or report an issue.')
          .setEmoji('🆘')
          .setValue('support'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Sheckles')
          .setDescription('Buy trillions of in-game currency.')
          .setEmoji('💰')
          .setValue('sheckles'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Pets')
          .setDescription('Purchase rare pets like Disco Bee.')
          .setEmoji('🐾')
          .setValue('pets'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Claim Your Order')
          .setDescription('Already paid? Get your items here.')
          .setEmoji('📦')
          .setValue('claim'),
        new StringSelectMenuOptionBuilder()
          .setLabel('How To Pay')
          .setDescription('Need payment instructions? Click here.')
          .setEmoji('📜')
          .setValue('howtopay'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Custom Pet Order')
          .setDescription('Pick mutation, age 🐥, and weight ⚖️!')
          .setEmoji('🧬')
          .setValue('custompet'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Custom Sheckles Order')
          .setDescription('Request a custom Sheckle amount 💼🌕')
          .setEmoji('🌕')
          .setValue('customsheckles')
      );

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setTitle('🧾 | Purchase')
      .setDescription('Please click on the button below to purchase what you like :D')
      .setColor('Blurple');

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });
  }
};
