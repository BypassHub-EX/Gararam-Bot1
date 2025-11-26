  const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delivered')
    .setDescription('Mark an order as delivered and notify the buyer')
    .addStringOption(opt => 
      opt.setName('order')
        .setDescription('Order ID (e.g. 1027, no #)')
        .setRequired(true))
    .addUserOption(opt => 
      opt.setName('user')
        .setDescription('Buyer\'s Discord user')
        .setRequired(true)),

  async execute(interaction) {
    const orderId = interaction.options.getString('order');
    const user = interaction.options.getUser('user');

    // Load item name from orders.json
    const ordersPath = path.join(__dirname, '..', 'orders.json');
    let orders = {};
    if (fs.existsSync(ordersPath)) {
      orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    }

    const itemName = orders[orderId] || 'your item';

    try {
      await user.send(
`Your delivery has been completed.

Order: ${orderId}
Item: ${itemName}

Everything should now be received in-game.
If anything is missing or you need help, let us know in the server.`
      );

      await interaction.reply({ 
        content: `Order ${orderId} marked as delivered and a message was sent to <@${user.id}>.`, 
        ephemeral: true 
      });
    } catch (err) {
      console.error('DM failed:', err);
      await interaction.reply({ 
        content: `I couldn't send a message to the user.`, 
        ephemeral: true 
      });
    }
  }
};
