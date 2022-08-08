const {Client, GatewayIntentBits, Partials, ActivityType, GuildScheduledEventEntityType} = require('discord.js');
const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});
const {getEventSchedule, updateSchedule} = require("../utility/checkEvents");
const {serverParamsToChinese} = require("../Helper/eventHelper");
const config = require("../../editables/config.json");
const {eventScheduleMessage} = require("../../editables/event_messages.js");
const path = require('path');
bot.login(process.env.TOKEN);
let annoucementChannel = null;

function updateDiscordStatus(){
    console.log("Today's event:    "+ (Object.prototype.hasOwnProperty.call(getEventSchedule(), "today") ? getEventSchedule()[getEventSchedule().today].title : "none"));
    console.log("Tomorrow's event: "+ (Object.prototype.hasOwnProperty.call(getEventSchedule(), "tomorrow") ? getEventSchedule()[getEventSchedule().tomorrow].title : "none"));
    if(Object.prototype.hasOwnProperty.call(getEventSchedule(), "today")){
        bot.user.setActivity("是日小遊戲: "+ getEventSchedule()[getEventSchedule().today].title, {type: ActivityType.Playing});
    }
    else{
        bot.user.setActivity("今天沒有小遊戲 :(", {type: ActivityType.Watching});
    }
    
}

async function updateScheduledEvents(){
    const schedule = await getDiscordScheduledEvents();
    if(schedule.size === 0){
        const nearestID = getEventSchedule().nearest;
        setEventSchedule(getEventSchedule()[nearestID], "skyblock");
        setEventSchedule(getEventSchedule()[nearestID], "survival");
    }
}

function setEventSchedule(event, server){
    const serverName = serverParamsToChinese(server);
    let eventTime = serverName === "生存" ? event.date.plus({hours: 1}) : event.date;
    annoucementChannel.guild.scheduledEvents.create({ 
        name: event.emote +" "+event.title,
        scheduledStartTime: eventTime.toMillis(),
        scheduledEndTime: eventTime.plus({minutes: 30}).toMillis(),
        image: path.resolve(__dirname, `../../editables/images/${event.id}_${server}.png`),
        privacyLevel: 2,
        entityType: GuildScheduledEventEntityType.External,
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



module.exports = {
    updateDiscordStatus: updateDiscordStatus,
    getDiscordScheduledEvents: getDiscordScheduledEvents,
    updateScheduledEvents: updateScheduledEvents,
    getAnnoucementChannel: function(){
        return annoucementChannel;
    },
    bot: bot
}