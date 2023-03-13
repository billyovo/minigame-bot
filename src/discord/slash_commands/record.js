const {database} = require("../../Helper/db.js");
const {serverParamsToChinese} = require("../../Helper/eventHelper.js");
const {EmbedBuilder} = require('discord.js');

module.exports = {
    run: async function(bot, interaction){
            const target = interaction.options.get("player");
            const name = target?.member?.nickname || target?.user?.username;
            const server = interaction.options.get("server").value;
            
        	let filter = {name: name};
        	if(server !== "all") filter.server = serverParamsToChinese(server);
        	const count = await database.countDocuments(filter);
        	if(!count){
                interaction.reply({content: "找不到玩家 `"+name+"` 的紀錄 :(", ephemeral: true})
                return;
            }
        	
        	const target_info = await database.findOne({name: name});
       
                    const embed = new EmbedBuilder()
                        .setColor('#ee831b')
                        .setTitle(name)
                        .setDescription(server === 'all' ? "全部伺服器" : serverParamsToChinese(server)+"服")
                        .setThumbnail('https://crafatar.com/avatars/'+target_info.UUID+"?overlay")
                        .addFields({
                            name: "勝利次數", 
                            value: count+"次"
                        });
                    interaction.reply({embeds: [embed]});
                
            
        }
}