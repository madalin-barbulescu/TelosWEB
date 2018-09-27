var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var MODEL_NAME = 'transaction_traces';
var TABLE_NAME = 'transaction_traces';
var MODEL;

var API = new mongoose.Schema({
  id: { 
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

