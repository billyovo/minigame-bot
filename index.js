process.env.TZ = "Asia/Hong_Kong";
require('dotenv').config({path: './editables/.env'});
require("./src/cronJobs/jobs.js");
const config = require('./editables/config.json')
const db = require('./src/Helper/db.js');
const path = require('path');
const {getEventSchedule, updateSchedule} = require("./src/utility/checkEvents.js");
const {Client, Intents, Permissions} = require('discord.js');
const Discord = require('discord.js')
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
const fs = require("fs");
const prefix = config.prefix;
let annoucementChannel = null;

bot.login(process.env.TOKEN);
db.connect().then(() => {
    console.log('Connected to database');
})
function updateDiscordStatus(){
    console.log("Today's event:    "+ (Object.prototype.hasOwnProperty.call(getEventSchedule(), "today") ? getEventSchedule()[getEventSchedule().today].title : "none"));
    console.log("Tomorrow's event: "+ (Object.prototype.hasOwnProperty.call(getEventSchedule(), "tomorrow") ? getEventSchedule()[getEventSchedule().tomorrow].title : "none"));
    if(Object.prototype.hasOwnProperty.call(getEventSchedule(), "today")){
        bot.user.setActivity("是日小遊戲: "+ getEventSchedule()[getEventSchedule().today].title, {type: "PLAYING"});
    }
    else{
        bot.user.setActivity("今天沒有小遊戲 :(", {type: "PLAYING"});
    }
}

function loadCommands(){
    bot.commands = new Discord.Collection();
    const dirPath = path.resolve(__dirname, './src/discord/commands');
    const commands = fs.readdirSync(dirPath).filter(file => file.endsWith(".js"));
    for (const file of commands) {
        const commandName = file.split(".")[0];
        const command = require(dirPath+`/${file}`);
      
        bot.commands.set(commandName, command);
        console.log("loaded command "+commandName);
    }

    const slashDirPath = path.resolve(__dirname, './src/discord/slash_commands');
    const slashCommands = fs.readdirSync(slashDirPath).filter(file => file.endsWith(".js"));
    for (const file of slashCommands) {
        const commandName = file.split(".")[0];
        const command = require(slashDirPath+`/${file}`);
      
        bot.commands.set(commandName, command);
        console.log("loaded command "+commandName);
    }
}


updateSchedule();
bot.on('ready', async () => {
    annoucementChannel = await bot.channels.fetch(config.annoucementChannelID,true,true);
    
    if(!annoucementChannel){
        console.error('annoucement channel is not found! Stopping execution.');
        process.abort();
    }
    
    console.log("Connected to Discord as: "+bot.user.tag);
    console.log("Found event annoucement channel: "+annoucementChannel.name);
    console.log('done!');


    updateDiscordStatus();
    loadCommands();
})

bot.on('messageCreate',async (msg) => {
    if(!msg.content.startsWith(prefix) || msg.author.bot){return;}
    if(msg.member && !msg.member.permissions.has(Permissions.FLAGS.MANAGE_WEBHOOKS)){return;}
    let params = msg.content.substring(1).split(' ');
    const commandName = params.shift(); 
    bot.commands.get(commandName)?.run(bot,msg,params);
})

bot.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
	const { commandName } = interaction;
    bot.commands.get(commandName)?.run(bot,interaction);   
});

module.exports = {
    updateDiscordStatus: updateDiscordStatus,
    getAnnoucementChannel: function(){
        return annoucementChannel;
    },
    bot: bot
}