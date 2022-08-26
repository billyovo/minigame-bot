const db = require("../../Helper/db.js");
const {getEmoteByName} = require("../../Helper/eventHelper.js");
const {EmbedBuilder} = require('discord.js');

module.exports = {
    run: function(bot, interaction){
            const query = `SELECT player.name, a.event FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY event ORDER BY date DESC) AS rowNumber FROM ??) a INNER JOIN player ON a.player = player.uuid WHERE rowNumber = 1`;
            const formatReply = (interaction.options.get("server").value === "survival" ? "生存" : "空島")+"服 禁賽名單";
            const embed = new EmbedBuilder()
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