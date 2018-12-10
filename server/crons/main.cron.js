/* Cron tasks for daemons , crate by Rost */

const async = require('async');
const cron = require('node-cron');
// const fork = require('child_process').fork;
// const path = require('path');

const config = require('../../config');
const log4js = require('log4js');
log4js.configure(config.logger);
const log = log4js.getLogger('global_stat');

const EOS     		= require('eosjs');
config.eosConfig.httpEndpoint =  (config.CRON) ? config.CRON_API : config.eosConfig.httpEndpoint;
const eos     		= EOS(config.eosConfig);

let ACCOUNTS_PROCESS = 0;
let ACCOUNTS_STAT_PROCESS = 0;
let GLOBAL_STAT_PROCESS = 0;

module.exports = (mongoMain, mongoCache) => {

   const SETTINGS = require('../models/api.stats.model')(mongoMain);
   const CACHE_TRANSACTIONS = require('../models/nodeos.transactions.model')(mongoCache);
   const CACHE_ACCOUNTS = require('../models/nodeos.accounts.model')(mongoCache);
   const CACHE_ACTIONS = require('../models/nodeos.action_traces.model')(mongoCache);

   const CACHE_BALLOTS = require('../models/api.ballots.model')(mongoMain);
   const CACHE_WPS_SUBMISSIONS = require('../models/api.submission.wps.model')(mongoMain);
   // const CACHE_AMEND_SUBMISSIONS = require('../models/api.submission.amend.model')(mongoCache);

   function startGlobalStatAnalytics() {
      async.waterfall([
         (cb) => {
            log.info('===== start stat aggregation ');
            SETTINGS.findOne({}, (err, result) => {
               if (err) {
                  return cb(err);
               }
               if (result) {
                  return cb(null, result);
               }
               let stat = new SETTINGS();
               stat.save((err) => {
                  if (err) {
                     return cb(err);
                  }
                  cb(null, stat);
               });
            });
         },
         (stat, cb) => {
            CACHE_ACCOUNTS.estimatedDocumentCount({}, function (err, result) {
               if (err) {
                  return cb(err);
               }
               stat.accounts = result;
               cb(null, stat);
            });
         },
         (stat,cb) => {
            CACHE_ACTIONS.estimatedDocumentCount({}, function (err, result) {
               if (err) {
                  return cb(err);
               }
               stat.aps.push(result - stat.actions);
               stat.actions = result;
               if(stat.aps.length > 12)
                  stat.aps.splice(0,1);
               
               cb(null, stat);
            });
         },
         (stat,cb) => {
            CACHE_TRANSACTIONS.estimatedDocumentCount({}, function (err, result) {
               if (err) {
                  return cb(err);
               }
               stat.tps.push(result - stat.transactions);
               stat.transactions = result;
               if(stat.tps.length > 12)
                  stat.tps.splice(0,1);
               
               cb(null, stat);
            });
         },
         (stat,cb) => {
            stat.save((err) => {
               if(err){
                  log.error(err);
                  return cb(err);
               }
               log.info('===== end stat aggregation ');

               cb(null,stat);
            });
         }],
         (err, stat) => {
            if (err) {
               log.error(err);
            }
         });
   }

   function cacheBallotsAndSubmissions() {
      async.waterfall([
         (cb) => {
            log.info('===== start cache voting items ');
            SETTINGS.findOne({}, (err, result) => {
               if (err) {
                  return cb(err);
               }
               if (result) {
                  return cb(null, result);
               }
               let stat = new SETTINGS();
               stat.save((err) => {
                  if (err) {
                     return cb(err);
                  }
                  cb(null, stat);
               });
            });
         },
         (stat, cb) => {
            // get ballots
            eos.getTableRows({
			      json: true,
			      code: "eosio.trail",
			      scope: "eosio.trail",
			      table: "ballots",
			      lower_bound: stat.last_ballot + 1,
			      upper_bound: "",
			      limit: 200
			   }).then(
               (result) => {
                  stat.ballots += result.rows.length;
                  for(var i in result.rows){
                     const ballot = new CACHE_BALLOTS();
                     ballot.ballot_id = result.rows[i].ballot_id;
                     ballot.type = result.rows[i].table_id;
                     ballot.reference_id = result.rows[i].reference_id;

                     ballot.save((err) => {
                        if (err) {
                           return cb(err);
                        }
                     });

                     stat.last_ballot = Math.max(stat.last_ballot, ballot.ballot_id);
                  }

                  cb(null, stat);
               },
               (reject) => {
                  return cb(reject);
               }
            ).catch((err) => {
               return cb(err);
            });
         },
         (stat,cb) => {
            // get wps submissions
            eos.getTableRows({
			      json: true,
			      code: "eosio.saving",
			      scope: "eosio.saving",
			      table: "submissions",
			      lower_bound: stat.last_wps + 1,
			      upper_bound: "",
			      limit: 200
			   }).then(
               (result) => {
                  stat.wps_submissions += result.rows.length;
                  for(var i in result.rows){
                     const sub = new CACHE_WPS_SUBMISSIONS();
                     sub.id = result.rows[i].id;
                     sub.ballot_id = result.rows[i].ballot_id;
                     sub.cycles = result.rows[i].cycles;
                     sub.amount = result.rows[i].amount;
                     sub.fee = result.rows[i].fee;
                     sub.title = result.rows[i].title;
                     sub.ipfs_location = result.rows[i].ipfs_location;
                     sub.proposer = result.rows[i].proposer;
                     sub.receiver = result.rows[i].receiver;
                     
                     sub.save((err) => {
                        if (err) {
                           return cb(err);
                        }
                     });

                     stat.last_wps = Math.max(stat.last_wps, sub.id);
                  }

                  cb(null, stat);
               },
               (reject) => {
                  return cb(reject);
               }
            ).catch((err) => {
               return cb(err);
            });
         },
         (stat,cb) => {
            // // get amend submissions
            // eos.getTableRows({
			   //    json: true,
			   //    code: "eosio.saving",
			   //    scope: "eosio.saving",
			   //    table: "submissions",
			   //    lower_bound: stat.last_wps,
			   //    upper_bound: "",
			   //    limit: 1000
			   // }).then(
            //    (result) => {
            //       stat.wps_submissions += result.rows.length;
            //       for(var i in result.rows){
            //          const sub = new CACHE_WPS_SUBMISSIONS();
            //          sub = {
            //             id: result.rows[i].id,
            //             ballot_id: result.rows[i].ballot_id,
            //             cycles: result.rows[i].cycles,
            //             amount: result.rows[i].amount,
            //             fee: result.rows[i].fee,
            //             title: result.rows[i].title,
            //             ipfs_location: result.rows[i].ipfs_location,
            //             proposer: result.rows[i].proposer,
            //             receiver: result.rows[i].receiver
            //          }

            //          sub.save((err) => {
            //             if (err) {
            //                return cb(err);
            //             }
            //          });

            //          stat.last_wps = Math.max(stat.last_wps, sub.id);
            //       }

                  cb(null, stat);
            //    },
            //    (reject) => {
            //       return cb(reject);
            //    }
            // ).catch((err) => {
            //    return cb(err);
            // });
         },
         (stat,cb) => {
            stat.save((err) => {
               if(err){
                  log.error(err);
                  return cb(err);
               }
               log.info('===== end cache voting items ');

               cb(null,stat);
            });
         }],
         (err) => {
            if (err) {
               log.error(err);
            }
         });
   }

   let skipFirst = true;
   cron.schedule('*/5 * * * * *', () => {
      if(skipFirst){ skipFirst = false; return; }

      startGlobalStatAnalytics();
      cacheBallotsAndSubmissions();
   });
}
