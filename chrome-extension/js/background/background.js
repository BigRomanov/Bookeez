console.log("We are up and running");


Mind.analyze();


// chrome.tabs.onCreated.addListener(function(tab) {
//   console.log("Tab created");
//   console.log(tab);
//   var opt = {
//     iconUrl: "http://www.google.com/favicon.ico",
//     type: 'basic',
//     title: 'New tab opened',
//     message: tab.url
//   };

//   chrome.notifications.create("", opt, function(id) {
//     console.log(id);
//     console.log("Last error:", chrome.runtime.lastError);
//   });
// });