var CronJob = require('cron').CronJob;
let {bot, getAnnoucementChannel,updateDiscordStatus,getDiscordScheduledEvents, updateScheduledEvents} = require("../discord/init.js");
const eventMessages = require('../../editables/event_messages.js');
const config = require('../../editables/config.json');
const {GuildScheduledEventStatus} = require("discord.js");
let {getEventSchedule, updateSchedule} = require("../utility/checkEvents.js");

function shouldSendMessage(server, isToday){
    const shouldSend = require("../../editables/options.json");

    if(isToday){
        return shouldSend[server].todayMessage;
    }
    else{
        return shouldSend[server].tomorrowMessage;
    }
    
}
const tomorrowMessage = new CronJob('0 17 * * *', function() {
    const tomorrowEvent = getEventSchedule().tomorrow;
    if(!tomorrowEvent){return;}
    const hasSurvivalGame = shouldSendMessage('survival', false);
    const hasSkyblockGame = shouldSendMessage('skyblock', false);
    if(!hasSkyblockGame && !hasSurvivalGame) return;

	getAnnoucementChannel().send({content: `<@&${config.skyblockID}> <@&${config.survivalID}>`, embeds: [eventMessages.eventTomorrow(tomorrowEvent.imageurl,tomorrowEvent.title,bot.user.avatarURL())]});
}, null, true, 'Asia/Taipei');
tomorrowMessage.start();


const todayMessageSkyblock = new CronJob('40 20 * * *', async function() {
    const todayEvent = getEventSchedule().today;
    if(!todayEvent){return;}
    if(!shouldSendMessage('skyblock', true)) return;
	getAnnoucementChannel().send(eventMessages.eventStart(todayEvent.emote,todayEvent.title,"21:00",config.skyblockID));
    const events = await getDiscordScheduledEvents();
    const currentEvent = events?.at(0);
    currentEvent?.edit({name: currentEvent.name + " - 21:00正式開始"});
    currentEvent?.setStatus(GuildScheduledEventStatus.Active);
}, null, true, 'Asia/Taipei');
todayMessageSkyblock.start();

const todayMessageSurvival = new CronJob('40 21 * * *', async function() {
    const todayEvent = getEventSchedule().today;
    if(!todayEvent){return;}
    if(!shouldSendMessage('survival', true)) return;
	getAnnoucementChannel().send(eventMessages.eventStart(todayEvent.emote,todayEvent.title,"22:00",config.survivalID));
    const events = await getDiscordScheduledEvents();
    const currentEvent = events?.at(0);
    currentEvent?.edit({name: currentEvent.name + " - 22:00正式開始"});
    currentEvent?.setStatus(GuildScheduledEventStatus.Active);
}, null, true, 'Asia/Taipei');
todayMessageSurvival.start();

const scheduleCheckEvent = new CronJob('1 0 * * *', function() {
    updateSchedule();
    updateDiscordStatus();
    updateScheduledEvents();	
}, null, true, 'Asia/Taipei');
scheduleCheckEvent.start();

const tomorrowMazeMessage = new CronJob('0 12 14 * *', function() {
    getAnnoucementChannel().send({content: `<@&${config.skyblockID}> <@&${config.survivalID}>`, embeds: [eventMessages.eventMazeTomorrow(bot.user.avatarURL())]});
}, null, true, 'Asia/Taipei');
tomorrowMazeMessage.start();

const todayMazeMessage = new CronJob('0 14 15 * *', function() {
    getAnnoucementChannel().send(eventMessages.eventMazeToday());
}, null, true, 'Asia/Taipei');
todayMazeMessage.start();
