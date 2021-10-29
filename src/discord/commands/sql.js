const db = require('../../Helper/db.js');

module.exports = {
    run: function(bot, msg, params){
        db.query(params.join(' '))
            .then((result)=>{
                msg.channel.send(JSON.stringify(result));
            })
            .catch((error)=>{
                msg.channel.send(error.message);
            })
            
    }
}