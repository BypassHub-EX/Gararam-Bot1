require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers
  ],
  partials: ['CHANNEL']
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
  console.log(`✅ Bloom Haven Bot is online as ${client.user.tag}`);

  const { REST, Routes } = require('discord.js');
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const commands = commandFiles.map(file => require(`./commands/${file}`).data.toJSON());

  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('✅ Slash commands registered.');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
    }
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot || message.guild) return;
  const logChannelId = '1399416161631993866';
  const logChannel = await client.channels.fetch(logChannelId).catch(() => null);
  if (!logChannel) return;

  const content = message.content || '[No text]';
  const attachments = message.attachments.map(att => att.url);
  const log = `📨 **DM from ${message.author.tag}** (\`${message.author.id}\`)\n> ${content}\n\n🛠️ To reply use:\n\`/reply user:${message.author.id} message:<your message>\``;
  await logChannel.send({ content: log, files: attachments.length > 0 ? attachments : undefined });
});

// === EXPRESS SERVER FOR SHOPIFY WEBHOOK ===
const app = express();
const PORT = process.env.PORT || 8080;
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('🌸 Bloom Haven Bot is online and accepting webhooks!');
});

app.post('/shopify-webhook', async (req, res) => {
  const order = req.body;

  console.log('🔔 New webhook received');
  console.log('🛒 Order ID:', order?.order_number);
  console.log('🌐 Landing Site:', order?.landing_site);

  const discordId = order?.customer?.last_name;
  const robloxUser = order?.customer?.first_name;
  const landingSite = order?.landing_site || '';
  const isArabic = landingSite.includes('/ar');

  if (!discordId) {
    console.warn('❌ No Discord ID found.');
    return res.status(400).send('Missing Discord ID.');
  }

  const user = await client.users.fetch(discordId).catch(() => null);
  if (!user) {
    console.warn('❌ Discord user not found:', discordId);
    return res.status(404).send('User not found.');
  }

  const items = order?.line_items?.map(i => `${i.name} x${i.quantity}`).join(', ') || 'Item(s)';
  const total = order?.total_price || '?';
  const orderId = order?.order_number || '?';
  const method = order?.payment_gateway_names?.[0] || 'Unknown';

  // Payment links
  const links = {
    PayPal: 'https://www.paypal.com/paypalme/oilmoney001',
    'Buy Me a Coffee': 'https://ko-fi.com/oilmoney01',
    'Trade With Us': 'http://discord.gg/bloomhaven1'
  };

  const selectedLink = links[method] || links.PayPal;

  // Auto message
  const confirmationMessage = isArabic
    ? `🤖 **تم تأكيد طلبك**

📦 رقم الطلب: \`#${orderId}\`
👤 اسم المستخدم: \`${robloxUser}\`
💳 طريقة الدفع: \`${method}\`

✅ تم تسجيل طلبك. يرجى إتمام الدفع بالطريقة المحددة أدناه.

رابط الدفع: ${selectedLink}

- أرسل المبلغ المحدد بدقة.
- تأكد من تطابق اسمك مع الطلب.
- سيتم تأكيد الدفع تلقائيًا قريبًا.

شكراً لطلبك من بلوم هيفن.`
    : `🤖 **Order Confirmed Automatically**

🧾 **Order ID:** \`#${orderId}\`
🎮 **Roblox Username:** \`${robloxUser}\`
💳 **Selected Payment Method:** \`${method}\`

✅ Your order has been registered and is now pending payment.

🔗 Payment Link: ${selectedLink}

1. Send the exact amount listed for your items.
2. Make sure your username matches your order.
3. Payment will be verified shortly.

Thanks for ordering from Bloom Haven.`;

  try {
    await user.send(confirmationMessage);

    const logChannel = await client.channels.fetch('1397212138753495062');
    const embed = new EmbedBuilder()
      .setTitle(isArabic ? '📦 طلب جديد' : '📦 New Order')
      .setDescription(
        `**User:** <@${user.id}>\n` +
        `**Order ID:** #${orderId}\n` +
        `**Items:** ${items}\n` +
        `**Total:** $${total}\n` +
        `**Payment Method:** ${method}\n` +
        `**Language:** ${isArabic ? '🇸🇦 Arabic' : '🇺🇸 English'}`
      )
      .setColor(isArabic ? 0xf39c12 : 0x2ecc71)
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
    await logChannel.send(`✅ DM sent to <@${user.id}>`);

    res.status(200).send('DM sent and order logged');
  } catch (error) {
    console.error('❌ Failed to DM user or log order:', error);
    res.status(500).send('Internal Error');
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN);
