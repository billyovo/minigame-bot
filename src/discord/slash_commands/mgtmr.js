const {getAnnoucementChannel} = require("../init.js");
const {getEmoteByName, getEventNameByID, getImageURLByID} = require("../../Helper/eventHelper.js");
const {createConfirmCollector, createButtonRows} = require("../../Helper/buttonHelper.js");
const eventMessages = require("../../../editables/event_messages.js");
const config = require("../../../editables/config.json");

module.exports = {
    run: async function(bot, interaction){
        const event = interaction.options.get("name").value;

        const event_name = getEventNameByID(event);

        const sur_time = interaction.options.get("survival_time")?.value ?? "22:00";
        const sky_time = interaction.options.get("skyblock_time")?.value ?? "21:00";

        
        await interaction.reply({ content: `I am going to send this to <#${getAnnoucementChannel().id}>`, components: [createButtonRows(interaction)], embeds: [eventMessages.eventTomorrow(getImageURLByID(event),event_name,bot.user.avatarURL(),sky_time,sur_time)]});
        
        createConfirmCollector(interaction, interaction.user, ()=>{
            return getAnnoucementChannel().send({content: `<@&${config.skyblockID}> <@&${config.survivalID}>`,embeds: [eventMessages.eventTomorrow(getImageURLByID(event),getEventNameByID(event),bot.user.avatarURL(),sky_time,sur_time)]});
        });
    },
}