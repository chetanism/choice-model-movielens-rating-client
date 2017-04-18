const EventParser = require('./EventParser');
const RequestManager = require('choice-model-client-utils/RequestManager');
const Movie = require('./movies');

const filename = process.argv[2];
if (filename === undefined) {
  throw new Error('Provide training filename');
}
const port = process.argv[3];


Movie.loadMovies('./data/movielens/movie.csv');

const eventParser = new EventParser(filename);
const requests = new RequestManager(`http://127.0.0.1:${port}/choice_model/predict`);

const requestPoolSize = 40;
const matches = [0, 0, 0, 0, 0, 0];

let count = 0;
let map = 0.0;


requests.on('failure', function (body, err) {
  console.log(`A request failed with body ${body}`);
  console.log('Querying it again..');
  requests.createNextRequest(body);
});

requests.on('success', function (body, resp) {
  count++;
  const actual = body.event.choice_ids[0];
  console.log(JSON.stringify(resp));
  const predictions = Object.keys(resp.predictions);

  let weightSum = 0;
  const prediction = predictions.reduce(function (val, r) {
    const rating = parseFloat(r);
    const weight = resp.predictions[r];
    weightSum += weight;
    return val + (rating * weight);
  }, 0);
  const roundedPrediction = Math.round((prediction/weightSum) * 2)/2;

  const diff = Math.abs(parseFloat(actual) - roundedPrediction);
  let scale = Math.round(diff);
  if (scale > 3) {
    scale = 3;
  }

  matches[scale]++;

  const position = predictions.indexOf(actual);
  if (position > 0) {
    map += 1/position;
  }

  console.log('-------------------');
  console.log(`actual: ${actual}`);
  console.log(`predictions ${predictions}`);
  console.log(`rounded prediction ${roundedPrediction}`);
  console.log(`scale counts: ${matches}`);
  console.log(`scale counts ratios: ${matches.map(c => c/count)}`);
  console.log(`map = ${map/count}`);
  createNextRequest();
});

function createNextRequest() {
  const nextEvent = eventParser.getNextEvent();
  if (nextEvent) {
    requests.createNextRequest({
      event: nextEvent,
      max_count: 0
    });
  }
}

for (let i = 0; i < requestPoolSize; i++) {
  createNextRequest();
}







