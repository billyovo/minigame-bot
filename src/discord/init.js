const {Client, Intents} = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
const {getEventSchedule, updateSchedule} = require("../utility/checkEvents");
const {serverParamsToChinese} = require("../Helper/eventHelper");
const config = require("../../editables/config.json");
const {eventScheduleMessage} = require("../../editables/messages");
bot.login(process.env.TOKEN);
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

async function updateScheduledEvents(){
    const schedule = await getDiscordScheduledEvents();
    if(schedule.size === 0){
        setEventSchedule(getEventSchedule()[getEventSchedule().nearest], "空島");
        setEventSchedule(getEventSchedule()[getEventSchedule().nearest], "生存");
    }
}

function setEventSchedule(event, server){
    const serverName = serverParamsToChinese(server);
    let eventTime = serverName === "生存" ? event.date.plus({hours: 1}) : event.date;
    annoucementChannel.guild.scheduledEvents.create({ 
        name: event.emote +" "+event.title,
        scheduledStartTime: eventTime.toMillis(),
        scheduledEndTime: eventTime.plus({minutes: 30}).toMillis(),
        privacyLevel: "GUILD_ONLY",
        entityType: "EXTERNAL",
        description: eventScheduleMessage(serverName),
        entityMetadata:{
            location: serverName+"小遊戲伺服器"
        }
    });
}

async function getDiscordScheduledEvents(){
    let events = await annoucementChannel.guild.scheduledEvents.fetch();
    return events.filter((event)=> event.creator.id === bot.user.id).sort((eventA,eventB)=> eventA.scheduledStartTime > eventB.scheduledStartTime);
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
    updateScheduledEvents();
})

process.on('uncaughtException', function(err) {
    if(Object.prototype.hasOwnProperty.call(getEventSchedule(), "today")){
        bot.user.setActivity("是日小遊戲: "+ getEventSchedule()[getEventSchedule().today].title, {type: "PLAYING"});
    }
    else{
        bot.user.setActivity("今天沒有小遊戲 :(", {type: "PLAYING"});
    }
});

module.exports = {
    updateDiscordStatus: updateDiscordStatus,
    getDiscordScheduledEvents: getDiscordScheduledEvents,
    updateScheduledEvents: updateScheduledEvents,
    getAnnoucementChannel: function(){
        return annoucementChannel;
    },
    bot: bot
}