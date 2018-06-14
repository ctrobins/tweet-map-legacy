const express = require('express');
const bodyParser = require('body-parser');
const db = require('../database/database');

var app = express();

app.use(express.static(__dirname + '/../client/dist/'));
app.use(bodyParser.json());

app.get('/nationaltrends', async (req, res) => {
  console.log('GET request for national trends');
  let trends = await db.getNationalTrends();
  res.send(trends);
});

app.get('/keywords', async (req, res) => {
  console.log('GET request for state keywords');
  let keywords = await db.getStateKeywords();
  res.send(keywords);
});

app.get('/bubbles', (req, res) => {
  db.getBubbles((err, data) => {
    if (err) {
      res.status(404).end();
    } else {
      res.send(data);
    }
  });
});

app.post('/statepercentages', async (req, res) => {
  console.log('POST request for state percentages for', req.body.word);
  let percents = await db.getStatePercentages(req.body);
  res.send(percents);
})

app.listen(process.env.PORT || 3000, function() {
  console.log(`Listening on port ${process.env.PORT || 3000}!`);
});