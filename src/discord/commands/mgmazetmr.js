const {getAnnoucementChannel} = require("../init.js");
const eventMessages = require("../../../editables/messages.js");
const config = require('../../../editables/config.json');

module.exports = {
    run: function(bot, msg, params){
        if(params[0]){
            if(!params[1])
            {
                msg.reply("TYPE THE END TIME TOO YOU BAD BOT USER!");
            }
            else{
                getAnnoucementChannel().send({content: `<@&${config.skyblockID}> <@&${config.survivalID}>`,embeds:[eventMessages.eventMazeTomorrow(bot.user.avatarURL(),params[0],params[1])]});
            }
        }
        else{
            getAnnoucementChannel().send({content: `<@&${config.skyblockID}> <@&${config.survivalID}>`, embeds:[eventMessages.eventMazeTomorrow(bot.user.avatarURL())]});
        }
    }
}