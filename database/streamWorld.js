const Twit = require('twit');
const db = require('./database.js');

const twit = new Twit({
  consumer_key: 'm6kmS86SUUK2klF4bLTcOc6On',
  consumer_secret: 'b7wfrtKleDsfgtkF0L3m2j0bh8K4StlXVvZppgpF6Ij1hTDypA',
  access_token: '1001852482828500992-7CpD2KafBQ6qqWpcMQWv4TyC9I22ad',
  access_token_secret: 'zljSTq0DcQo02x3ZXCVYDB8Y3wCsORMXZwpzDyRTGfCc9',
});

let count = 0;

const acronyms = {
    Alabama: 'AL',
    Alaska: 'AK',
    Arizona: 'AZ',
    Arkansas: 'AR',
    California: 'CA',
    Colorado: 'CO',
    Connecticut: 'CT',
    Delaware: 'DE',
    'District Of Columbia': 'DC',
    Florida: 'FL',
    Georgia: 'GA',
    Hawaii: 'HI',
    Idaho: 'ID',
    Illinois: 'IL',
    Indiana: 'IN',
    Iowa: 'IA',
    Kansas: 'KS',
    Kentucky: 'KY',
    Louisiana: 'LA',
    Maine: 'ME',
    Maryland: 'MD',
    Massachusetts: 'MA',
    Michigan: 'MI',
    Minnesota: 'MN',
    Mississippi: 'MS',
    Missouri: 'MO',
    Montana: 'MT',
    Nebraska: 'NE',
    Nevada: 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    Ohio: 'OH',
    Oklahoma: 'OK',
    Oregon: 'OR',
    Pennsylvania: 'PA',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    Tennessee: 'TN',
    Texas: 'TX',
    Utah: 'UT',
    Vermont: 'VT',
    Virginia: 'VA',
    Washington: 'WA',
    'West Virginia': 'WV',
    Wisconsin: 'WI',
    Wyoming: 'WY',
};


const twitStream = (stream, scope) => {
    stream.on('tweet', (tweet) => {
        count += 1;
        //console.log(scope, tweet.text);
        
        if (tweet.place && (tweet.place.place_type === 'city' || tweet.place.place_type === 'admin')) {
            let state;
            if (tweet.place.country_code === 'US') {
                if (tweet.place.place_type === 'city') {
                    // Get state abbreviation from the end of the place name
                    state = tweet.place.full_name.slice(tweet.place.full_name.length - 2);
                } else {
                    // Remove ", USA" fron the place name and convert to abbreviation
                    const stateName = tweet.place.full_name.slice(0, tweet.place.full_name.length - 5);
                    if (Object.keys(acronyms).includes(stateName)) {
                        state = acronyms[stateName];
                    }
                }
            }
            let tweetText = tweet.text;
            if (tweet.retweeted_status !== undefined) {
                tweetText += ` ~ ${tweet.retweeted_status.text}`;
            }
            if (tweet.quoted_status !== undefined) {
                tweetText += ` ~ ${tweet.quoted_status.text}`;
            }
            
            db.saveTweet({
                id: tweet.id_str,
                place: tweet.place.full_name,
                state,
                country: tweet.place.country_code,
                text: tweetText,
                username: tweet.user.screen_name,
                tweetedAt: tweet.created_at,
                link: `https://twitter.com/statuses/${tweet.id_str}`,
                latitude: tweet.place.bounding_box.coordinates[0][0][1],
                longitude: tweet.place.bounding_box.coordinates[0][0][0],
                radius: 2.5,
                createdAt: Date.now(),
            });
        }
    });
};

// Create a new stream
const streamWorld = twit.stream('statuses/sample');

// Start the new stream
twitStream(streamWorld, 'World');

setTimeout(() => {
    streamWorld.stop();
    db.endConnection();
    console.log(`Stored ${count} World tweets!`);
}, 25 * 60 * 1000);