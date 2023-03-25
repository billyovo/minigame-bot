const {getEventSchedule} = require("../../utility/checkEvents");
module.exports = {
    run: function(bot, interaction){
        const selectedEvent = getEventSchedule()[interaction.options.get("name").value];
        interaction.reply(selectedEvent.emote+" "+selectedEvent.title+" "+selectedEvent.emote+"\r\n"+`<:cobblestone:833225746020696075> 空島: <t:${parseInt(selectedEvent.date.toSeconds())}:f>`+"\r\n"+`<:grassblock:833226098020057088> 生存: <t:${parseInt(selectedEvent.date.plus({hours: 1}).toSeconds())}:f>`);
    }
}