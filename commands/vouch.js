const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const VOUCH_CHANNEL_ID = '1443699453390229681';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vouch')
    .setDescription('Submit a vouch with an image and your comment')

    .addAttachmentOption(opt =>
      opt.setName('image')
        .setDescription('Upload an image of your item or delivery')
        .setRequired(true))

    .addBooleanOption(opt =>
      opt.setName('customorder')
        .setDescription('Was this a custom order?')
        .setRequired(true))

    // ITEM MENU 1 (CHOICES 1–25)
    .addStringOption(opt =>
      opt.setName('item1')
        .setDescription('Select your item (list 1)')
        .setRequired(false)
        .addChoices(
          { name: 'Guerriro Digitale - $1', value: 'Guerriro Digitale' },
          { name: 'Job Job Job Sahur - $1', value: 'Job Job Job Sahur' },
          { name: 'Graipuss Medussi - $2', value: 'Graipuss Medussi' },
          { name: 'Cuadramat and Pakrahmatmamat - $3', value: 'Cuadramat and Pakrahmatmamat' },
          { name: 'Los Jobcitos - $2', value: 'Los Jobcitos' },
          { name: 'Nooo My Hotspot - $6', value: 'Nooo My Hotspot' },
          { name: 'Pot Hotspot - $2', value: 'Pot Hotspot' },
          { name: 'Telemorte - $9', value: 'Telemorte' },
          { name: 'To To To Sahur - $3', value: 'To To To Sahur' },
          { name: 'Pirulitoita Bicicletaire - $9', value: 'Pirulitoita Bicicletaire' },
          { name: 'Horegini Boom - $1', value: 'Horegini Boom' },
          { name: 'Quesadilla Crocodila - $3', value: 'Quesadilla Crocodila' },
          { name: 'Pot Pumpkin - $6', value: 'Pot Pumpkin' },
          { name: 'Chicleteira Bicicleteira - $6', value: 'Chicleteira Bicicleteira' },
          { name: 'Spaghetti Tualetti - $15', value: 'Spaghetti Tualetti' },
          { name: 'Esok Sekolah - $7', value: 'Esok Sekolah' },
          { name: 'Quesadillo Vampiro - $8', value: 'Quesadillo Vampiro' },
          { name: 'Burrito Bandito - $13', value: 'Burrito Bandito' },
          { name: 'Chicleteirina Bicicleteirina - $5', value: 'Chicleteirina Bicicleteirina' },
          { name: 'Noo My Candy - $9', value: 'Noo My Candy' },
          { name: 'Los Nooo My Hotspotsitos - $4', value: 'Los Nooo My Hotspotsitos' },
          { name: 'La Grande Combinassion - $5', value: 'La Grande Combinassion' },
          { name: 'Rang Ring Bus - $7', value: 'Rang Ring Bus' },
          { name: 'Guest 666 - $80', value: 'Guest 666' },
          { name: 'Los Chicleteiras - $5', value: 'Los Chicleteiras' }
        ))

    // ITEM MENU 2 (CHOICES 26–50)
    .addStringOption(opt =>
      opt.setName('item2')
        .setDescription('Select your item (list 2)')
        .setRequired(false)
        .addChoices(
          { name: '67 - $5', value: '67' },
          { name: 'Mariachi Corazoni - $10', value: 'Mariachi Corazoni' },
          { name: 'Swag Soda - $5', value: 'Swag Soda' },
          { name: 'Los Combinasionas - $4', value: 'Los Combinasionas' },
          { name: 'Tacorita Bicicleta - $15', value: 'Tacorita Bicicleta' },
          { name: 'Nuclearo Dinosauro - $19', value: 'Nuclearo Dinosauro' },
          { name: 'Las Sis - $10', value: 'Las Sis' },
          { name: 'Chillin Chili - $22', value: 'Chillin Chili' },
          { name: 'Chipso and Queso - $20', value: 'Chipso and Queso' },
          { name: 'Money Money Puggy - $15', value: 'Money Money Puggy' },
          { name: 'Celularcini Viciosini - $25', value: 'Celularcini Viciosini' },
          { name: 'Los Mobilis - $5', value: 'Los Mobilis' },
          { name: 'Los 67 - $12', value: 'Los 67' },
          { name: 'Mieteteira Bicicleteira - $5', value: 'Mieteteira Bicicleteira' },
          { name: 'La Spooky Grande - $13', value: 'La Spooky Grande' },
          { name: 'Los Spooky Combinasionas - $8', value: 'Los Spooky Combinasionas' },
          { name: 'Los Hotspositos - $17', value: 'Los Hotspositos' },
          { name: 'Los Puggies - $10', value: 'Los Puggies' },
          { name: 'W or L - $16', value: 'W or L' },
          { name: 'La Extinct Grande - $10', value: 'La Extinct Grande' },
          { name: 'Tralaledon - $60', value: 'Tralaledon' },
          { name: 'Los Primos - $55', value: 'Los Primos' },
          { name: 'Eviledon - $17', value: 'Eviledon' },
          { name: 'Los Tacoritas - $30', value: 'Los Tacoritas' },
          { name: 'Tang Tang Kelentang - $25', value: 'Tang Tang Kelentang' }
        ))

    // ITEM MENU 3 (CHOICES 51–68)
    .addStringOption(opt =>
      opt.setName('item3')
        .setDescription('Select your item (list 3)')
        .setRequired(false)
        .addChoices(
          { name: 'Ketupat Kepat - $35', value: 'Ketupat Kepat' },
          { name: 'Los Bros - $15', value: 'Los Bros' },
          { name: 'Tictac Sahur - $39', value: 'Tictac Sahur' },
          { name: 'La Supreme Combinasion - $100', value: 'La Supreme Combinasion' },
          { name: 'Orcaledon - $27', value: 'Orcaledon' },
          { name: 'Ketchuru and Masturu - $50', value: 'Ketchuru and Masturu' },
          { name: 'Garama and Madundung - $35', value: 'Garama and Madundung' },
          { name: 'Spooky and Pumpky - $60', value: 'Spooky and Pumpky' },
          { name: 'Lavadorito Spinito - $75', value: 'Lavadorito Spinito' },
          { name: 'Los Spaghettis - $20', value: 'Los Spaghettis' },
          { name: 'La Casa Boo - $45', value: 'La Casa Boo' },
          { name: 'Fragrama and Chocrama - $49', value: 'Fragrama and Chocrama' },
          { name: 'La Secret Combinasion - $34', value: 'La Secret Combinasion' },
          { name: 'Burguro and Fryuro - $110', value: 'Burguro and Fryuro' },
          { name: 'Dragon Cannelloni - $80', value: 'Dragon Cannelloni' },
          { name: 'Capitano Moby - $80', value: 'Capitano Moby' },
          { name: 'Strawberry Elephant - $90', value: 'Strawberry Elephant' },
          { name: 'Meowl - $1400', value: 'Meowl' }
        ))

    .addStringOption(opt =>
      opt.setName('comment')
        .setDescription('Say something about your experience')
        .setRequired(true))

    .addStringOption(opt =>
      opt.setName('customname')
        .setDescription('Enter the custom order name if customorder = true')
        .setRequired(false)
    ),

  async execute(interaction) {
    const image = interaction.options.getAttachment('image');
    const customOrder = interaction.options.getBoolean('customorder');
    const comment = interaction.options.getString('comment');
    const customName = interaction.options.getString('customname');

    const item =
      interaction.options.getString('item1') ||
      interaction.options.getString('item2') ||
      interaction.options.getString('item3');

    const finalItemName = customOrder
      ? (customName || 'Custom Order')
      : (item || 'Unknown Item');

    const embed = new EmbedBuilder()
      .setTitle(`New Vouch for ${finalItemName}`)
      .setDescription(`"${comment}"`)
      .setColor(0x2ECC71)
      .setTimestamp()
      .setImage(image.url)
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL()
      });

    try {
      const channel = await interaction.client.channels.fetch(VOUCH_CHANNEL_ID);
      await channel.send({ embeds: [embed] });

      await interaction.reply({
        content: 'Thanks for your vouch. It has been posted.',
        ephemeral: true
      });

    } catch (err) {
      console.error('Failed to send vouch:', err);
      await interaction.reply({
        content: 'Something went wrong while posting your vouch.',
        ephemeral: true
      });
    }
  }
};
