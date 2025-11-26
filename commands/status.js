const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check the status of your order')
    .addStringOption(opt =>
      opt.setName('order')
        .setDescription('Order ID')
        .setRequired(true)
    ),

  async execute(interaction) {
    const orderId = interaction.options.getString('order');

    await interaction.reply({
      content: `Order #${orderId} is being processed. You will receive your delivery soon.`,
      ephemeral: true
    });
  }
};
