const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delivered-ar')
    .setDescription('تأكيد تسليم الطلب للعميل (بالعربية)')
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
`تم تسليم طلبك.

رقم الطلب: #${orderId}

إذا كان لديك أي سؤال أو احتجت متابعة، تواصل معنا داخل السيرفر.`
      );

      await interaction.reply({ 
        content: `تم تأكيد تسليم الطلب لـ <@${userId}>`, 
        ephemeral: true 
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ 
        content: `لم أتمكن من إرسال رسالة التأكيد. تأكد من صحة المعرف أو من السماح بالرسائل الخاصة.`, 
        ephemeral: true 
      });
    }
  }
};
