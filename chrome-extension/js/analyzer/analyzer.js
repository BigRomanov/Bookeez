console.log("Loading Analyzer");

define( 'analyzer/analyzer', [ 'underscore', 'URI',  'bookiesApp'],

function(_, URI, bookiesApp) { "use strict";
  console.log("Processing analyzer function");
  
  var Analyzer = function () {

    this.analyzeItems = function(items, callback) {
      console.log("analyzeItems", items);
      callback(items);  
      // var self = this;


      // var analyzedItems = _.map(items, function(item) {

      //   // Assign item group (TODO: Implement as labels)
      //   item.group = self.assignGroup(item);

      //   return item;
      // });

      // callback(analyzedItems);
    }

    this.assignGroup = function(item) {
      // Check if url contains 'twitter', assign twitter group

      // if (S(item.url).contains("twitter")) {
      //   return "Twitter";
      // }
      // else {
      //   return "Other";
      // }
    }
 
    
    this.process = function(url, callback) {
      console.log("Processing url");

      // call callback

    };
  };

console.log("Loading Analyzer 2");
  bookiesApp.factory('analyzer', function() {
    console.log("Creating new analyzer");
    return new Analyzer();
  });

});