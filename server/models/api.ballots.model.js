var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var MODEL_NAME = 'Ballots';
var TABLE_NAME = 'Ballots';
var MODEL;

var API = new mongoose.Schema({
  ballot_id: { 
    index: true,
    type: Number,
    default: 0 
  },
  reference_id: { 
    type: Number,
    default: 0 
  },
  type: { 
    type: Number,
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



