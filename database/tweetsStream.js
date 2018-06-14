//Run this file to stream tweets from Twitter, saved to tweets.json
//Time is set on the last line of the file

const Twit = require('twit');
const db = require('./database.js');

const twit = new Twit({
  consumer_key:         'm6kmS86SUUK2klF4bLTcOc6On',
  consumer_secret:      'b7wfrtKleDsfgtkF0L3m2j0bh8K4StlXVvZppgpF6Ij1hTDypA',
  access_token:         '1001852482828500992-7CpD2KafBQ6qqWpcMQWv4TyC9I22ad',
  access_token_secret:  'zljSTq0DcQo02x3ZXCVYDB8Y3wCsORMXZwpzDyRTGfCc9'
});

const US = ['-177', '18.0', '-65.0', '72.0'];

// const AUS = ['113.3', '-43.6', '153.6', '-10.7'];

const acronyms = {
  "Alabama": "AL", 
  "Alaska": "AK", 
  "Arizona": "AZ", 
  "Arkansas": "AR", 
  "California": "CA", 
  "Colorado": "CO", 
  "Connecticut": "CT", 
  "Delaware": "DE", 
  "District Of Columbia": "DC", 
  "Florida": "FL", 
  "Georgia": "GA", 
  "Hawaii": "HI", 
  "Idaho": "ID", 
  "Illinois": "IL", 
  "Indiana": "IN", 
  "Iowa": "IA", 
  "Kansas": "KS", 
  "Kentucky": "KY", 
  "Louisiana": "LA", 
  "Maine": "ME", 
  "Maryland": "MD", 
  "Massachusetts": "MA", 
  "Michigan": "MI", 
  "Minnesota": "MN", 
  "Mississippi": "MS", 
  "Missouri": "MO", 
  "Montana": "MT", 
  "Nebraska": "NE", 
  "Nevada": "NV", 
  "New Hampshire": "NH", 
  "New Jersey": "NJ", 
  "New Mexico": "NM", 
  "New York": "NY", 
  "North Carolina": "NC", 
  "North Dakota": "ND", 
  "Ohio": "OH", 
  "Oklahoma": "OK", 
  "Oregon": "OR", 
  "Pennsylvania": "PA", 
  "Rhode Island": "RI", 
  "South Carolina": "SC", 
  "South Dakota": "SD", 
  "Tennessee": "TN", 
  "Texas": "TX", 
  "Utah": "UT", 
  "Vermont": "VT", 
  "Virginia": "VA", 
  "Washington": "WA", 
  "West Virginia": "WV", 
  "Wisconsin": "WI", 
  "Wyoming": "WY", 
};

let count = 0;

const stream = twit.stream('statuses/sample'); //, {locations: US});

stream.on('tweet', (tweet) => {
  if (tweet.place) {
    count++;
    console.log(tweet.text);

    if (tweet.place.country_code === 'US' && (tweet.place.place_type === 'city' || tweet.place.place_type === 'admin')) {
      var state = undefined;
      if (tweet.place.place_type  === 'city') {
        // Get state abbreviation from the end of the place name
        state = tweet.place.full_name.slice(tweet.place.full_name.length - 2);
      } else {
        // Remove ", USA" fron the place name and convert to abbreviation
        let stateName = tweet.place.full_name.slice(0, tweet.place.full_name.length - 5);
        if (Object.keys(acronyms).includes(stateName)) {
          state = acronyms[stateName];
        }
      }
    }

    let tweetText = tweet.text;
    if (tweet.retweeted_status !== undefined) {
      tweetText += " ~ " + tweet.retweeted_status.text;
    } 
    if (tweet.quoted_status !== undefined) {
      tweetText += " ~ " + tweet.quoted_status.text;
    }

    // Temporarily using this table just to match the style of the original project
    // if (state !== undefined) {
    //   db.saveStateTweet({
    //     state: state,
    //     text: tweetText
    //   });
    // }
    // This is the real table we will use for both US and international tweets
    db.saveTweet({
      place: tweet.place.full_name,
      state: state,
      country: tweet.place.country_code,
      text: tweetText,
      username: tweet.user.screen_name,
      createdAt: tweet.created_at,
      link: `https://twitter.com/statuses/${tweet.id_str}`,
      latitude: tweet.place.bounding_box.coordinates[0][0][1],
      longitude: tweet.place.bounding_box.coordinates[0][0][0],
      radius: 1,
      significance: tweetText,
    });
  }
});

const stopStream = () => {
  stream.stop();
  console.log(`Stored ${count} tweets!`);
}

// Just keeping this temporarily until we get the cron job working
setTimeout(() => {
  stopStream();
}, 60 * 60 * 1000);