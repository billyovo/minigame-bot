var CronJob = require('cron').CronJob;
let {bot, getAnnoucementChannel} = require("../discord/init.js");
const eventMessages = require('../../editables/messages.js');
const config = require('../../editables/config.json');
let {getEventSchedule, updateSchedule} = require("../utility/checkEvents");
const {updateDiscordStatus} = require("../discord/init.js");

var tomorrowMessage = new CronJob('0 17 * * *', function() {
    if(!Object.prototype.hasOwnProperty.call(getEventSchedule(), "tomorrow")){return;}
    const tomorrowEvent = getEventSchedule()[getEventSchedule().tomorrow];
	getAnnoucementChannel().send({content: `<@&${config.skyblockID}> <@&${config.survivalID}>`, embeds: [eventMessages.eventTomorrow(tomorrowEvent.emote,tomorrowEvent.title,bot.user.avatarURL())]});
}, null, true, 'Asia/Taipei');
tomorrowMessage.start();


var todayMessageSkyblock = new CronJob('40 20 * * *', function() {
    if(!Object.prototype.hasOwnProperty.call(getEventSchedule(), "today")){return;}
    const todayEvent = getEventSchedule()[getEventSchedule().today];
	getAnnoucementChannel().send(eventMessages.eventStart(todayEvent.emote,todayEvent.title,"21:00",config.skyblockID));
}, null, true, 'Asia/Taipei');
todayMessageSkyblock.start();

var todayMessageSurvival = new CronJob('40 21 * * *', function() {
    if(!Object.prototype.hasOwnProperty.call(getEventSchedule(), "today")){return;}
    const todayEvent = getEventSchedule()[getEventSchedule().today];
	getAnnoucementChannel().send(eventMessages.eventStart(todayEvent.emote,todayEvent.title,"22:00",config.survivalID));
}, null, true, 'Asia/Taipei');
todayMessageSurvival.start();

var scheduleCheckEvent = new CronJob('1 0 * * *', function() {
    updateSchedule();
    updateDiscordStatus();
}, null, true, 'Asia/Taipei');
scheduleCheckEvent.start();