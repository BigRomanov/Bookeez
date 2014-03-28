var _       = require('underscore');
var db      = require('../models');

exports.add_session =  function(req, res) {
	var tabs = req.body;

	var pageUrl = null;

	db.Session.create({
   	title: "Set your own title",
  })
  .complete(function(err, session) {

  	var bookmarks = []
   	// Create bookmarks for the session
		_.each(tabs, function(tab) {
			var bookmark = db.Bookmark.build({
    		title: tab.title,
    		url: tab.url
  		});

			bookmark.setSession(session);
  		bookmark.save().complete(function(err, bookmark) {
  				// add error handling
	  	});
		});
		
	  pageUrl = db.Session.encryptId(session.id);
	  res.send({'result':'OK', 'url':pageUrl});
	});

};