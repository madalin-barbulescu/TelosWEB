var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var MODEL_NAME = 'accounts';
var TABLE_NAME = 'accounts';
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
