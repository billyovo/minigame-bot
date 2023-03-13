const {getAnnoucementChannel} = require("../init.js");
const {createConfirmCollector, createButtonRows} = require("../../Helper/buttonHelper.js");
const eventMessages = require("../../../editables/event_messages.js");
const config = require("../../../editables/config.json");
const { DateTime } = require('luxon');

module.exports = {
    run: async function(bot, interaction){

        let next_time = interaction.options.get("next_time")?.value;

        if(next_time){
            next_time = DateTime.fromFormat(next_time,"hh:mm").isValid ? next_time : "unknown";
        }
        else{
            next_time = "13:30";
        }

        await interaction.reply({ content: `I am going to send this to <#${getAnnoucementChannel().id}>\r\n\r\n\r\n ${eventMessages.eventMazeToday(next_time)}`, components: [createButtonRows(interaction)]});
        
        createConfirmCollector(interaction, interaction.user, ()=>{
            return getAnnoucementChannel().send(`${eventMessages.eventMazeToday(next_time)}`);
        });
    },
}