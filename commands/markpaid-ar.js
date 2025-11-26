const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('markpaid-ar')
    .setDescription('تأكيد استلام الدفع (بالعربية)')
    .addStringOption(option =>
      option.setName('orderid')
        .setDescription('رقم الطلب بدون علامة #')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('user')
        .setDescription('معرف المستخدم (Discord ID)')
        .setRequired(true)),

  async execute(interaction) {
    const orderId = interaction.options.getString('orderid');
    const userId = interaction.options.getString('user');

    try {
      const user = await interaction.client.users.fetch(userId);
      await user.send(
`تم تأكيد استلام الدفع لطلبك.

رقم الطلب: #${orderId}

سيتم تجهيز وتسليم العناصر قريبًا.
إذا احتجت أي مساعدة، تواصل معنا داخل السيرفر.`
      );

      await interaction.reply({ 
        content: `تم إرسال تأكيد الدفع إلى <@${userId}>`, 
        ephemeral: true 
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ 
        content: `لم أتمكن من إرسال الرسالة. قد تكون الرسائل الخاصة مغلقة.`, 
        ephemeral: true 
      });
    }
  }
};
