const {database} = require('../../Helper/db.js');
const {serverParamsToChinese} = require('../../Helper/eventHelper.js');
const eventMessages = require("../../../editables/event_messages.js");
let {getDiscordScheduledEvents} = require("../../discord/init.js");
const {getEventSchedule} = require("../../utility/checkEvents.js");

module.exports = {
    run: async function(bot,msg,params){
        const server = params.shift();
        const game = params.length === 0 ? getEventSchedule().today?.title : params.join(' ');
       
        await database.insertOne({
                  name: "平手",
                  UUID: "draw_result",
                  event: game,
                  server: server,
                  date: new Date().toISOString().substring(0,10)
              });
        
        msg.delete();
        msg.channel.send(eventMessages.eventDraw(server,game));
        //end the nearest event
        const events = await getDiscordScheduledEvents();
        events.at(0).delete();
    }
}
