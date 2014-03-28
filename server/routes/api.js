var _       = require('underscore');
var db      = require('../models')

exports.add_session =  function(req, res) {
	var tabs = req.body;

	// Create new session with unique id

	// Create bookmarks for the session

	_.each(tabs, function(tab) {
		console.log("============================================");
		console.log(tab);

		db.Bookmark.create({
    		title: tab.title,
    		url: tab.url
  		})
  		.complete(function(err, bookmark) {
    		/* ... */
  		})
	})

    res.send({'result':'OK'});
};