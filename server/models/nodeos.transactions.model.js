var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var MODEL_NAME = 'transactions';
var TABLE_NAME = 'transactions';
var MODEL;

var API = new mongoose.Schema({
  trx_id: { 
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
