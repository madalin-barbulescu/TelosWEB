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

const cronJobStatus = {
   counter: -1,
   cacheBallotsAndSubmissions: {
      inProgress: false
   }
}

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
            SETTINGS.findOne({name: "globalStats"}, (err, result) => {
               if (err) {
                  return cb(err);
               }
               if (result) {
                  return cb(null, result.extractStat());
               }
               let stat = new SETTINGS();
               stat.name = "globalStats";
               stat.statmap = [
                  {name: "accounts", idx:0},
                  {name: "actions", idx:1},
                  {name: "transactions", idx:2}
               ];
               stat.stat = [
                  {count:0},
                  {count:0},
                  {count:0}
               ];
               stat.save((err) => {
                  if (err) {
                     return cb(err);
                  }
                  cb(null, stat.extractStat());
               });
            });
         },
         (stat, cb) => {
            CACHE_ACCOUNTS.estimatedDocumentCount({}, function (err, result) {
               if (err) {
                  return cb(err);
               }
               stat.accounts.count = result;
               cb(null, stat);
            });
         },
         (stat,cb) => {
            CACHE_ACTIONS.estimatedDocumentCount({}, function (err, result) {
               if (err) {
                  return cb(err);
               }

               // stat.actions.aps = stat.actions.aps || []; 
               // stat.actions.aps.push(result - stat.actions.count);
               stat.actions.count = result;
               // if(stat.actions.aps.length > 12)
               //    stat.actions.aps.splice(0,1);
               
               cb(null, stat);
            });
         },
         (stat,cb) => {
            CACHE_TRANSACTIONS.estimatedDocumentCount({}, function (err, result) {
               if (err) {
                  return cb(err);
               }
               // stat.transactions.tps = stat.transactions.tps || []; 
               // stat.transactions.tps.push(result - stat.transactions.count);
               stat.transactions.count = result;
               // if(stat.transactions.tps.length > 12)
               //    stat.transactions.tps.splice(0,1);
               
               cb(null, stat);
            });
         },
         (stat,cb) => {
            stat.model.save((err) => {
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

   function cacheBallotsAndSubmissions(outsideCallback) {
      const status = cronJobStatus.cacheBallotsAndSubmissions;
      if(status.inProgress) {
         if(outsideCallback){
               outsideCallback(null);
         }
         return;
      }
      
      status.inProgress = true;

      async.waterfall([
         (cb) => {
            log.info('===== start cache voting items ');
            SETTINGS.findOne({name: "ballotCacheStats"}, (err, result) => {
               if (err) {
                  return cb(err);
               }
               if (result) {
                  return cb(null, result.extractStat());
               }
               let stat = new SETTINGS();
               stat.name = "ballotCacheStats";
               stat.statmap = [
                  {name: "ballots", idx:0},
                  {name: "wps", idx:1},
                  {name: "amend", idx:2}
               ];
               stat.stat = [
                  {count:0, cursor: -1, last_update: 0},
                  {count:0, cursor: -1, last_update: 0},
                  {count:0, cursor: -1, last_update: 0}
               ];
               stat.save((err) => {
                  if (err) {
                     return cb(err);
                  }
                  cb(null, stat.extractStat());
               });
            });
         },
         (stat,cb) => {
            const whr = {"receipt.receiver":"eosio.trail", "act.name":"unregballot"};
            if(stat.ballots.last_update > -1){
               whr.createdAt = {"$gt": new Date(stat.ballots.last_update)};
            }
            stat.ballots.last_update = Date.now();

            CACHE_ACTIONS.where(whr).select("act.data.ballot_id").find((err, result) => {
					if(err || !result || result.length === 0){
                  if(err){
                     return cb(err);
                  }
                  cb(null, stat);
               }else{
                  const ids = [];
                  let found = false;

                  for(let i = 0; i < result.length; i++){
                     const action = result[i].toObject();
                     ids.push(action.act.data.ballot_id);
                     if(stat.ballots.cursor === action.act.data.ballot_id) found = true;
                  }

                  if(found){
                     ids.sort();
                     const start = ids.indexOf(stat.ballots.cursor);
                     if(start == 0){
                        stat.ballots.cursor -= 1;
                     }else{
                        start = start - 1;
                        stat.ballots.cursor -= 1;

                        while(start >= 0 && stat.ballots.cursor === ids[start]){ stat.ballots.cursor--; start--; }
                     }
                  }

                  console.log(" before if ");
                  if(ids.length){
                     async.parallel([
                        function(callback) {
                           CACHE_BALLOTS.remove({"ballot_id":{$in:ids}}, ()=>{callback(null);});
                        },
                        function(callback) {
                           CACHE_WPS_SUBMISSIONS.remove({"ballot_id":{$in:ids}}, ()=>{
                              CACHE_WPS_SUBMISSIONS.findOne()
                              .sort('-id')  // give me the max
                              .exec(function (err, member) {
                                 if(err){
                                    log.error(err);
                                 } 
                                 else if(member){
                                    stat.wps.cursor = member.id;
                                 }
                                 callback(null);
                              });
                            
                           });
                        }
                     ],
                     function(err) {
                        if(err){
                           return cb(err);
                        }
   
                        cb(null, stat);
                     });
                  }else{
                     cb(null, stat);
                  }
               }
            });
         },
         (stat, cb) => {
            // get ballots
            eos.getTableRows({
			      json: true,
			      code: "eosio.trail",
			      scope: "eosio.trail",
			      table: "ballots",
			      lower_bound: stat.ballots.cursor + 1,
			      upper_bound: "",
			      limit: 200
			   }).then(
               (result) => {
                  stat.ballots.count += result.rows.length;
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

                     stat.ballots.cursor = Math.max(stat.ballots.cursor, ballot.ballot_id);
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
			      lower_bound: stat.wps.cursor + 1,
			      upper_bound: "",
			      limit: 200
			   }).then(
               (result) => {
                  stat.wps.count += result.rows.length;
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

                     stat.wps.cursor = Math.max(stat.wps.cursor, sub.id);
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
            stat.model.save((err) => {
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

            if(outsideCallback){
               outsideCallback(err);
            }
           
            status.inProgress = false;
         }); 
   }

   cron.schedule('*/5 * * * * *', () => {
      cronJobStatus.counter += 1;
      if(cronJobStatus.counter == 0) return;

      startGlobalStatAnalytics();
      cacheBallotsAndSubmissions();
   });

   return {};
}
