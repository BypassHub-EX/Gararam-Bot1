const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cancel')
    .setDescription('Cancel an order and let the buyer know')
    .addStringOption(opt =>
      opt.setName('order')
        .setDescription('Order ID (e.g. 1035)')
        .setRequired(true))
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('Buyer\'s Discord user')
        .setRequired(true)),

  async execute(interaction) {
    const orderId = interaction.options.getString('order');
    const user = interaction.options.getUser('user');

    // Load orders
    const ordersPath = path.join(__dirname, '..', 'orders.json');
    let orders = {};
    if (fs.existsSync(ordersPath)) {
      orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    }

    // Remove order if exists
    const existed = orders.hasOwnProperty(orderId);
    if (existed) {
      delete orders[orderId];
      fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
    }

    try {
      await user.send(
        `Your order has been cancelled.\n\n` +
        `Order ID: ${orderId}\n` +
        `It has been removed from our list on Grow Up.\n\n` +
        `If this was a mistake, you can reach out in the server and we’ll sort it out.`
      );

      await interaction.reply({ 
        content: `Order ${orderId} has been cancelled and the buyer was notified.`,
        ephemeral: true 
      });
    } catch (err) {
      console.error('Failed to DM user:', err);
      await interaction.reply({ 
        content: `The order was removed, but I could not message the user.`,
        ephemeral: true 
      });
    }
  }
};
