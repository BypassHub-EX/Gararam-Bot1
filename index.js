require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, Collection } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { REST, Routes } = require('discord.js');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();

const app = express();
const PORT = process.env.PORT || 8080;
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = '1396258538460020856';
const LOG_CHANNEL_ID = '1397212138753495062';

app.use(bodyParser.json());

// ========== ORDER HANDLER ==========
app.post('/shopify-webhook', async (req, res) => {
  const order = req.body;
  const createdAt = new Date(order?.created_at);
  const now = new Date();
  const diffMs = now - createdAt;
  if (diffMs > 1000 * 60 * 60 * 12) return res.sendStatus(200); // Ignore old orders

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

  const logEmbed = new EmbedBuilder()
    .setTitle('🧾 New Order Received')
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

  const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
  if (logChannel) logChannel.send({ embeds: [logEmbed] });

  if (discordID) {
    const dm = await generateDM({ language, orderID, robloxUsername, method, total });
    try {
      const user = await client.users.fetch(discordID);
      await user.send(dm);
      if (logChannel) logChannel.send(`✅ DM sent to <@${discordID}>`);
    } catch {
      if (logChannel) logChannel.send(`❌ Failed to DM <@${discordID}>`);
    }
  }

  res.sendStatus(200);
});

// ========== DM GENERATOR ==========
function generateDM({ language, orderID, robloxUsername, method, total }) {
  const paymentLinks = {
    'PayPal': 'https://www.paypal.com/paypalme/oilmoney001',
    'Ko-fi': 'https://ko-fi.com/oilmoney01',
    'Trade With Us': 'http://discord.gg/bloomhaven1'
  };
  const link = paymentLinks[method] || 'Unavailable';

  if (language === 'Arabic') {
    return (
`🧾 **تم تأكيد طلبك**

رقم الطلب: \`#${orderID}\`
اسم المستخدم في روبلوكس: \`${robloxUsername}\`
طريقة الدفع: ${method}

${method === 'Trade With Us'
  ? `يرجى فتح تذكرة في سيرفرنا الرسمي:
${link}
ثم اختر "الدفع عبر التداول".`
  : `يرجى دفع مبلغ **${total}$** عبر الرابط:
${link}

تأكد من مطابقة الاسم مع الطلب. سيتم التحقق تلقائيًا.`}

بعد التأكيد، سيتم تجهيز طلبك للتوصيل.

**شكرًا لتسوقك من Bloom Haven**`
    );
  } else {
    return (
`🧾 **Order Confirmed**

Order ID: \`#${orderID}\`
Roblox Username: \`${robloxUsername}\`
Payment Method: ${method}

${method === 'Trade With Us'
  ? `Please open a ticket in our Discord server:
${link}
Then select "Pay By Trading".`
  : `Please send **$${total}** via the link below:
${link}

Make sure your name matches the order. It will be verified automatically.`}

Once confirmed, your order will be prepared for delivery.

**Thanks for ordering from Bloom Haven.**`
    );
  }
}

// ========== BOT READY ==========
client.once('ready', () => {
  console.log(`✅ Bloom Haven Bot is online as ${client.user.tag}`);
  app.listen(PORT, () => console.log(`🌐 Webhook server is running on port ${PORT}`));
});

// ========== SLASH COMMAND REGISTRATION ==========
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[WARNING] Command in ${file} is missing "data" or "execute".`);
  }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  try {
    console.log('📡 Registering slash commands...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('✅ Slash commands registered!');
  } catch (err) {
    console.error('❌ Error registering commands:', err);
  }
})();

client.login(TOKEN);
