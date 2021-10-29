const db = require('../../Helper/db.js');
const {serverParamsToDBName}= require('../../Helper/eventHelper.js');
const fetch = require("node-fetch");
const eventMessages = require("../../../editables/messages.js");

module.exports = {
    run: async function(bot,msg,params){
            const server = serverParamsToDBName(params.shift());
            const name = params.shift();
            const game = params.length === 0 ? getEventSchedule()[getEventSchedule().today].title : params.join(' ');
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
    }
}