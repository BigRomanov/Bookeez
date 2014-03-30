var _       = require('underscore');
var async   = require('async');
var db      = require('../models');

exports.add_session =  function(req, res) {
	var tabs = req.body;

	var pageUrl = null;

	db.Session.create({
   	title: "Set your own title",
  })
  .complete(function(err, session) {
    // TODO: check for error

		async.eachSeries(tabs, function(tab, callback) {

			var bookmark = db.Bookmark.build({
    		title: tab.title,
    		url: tab.url,
        faviconUrl: tab.faviconUrl,
        SessionId: session.id
  		});

      bookmark.save().success(function(newBookmark) {
        callback();
      }).error(function(err) {
        callback(err);
      });
		}, function(err){
        if( err ) {
          console.log('A bookmark failed to process', err);
        } else {
          pageUrl = db.Session.encryptId(session.id);
          res.send({'result':'OK', 'url':pageUrl});
        }
    });
	});

};