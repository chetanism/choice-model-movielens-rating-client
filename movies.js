const CSVReader = require('choice-model-client-utils/CSVReader');

const movies = {};

function loadMovies(filename) {
  const reader = new CSVReader(filename);
  let movieObject;
  console.log('Loading Movies...');
  while(movieObject = reader.getNextObject()) {
    movieObject.genres = movieObject.genres.split('|');
    movies[movieObject.movieId] = movieObject;
  }
  console.log('Loaded Movies.');
}

function getMovie(movieId) {
  return movies[movieId];
}

module.exports = {
  loadMovies: loadMovies,
  getMovie: getMovie
};
