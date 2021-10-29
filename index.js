process.env.TZ = "Asia/Hong_Kong";
require('dotenv').config({path: './editables/.env'});
const config = require('./editables/config.json')
const eventMessages = require('./editables/messages.js')
require("./src/cronJobs/jobs.js");
var db = require('./src/Helper/db.js');
const {getEmoteByName, serverParamsToDBName, serverParamsToChannelID} = require('./src/Helper/eventHelper.js')

const {Permissions, MessageEmbed} = require('discord.js');
let {bot, getAnnoucementChannel} = require("./src/discord/init.js");

const fetch = require('node-fetch');

let {getEventSchedule, updateSchedule} = require("./src/utility/checkEvents");
 
const prefix = config.prefix;

updateSchedule();

db.connect().then(() => {
    console.log('Connected to database');
})

bot.on('messageCreate',async (msg) => {
    if(!msg.content.startsWith(prefix) || msg.author.bot){return;}
    if(msg.member && !msg.member.permissions.has(Permissions.FLAGS.MANAGE_WEBHOOKS)){return;}
    let params = msg.content.substring(1).split(' ');
    const commandName = params.shift(); 
    const command = bot.commands.get(commandName);
    command.run(bot, msg, params);
    //perms
/*
    let params = msg.content.substring(1).split(' ');
    switch(params[0]){
        case 'winner':{
            params.shift();
            let server = serverParamsToDBName(params.shift());
            let name = params.shift();
            let game = params.length === 0 ? getEventSchedule()[getEventSchedule().today].title : params.join(' ');
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
            break;
        }

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
            getAnnoucementChannel().send({content: `<@&${config.skyblockID}> <@&${config.survivalID}>`,embeds: [eventMessages.eventTomorrow(params[1],params[2],bot.user.avatarURL(),params[3],params[4])]});
            break;
        }
         case 'mgtdy':{
            let server = serverParamsToChannelID(params[4]);
            getAnnoucementChannel().send(eventMessages.eventStart(params[1],params[2],params[3],server));
            break;
        }
    }
*/
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
            const nearestEvent = getEventSchedule()[getEventSchedule().nearest];
            interaction.reply(nearestEvent.emote+" "+nearestEvent.title+" "+nearestEvent.emote+"\r\n"+`<:cobblestone:833225746020696075> 空島: <t:${parseInt(nearestEvent.date.toSeconds())}:R>`+"\r\n"+`<:grassblock:833226098020057088> 生存: <t:${parseInt(nearestEvent.date.plus({hours: 1}).toSeconds())}:R>`);
            break;
        }
        case "time":{
            const selectedEvent = getEventSchedule()[interaction.options.get("name").value];
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