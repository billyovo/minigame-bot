process.env.TZ = "Asia/Hong_Kong";
require('dotenv').config({path: './editables/.env'});
const config = require('./editables/config.json')
const eventMessages = require('./editables/messages.js')
const events = require('./editables/event.json')
var db = require('./Helper/db.js');
const {getEmoteByName} = require('./Helper/eventHelper.js')

const {Client, Intents, Permissions, MessageEmbed} = require('discord.js');
const rrule = require('rrule')
const fetch = require('node-fetch');
var CronJob = require('cron').CronJob;
var { DateTime } = require('luxon');

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
const prefix = config.prefix;
const serverArgs = ['survival','sur','生存'];

let annoucementChannel = null;

var tomorrowMessage = new CronJob('0 17 * * *', function() {
    if(!storedEvents.tomorrow.name){return;}
	annoucementChannel.send({content: `<@&${config.skyblockID}> <@&${config.survivalID}>`, embeds: [eventMessages.eventTomorrow(storedEvents.tomorrow.emote,storedEvents.tomorrow.name,bot.user.avatarURL())]});
}, null, true, 'Asia/Taipei');
tomorrowMessage.start();


var todayMessageSkyblock = new CronJob('40 20 * * *', function() {
    if(!storedEvents.today.name){return;}
	annoucementChannel.send(eventMessages.eventStart(storedEvents.today.emote,storedEvents.today.name,"21:00",config.skyblockID));
}, null, true, 'Asia/Taipei');
todayMessageSkyblock.start();

var todayMessageSurvival = new CronJob('40 21 * * *', function() {
    if(!storedEvents.today.name){return;}
	annoucementChannel.send(eventMessages.eventStart(storedEvents.today.emote,storedEvents.today.name,"22:00",config.survivalID));
}, null, true, 'Asia/Taipei');
todayMessageSurvival.start();

var scheduleCheckEvent = new CronJob('1 0 * * *', function() {
    checkEvents();
    console.log("Today's event:    "+ (storedEvents.today.name|| 'none'));
    console.log("Tomorrow's event: "+ (storedEvents.tomorrow.name|| 'none'));
    bot.user.setActivity(storedEvents.today.name? `是日小遊戲: ${storedEvents.today.name}` : '今天沒有小遊戲的悲嗚', { type: storedEvents.today.name? 'PLAYING':'LISTENING'});  
}, null, true, 'Asia/Taipei');
scheduleCheckEvent.start();

var storedEvents = {
    today:{
        name: "",
        emote: ""
    },
    tomorrow:{
        name: "",
        emote: ""
    }
}

var eventsDateMap = {};
var eventsNearest;

function checkEvents(){
    storedEvents = {
        today:{
            name: "",
            emote: ""
        },
        tomorrow:{
            name: "",
            emote: ""
        }
	};
     eventsDateMap = {};
     eventsNearest = null;

    let today = DateTime.now();
    let tomorrow = DateTime.now().plus({days: 1}).startOf("day");
	console.log('================================================ '+today.toFormat('yyyy-LL-dd')+' ======================================================');
    const weekdays = ['一','二','三','四','五','六','日'];
	events.forEach((event)=>{
        let todayUTC = today.startOf("day");

        let fixedRule = 'DTSTART;TZID=Asia/Hong_Kong:'+todayUTC.toFormat('yyyyLLdd')+'T'+todayUTC.toFormat('HHmm00')+'\nRRULE:'+event.rrule;
        let eventRule = rrule.rrulestr(fixedRule);
        let eventDate = eventRule.after(todayUTC.toJSDate(),true);
        eventDate = DateTime.fromJSDate(eventDate).set({hours: 21, minutes: 0});
        console.log(event.title+"\r\n"+eventDate.toFormat('yyyy-LL-dd')+" 星期"+weekdays[eventDate.weekday-1]+"\r\n");
        eventsDateMap[event.id] = {
            title: event.title,
            date: eventDate,
            emote: event.emote
        }
        if(!eventsNearest){
            eventsNearest = eventsDateMap[event.id];
        }
        else{
            if(eventsNearest.date > eventsDateMap[event.id].date){
                eventsNearest = eventsDateMap[event.id];
            }
        }
    if(today.ordinal === eventDate.ordinal){
        storedEvents.today.name = event.title;
        storedEvents.today.emote = event.emote;
     }
    if(tomorrow.ordinal === eventDate.ordinal){
        storedEvents.tomorrow.name = event.title;
        storedEvents.tomorrow.emote = event.emote;
     }
	})
	console.log('==================================================================================================================');
}

checkEvents();
bot.login(process.env.TOKEN);
bot.on('ready', async () => {
    //annoucementChannel = bot.channels.cache.get(config.annoucementChannelID);
    annoucementChannel = await bot.channels.fetch(config.annoucementChannelID,true,true);
    
    if(!annoucementChannel){
        console.error('annoucement channel is not found! Stopping execution.');
        process.abort();
    }
    
    console.log("Connected to Discord as: "+bot.user.tag);
    console.log("Found event annoucement channel: "+annoucementChannel.name);
    console.log("Today's event:    "+ (storedEvents.today.name|| 'none'));
    console.log("Tomorrow's event: "+ (storedEvents.tomorrow.name|| 'none') + "\r\n");
    console.log('done!');
    bot.user.setActivity(storedEvents.today.name? `是日小遊戲: ${storedEvents.today.name}` : '今天沒有小遊戲的悲嗚', { type: storedEvents.today.name? 'PLAYING':'LISTENING'});
    //bot.user.setStatus(storedEvents.today.name? 'online' : 'dnd');
})

db.connect().then(() => {
    console.log('Connected to database');
})

bot.on('messageCreate',async (msg) => {
    if(!msg.content.startsWith(prefix)){return;}
    if(msg.member && !msg.member.permissions.has(Permissions.FLAGS.MANAGE_WEBHOOKS)){return;}
    //perms
    let params = msg.content.substring(1).split(' ');
    switch(params[0]){
        case 'winner':{
            params.shift();
            let server = serverArgs.includes(params.shift().toLowerCase()) ? "survival" : "skyblock";
            let name = params.shift();
            let game = params.length === 0 ? storedEvents.today.name : params.join(' ');
            msg.delete();
            let winner = await db.query('SELECT name, UUID FROM player WHERE name = ?',[name]);
            let uuid = winner[0] ? winner[0].UUID : "";
  
            //is winner name in database?
            if(winner.length === 0){
                //if no, fetch his uuid from mojang 
                const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`);
                const json = await response.json();
                uuid = json.id;
                if(!response.ok){
                    //oh shit mojang fucked up
                    msg.channel.send('搜尋玩家UUID時發生了錯誤!');
                    console.log('Mojang API: '+response.status+' '+response.statusText);
                }
                else{  
                    try{
                        //if mojang is ok, insert the uuid and name
                        await db.query('INSERT INTO player (name,uuid) VALUES (?,?)',[name,json.id])
                    }
                    catch(error){
                        if(error.errno === 1062){
                            //oh shit stupid player changed name and raised uuid primary key error
                            //update his name by record from mojang.
                            await db.query('UPDATE player SET name = ? WHERE uuid = ?',[json.name,json.id])       
                        }
                        else{
                            msg.channel.send('一個資料庫錯誤發生了!');
                            console.error(error);
                        }     	
                    }
                }
            }
            try{
                if(!uuid){
                    //oh shit uuid is not found
                    msg.channel.send('找不到玩家UUID, 此次紀錄並沒有加入資料庫');
                }
                else{
                    await db.query(`INSERT INTO ${server} (event,player,date) VALUES (?,?,NOW());`,[game,uuid]);
                }
            }
            catch(error){
                msg.channel.send('一個資料庫錯誤發生了!');
                console.error(error);
            }
            finally{
                msg.channel.send(eventMessages.eventWinner(server,game,name));
            }
            break;
        }
        case 'draw':{
            params.shift();
            let server = serverArgs.includes(params.shift().toLowerCase()) ? "survival" : "skyblock";
            let game = params.length === 0 ? storedEvents.today.name : params.join(' ');
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
            break;
        }
    /*
        case 'list':{
            let offset = (params[2] ? params[2] : 0) * 10;
            let query = (params[1] && params[1].toLowerCase() !== 'all')? `SELECT name, event, date FROM ${params[1]} INNER JOIN player ON player = player.uuid LIMIT 10 OFFSET ?`: 
`SELECT name, event, date FROM (SELECT * FROM survival UNION ALL SELECT * FROM skyblock) temp INNER JOIN player ON temp.player = player.uuid LIMIT 10 OFFSET ?;`;
             db.query(query,[offset])
            .then((data)=>{
                 let result = '';
                 data.forEach((row)=>{
                     let dateTemp = new Date(row.date);
                     result += row.name+' '+row.event+' '+dateTemp.getFullYear()+'-'+(dateTemp.getMonth()+1)+'-'+dateTemp.getDate()+'\r\n';
                 })
                 msg.channel.send(result || "page "+params[2]+" is empty!!!");
             })
            .catch((error)=>{
                 msg.channel.send('db error occured! '+error.message);
                 console.error(error);
             })
            break;
        }  
        */
        case 'players':{
             db.query('SELECT * FROM player')
            .then((data)=>{
                 let result = '';
                 data.forEach((row)=>{
                     result += row.name+": "+ row.uuid+'\r\n';
                 })
                 msg.channel.send(result);
             })
            .catch((error)=>{
                 msg.channel.send('db error occured! '+error.message);
                 console.error(error);
             })
            break;
        }
        case 'avatar':{
            let response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${params[1]}`);
            let json = await response.json();
            if(!response.ok){
                msg.channel.send('Mojang API is dead! Try again later!');
            }
            else{
                db.query('INSERT INTO player (name,uuid) VALUES (?,?)',[json.name,json.id])
                .then(()=>{
                    msg.channel.send('**Success!**\r\n'+json.name+" uuid is: "+json.id);
                })
                .catch((error)=>{
                    if(error.errno === 1062){
                        db.query('UPDATE player SET name = ? WHERE uuid = ?',[json.name,json.id]);
                        msg.channel.send('Duplicate UUID found! Player '+params[1]+' changed to '+json.name);
                    }
                    else{
                        console.error(error);
                        msg.channel.send('DB error occured!');
                    }     
                })
            }
            break;
        }
        case 'sql':{
            params.shift();
            db.query(params.join(' '))
            .then((result)=>{
                msg.channel.send(JSON.stringify(result));
            })
            .catch((error)=>{
                msg.channel.send(error.message);
            })
            break;
        }
         case 'mgtmr':{
            annoucementChannel.send({content: `<@&${config.skyblockID}> <@&${config.survivalID}>`,embeds: [eventMessages.eventTomorrow(params[1],params[2],bot.user.avatarURL(),params[3],params[4])]});
            break;
        }
         case 'mgtdy':{
            let server =  serverArgs.includes(params[4].toLowerCase()) ? config.survivalID : config.skyblockID;
            annoucementChannel.send(eventMessages.eventStart(params[1],params[2],params[3],server));
            break;
        }
    }
})

bot.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	switch(commandName){
        case "list":{
            let offset = (interaction.options.get("page") ? interaction.options.get("page").value-1 : 0) * 10;
            if(offset < 0){
                interaction.reply("page number start from 1!!!!!!");
                return;
            }
        
            let query = (interaction.options.get("server").value != "all") ? `SELECT name, event, date FROM ${interaction.options.get("server").value} INNER JOIN player ON player = player.uuid LIMIT 10 OFFSET ?`: 
`SELECT name, event, date FROM (SELECT * FROM survival UNION ALL SELECT * FROM skyblock) temp INNER JOIN player ON temp.player = player.uuid LIMIT 10 OFFSET ?;`;
             db.query(query,[offset])
            .then((data)=>{
                 let result = '';
                 data.forEach((row)=>{
                     let dateTemp = new Date(row.date);
                     result += row.name+' '+row.event+' '+dateTemp.getFullYear()+'-'+(dateTemp.getMonth()+1)+'-'+dateTemp.getDate()+'\r\n';
                 })
                interaction.reply(result || "page "+ ((offset/10)+1)+" is empty!!!");
             })
            .catch((error)=>{
                 interaction.reply('db error occured! '+error.message);
                 console.error(error);
             })
            break;
        }
        case "nearest":{
            interaction.reply(eventsNearest.emote+" "+eventsNearest.title+" "+eventsNearest.emote+"\r\n"+`<:cobblestone:833225746020696075> 空島: <t:${parseInt(eventsNearest.date.toSeconds())}:R>`+"\r\n"+`<:grassblock:833226098020057088> 生存: <t:${parseInt(eventsNearest.date.plus({hours: 1}).toSeconds())}:R>`);
            break;
        }
        case "time":{
            const selectedEvent = eventsDateMap[interaction.options.get("name").value];
            interaction.reply(selectedEvent.emote+" "+selectedEvent.title+" "+selectedEvent.emote+"\r\n"+`<:cobblestone:833225746020696075> 空島: <t:${parseInt(selectedEvent.date.toSeconds())}:f>`+"\r\n"+`<:grassblock:833226098020057088> 生存: <t:${parseInt(selectedEvent.date.plus({hours: 1}).toSeconds())}:f>`)
            break;
        }
        case "banlist":{
            const query = `SELECT player.name, a.event FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY event ORDER BY date DESC) AS rowNumber FROM ??) a INNER JOIN player ON a.player = player.uuid WHERE rowNumber = 1`;
            let formatReply = (interaction.options.get("server").value === "survival" ? "生存" : "空島")+"服 禁賽名單";
            let embed = new MessageEmbed()
                            .setColor('#ee831b')
							.setTitle(formatReply);
            db.query(query,[interaction.options.get("server").value])
            .then((data)=>{          	
                data.forEach((record)=>{
                    embed.addFields(
						{ name: getEmoteByName(record.event) +" "+record.event, value: record.name},
                    );
                })
                interaction.reply({embeds: [embed]});
            })
            .catch((error)=>{
                interaction.reply({content: "一個錯誤發生了, 請稍後再試", ephemeral: true});
                console.log(error);
            })
        }
	}
});