var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var MODEL_NAME = 'blocks';
var TABLE_NAME = 'blocks';
var MODEL;

var API = new mongoose.Schema({
  block_id: { 
    type: String
  },
  block_num: {
    type: Number
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



