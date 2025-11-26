const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deliver')
    .setDescription('Send the private server link to the buyer')
    .addStringOption(opt => 
      opt.setName('order')
        .setDescription('Order ID (e.g. #1027)')
        .setRequired(true))
    .addUserOption(opt => 
      opt.setName('user')
        .setDescription('Buyer\'s Discord user')
        .setRequired(true))
    .addStringOption(opt => 
      opt.setName('link')
        .setDescription('Private server link')
        .setRequired(true)),

  async execute(interaction) {
    const orderId = interaction.options.getString('order');
    const user = interaction.options.getUser('user');
    const link = interaction.options.getString('link');

    try {
      await user.send(
`Your private server link is ready.

Order: ${orderId}
Link: ${link}

Join whenever you're ready so the delivery can be completed.
If you need help or something isn't clear, feel free to ask in the server.`
      );

      await interaction.reply({ 
        content: `Sent the delivery link for order ${orderId} to <@${user.id}>.`, 
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
