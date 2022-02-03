const {getAnnoucementChannel} = require("../init.js");
var { DateTime } = require('luxon');
const eventMessages = require("../../../editables/messages.js");

module.exports = {
    run: function(bot, msg, params){
        if(!params[0]){
            getAnnoucementChannel().send(eventMessages.eventMazeToday());
            return;
        }
        if(DateTime.fromFormat(params[0],"hh:mm").isValid){
            getAnnoucementChannel().send(eventMessages.eventMazeToday(params[0]));   
        }
        else{
            getAnnoucementChannel().send(eventMessages.eventMazeToday("unknown"));
        }
    }
}