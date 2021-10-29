const db = require('../../Helper/db.js');


module.exports = {
    run: function(bot,msg,params){
        db.query('SELECT * FROM player')
        .then((data)=>{
             let result = '';
             data.forEach((row)=>{
                 result += row.name+": "+ row.uuid+'\r\n';
             })
             msg.channel.send(result);
         })
        .catch((error)=>{
             msg.channel.send('db error occured! '+error.message);
             console.error(error);
         })
    }
}

