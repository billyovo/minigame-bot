const events = require('../../editables/event.json');
const config = require('../../editables/config.json');
const serverArgs = ['survival','sur','生存'];
module.exports= {
    getEmoteByName: function(name){
        let result = events.find(event => event.title == name);
        return result ? result.emote : "";
    },
    getEventNameByID: function(id){
        let result = events.find(event => event.id == id);
        return result ? result.title : "";
    },
    getImageURLByID: function(id){
        let result = events.find(event => event.id == id);
        return result ? result.imageurl : "";
    },
    serverParamsToDBName: function(params){
        return serverArgs.includes(params.toLowerCase()) ? "survival" : "skyblock";
    },
    serverParamsToChannelID: function(params){
        return serverArgs.includes(params.toLowerCase()) ? config.survivalID : config.skyblockID;
    },
    serverParamsToChinese: function(params){
        return serverArgs.includes(params.toLowerCase()) ? "生存" : "空島";
    }
}