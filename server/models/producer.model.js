/*
   Created by amplified
*/
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var MODEL_NAME = 'PRODUCER';
var TABLE_NAME = 'PRODUCER';
var MODEL;

var API = new mongoose.Schema({
  nodeVersion: {
    type: String,
    default: 0
  },
  latitude: {
    type: Number,
    default: 0
  },
  longitude: {
    type: Number,
    default: 0
  },
  country: {
    type: String,
    default: ''
  },
  region: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  isp: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    index: true
  },
  organization: {
    type: String,
    default: ''
  },
  httpServerAddress: {
    type: String
  },
  httpsServerAddress: {
    type: String
  },
  p2pServerAddress: {
    type: String
  },
  producerPublicKey: {
    type: String
  },
  telegramChannel: {
    type: String,
    default: ''
  },
  email: {
    type: String
  },
  url: {
    type: String
  },
  last_update: {
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

