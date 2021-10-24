const config = require('../../editables/config.json')
const mysql = require('mysql');

var pool = mysql.createPool(config.dbconfig);

module.exports= {
    connect: function(){
        return new Promise((resolve) => {
            pool.on('connection', function (connection) {
              connection.on('error', function (err) {
                console.error(err);
              });
            });
            resolve();
        })
    },

    query: function(query,params = []){
        return new Promise((resolve, reject)=>{
        pool.query(query,params, function (error, results) {
            if (error) reject(error);
            resolve(results);
          });
        })
    }
}