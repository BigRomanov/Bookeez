define(
'models/bookmark',
[ 
  'underscore', 
  'bookiesApp',
],

function(_, bookiesApp) { "use strict";

  // Describes the basic bookmark class
  return function Bookmark(title, url, dateAdded, id, index, parentId, tags)
  {
      // Chrome bookmark and folder fields
      this.title     = title;
      this.url       = url;  // only for bookmark
      this.dateAdded = dateAdded;
      this.id        = id;
      this.index     = index;
      this.parentId  = parentId;
      this.children  = [];

      this.path      = "";

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

      this.update = function(change) {
        console.log("Update: ", change.title, change.url, change.tags);
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
            return true;
          }
          return false;

        });
      }
      
      return (typeof(res) !== "undefined");
    }
  };

});
