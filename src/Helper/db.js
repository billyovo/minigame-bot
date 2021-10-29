const config = require('../../editables/config.json')
const mysql = require('mysql');

var pool = mysql.createPool(config.dbconfig);

function connect(){
  return new Promise((resolve) => {
      pool.on('connection', function (connection) {
        connection.on('error', function (err) {
          console.error(err);
        });
      });
      resolve();
  })
}

connect().then(() => {
  console.log('Connected to database');
})

module.exports= {
    query: function(query,params = []){
        return new Promise((resolve, reject)=>{
        pool.query(query,params, function (error, results) {
            if (error) reject(error);
            resolve(results);
          });
        })
    }
}