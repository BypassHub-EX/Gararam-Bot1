require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, REST, Routes } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const app = express();
const PORT = process.env.PORT || 8080;
const TOKEN = process.env.BOT_TOKEN;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const CLIENT_ID = '1396258538460020856';

app.use(bodyParser.json());

// SHOPIFY WEBHOOK HANDLER
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
  const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);

  // LOG TO CHANNEL
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

  if (logChannel) logChannel.send({ embeds: [embed] });

  // DM TO BUYER
  if (discordID) {
    try {
      const user = await client.users.fetch(discordID);
      const dmText = generateDM({ language, orderID, robloxUsername, method, total });
      await user.send(dmText);
      if (logChannel) logChannel.send(`✅ DM sent to <@${discordID}>`);
    } catch (err) {
      if (logChannel) logChannel.send(`❌ Failed to DM <@${discordID}>`);
    }
  }

  res.sendStatus(200);
});

// ORDER CONFIRMATION DM TEXT
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
👤 اسم مستخدم روبلوكس: \`${robloxUsername}\`
💳 طريقة الدفع: ${method}

${method === 'Trade With Us' ? 
`يرجى فتح تذكرة عبر الرابط التالي:
${link}
ثم اختيار "الدفع عبر التداول".` :
`ادفع مبلغ \`${total}\` عبر الرابط:
${link}
تأكد من تطابق الاسم، وسيتم التحقق تلقائيًا.`}

📦 سيتم تجهيز طلبك للتوصيل بمجرد تأكيد الدفع.

شكراً لتسوقك من Bloom Haven.`
    );
  } else {
    return (
`📢 **Order Confirmed**

🧾 Order ID: \`#${orderID}\`
🎮 Roblox Username: \`${robloxUsername}\`
💳 Payment Method: ${method}

${method === 'Trade With Us' ? 
`Please open a ticket in our Discord:
${link}
And choose "Pay By Trading" as your topic.` :
`Send \`$${total}\` via:
${link}
Make sure your name matches your order.`}

📦 Once verified, your order will be queued for delivery.

Thanks for ordering from Bloom Haven.`
    );
  }
}

// LOGIN BOT
client.once('ready', () => {
  console.log(`✅ Bloom Haven Bot is online as ${client.user.tag}`);
  app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));
});

// REGISTER SLASH COMMANDS
client.commands = new Map();
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[WARN] Command at ${file} is missing required "data" or "execute".`);
  }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  try {
    console.log('📡 Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registered successfully!');
  } catch (err) {
    console.error('❌ Error registering commands:', err);
  }
})();

client.login(TOKEN);
