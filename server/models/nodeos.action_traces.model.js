var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var MODEL_NAME = 'action_traces';
var TABLE_NAME = 'action_traces';
var MODEL;

var API = new mongoose.Schema({
  name: { 
    type: String
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



