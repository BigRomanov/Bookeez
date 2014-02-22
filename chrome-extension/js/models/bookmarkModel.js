define(
'models/bookmarkModel',
[
  'underscore',
  'bookiesApp'
],
function(_, bookiesApp) { "use strict";

function Bookmark(title, url, tag, date, id)
{
    this.title    = title;
    this.checked  = false;
    this.expanded = false;
    this.url      = url;
    this.tag      = tag;
    this.date     = date;
    this.id       = id;
    this.children = [];

    this.isFolder = function() {
      return (this.children.length > 0);
    }

    this.copy = function(src)
    {
      this.title    = src.title;
      this.checked  = src.checked;
      this.expanded = src.expanded;
      this.url      = src.url;
      this.tag      = src.tag;
      this.date     = src.date;
      this.id       = src.id;
    }

    this.inFilter = function(prefix) {
      var self = this;

      if (this.title) {
        var words = this.title.split(" ");
        var res = _.find(words, function(word) {
          if (word.toLowerCase().indexOf(prefix.toLowerCase()) === 0) {
            console.log("Title: " + self.title + " has prefix: " + prefix);
            return true;
          }
          return false;

        });
      }
      
      return (typeof(res) !== "undefined");
    }

}
var BookmarkModel = function () {

  var rootFolder = new Bookmark("Bookmarks");
  var customTagsStorage = [];

  /*
  * Save chunk with custom tags by index (key will be t[Index]).
  */
  var saveCustomTagsChunk = function(index, chunk) {
    var change = {};
    var key = 't' + index;
    change[key] = chunk;
    chrome.storage.sync.set(change);
  }

  /*
  * Find chunk which stores custom tags for bookmark and remove this information.
  */
  var removeCustomTags = function(bookmarkUrl) {
    _.each(customTagsStorage, function(chunk, index) {
      if (chunk.d[bookmarkUrl]) {
        delete chunk.d[bookmarkUrl];
        saveCustomTagsChunk(index, chunk);
      };
    })
  };

  /*
  * Save custom tags to chunk.
  */
  var saveCustomTags = function(bookmarkUrl, customTags) {
    // Try to find chunk and index of this chunk
    // which has less than 20 items
    var chunk, index;
    for (var i = 0; i < customTagsStorage.length; i++) {
      if (_.size(customTagsStorage[i].d) < 20) {
        chunk = customTagsStorage[i];
        index = i;
        break;
      }
    }
    // If don't have chunk with less than 20 items 
    // Create new one.
    if (!chunk) {
      chunk = { d: {} };
      var lChunk = _.last(customTagsStorage);
      // If previous chunk exist and it does not know about new chunk
      // Update it with setting next = true
      if (lChunk && !lChunk.n) {
        lChunk.n = true;
        saveCustomTagsChunk(customTagsStorage.length - 1, lChunk);
      }
      index = customTagsStorage.length;
      customTagsStorage.push(chunk);
    }
    // Save custom tags for bookmark 
    chunk.d[bookmarkUrl] = customTags;
    saveCustomTagsChunk(index, chunk);
  };

  /*
  * Get all chunks with custom tags.
  */
  var enumerateAllCustomTagChunks = function(currentChunk, index, done) {
    if (currentChunk && currentChunk.n) {
      index++;
      var key = 't' + index;
      chrome.storage.sync.get(key, function(data) {
        if (data[key]) {
          customTagsStorage.push(data[key]);
        }
        enumerateAllCustomTagChunks(data[key], index, done);
      });
    } else {
      done();
    }
  };

  /*
  * Add all custom tags from array to bookmark tags.
  */
  var fillBookmarkWithCustomTags = function(bookmark) {
    var chunk = _.find(customTagsStorage, function(chunk) { return _.isArray(chunk.d[bookmark.url]); });
    if (chunk) {
      _.each(chunk.d[bookmark.url], function(tag){
        bookmark.tag.push({text: tag, custom: true});
      });
    }
  }
  
  var createBookmarks = function(root, tree, tags) {
      
      if (tree) {
        _.each(tree, function(c) {
            if (!c.url) {
                
                var t = tags.slice();
                if (c.title) {
                    t.push(c.title);
                }
                
                //console.log("FOLDER: " + c.title);
                var folder = new Bookmark(c.title);
                root.children.push(folder);
                
                createBookmarks(folder, c.children, t);
            } 
            else {
                //console.log("BOOKMARK: " + c.title);
                var bookmark = new Bookmark(c.title, c.url, [], c.dateAdded, c.id);
                
                _.each(tags, function(tag) {
                  bookmark.tag.push({text: tag, custom: false});
                });

                fillBookmarkWithCustomTags(bookmark);

                root.children.push(bookmark);
            }
        });
      }
    };
  

  /*
  * Add custom tags to bookmarks.
  */
  var fillCustomTags = function(bookmarks, customTags) {
    _.each(bookmarks, function(bookmark) {
      // Remove all custom tags from bookmark first
      bookmarks.tag = _.filter(bookmarks.tag, function (t) { return t.custom === false });
      saveCustomTags(bookmark.url, customTags[bookmark.url]);
    });
  };

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
      if (changes.hasOwnProperty(key) && key === 'customTags') {
        customTags = changes[key].newValue;
        if (customTags) {
          fillCustomTags(bookmarks, customTags);
        }
      }
    };
  });
  
  this.getTree = function(callback) {
    // At first get custom tags and after this start bookmarks traversal.
    enumerateAllCustomTagChunks({n: true}, -1, function() {
      chrome.bookmarks.getTree(function(tree) {
        createBookmarks(rootFolder, tree[0].children, []);
        callback(rootFolder.children);
      });
    });
  };

  this.filterTree_rec = function(node, children, filter)
  {
    var self = this; 
    var filteredChildren = [];

    _.each(node.children, function(child) {
      self.filterTree_rec(child, filteredChildren, filter)
    });

    if( node.inFilter(filter) || filteredChildren.length > 0)
    {
      console.log("Passed filter: " + node.title);
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
      self.filterTree_rec(node, filteredChildren, filter);
      
      _.each(filteredChildren, function(node) {
        filtered.push(node);
      });
    });

    console.log("Filtered chidlren", filtered);
    return filtered;
  }
  

  this.update = function(bookmark, changes) {
    if (changes.title !== bookmark.title) {
      chrome.bookmarks.update(bookmark.id, { title: changes.title});
      bookmark.title = changes.title;
    }

    removeCustomTags(bookmark.url);
    bookmark.tag = _.filter(bookmark.tag, function(t) { return t.custom === false });
    if (changes.customTags && changes.customTags.length > 0) {
      saveCustomTags(bookmark.url, changes.customTags);
      fillBookmarkWithCustomTags(bookmark);
    }
  };

  this.remove = function(bookmark) {
    removeCustomTags(bookmark.url);
    chrome.bookmarks.remove(bookmark.id);
  };
};

var BookmarkModelFactory = function() {
  return new BookmarkModel();
};

bookiesApp.factory('bookmarkModel', BookmarkModelFactory);

});