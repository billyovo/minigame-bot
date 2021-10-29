const db = require("../../Helper/db.js");
module.exports = {
    run: function(bot, interaction){
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
    }
}