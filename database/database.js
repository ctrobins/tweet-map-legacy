const mongoose = require("mongoose");
const dotenv = require('dotenv').config({silent: true});
mongoose.Promise = global.Promise;
const mongoPath = process.env.MONGO_URL;
mongoose.connect(mongoPath);
const db = mongoose.connection;
const Schema = mongoose.Schema;
const sw = require("stopword");
const _ = require("underscore");
const bodyParser = require("body-parser");
const rp = require("remove-punctuation");
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", function() {
  console.log("Connection Established.");
});

const nationalTrend = mongoose.model("NationalTrend",
  new Schema({ trend: String, rank: Number, date: String }), "NationalTrends");

const globalTrend = mongoose.model("GlobalTrend",
  new Schema({ trend: String, rank: Number, date: String }), "GlobalTrends");

const stateTweet = mongoose.model("StateTweet",
  new Schema({ state: String, text: String }), "StateTweets");

const stateKeyword = mongoose.model("StateKeyword",
  new Schema({}), "statekeywords");

const Tweet = mongoose.model("Tweet",
  new Schema({ place: String, state: String, country: String, text: String, username: String, link: String, createdAt: Date, latitude: Number, longitude: Number, radius: Number}), "Tweets");

const Bubble = mongoose.model("Bubble",
  new Schema({ place: String, state: String, country: String, text: String, username: String, link: String, createdAt: Date, latitude: Number, longitude: Number, radius: Number}), "Bubbles");

// const keywordSchema = mongoose.Schema({}, { strict: false, versionKey: false });
// const stateKeywordCreate = mongoose.model("stateKeyword", keywordSchema);

// const states = [
//   "AL",
//   "AK",
//   "AZ",
//   "AR",
//   "CA",
//   "CO",
//   "CT",
//   "DE",
//   "DC",
//   "FL",
//   "GA",
//   "HI",
//   "ID",
//   "IL",
//   "IN",
//   "IA",
//   "KS",
//   "KY",
//   "LA",
//   "ME",
//   "MD",
//   "MA",
//   "MI",
//   "MN",
//   "MS",
//   "MO",
//   "MT",
//   "NE",
//   "NV",
//   "NH",
//   "NJ",
//   "NM",
//   "NY",
//   "NC",
//   "ND",
//   "OH",
//   "OK",
//   "OR",
//   "PA",
//   "RI",
//   "SC",
//   "SD",
//   "TN",
//   "TX",
//   "UT",
//   "VT",
//   "VA",
//   "WA",
//   "WV",
//   "WI",
//   "WY"
// ];

// let totalTweetArray = [];
// let fiftyplusstates = [];
// stateTweet.find()
//   .exec()
//   .then(res => {
//     //Go through list of a state's tweets and format
//     for (let doc of res) {
//       let message = doc.text.split(" ");
//       for (let state of states) {
//         if (doc.state === state) {
//           let obj = {};
//           let message = doc.text.split(" ");
//           let keywordCollection = sw.removeStopwords(message);
//           let keyword = keywordCollection.map(word => {
//             word = rp(word).toLowerCase();
//             if (
//               typeof word === "string" &&
//               typeof word !== "undefined" &&
//               word !== "" &&
//               word !== " " &&
//               word !== "-"
//             ) {
//               return word;
//             }
//           });
//           let stateKeyWords = _.countBy(keyword);
//           obj.state = state;
//           obj.keywords = [stateKeyWords];
//           totalTweetArray.push(obj);
//         }
//       }
//     }

//     for (let state of states) {
//       //iterates through the list of 50 states (+DC)
//       let stateObj = {};
//       let stateName = {};
//       let stateList = {};
//       stateObj.trends = [];

//       for (let tweet of totalTweetArray) {
//         //each state has a list of tweets associated with it. This consolidates those into one list
//         if (tweet.state === state) {
//           tweet.keywords.forEach(list => {
//             if (tweet.state === state) {
//               let combinedStateKeywords = Object.assign(stateList, list);
//               stateList = combinedStateKeywords;
//             }
//           });
//         }
//       }
//       for (let key in stateList) {
//         //formatting based on The Ohzone's Request, {word: "apple", count: 2}
//         let word = "";
//         let count = "";
//         word = key;
//         count = stateList[key];
//         stateObj.trends.push({ word: word, count: count });
//       }
//       stateObj.trends.sort((a, b) => b.count - a.count); //after formatting, sort by count and slice the top 10
//       stateObj.trends = stateObj.trends.slice(0, 10);

//       let topKeywordsByState = { state: state, trends: stateObj.trends };
//       fiftyplusstates.push(topKeywordsByState);
//     }

//     for (let state of fiftyplusstates) {
//       console.log('CREATING');
//       //saves each as a document to mongodb, notice the schema for stateKeyword is a blank canvas with "strict: false", used this because mongodb does not allow dynamic keys in schema
//         let data = new stateKeywordCreate({ state: state.state, keywords: state.trends });
//         data.save(function(err) {
//           if (err) {
//             console.log("error");
//           }
//           console.log("saved");
//         });

//     }
//   });

const saveStateTweet = (data) => {
  stateTweet(data).save();
}

const saveTweet = (data) => {
  Bubble(data).save();
}

const saveNationalTrend = (data) => {
  nationalTrend(data).save();
}

const saveGlobalTrend = (data) => {
  globalTrend(data).save();
}

const getNationalTrends = async () => {
  let res = await nationalTrend.find({ rank: { $lte: 15 } }).select("trend");
  return res;
};

const getStateKeywords = async () => {
  let res = await stateKeyword.find({});
  return res;
}

const getStatePercentages = async keyword => {
  let percents = await stateTweet.aggregate([
    {
      $group: {
        _id: "$state",
        state: { $first: "$state" },
        totalCount: { $sum: 1 },
        text: { $push: "$text" }
      }
    },
    {
      $unwind: "$text"
    },
    {
      $match: {
        text: { $regex: keyword.word, $options: "i" }
      }
    },
    {
      $group: {
        _id: "$state",
        state: { $first: "$state" },
        totalCount: { $first: "$totalCount" },
        matchCount: { $sum: 1 },
        text: { $push: "$text" }
      }
    },
    {
      $project: {
        _id: 0,
        state: 1,
        text: 1,
        percent: {
          $multiply: [{ $divide: ["$matchCount", "$totalCount"] }, 100]
        }
      }
    }
  ]);

  let percentsObj = {};
  for (let val of percents) {
    percentsObj[val.state] = {
      fillKey: Math.round(val.percent * 100) / 100,
      text: val.text.slice(0, 5)
    };
  }

  return percentsObj;
};

const configBubble = () => {
  console.log('CONFIG BUBBLE!');
  Tweet.update({county: 'AU'}, {radius: 1});
}

const getBubbles = (callback) => {
  Bubble.find({}, (err, data) => {
    if (!err) {
      callback(null, data);
    }
  });
}

module.exports = {
  saveTweet: saveTweet,
  saveStateTweet: saveStateTweet,
  saveNationalTrend: saveNationalTrend,
  saveGlobalTrend: saveGlobalTrend,
  getNationalTrends: getNationalTrends,
  getStateKeywords: getStateKeywords,
  getStatePercentages: getStatePercentages,
  configBubble: configBubble,
  getBubbles: getBubbles,
};
