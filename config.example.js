const path = require('path');
let config = {};

// production mode
config.PROD = true;

// enable or disable admin api
config.ADMIN_ENABLED = true;

// the key used to verify admin stuff
config.ADMIN_PKEY = process.env.MONITOR_ADMIN_KEY || "EOS5WJtphnj2KfsPL3mxNqgsGcdGqwSBPpVjgPGYrJTiKsQGKrsQj";

// mongo uri and options
config.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/TLSweb';
config.MONGO_NODE_URI = process.env.MONGO_NODE_URI || 'mongodb://localhost:27017/TELOS';

config.MONGO_OPTIONS = {
    socketTimeoutMS: 30000,
    keepAlive: true,
    reconnectTries: 30000,
    useNewUrlParser: true
};

// default api endpoint
config.MAIN_API_ENDPOINT = process.env.API_NODE_ENDPOINT || 'https://testnet.eos.miami' ;
config.MAIN_API_CHAIN_ID = process.env.API_NODE_CHAINID || 'e17615decaecd202a365f4c029f206eee98511979de8a5756317e2469f2289e3' ;
config.FAUCET_KEY_PROVIDER = process.env.FAUCET_KEY_PROVIDER || '';

// cron processes (aggregation of main stat - actions, transactions, accounts, analytics)
config.CRON = true;
config.CRON_API = process.env.CRON_API_NODE_ENDPOINT || config.MAIN_API_ENDPOINT;

config.TPS_ENABLE = false;
config.MAX_TPS_TIME_UPDATE = 5000;
 
config.eosInfoConfigs = {
      mainNet: {
        chainId: config.MAIN_API_CHAIN_ID,
        httpEndpoint: config.MAIN_API_ENDPOINT,
        name: "Main Net",
        key: "mainNet"
      },
};

// eosjs
config.eosConfig = {
  chainId: config.MAIN_API_CHAIN_ID,
  keyProvider: config.FAUCET_KEY_PROVIDER,
  httpEndpoint: config.MAIN_API_ENDPOINT,
  expireInSeconds: 60,
  keyPrefix: "EOS",
  broadcast: true,
  sign: true,
  debug: false,
  // logger: {
  //   log: console.log,
  //   error: console.error
  // }
};

// api url for producers list
config.customChain = process.env.PRODUCERS_QUERY_ENDPOINT || config.MAIN_API_ENDPOINT;

config.apiV = 'v1'; // api version
config.RAM_UPDATE = 5 * 60 * 1000; // time for ram update - /api/api.*.socket
config.HISTORY_UPDATE = 5 * 60 * 1000; // time for stats update - /api/api.*.socket 
config.MAX_BUFFER = 500000; // max buffer size for child processes (kb) - /crons
config.blockUpdateTime = 1900; // mainpage upades frequency  - /api/api.*.socket in ml sec
config.offsetElementsOnMainpage = 6; // blocks on mainpage
config.limitAsync = 15; // max threads for async.js module  

// log4js
config.logger = {
    appenders: {
      out:  {
            type: 'stdout'
      },
      server: {
        type: 'file',
        filename: path.join(__dirname, './server/logs/server.log'),
      },
      socket_io: {
        type: 'file',
        filename: path.join(__dirname, './server/logs/socket_io.log'),
      },      
      accounts_daemon: {
        type: 'file',
        filename: path.join(__dirname, './server/logs/accounts_daemon.log'),
      },
      accounts_analytics: {
        type: 'file',
        filename: path.join(__dirname, './server/logs/accounts_analytics.log'),
      },
      global_stat: {
        type: 'file',
        filename: path.join(__dirname, './server/logs/global_stat.log'),
      },
      ram_bot: {
        type: 'file',
        filename: path.join(__dirname, './server/logs/ram_bot.log'),
      }
    },
    categories: {
        default:       {
          appenders: ['out'],
          level:     'error'
        },
        server:  {
          appenders: ['out', 'server'],
          level:     'error'
        },
        socket_io:  {
          appenders: ['out', 'socket_io'],
          level:     'error'
        },
        accounts_daemon:  {
          appenders: ['out', 'accounts_daemon'],
          level:     'error'
        },
        accounts_analytics:  {
          appenders: ['out', 'accounts_analytics'],
          level:     'error'
        },
        global_stat:  {
          appenders: ['out', 'global_stat'],
          level:     'error'
        },
        ram_bot:  {
          appenders: ['out', 'ram_bot'],
          level:     'error'
        }
    }
};

// note : we haven't looked into the stuff below

// slack notifications
config.loggerSlack = {
      alerts: {
        type: '',
        token: '',
        channel_id: '',
        username: '',
      }
};

// telegram alert bot 
config.telegram = {
  ON: false,
  TOKEN: '',
  TIME_UPDATE: 5000
};

let endpoint = config.MAIN_API_ENDPOINT.split(":");
endpoint[1] = endpoint[1].substring(2);
endpoint[2] = (typeof endpoint[2] === "string" ? parseInt(endpoint[2]) : 0) || (endpoint[0] === 'https' ? 443 : 80);

// wallet api config
config.walletAPI = {
  blockchain: 'TELOS',
  host: endpoint[1],
  port: endpoint[2],
  chainId: config.MAIN_API_CHAIN_ID,
  keyPrefix: "EOS",
  protocol: endpoint[0],
};

config.client = {
  faucet: process.env.FAUCET_ENABLED || false,
  networkType: process.env.NETWORK_TYPE || 'main'
}

module.exports = config;