const {getAnnoucementChannel} = require("../../../index.js");

module.exports = {
    run: function(bot, msg, params){
        let server = serverParamsToChannelID(params[3]);
        getAnnoucementChannel().send(eventMessages.eventStart(params[0],params[1],params[2],server));
    }
}