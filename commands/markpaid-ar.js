// commands/markpaid-ar.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('markpaid-ar')
    .setDescription('✅ تأكيد استلام الدفع (بالعربية)')
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
      await user.send(`🧾 **طلبك قيد التجهيز!**

✅ تم تأكيد الدفع لطلبك **#${orderId}**

📦 يرجى الانتظار، سيتم توصيل العناصر قريبًا.

**- فريق Bloom Haven**`);

      await interaction.reply({ content: `📨 تم إرسال تأكيد الدفع إلى <@${userId}>`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: `❌ فشل إرسال الرسالة. ربما المستخدم أغلق الرسائل الخاصة.`, ephemeral: true });
    }
  }
};
