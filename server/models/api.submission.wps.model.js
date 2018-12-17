var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var MODEL_NAME = 'WPSSubmission';
var TABLE_NAME = 'WPSSubmission';
var MODEL;

var API = new mongoose.Schema({
  id: { 
    index: true,
    type: Number,
    default: 0 
  },
  ballot_id: { 
    index: true,
    type: Number,
    default: 0 
  },
  cycles: { 
    type: Number,
    default: 0 
  },
  amount: { 
    type: Number,
    default: 0 
  },
  fee: { 
    type: Number,
    default: 0 
  },
  title: {
    index: true,
    type: String,
    default: 'Unknown'
  },
  ipfs_location: {
    type: String,
    default: 'Unknown'  
  },
  proposer: {
    index: true,
    type: String,
    default: 'unknown'
  },
  receiver: {
    index: true,
    type: String,
    default: 'unknown'
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



