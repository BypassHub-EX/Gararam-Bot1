// commands/reply-ar.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reply-ar')
    .setDescription('📬 إرسال رد يدوي للمستخدم عبر الخاص (بالعربية)')
    .addStringOption(option =>
      option.setName('user')
        .setDescription('معرف المستخدم (Discord ID)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('الرسالة التي تريد إرسالها')
        .setRequired(true)),

  async execute(interaction) {
    const userId = interaction.options.getString('user');
    const msg = interaction.options.getString('message');

    try {
      const user = await interaction.client.users.fetch(userId);
      await user.send(`💬 **رسالة من فريق Bloom Haven:**\n\n${msg}`);
      await interaction.reply({ content: `✅ تم إرسال الرسالة إلى <@${userId}>`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: `❌ تعذر إرسال الرسالة. قد تكون الرسائل الخاصة مغلقة.`, ephemeral: true });
    }
  }
};
