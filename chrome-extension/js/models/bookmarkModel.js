define(
'models/bookmarkModel',
[
  'underscore',
  'bookiesApp'
],
function(_, bookiesApp) { "use strict";

function Bookmark(title, url, dateAdded, id, index, parentId, tags)
{
    // Chrome bookmark and folder fields
    this.title     = title;
    this.url       = url;  // only for bookmark
    this.dateAdded = dateAdded;
    this.id        = id;
    this.index     = index;
    this.parentId  = parentId;
    this.children  = [];

    this.checked   = false;
    this.expanded  = false;

    this.tags      = tags;
    this.folders   = [];

    this.isFolder = function() {
      return (this.children.length > 0);
    }

    this.saveTags = function() {
      console.log("bookmark.saveTags");
    }

    // Methods to interact with chrome.bookmarks API
    // TODO: Refactor to use dependency injection

    this.updateTitle = function() {
      console.log("updateTitle", this.id, this.title);
      chrome.bookmarks.update(this.id, { title: this.title});
    }

    this.updateUrl = function() {
      chrome.bookmarks.update(this.id, { title: this.url});
    }

    this.updateTags = function() {
      console.log("Tags updated", this.tags);
    }

    this.copy = function(src) {
      // Chrome bookmark and folder fields
      this.title     = src.title;
      this.url       = src.url;  // only for bookmark
      this.dateAdded = src.dateAdded;
      this.id        = src.id;
      this.index     = src.index;
      this.parentId  = src.parentId;
      this.children  = src.children;

      this.checked   = src.checked;
      this.expanded  = src.expanded;

      this.tags      = tags;
      this.folders   = src.folders;
    }


  // Count all children from given node and down the tree
  this.countChildrenFrom = function(node) {
    var sum = 0;
    var self = this;
    if (node.children.length > 0)
    {
      _.each(node.children, function(_node) {
        sum += self.countChildrenFrom(_node);
      });
    }
    else
    {
      sum = 1;
    }
    
    return sum;
  }
  
  // Count all children from current folder down
  this.countChildren = function() {
    return this.countChildrenFrom(this);
  }

  // Check whether node contains given prefix
  this.inFilter = function(prefix) {
    var self = this;

    if (this.title) {
      var words = this.title.split(" ");
      var res = _.find(words, function(word) {
        if (word.toLowerCase().indexOf(prefix.toLowerCase()) === 0) {
          //console.log("Title: " + self.title + " has prefix: " + prefix);
          return true;
        }
        return false;

      });
    }
    
    return (typeof(res) !== "undefined");
  }

}

// TODO: Implement separate data model for tags
var TagStore = function(id) {
  var storage = []; // chunked storage
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
    console.log("Save chunk to storage", change);
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
        console.log("Retrieved from storage", data);
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
      _.each(chunk.d[bookmark.url], function(tag) {
        bookmark.tags.push({text: tag});
      });
    }
  }
  
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
      // bookmarks.tag = _.filter(bookmarks.tag, function (t) { return t.custom === false });
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
      self.filterTree_rec(node, filteredChildren, filter);
      
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

    removeCustomTags(bookmark.url);
    // bookmark.tag = _.filter(bookmark.tag, function(t) { return t.custom === false });
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