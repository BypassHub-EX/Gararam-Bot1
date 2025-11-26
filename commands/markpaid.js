const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('markpaid')
    .setDescription('Mark an order as paid and notify the buyer')
    .addStringOption(opt =>
      opt.setName('order')
        .setDescription('Order ID (e.g. 1027)')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('item')
        .setDescription('Item purchased')
        .setRequired(true))
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('Buyer\'s Discord user')
        .setRequired(true)),

  async execute(interaction) {
    const orderId = interaction.options.getString('order');
    const itemName = interaction.options.getString('item');
    const user = interaction.options.getUser('user');

    // Save order info to orders.json
    const ordersPath = path.join(__dirname, '..', 'orders.json');
    let orders = {};
    if (fs.existsSync(ordersPath)) {
      orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    }
    orders[orderId] = { item: itemName, userId: user.id };
    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));

    // DM the user
    try {
      await user.send(
`Your payment has been confirmed.

Order: ${orderId}
Item: ${itemName}

Your item is now queued for delivery.
You will receive the private server link shortly.

If you need anything, feel free to ask in the server.`
      );
    } catch (err) {
      console.warn(`Couldn't DM user: ${err}`);
    }

    // Edit original order log embed
    try {
      const messageMapPath = path.join(__dirname, '..', 'messageMap.json');
      if (!fs.existsSync(messageMapPath)) {
        return interaction.reply({ content: 'messageMap.json not found.', ephemeral: true });
      }

      const messageMap = JSON.parse(fs.readFileSync(messageMapPath, 'utf8'));
      const messageId = messageMap[orderId];
      const logChannelId = '1397212138753495062';
      const logChannel = await interaction.client.channels.fetch(logChannelId);
      const msg = await logChannel.messages.fetch(messageId);

      const originalEmbed = msg.embeds[0];
      const updatedFields = originalEmbed.fields.map(field =>
        field.name === '📌 Status'
          ? { name: '📌 Status', value: 'Payment Confirmed', inline: false }
          : field
      );

      const updatedEmbed = EmbedBuilder.from(originalEmbed).setFields(updatedFields);
      await msg.edit({ embeds: [updatedEmbed] });
    } catch (e) {
      console.error('Could not update order log message:', e);
    }

    await interaction.reply({
      content: `Order ${orderId} has been marked as paid and saved as "${itemName}".`,
      ephemeral: true
    });
  }
};
