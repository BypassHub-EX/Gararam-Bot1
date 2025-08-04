const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ptbuy')
    .setDescription('Opens a dropdown menu with purchase topics'),

  async execute(interaction) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('ptbuy_select') // ✅ Fixed this line
      .setPlaceholder('Select a topic')
      .addOptions(
        {
          label: 'Support Team',
          value: 'support',
          description: 'Ask for help or report an issue.',
          emoji: '🆘',
        },
        {
          label: 'Sheckles',
          value: 'sheckles',
          description: 'Buy trillions of in-game currency.',
          emoji: '💰',
        },
        {
          label: 'Pets',
          value: 'pets',
          description: 'Purchase rare pets like Disco Bee.',
          emoji: '🏹',
        },
        {
          label: 'Claim Your Order',
          value: 'claim',
          description: 'Already paid? Get your items here.',
          emoji: '📘',
        },
        {
          label: 'How To Pay',
          value: 'howtopay',
          description: 'Need payment instructions? Click here.',
          emoji: '📄',
        },
        {
          label: 'Custom Pet Order',
          value: 'custompet',
          description: 'Pick mutation, age 🐥, and weight ⚖️!',
          emoji: '🧬',
        },
        {
          label: 'Custom Sheckles Order',
          value: 'customsheckles',
          description: 'Request a custom Sheckle amount 🧳🌑',
          emoji: '🌒',
        },
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      components: [row],
      ephemeral: false,
    });
  },
};
