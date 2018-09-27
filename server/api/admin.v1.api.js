const ecc = require("eosjs-ecc");
ecc.config.address_prefix = "TLOS";

module.exports 	= function(router, config, mongoMain) {

	console.log("IMPORTED ADMIN ");
	const MONITOR_NEWS 	= require('../models/monitor.news.model')(mongoMain);
    
	router.post('/admin/v1/news', (req, res) => {
		let newsReq = req.body;
		if (!newsReq){
			return res.status(400).send('Nothing sent!');
        }
		// Eos.modules.ecc
		
		MONITOR_NEWS.findOne({}, (err, result) => {
			if (err) {
			   return res.status(400).send('Find news error!');
			}
			let news = result;
			if (!news) {
				news = new MONITOR_NEWS();
				news.message = "";
				news.save((err) => {
					if (err) {
						return res.status(400).send('Save news error!');
					}
					res.json(news);
				});
			}

			if( !ecc.verify(newsReq.signature, newsReq.message, config.ADMIN_PKEY) ){
				return res.status(400).send('Bad signature!');
			}
			
			news.message = newsReq.message;
			news.save((err) => {
				if (err) {
					return res.status(400).send('Save news error!');
				}
				return res.json(news);
			});
		 });
	});
	
	router.get('/admin/v1/news', (req, res) => {
		MONITOR_NEWS.findOne({}, (err, result) => {
			if (err || !result){
				result = new MONITOR_NEWS();
			}
			res.json(result);
		});
    });
}