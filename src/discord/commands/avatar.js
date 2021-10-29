const db = require('../../Helper/db.js');
const fetch = require("node-fetch");

module.exports = {
    run: async function(bot,msg,params){
        let response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${params[0]}`);
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
                    msg.channel.send('Duplicate UUID found! Player '+params[0]+' changed to '+json.name);
                }
                else{
                    console.error(error);
                    msg.channel.send('DB error occured!');
                }     
            })
        }
    }
}

