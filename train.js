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
const requests = new RequestManager(`http://127.0.0.1:${port}/choice_model/event`);

const requestPoolSize = 20;

requests.on('success', function () {
  requests.printStatus();
  createNextRequest();
});

requests.on('failure', function (body, err) {
  // a request failed, try enqueueing it again
  console.log(`A request failed with body: ${body}`);
  console.log('Putting it again in the queue.');
  requests.createNextRequest(body);
});

function createNextRequest() {
  const nextEvent = eventParser.getNextEvent();
  if (nextEvent) {
    requests.createNextRequest({
      event: nextEvent
    });
  }
}

for (let i = 0; i < requestPoolSize; i++) {
  createNextRequest();
}
