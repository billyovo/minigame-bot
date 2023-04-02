const {database} = require('../../Helper/db.js');
const {serverParamsToChinese} = require('../../Helper/eventHelper.js');
const fetch = require("node-fetch");
const eventMessages = require("../../../editables/event_messages.js");
let {getDiscordScheduledEvents} = require("../../discord/init.js");
const {getEventSchedule} = require("../../utility/checkEvents.js");

async function findUUID(name){
     const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`);
     const json = await response.json();
     if(!response.ok){
       //oh shit mojang fucked up
       console.log('Mojang API: '+response.status+' '+response.statusText);
       return null;
     }
     else{  
       return {
           name: json.name,
           UUID: json.id
       }
     }
}
module.exports = {
    run: async function(bot,msg,params){
            const server = params.shift();
            const name = params.shift();
            const game = params.length === 0 ? getEventSchedule().today?.title : params.join(' ');
         
            const winner = await database.findOne({name: name});
        	let UUID = winner?.UUID;
        	if(!winner){
                //get UUID from mojang
                const winner_data = await findUUID(name);
                UUID = winner_data.UUID;
                
                //shit player changed their username! update their name in db!
                const search_winner_by_uuid = await database.findOne({UUID: winner_data.UUID});
                if(search_winner_by_uuid){
                    await database.updateMany(
                        {UUID: winner_data.UUID},
                        {$set:{ name: winner_data.name}}
                    )
                }
            }
        
            // insert new record
              await database.insertOne({
                  name: name,
                  UUID: UUID,
                  event: game,
                  server: server,
                  date: new Date().toISOString().substring(0,10)
              });
        	
        	// clean ups
         	msg.channel.send(eventMessages.eventWinner(server,game,name));
        	msg.delete();
       	 	const events = await getDiscordScheduledEvents();
            events?.at(0)?.delete();
    }
}
