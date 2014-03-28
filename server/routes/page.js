var db      = require('../models');

exports.show =  function(req, res){
	var sessionId = db.Session.decryptId(req.params.id);
	console.log("Get bookmarks for session: ", sessionId);
	
	db.Bookmark.findAll({where: {SessionId :sessionId}}).success(function(bookmarks) {
		res.render('page/index', {
    	title: 'Open tabs',
    	user: req.user,
    	bookmarks: bookmarks
  	});
	});

};
