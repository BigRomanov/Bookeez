console.log("Processing bookmarkModel");

define(
'models/bookmarkModel',
[ 
  'underscore', 
  'bookiesApp',
  'models/bookmark',
  'models/bookmarkProvider',
],

function(_, bookiesApp, Bookmark) { "use strict";
  console.log("Processing bookmarkModel function");
  
  var BookmarkModel = function (bookmarkProvider) {

    var rootFolder = new Bookmark("Bookmarks");
    
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
    
    
    this.load = function(callback) {
      console.log("Loading model", bookmarkProvider.getProviders());
      var self = this;
      // _.each(bookmarkProvider.getProviders(), function(provider) {
      //   provider.load(function(tree) {
      //     mergeBookmarks(rootFolder, tree[0]);
      //     callback(rootFolder.children);
      //   });
      // });

      chrome.bookmarks.getTree(function(tree) {
        createBookmarks(rootFolder, tree[0].children, []);
        callback(rootFolder.children);
      });
    };

    var filterTree_rec = function(node, children, filter)
    {
      var self = this; 
      var filteredChildren = [];

      _.each(node.children, function(child) {
        self.filterTree_rec(child, filteredChildren, filter)
      });

      if( node.inFilter(filter) || filteredChildren.length > 0)
      {
        //console.log("Passed filter: " + node.title);
        var newNode = new Bookmark(node.title);
        newNode.copy(node);
        newNode.expanded = true;
        newNode.children = filteredChildren;
        children.push(newNode);
      }
    }

    this.filterTree = function(roots, filter)
    {
      var self = this; 
      var filtered = []; // resulting nodes
      
      _.each(roots, function(node) {
        var filteredChildren = []
        filterTree_rec(node, filteredChildren, filter);
        
        _.each(filteredChildren, function(node) {
          filtered.push(node);
        });
      });

      return filtered;
    }
    

    this.update = function(bookmark, changes) {
      if (changes.title !== bookmark.title) {
        chrome.bookmarks.update(bookmark.id, { title: changes.title});
        bookmark.title = changes.title;
      }

      removeBookmarkTags(bookmark.url);
      // bookmark.tag = _.filter(bookmark.tag, function(t) { return t.custom === false });
      if (changes.bookmarkTags && changes.bookmarkTags.length > 0) {
        saveBookmarkTags(bookmark.url, changes.bookmarkTags);
        loadTags(bookmark);
      }
    };

    this.remove = function(bookmark) {
      removeBookmarkTags(bookmark.url);
      chrome.bookmarks.remove(bookmark.id);
    };

  };

  bookiesApp.factory('bookmarkModel', ["bookmarkProvider", function(bookmarkProvider){
    return new BookmarkModel(bookmarkProvider);
  }]);

});