var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var MODEL_NAME = 'account_controls';
var TABLE_NAME = 'account_controls';
var MODEL;

var API = new mongoose.Schema({
  controlled_account: { 
    type: String
  },
  controlling_account: { 
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



