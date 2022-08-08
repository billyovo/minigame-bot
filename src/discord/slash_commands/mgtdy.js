const {getAnnoucementChannel} = require("../init.js");
const {getEmoteByName, getEventNameByID} = require("../../Helper/eventHelper.js");
const {createConfirmCollector, createButtonRows} = require("../../Helper/buttonHelper.js");
const eventMessages = require("../../../editables/event_messages.js");
const config = require("../../../editables/config.json");

module.exports = {
    run: async function(bot, interaction){
        const event = interaction.options.get("name").value;
        const server = interaction.options.get("server").value;

        const event_name = getEventNameByID(event);
        const event_emote = getEmoteByName(event_name);

        const time = interaction.options.get("time")?.value ?? server=== "survival" ? "22:00" : "21:00";

        const roleID = server === 'survival' ? config.skyblockID : config.skyblockID;
        
        await interaction.reply({ content: `I am going to send this to <#${getAnnoucementChannel().id}>\r\n\r\n\r\n ${eventMessages.eventStart(event_emote, event_name, time, roleID)}`, components: [createButtonRows()]});
        
        createConfirmCollector(interaction, interaction.user, ()=>{
            return getAnnoucementChannel().send(eventMessages.eventStart(event_emote, event_name, time, roleID));
        });
    },
}