const express = require('express');
require('dotenv').config();
var fs = require('fs');
const path = require('path');
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const mongourl = `mongodb+srv://discord:[INSERTPASS]@discordbot.fjqyf.mongodb.net/?retryWrites=true&w=majority`;

const app = express();
const port = process.env.PORT || 80;
app.listen(port, () => console.log(`Server listening at port ${port}`));
app.use(express.static(__dirname + "/public"));
app.use(express.json({ limit: '100mb', extended: true }));

var publicPath = path.join(__dirname, 'public');

app.get('/', function(req, res) {
  res.sendFile(publicPath + '/index.html');
});

app.get('/AccCreator', function(req, res) {
  res.sendFile(publicPath + '/createaccount.html');
});

app.get('/AdminPage', function(req, res) {
  res.sendFile(publicPath + '/admin.html');
});

app.get('/getscoreboard', (request, response) => {
  MongoClient.connect(mongourl, async function(err, db) {
    if (err) throw err;
    var dbo = db.db("misc");
    var mysort = { wins: -1 };
    let users = await dbo.collection("gamenight").find().sort(mysort).toArray();
    let neededInformation = [];
    for(user of users) {
      neededInformation.push({
        name: user.name,
        wins: user.wins,
        lose: user.lose,
        color: user.color,
        img: user.img,
        id: ObjectId(user._id).toString()
      });
    }
    response.json(neededInformation);
    db.close();
  });
});

app.post('/getaccount', (request, response) => {
  const data = request.body;
  MongoClient.connect(mongourl, async function (err, db) {
      if (err) throw err;
      var dbo = db.db("misc");
      let user = await dbo.collection("gamenight");
      let userData = {
        name: data.name,
        color: data.color,
        img: data.img,
        wins: 0,
        lose: 0
      }
      await user.insertOne(userData);
      db.close();
  });
});

app.post('/getdb', (request, response) => {
  const data = request.body;
  MongoClient.connect(mongourl, async function (err, db) {
      if (err) throw err;
      var dbo = db.db("misc");
      if(data.action === "delete") {
        await dbo.collection("gamenight").findOneAndDelete({_id: ObjectId(data.id.toString())});
      } else if(data.action === "increase") {
        await dbo.collection("gamenight").findOneAndUpdate({_id: ObjectId(data.id.toString())}, { $inc : { "wins" : 1 } });
      } else if(data.action === "decrease") {
        await dbo.collection("gamenight").findOneAndUpdate({_id: ObjectId(data.id.toString())}, { $inc : { "lose" : 1 } });
      }
      db.close();
  });
});
