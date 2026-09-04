import { REST, Routes, SlashCommandBuilder } from 'discord.js';
const command=new SlashCommandBuilder().setName('login').setDescription('Open Arab Designers Discord login');
const rest=new REST({version:'10'}).setToken(process.env.DISCORD_BOT_TOKEN);
await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),{body:[command.toJSON()]});
console.log('Registered /login');
