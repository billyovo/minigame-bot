const db = require("../../Helper/db.js");
const fetch = require("node-fetch");

module.exports = {
    run: async function(bot, interaction){
        let player = interaction.options.get("player").value;

        let response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${player}`);
        let json = await response.json();
        if(!response.ok){
           interaction.reply('Mojang API is dead! Try again later!');
        }
        else{
            db.query('INSERT INTO player (name,uuid) VALUES (?,?)',[json.name,json.id])
            .then(()=>{
                interaction.reply('**Success!**\r\n'+json.name+" uuid is: "+json.id);
            })
            .catch((error)=>{
                if(error.errno === 1062){
                    db.query('UPDATE player SET name = ? WHERE uuid = ?',[json.name,json.id]);
                    interaction.reply('Duplicate UUID found! Player '+player+' changed to '+json.name);
                }
                else{
                    console.error(error);
                    interaction.reply('DB error occured!');
                }     
            })
        }
    }
}