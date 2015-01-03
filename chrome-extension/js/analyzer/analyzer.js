console.log("Loading Analyzer");

define(
'analyzer/analyzer',
[ 
  'underscore', 
  'URI',
  'bookiesApp',
],

function(_, URI, bookiesApp) { "use strict";
  console.log("Processing historyModel function");
  
  var Analyzer = function () {
 
    
    this.process = function(url, callback) {
      console.log("Processing url");

      // call callback

    };
  };

  bookiesApp.factory('analyzer', function() {
    return new Analyzer();
  });

});