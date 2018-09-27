var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var MODEL_NAME = 'pub_keys';
var TABLE_NAME = 'pub_keys';
var MODEL;

var API = new mongoose.Schema({
  account: { 
    type: String
  },
  public_key: { 
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

