const db = require('../../Helper/db.js');
const {serverParamsToDBName}= require('../../Helper/eventHelper.js');
const eventMessages = require("../../../editables/event_messages.js");
let {getDiscordScheduledEvents} = require("../../discord/init.js");

module.exports = {
    run: async function(bot,msg,params){
        let server = serverParamsToDBName(params.shift());
        let game = params.length === 0 ? getEventSchedule()[getEventSchedule().today].title : params.join(' ');
        msg.delete();
        try{
            //is draw~
            await db.query(`INSERT INTO ${server} (event,player,date) VALUES (?,?,NOW());`,[game,"draw_result"]);
         }
        catch(error){
            msg.channel.send("一個錯誤發生了!!");
        }
        finally{ 
            msg.channel.send(eventMessages.eventDraw(server,game));
        }
        //end the nearest event
        const events = await getDiscordScheduledEvents();
        events.at(0).delete();
    }
}
