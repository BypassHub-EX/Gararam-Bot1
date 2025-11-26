const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('placed')
    .setDescription('Notify a buyer that their order has been placed')
    .addStringOption(option =>
      option.setName('order')
        .setDescription('Order ID')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Buyer to notify')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('items')
        .setDescription('Items separated by commas')
        .setRequired(false)
    ),

  async execute(interaction) {
    const orderId = interaction.options.getString('order');
    const user = interaction.options.getUser('user');
    const itemsRaw = interaction.options.getString('items') || '';

    // Convert "mango,67,carrot" → "mango, 67, carrot"
    const items = itemsRaw
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0)
      .join(', ');

    const itemsLine = items ? `**Items:** __${items}__` : '';

    const message = 
`# **Your Order Has Been Placed**

## **Order Overview**
Your order has been received and successfully registered.  
This message confirms that everything went through correctly and that processing has started.

### **Order Details**
**Order ID:** __#${orderId}__  
${itemsLine}

---------------------------------

# **What Happens Next**

* We review your order to make sure all items are correct.  
* If any clarification is needed, we will message you.  
* You will receive updates as your order moves to the next stage.  
* *You don’t need to do anything right now—just stay available for updates.*

---------------------------------

# **Support & Questions**

If you notice something incorrect or want to check on the progress, feel free to contact us in the server.

* We respond as quickly as possible.  
* We keep every update clear and simple.  
* *Your order will continue moving smoothly through each step.*

---------------------------------

# **Thank You**
Thank you for placing an order with us.  
We will keep you updated as things progress.

---------------------------------`;

    try {
      await user.send(message);

      await interaction.reply({
        content: `Order #${orderId} has been marked as placed. The buyer has been notified.`,
        ephemeral: true
      });

    } catch (err) {
      console.error('Failed to send DM:', err);

      await interaction.reply({
        content: `Order marked as placed, but I couldn't send a DM to the user.`,
        ephemeral: true
      });
    }
  }
};
