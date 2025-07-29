require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, REST, Routes } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
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

client.commands = new Map(); // ✅ FIXED COMMANDS

const app = express();
const PORT = process.env.PORT || 8080;
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
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

  // Log Order
  const logEmbed = new EmbedBuilder()
    .setTitle('📦 New Order Received')
    .addFields(
      { name: 'Order ID', value: `#${orderID}`, inline: true },
      { name: 'User', value: userMention, inline: true },
      { name: 'Roblox Username', value: robloxUsername, inline: true },
      { name: 'Items', value: items },
      { name: 'Total', value: `$${total}`, inline: true },
      { name: 'Payment Method', value: method, inline: true },
      { name: 'Language', value: isArabic ? '🇸🇦 Arabic' : '🇺🇸 English', inline: true }
    )
    .setColor('Green')
    .setTimestamp();

  const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
  if (logChannel) await logChannel.send({ embeds: [logEmbed] });

  // DM Confirmation
  if (discordID) {
    const dmContent = await generateDM({ language, orderID, robloxUsername, method, total });

    try {
      const user = await client.users.fetch(discordID);
      await user.send(dmContent);
      if (logChannel) await logChannel.send(`✅ DM sent to <@${discordID}>`);
    } catch (err) {
      if (logChannel) await logChannel.send(`❌ Could not send DM to <@${discordID}>`);
    }
  }

  res.sendStatus(200);
});

function generateDM({ language, orderID, robloxUsername, method, total }) {
  const links = {
    'PayPal': 'https://www.paypal.com/paypalme/oilmoney001',
    'Ko-fi': 'https://ko-fi.com/oilmoney01',
    'Trade With Us': 'http://discord.gg/bloomhaven1'
  };
  const link = links[method] || 'Unavailable';

  if (language === 'Arabic') {
    return (
`**تم تأكيد طلبك بنجاح**

🔹 رقم الطلب: \`#${orderID}\`
🔹 اسم مستخدم روبلوكس: \`${robloxUsername}\`
🔹 طريقة الدفع: ${method}

${method === 'Trade With Us' ? 
`يرجى فتح تذكرة في خادمنا الرسمي عبر هذا الرابط:
${link}
ثم اختيار "الدفع عبر التداول".` 
: 
`يرجى دفع المبلغ: **${total} دولار**
رابط الدفع:
${link}

تأكد من تطابق الاسم مع الطلب ليتم التحقق تلقائيًا.`}

سيتم تجهيز طلبك بعد تأكيد الدفع.

شكراً لتسوقك من Bloom Haven.`
    );
  } else {
    return (
`**Order Confirmed**

🔹 Order ID: \`#${orderID}\`
🔹 Roblox Username: \`${robloxUsername}\`
🔹 Payment Method: ${method}

${method === 'Trade With Us' ?
`Please open a ticket in our official Discord:
${link}
Then choose the topic: "Pay By Trading".`
:
`Please pay **$${total}** using the following link:
${link}

Make sure your name matches your order for automatic verification.`}

Once payment is confirmed, your order will be prepared.

Thanks for ordering from Bloom Haven.`
    );
  }
}

// App + Bot Ready
client.once('ready', () => {
  console.log(`✅ Bloom Haven Bot is online as ${client.user.tag}`);
  app.listen(PORT, () => console.log(`🌐 Webhook server running on port ${PORT}`));
});

// Register Slash Commands
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[WARN] Command ${file} missing data or execute.`);
  }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('📡 Registering slash commands...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('✅ Slash commands registered successfully!');
  } catch (error) {
    console.error('❌ Error registering slash commands:', error);
  }
})();

client.login(TOKEN);
