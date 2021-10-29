const config = require('../../editables/config.json')
let {getEventSchedule} = require("../utility/checkEvents.js");
const {Client, Intents, Discord} = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
bot.login(process.env.TOKEN);
const fs = require("fs");
let annoucementChannel = null;

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
    const commands = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
    for (const file of commands) {
        const commandName = file.split(".")[0];
        const command = require(`./commands/${file}`);
      
        console.log(`Loaded command ${commandName}`);
        bot.commands.set(command.name, command);
    }
}

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

module.exports= {
    bot: bot,
    getAnnoucementChannel: function(){
        return annoucementChannel;
    },
    updateDiscordStatus: updateDiscordStatus
}