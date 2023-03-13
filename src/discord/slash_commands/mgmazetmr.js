const {getAnnoucementChannel} = require("../init.js");
const {createConfirmCollector, createButtonRows} = require("../../Helper/buttonHelper.js");
const eventMessages = require("../../../editables/event_messages.js");
const config = require("../../../editables/config.json");

module.exports = {
    run: async function(bot, interaction){


        const reset_time = interaction.options.get("reset_time")?.value ?? "13:30";
        const open_time = interaction.options.get("finish_time")?.value ?? "14:00";

        
        await interaction.reply({ content: `I am going to send this to <#${getAnnoucementChannel().id}>`, components: [createButtonRows(interaction)], embeds: [eventMessages.eventMazeTomorrow(bot.avatarURL, reset_time, open_time)]});
        
        createConfirmCollector(interaction, interaction.user, ()=>{
            return getAnnoucementChannel().send({content: `<@&${config.skyblockID}> <@&${config.survivalID}>`,embeds: [eventMessages.eventMazeTomorrow(bot.avatarURL, reset_time, open_time)]});
        });
    },
}