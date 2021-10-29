const {getAnnoucementChannel} = require("../../../index.js");

module.exports = {
    run: function(bot, msg, params){
        getAnnoucementChannel().send({content: `<@&${config.skyblockID}> <@&${config.survivalID}>`,embeds: [eventMessages.eventTomorrow(params[0],params[1],bot.user.avatarURL(),params[2],params[3])]});
    }
}