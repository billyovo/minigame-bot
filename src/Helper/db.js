const { MongoClient } = require('mongodb');
require('dotenv').config();
const client = new MongoClient(process.env.connection);

const db = client.db("admin_minigames");
const winner = db.collection('winner');
const news = db.collection('news');
module.exports= {
   database: winner,
   news: news
}
