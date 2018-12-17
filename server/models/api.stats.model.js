/*
   Created by eoswebnetbp1
*/
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var MODEL_NAME = 'Stats';
var TABLE_NAME = 'Stats';
var MODEL;

var mapSchema = new mongoose.Schema({
  name: {
    type: String, 
    default: 'Unknow'
  },
  idx: {
    type: Number,
    default: 0
  }
});

var statSchema = new mongoose.Schema({
  count: {
    type: Number
  },
  cursor: {
    type: Number
  },
  last_update: { // ms from Date.now()
    type: Number
  }
});

var API = new mongoose.Schema({
  name: {
    index: true,
    type: String,
    default: 'Unknown'
  },
  statmap: [mapSchema],
  stat: [statSchema]
});

API.methods.extractStat = function(){
  const result = {};
  for( var i in this.statmap ){
    result[this.statmap[i].name] = this.stat[this.statmap[i].idx];
  }
  result.model = this;
  return result;
}

module.exports = function (connection) {
  if ( !MODEL ) {
    if ( !connection ) {
      connection = mongoose;
    }
    MODEL = connection.model(MODEL_NAME, API, TABLE_NAME);
  }
  return MODEL;
};



