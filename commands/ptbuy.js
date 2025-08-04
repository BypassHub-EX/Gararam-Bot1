const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ptbuy')
    .setDescription('📩 Open the Bloom Haven topic selector'),

  async execute(interaction) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('ptbuy_select')
      .setPlaceholder('Select a topic')
      .addOptions(
        {
          label: 'Support Team',
          value: 'Support Team',
          description: 'Ask for help or report an issue.',
          emoji: '🆘'
        },
        {
          label: 'Sheckles',
          value: 'Sheckles',
          description: 'Buy trillions of in-game currency.',
          emoji: '💰'
        },
        {
          label: 'Pets',
          value: 'Pets',
          description: 'Purchase rare pets like Disco Bee.',
          emoji: '🧌'
        },
        {
          label: 'Claim Your Order',
          value: 'Claim Your Order',
          description: 'Already paid? Get your items here.',
          emoji: '📘'
        },
        {
          label: 'How To Pay',
          value: 'How To Pay',
          description: 'Need payment instructions? Click here.',
          emoji: '📰'
        },
        {
          label: 'Custom Pet Order',
          value: 'Custom Pet Order',
          description: 'Pick mutation, age 🐥, and weight ⚖️!',
          emoji: '🧬'
        },
        {
          label: 'Custom Sheckles Order',
          value: 'Custom Sheckles Order',
          description: 'Request a custom Sheckle amount 💼🌑',
          emoji: '🌕'
        }
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({ components: [row], ephemeral: false });
  }
};
