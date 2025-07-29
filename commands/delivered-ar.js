// commands/delivered-ar.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delivered-ar')
    .setDescription('✅ تأكيد تسليم الطلب للعميل (بالعربية)')
    .addStringOption(option =>
      option.setName('orderid')
        .setDescription('رقم الطلب (بدون #)')
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
      await user.send(`🎁 **تم تسليم طلبك بنجاح!**

✅ رقم الطلب: **#${orderId}**
🎉 نشكرك على الشراء من Bloom Haven.

📌 إذا كان لديك أي استفسار، لا تتردد في التواصل معنا!

**- فريق Bloom Haven**`);

      await interaction.reply({ content: `📨 تم تأكيد تسليم الطلب لـ <@${userId}>`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: `❌ لم أتمكن من إرسال التأكيد. تحقق من المعرف أو الرسائل الخاصة.`, ephemeral: true });
    }
  }
};
