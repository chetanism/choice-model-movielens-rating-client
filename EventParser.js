const BaseEventParser = require('choice-model-client-utils/EventParser');
const Movie = require('./movies');


class EventParser extends BaseEventParser {
  parseEvent(eventData) {

    const movieId = eventData.movieId;
    const movie = Movie.getMovie(movieId);

    return {
      user_id: eventData.userId,
      context_ids: movie.genres,
      choice_ids: [Number(eventData.rating).toString()],
      weight: 1
    };
  }
}

module.exports = EventParser;