const events = require('../editables/event.json');
module.exports= {
    getEmoteByName: function(name){
        let result = events.find(event => event.title == name);
        return result ? result.emote : "";
    },
    serverParamsToDBName: function(params){
        const serverArgs = ['survival','sur','生存'];
        return serverArgs.includes(params.toLowerCase()) ? "survival" : "skyblock";
    }
}