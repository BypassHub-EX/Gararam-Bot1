const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deliver-ar')
    .setDescription('إرسال رابط التسليم للعميل (بالعربية)')
    .addStringOption(option =>
      option.setName('orderid')
        .setDescription('رقم الطلب بدون علامة #')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('user')
        .setDescription('معرف المستخدم (Discord ID)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('link')
        .setDescription('رابط السيرفر أو رابط التسليم')
        .setRequired(true)),

  async execute(interaction) {
    const orderId = interaction.options.getString('orderid');
    const userId = interaction.options.getString('user');
    const link = interaction.options.getString('link');

    try {
      const user = await interaction.client.users.fetch(userId);
      await user.send(
`تم تجهيز طلبك.

رقم الطلب: #${orderId}
رابط التسليم: ${link}

يرجى الدخول في أقرب وقت لإكمال عملية التسليم.
إذا احتجت أي مساعدة، تحدث معنا داخل السيرفر.`
      );

      await interaction.reply({ 
        content: `تم إرسال رابط التسليم إلى <@${userId}>`, 
        ephemeral: true 
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ 
        content: `لم أستطع إرسال الرسالة. تأكد من صحة المعرف أو من السماح بالرسائل الخاصة.`, 
        ephemeral: true 
      });
    }
  }
};
