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

    this.test = function() {
      console.log("zzzzzzzzzzzzzzzzzz");
    }

    this.analyzeItems = function(items, callback) {
      console.log(items);
      callback(_.each(items, analyze));
    }

    this.analyze = function(item) {
      console.log(item);
      var _item = _.clone(item);
      _item.group = "Test";
      return _item;
    }
 
    
    this.process = function(url, callback) {
      console.log("Processing url");

      // call callback

    };
  };

  bookiesApp.factory('analyzer', function() {
    console.log("Creating new analyzer");
    return new Analyzer();
  });

});