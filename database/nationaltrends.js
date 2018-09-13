// Run this file to generate the top 50 Twitter trends, stored in national-trends.json
// That file will be importable

const axios = require('axios');
//const fs = require('fs');
const db = require('./database.js');

db.clearNationalTrends((err) => {
  if (err) {
    console.log('Error in clearing national trends', err);
  } else {
    axios.get('https://api.twitter.com/1.1/trends/place.json?id=23424977', {
      headers: {
        Authorization: 'Bearer AAAAAAAAAAAAAAAAAAAAAKhl6QAAAAAA7ryEMrycuJRLTZbyiyZmAJ6%2F8HM%3DgeDvD8L50Q0TgKP7cQJge4PLS26U7YvNlnlruVZ4n1HOo0TWJQ',
      },
    }).then((res) => {
      formatData(res.data[0].trends);
    }).catch((err) => {
      console.log(err.response.data);
    });

    let count = 0;
    const today = new Date(Date.now()).toDateString();
    
    const formatData = (data) => {
      const promises = [];
      for (const trend of data) {
        count++;
        promises.push(db.saveNationalTrend({
          trend: trend.name,
          rank: count,
          date: today,
        }));
      }
      Promise.all(promises).then(() => db.endConnection());
    };
  }
});


// const filePath = './database/national-trends.json';

// await fs.appendFileSync(filePath, JSON.stringify({
//   trend: trend.name,
//   rank: count,
//   date: today
// }));

// await fs.appendFileSync(filePath, '\n');