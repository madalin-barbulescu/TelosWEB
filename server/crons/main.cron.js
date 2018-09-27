/* Cron tasks for daemons , crate by Rost */

const async = require('async');
const cron = require('node-cron');
// const fork = require('child_process').fork;
// const path = require('path');

const config = require('../../config');
const log4js = require('log4js');
log4js.configure(config.logger);
const log = log4js.getLogger('global_stat');

let ACCOUNTS_PROCESS = 0;
let ACCOUNTS_STAT_PROCESS = 0;
let GLOBAL_STAT_PROCESS = 0;

module.exports = (mongoMain, mongoCache) => {

   const SETTINGS = require('../models/api.stats.model')(mongoMain);
   const CACHE_TRANSACTIONS = require('../models/nodeos.transactions.model')(mongoCache);
   const CACHE_ACCOUNTS = require('../models/nodeos.accounts.model')(mongoCache);
   const CACHE_ACTIONS = require('../models/nodeos.action_traces.model')(mongoCache);

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
               stat.actions = result;
               cb(null, stat);
            });
         },
         (stat,cb) => {
            CACHE_TRANSACTIONS.estimatedDocumentCount({}, function (err, result) {
               if (err) {
                  return cb(err);
               }
               stat.transactions = result;
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

   cron.schedule('*/5 * * * * *', () => {
      startGlobalStatAnalytics();
   });
}

// function startTPSdaemon(){
//         let forkProcess = fork(path.join(__dirname, '../daemons/max.tps.daemon.js'));
//         forkProcess.on('close', () => {
//               console.log('\x1b[33m%s\x1b[0m', '====== Process TPS close Error');
//               startTPSdaemon();
//         });
// }


// function startAccountsDaemon(){
//         console.log(" STAAAAAAAAT ",ACCOUNTS_STAT_PROCESS,GLOBAL_STAT_PROCESS,ACCOUNTS_PROCESS);
//         ACCOUNTS_PROCESS += 1;
//         let forkProcess = fork(path.join(__dirname, '../daemons/accounts.stat.daemon.js'));
//         forkProcess.on('close', res => {
//               console.log('\x1b[36m%s\x1b[0m', '====== Process stat accounts daemon end');
//               ACCOUNTS_PROCESS -= 1;
//         });
// }

// function startAccountsAnalytics(){
//         console.log(" STAAAAAAAAT ",ACCOUNTS_STAT_PROCESS,GLOBAL_STAT_PROCESS,ACCOUNTS_PROCESS);
//         ACCOUNTS_STAT_PROCESS += 1;
//         let forkProcess = fork(path.join(__dirname, '../daemons/accounts.analytics.daemon.js'));
//         forkProcess.on('close', res => {
//               console.log('\x1b[36m%s\x1b[0m' ,'====== Process analytics daemon end');
//               ACCOUNTS_STAT_PROCESS -= 1;
//         });
// }

