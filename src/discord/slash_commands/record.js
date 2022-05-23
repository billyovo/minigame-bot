const db = require("../../Helper/db.js");
const {serverParamsToChinese} = require("../../Helper/eventHelper.js");
const {MessageEmbed} = require("discord.js");
module.exports = {
    run: function(bot, interaction){
            const target = interaction.options.get("player");
            const name = target?.member?.nickname || target?.user?.username;
            const server = interaction.options.get("server").value;
            db.query("CALL count_name (?,?,?,?,?)",[server, "all", name, 1, 0])
            .then((result)=>{
                if(result[0].length === 0){
                    interaction.reply({content: "找不到玩家 `"+name+"` 的紀錄 :(", ephemeral: true})
                }
                else{
                    const embed = new MessageEmbed()
                        .setColor('#ee831b')
                        .setTitle(name)
                        .setDescription(server === 'all' ? "合共紀錄" : serverParamsToChinese(server)+"服")
                        .setThumbnail('https://crafatar.com/avatars/'+result[0][0].uuid+"?overlay")
                        .addFields({
                            name: "勝利次數", 
                            value: result[0][0].total+"次"
                        });
                    interaction.reply({embeds: [embed]});
                }
            })
            .catch((error)=>{
                console.log(error);
                interaction.reply({content:"一個未知的錯誤發生了!", ephemeral: true});
            })
        }
}