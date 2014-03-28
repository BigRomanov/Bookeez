define(
'services/bookmarkService',
[
  'underscore',
  'bookeezApp'
],
function(_, bookeezApp) { "use strict";

var BookmarkService = function () {

};

var BookmarkServiceFactory = function() {
  return new BookmarkService();
};

bookeezApp.factory('bookmarkService', BookmarkServiceFactory);

});