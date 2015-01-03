
var Mind = {

  // List of various categories recognized by the system
  categories: {
      TV_AND_MOVIES: "Tv and Movies",
      PROGRAMMING: "Programming",
      NEWS: "News"
  },

  domainToCategory: function(domain) {
    
    console.log("Convert domain: " + domain + "to category");

  },

  analyze: function() {
    console.log("Analyzing...");

    chrome.tabs.query({"title":"*"}, function(tabs) {

      _.each(tabs, function(tab) {
        console.log(tab.url);

        // Extract the domain from URL
        var uri = new URI(tab.url);
        console.log(uri.hostname());

      });

    }); 
  }
}