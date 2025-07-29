require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const PORT = process.env.PORT || 8080;
const TOKEN = process.env.BOT_TOKEN;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

app.use(bodyParser.json());

app.post('/shopify-webhook', async (req, res) => {
  const order = req.body;

  const robloxUsername = order?.customer?.first_name || 'Unknown';
  const discordID = order?.customer?.last_name || null;
  const orderID = order?.id || 'Unknown';
  const items = order?.line_items?.map(item => `${item.name} x${item.quantity}`).join(', ') || 'None';
  const total = order?.total_price || 'Unknown';
  const method = order?.payment_gateway_names?.[0] || 'Unknown';
  const landing = order?.landing_site?.toLowerCase() || '';
  const isArabic = landing.includes('/ar') || landing.includes('bloomhaven.store/ar');
  const language = isArabic ? 'Arabic' : 'English';

  const userMention = discordID ? `<@${discordID}>` : 'Unknown';

  // Log Embed
  const embed = new EmbedBuilder()
    .setTitle('📦 New Order')
    .addFields(
      { name: 'User', value: userMention, inline: true },
      { name: 'Order ID', value: `#${orderID}`, inline: true },
      { name: 'Items', value: items },
      { name: 'Total', value: `$${total}`, inline: true },
      { name: 'Payment Method', value: method, inline: true },
      { name: 'Language', value: isArabic ? '🇸🇦 Arabic' : '🇺🇸 English', inline: true }
    )
    .setTimestamp()
    .setColor('Green');

  const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
  if (logChannel) logChannel.send({ embeds: [embed] });

  // DM Message
  if (discordID) {
    const dm = await generateDM({ language, orderID, robloxUsername, method, total });
    try {
      const user = await client.users.fetch(discordID);
      await user.send(dm);
      if (logChannel) logChannel.send(`✅ DM sent to <@${discordID}>`);
    } catch (err) {
      if (logChannel) logChannel.send(`❌ Failed to DM <@${discordID}>`);
    }
  }

  res.sendStatus(200);
});

function generateDM({ language, orderID, robloxUsername, method, total }) {
  const paymentLinks = {
    'PayPal': 'https://www.paypal.com/paypalme/oilmoney001',
    'Ko-fi': 'https://ko-fi.com/oilmoney01',
    'Trade With Us': 'http://discord.gg/bloomhaven1'
  };

  const link = paymentLinks[method] || 'Unavailable';

  if (language === 'Arabic') {
    return (
`📢 **تم تأكيد الطلب**

📄 رقم الطلب: \`#${orderID}\`
👤 مستخدم روبلوكس: \`${robloxUsername}\`
💳 طريقة الدفع: ${method}

${method === 'Trade With Us'
  ? `يرجى فتح تذكرة في خادمنا الرسمي عبر الرابط التالي:
${link}
ثم اختيار خيار "الدفع عبر التداول".`
  : `ادفع المبلغ عبر الرابط:
${link}

تأكد أن الاسم يطابق الطلب، وسيتم التحقق تلقائيًا.`}

بمجرد تأكيد الدفع، سيتم تجهيز طلبك للتوصيل.

شكراً لتسوقك من Bloom Haven.`
    );
  } else {
    return (
`📢 **Order Confirmed**

🧾 Order ID: \`#${orderID}\`
🎮 Roblox Username: \`${robloxUsername}\`
💳 Payment Method: ${method}

${method === 'Trade With Us'
  ? `Please open a ticket in our Discord server:
${link}

And select the topic "Pay By Trading".`
  : `Send $${total} to this link:
${link}

Make sure your name matches the order. It will be auto-verified.`}

Once confirmed, your order will be prepared for delivery.

Thanks for ordering from Bloom Haven.`
    );
  }
}

client.once('ready', () => {
  console.log(`✅ Bloom Haven Bot is online as ${client.user.tag}`);
  app.listen(PORT, () => console.log(`🌐 Webhook server running on port ${PORT}`));
});

client.login(TOKEN);
