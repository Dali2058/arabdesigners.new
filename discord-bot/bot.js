import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
const client=new Client({intents:[GatewayIntentBits.Guilds]});
const SITE_URL=process.env.SITE_URL||'https://arabdesigners.ddns.net';
const BANNER='https://i.postimg.cc/FFT9tnKW/banner.png';
client.once('ready',()=>console.log(`Arab Designers bot online as ${client.user.tag}`));
client.on('interactionCreate',async interaction=>{
 if(!interaction.isChatInputCommand()||interaction.commandName!=='login')return;
 const embed=new EmbedBuilder().setTitle('Arab Designers').setDescription('Sign in with Discord to access your Arab Designers account.').setURL(`${SITE_URL}/login`).setImage(BANNER).setColor(0x3d46ff).setFooter({text:'Arab Designers'});
 const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Login with Discord').setStyle(ButtonStyle.Link).setURL(`${SITE_URL}/login`));
 await interaction.reply({embeds:[embed],components:[row],ephemeral:true});
});
client.login(process.env.DISCORD_BOT_TOKEN);
