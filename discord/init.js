
const config = require('../editables/config.json')
let {eventSchedule} = require("../utility/checkEvents");
const {Client, Intents} = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
bot.login(process.env.TOKEN);
let annoucementChannel = null;

console.log(process.env.TOKEN);
bot.on('ready', async () => {
    annoucementChannel = await bot.channels.fetch(config.annoucementChannelID,true,true);
    
    if(!annoucementChannel){
        console.error('annoucement channel is not found! Stopping execution.');
        process.abort();
    }
    
    console.log("Connected to Discord as: "+bot.user.tag);
    console.log("Found event annoucement channel: "+annoucementChannel.name);
    console.log("Today's event:    "+ (Object.prototype.hasOwnProperty.call(eventSchedule, "today") ? eventSchedule[eventSchedule.today].title : "none"));
    console.log("Tomorrow's event: "+ (Object.prototype.hasOwnProperty.call(eventSchedule, "tomorrow") ? eventSchedule[eventSchedule.tomorrow].title : "none"));
    console.log('done!');

    if(Object.prototype.hasOwnProperty.call(eventSchedule, "today")){
        bot.user.setActivity("是日小遊戲: "+ eventSchedule[eventSchedule.today].title, {type: "PLAYING"});
    }
    else{
        bot.user.setActivity("今天沒有小遊戲 :(", {type: "PLAYING"});
    }
})

module.exports= {
    bot: bot,
    annoucementChannel: annoucementChannel
}