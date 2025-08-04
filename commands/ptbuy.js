const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ptbuy')
    .setDescription('🎟 Open a support ticket for your order or issue'),

  async execute(interaction) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('ptbuy_select')
      .setPlaceholder('📋 Select your topic')
      .addOptions(
        {
          label: 'Payment Help',
          value: 'payment_help',
          description: 'Issues with payment, receipt, or failed transaction',
          emoji: '💳'
        },
        {
          label: 'Delivery Delay',
          value: 'delivery_delay',
          description: 'You paid but didn’t get your item yet',
          emoji: '📦'
        },
        {
          label: 'Wrong Item',
          value: 'wrong_item',
          description: 'You got something you didn’t order',
          emoji: '❗'
        },
        {
          label: 'Refund Request',
          value: 'refund_request',
          description: 'You want to request a refund for your order',
          emoji: '🔁'
        },
        {
          label: 'General Question',
          value: 'general_question',
          description: 'Ask a question or get help about the store',
          emoji: '❓'
        }
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      content: '📨 Select a topic to open a support ticket:',
      components: [row],
      ephemeral: true
    });
  }
};
