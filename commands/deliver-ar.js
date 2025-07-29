// commands/deliver-ar.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deliver-ar')
    .setDescription('📦 إرسال رابط التسليم للعميل (بالعربية)')
    .addStringOption(option =>
      option.setName('orderid')
        .setDescription('رقم الطلب (بدون #)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('user')
        .setDescription('معرف المستخدم (Discord ID)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('link')
        .setDescription('رابط السيرفر أو التسليم')
        .setRequired(true)),

  async execute(interaction) {
    const orderId = interaction.options.getString('orderid');
    const userId = interaction.options.getString('user');
    const link = interaction.options.getString('link');

    try {
      const user = await interaction.client.users.fetch(userId);
      await user.send(`🚚 **تم تجهيز طلبك!**

✅ رقم الطلب: **#${orderId}**
🎯 رابط التسليم: ${link}

💡 الرجاء الدخول لتسليم العناصر في أسرع وقت ممكن.

**- فريق Bloom Haven**`);

      await interaction.reply({ content: `📨 تم إرسال رابط التسليم إلى <@${userId}>`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: `❌ لم أستطع إرسال الرسالة. تحقق من صلاحية المعرف أو فتح الرسائل.`, ephemeral: true });
    }
  }
};
