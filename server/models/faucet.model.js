/*
   Created by amplified
*/
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var MODEL_NAME = 'PRODUCER';
var TABLE_NAME = 'PRODUCER';
var MODEL;

var API = new mongoose.Schema({
  name: {
    type: String,
    index: true
  },
  created: {
    type: Number,
    index: true,
    default: 0
  }
});


module.exports = function (connection) {
  if ( !MODEL ) {
    if ( !connection ) {
      connection = mongoose;
    }
    MODEL = connection.model(MODEL_NAME, API, TABLE_NAME);
  }
  return MODEL;
};

