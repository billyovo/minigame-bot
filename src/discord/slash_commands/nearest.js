const {getEventSchedule} = require("../../utility/checkEvents");

module.exports = {
    run: function(bot, interaction){
        const nearestEvent = getEventSchedule().nearest;
        interaction.reply(nearestEvent.emote+" "+nearestEvent.title+" "+nearestEvent.emote+"\r\n"+`<:cobblestone:833225746020696075> 空島: <t:${parseInt(nearestEvent.date.toSeconds())}:R>`+"\r\n"+`<:grassblock:833226098020057088> 生存: <t:${parseInt(nearestEvent.date.plus({hours: 1}).toSeconds())}:R>`);
    }
}