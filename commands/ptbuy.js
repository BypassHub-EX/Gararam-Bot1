const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ComponentType
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ptbuy')
    .setDescription('Create a private ticket for purchase topics')
    .addStringOption(option =>
      option.setName('topic')
        .setDescription('Select your ticket topic')
        .setRequired(true)
        .addChoices(
          { name: '💳 Payment Issues', value: 'Payment Issues' },
          { name: '🤝 Trade With Us', value: 'Trade With Us' },
          { name: '📦 Order Help', value: 'Order Help' }
        )
    ),

  async execute(interaction) {
    const topic = interaction.options.getString('topic');
    const guild = interaction.guild;
    const categoryId = '1401962962515918868'; // your ticket category ID

    // role IDs
    const founderRole = '1390980326964072560';
    const coFounderRole = '1390980398556909690';
    const modsRole = '1401961773166362794';

    // create the private ticket channel
    const ticketChannel = await guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: categoryId,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
        },
        {
          id: founderRole,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
        },
        {
          id: coFounderRole,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
        },
        {
          id: modsRole,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
        }
      ]
    });

    // Buttons
    const claimBtn = new ButtonBuilder()
      .setCustomId('claim')
      .setLabel('Claim')
      .setStyle(ButtonStyle.Primary);

    const unclaimBtn = new ButtonBuilder()
      .setCustomId('unclaim')
      .setLabel('Unclaim')
      .setStyle(ButtonStyle.Secondary);

    const closeBtn = new ButtonBuilder()
      .setCustomId('close')
      .setLabel('Close')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(claimBtn, unclaimBtn, closeBtn);

    // Embed
    const embed = new EmbedBuilder()
      .setTitle('🎫 Ticket Opened')
      .setDescription(`**Topic:** ${topic}\n**User:** <@${interaction.user.id}>\nA team member will assist you shortly.`)
      .setColor('Green')
      .setTimestamp();

    await ticketChannel.send({
      content: `<@&${founderRole}> <@&${coFounderRole}> <@&${modsRole}>`,
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({ content: `✅ Your ticket has been created: <#${ticketChannel.id}>`, ephemeral: true });

    // Handle buttons
    const collector = ticketChannel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3600000 });

    collector.on('collect', async i => {
      if (!i.member.roles.cache.hasAny(founderRole, coFounderRole, modsRole)) {
        return i.reply({ content: '❌ You are not authorized to use this button.', ephemeral: true });
      }

      if (i.customId === 'claim') {
        await i.reply({ content: `✅ Ticket claimed by <@${i.user.id}>.`, ephemeral: false });
      } else if (i.customId === 'unclaim') {
        await i.reply({ content: `🌀 Ticket unclaimed.`, ephemeral: false });
      } else if (i.customId === 'close') {
        await i.reply({ content: '⏳ Ticket will be closed in 5 seconds...', ephemeral: false });
        setTimeout(() => {
          ticketChannel.delete().catch(() => null);
        }, 5000);
      }
    });
  }
};
