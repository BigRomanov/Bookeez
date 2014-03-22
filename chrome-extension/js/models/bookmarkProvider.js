console.log("Processing bookmarkProvider");

define(
'models/bookmarkProvider',
[ 
  'underscore', 
  'bookiesApp',
],

function(_, bookiesApp) { "use strict";
	console.log("Processing BookmarkProvider function");
	var BookmarkProvider = function() {
		var providers = [];

		this.register = function(provider) {
			console.log("Register provider", provider);
			this.providers.push(provider);
		}

		this.getProviders = function() {
			return this.providers;
		}
	};

	
	bookiesApp.factory('bookmarkProvider', function() {
		return new BookmarkProvider()
	});

});