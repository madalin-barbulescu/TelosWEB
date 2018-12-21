/*
* Created by Rost
*/
const path = require('path');

module.exports = function(router, config, request, log) {

	const indexPath = path.join(__dirname, '../../dist/index.html');

	router.get('/', (req, res) => {
		//res.cookie('netsConf', JSON.stringify(config.eosInfoConfigs), { path: '/' });
	   	res.sendFile(indexPath);
	});

	router.get('/block/:id', (req, res) => {
	   	res.sendFile(indexPath);
	});
	
	router.get('/account/:id', (req, res) => {
	   	res.sendFile(indexPath);
	});
	
	router.get('/address/:id', (req, res) => {
	   	res.sendFile(indexPath);
	});

	router.get('/contracts', (req, res) => {
	   	res.sendFile(indexPath);
	});

	
	router.get('/producers', (req, res) => {
	   	res.sendFile(indexPath);
	});
	
	router.get('/producer/:id', (req, res) => {
	   	res.sendFile(indexPath);
	});
	
	router.get('/analytics', (req, res) => {
	   	res.sendFile(indexPath);
	});
	
	router.get('/accounts', (req, res) => {
	   	res.sendFile(indexPath);
	});
	
	router.get('/foundation', (req, res) => {
	   	res.sendFile(indexPath);
	});
	
	router.get('/foundation/members', (req, res) => {
	   	res.sendFile(indexPath);
	});
	
	router.get('/foundation/election', (req, res) => {
	   	res.sendFile(indexPath);
	});
	
	router.get('/foundation/issues', (req, res) => {
	   	res.sendFile(indexPath);
	});
	
	router.get('/settings', (req, res) => {
	   	res.sendFile(indexPath);
	});
	
	router.get('/settings/admin', (req, res) => {
	   	res.sendFile(indexPath);
	});
	
	router.get('/settings/p2p-edit/:id', (req, res) => {
	   	res.sendFile(indexPath);
	});
	
	router.get('/settings/p2p-management', (req, res) => {
	   	res.sendFile(indexPath);
	});
	
	router.get('/p2p', (req, res) => {
	   	res.sendFile(indexPath);
	});
	
	router.get('/info', (req, res) => {
	   	res.sendFile(indexPath);
	});
	
	router.get('/faucet', (req, res) => {
	   	res.sendFile(indexPath);
	});

	router.get('/ram', (req, res) => {
	   	res.sendFile(indexPath);
	});

	router.get('/account-creation', (req, res) => {
	   	res.sendFile(indexPath);
	});

	router.get('/keys', (req, res) => {
	   	res.sendFile(indexPath);
	});

	router.get('/registration', (req, res) => {
	   	res.sendFile(indexPath);
	});

	router.get('/transaction/:id', (req, res) => {
	   	res.sendFile(indexPath);
	});

	router.get('/wallet', (req, res) => {
	   	res.sendFile(indexPath);
	});

	router.get('/wallet-aux', (req, res) => {
	   	res.sendFile(indexPath);
	});

	router.get('/vote', (req, res) => {
	   	res.sendFile(indexPath);
	});

	router.get('/tokens', (req, res) => {
	   	res.sendFile(indexPath);
	});

	router.get('/notfound', (req, res) => {
	   	res.sendFile(indexPath);
	});

	router.get('/bp.json', (req, res) => {
	   	res.sendFile(path.join(__dirname, '../../bp.json'));
	});

	router.get('/sitemap.xml', (req, res) => {
	   	res.sendFile(path.join(__dirname, '../../sitemap.xml'));
	});

	router.get('/robots.txt', (req, res) => {
	   	res.sendFile(path.join(__dirname, '../../robots.txt'));
	});
// ============== END of exports 
};
















