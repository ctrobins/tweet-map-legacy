// Run this file to generate the top 50 national Twitter trends

const axios = require('axios');
const db = require('./database.js');
const TWITTER_AUTH = 'Bearer AAAAAAAAAAAAAAAAAAAAAKhl6QAAAAAA7ryEMrycuJRLTZbyiyZmAJ6%2F8HM%3DgeDvD8L50Q0TgKP7cQJge4PLS26U7YvNlnlruVZ4n1HOo0TWJQ'

// db.clearNationalTrends((err) => {
//   if (err) {
//     console.log('Error in clearing national trends:', err);
//   } else {
      axios.get('https://api.twitter.com/1.1/trends/place.json?id=23424977', {
        headers: {
          Authorization: TWITTER_AUTH
        }
      }).then((res) => {
        formatData(res.data[0].trends);
      }).catch((err) => {
        console.log('Error in retrieving national trends:', err);
      });
//   }
// });
      
const formatData = (data) => {
  let count = 0;
  const today = new Date(Date.now()).toDateString();
  // const promises = [];
  for (let trend of data) {
    count++;
    // promises.push(
      db.saveNationalTrend({
        trend: trend.name,
        rank: count,
        date: today,
      })
    // );
  }
  // Promise.all(promises).then(() => db.endConnection());
};