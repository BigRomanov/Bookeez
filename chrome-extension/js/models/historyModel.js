console.log("Processing historyModel");

define(
'models/historyModel',
[ 
  'underscore',
  'bookiesApp',
  // 'analyzer/analyzer'
],

function(_, bookiesApp) { "use strict";
  console.log("Processing historyModel function");
  
  var HistoryModel = function (analyzer) {
 
    
    this.load = function(callback) {
      console.log("Loading history");

      var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
      var oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;
      var numRequestsOutstanding = 0;

      chrome.history.search({'text' : '', 'startTime' : oneWeekAgo }, function(historyItems) {
        console.log("Calling analyzer", historyItems);
        // console.log(analyzer);
        // analyzer.analyzeItems(historyItems, function(analyzedItems) {
        //   console.log("Finished analyzing items");
        //   console.log(analyzedItems);
        //   callback(analyzedItems);  
        // });
        callback(historyItems);
        
      });
      //   function(historyItems) {
      //     // For each history item, get details on all visits.
      //     for (var i = 0; i < historyItems.length; ++i) {
      //       var url = historyItems[i].url;
      //       var processVisitsWithUrl = function(url) {
      //        // We need the url of the visited item to process the visit.
      //        // Use a closure to bind the  url into the callback's args.
      //        return function(visitItems) {
      //          processVisits(url, visitItems);
      //        };
      //      };
      //      chrome.history.getVisits({url: url}, processVisitsWithUrl(url));
      //      numRequestsOutstanding++;
      //    }
      //    if (!numRequestsOutstanding) {
      //      onAllVisitsProcessed();
      //    }
      //  });
      // });
    };
  };

  bookiesApp.factory('historyModel', [function() {
    return new HistoryModel();
  }]);



});