define(
'models/chromeBookmarks',
[
  'underscore',
  'models/bookmark',
  'bookiesApp'
],
function(_, bookiesApp) { "use strict";

// A wrapper around chrome bookmark service
var ChromeBookmarks = function () {

  var rootFolder = new Bookmark("Bookmarks");
  
  // Create bookmark model tree from chrome
  var createBookmarks = function(root, tree, folders) {
      
    if (tree) {
      _.each(tree, function(c) {
        if (!c.url) {
            
            var t = folders.slice();
            if (c.title) {
                t.push(c.title);
            }
            
            //console.log("FOLDER", c);
            var folder = new Bookmark(c.title, "", c.dateAdded, c.id, c.index, c.parentId, []);
            root.children.push(folder);
            
            createBookmarks(folder, c.children, t);
        } 
        else {
            //console.log("BOOKMARK", c);
            var bookmark = new Bookmark(c.title, c.url, c.dateAdded, c.id, c.index, c.parentId, []);
            
            _.each(folders, function(folder) {
              bookmark.folders.push({text: folder});
            });

            root.children.push(bookmark);
        }
      });
    }
  };
  
  this.getTree = function(callback) {
    chrome.bookmarks.getTree(function(tree) {
      createBookmarks(rootFolder, tree[0].children, []);
      callback(rootFolder.children);
    });
  };

var ChromeBookmarkServiceFactory = function() {
  return new ChromeBookmarksFactory();
};

bookiesApp.factory('chromeBookmarks', ChromeBookmarksFactory);

});