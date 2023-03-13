const {database} = require("../../Helper/db.js");
const {getEmoteByName} = require("../../Helper/eventHelper.js");
const {EmbedBuilder} = require('discord.js');

function getBanlistPipeline(server){
    return [
  {
    '$match': {
      'server': server
    }
  }, {
    '$sort': {
      'date': -1
    }
  }, {
    '$group': {
      '_id': {
        'event': '$event'
      }, 
      'name': {
        '$first': '$name'
      }
    }
  }, {
    '$project': {
      'event': '$_id.event', 
      'name': '$name'
    }
  }, {
    '$unset': '_id'
  }
]
}
module.exports = {
    run: async function(bot, interaction){
        	const server = (interaction.options.get("server").value === "survival") ? "生存" : "空島";
            const result = await database.aggregate(getBanlistPipeline(server)).toArray();
            const formatReply = server+"服 禁賽名單";
            const embed = new EmbedBuilder()
                        .setColor('#ee831b')
                        .setTitle(formatReply);        	
                result.forEach((record)=>{
                    embed.addFields(
						{ name: getEmoteByName(record.event) +" "+record.event, value: record.name, inline: true},
                    );
                })
                interaction.reply({embeds: [embed]});
            
        }
}