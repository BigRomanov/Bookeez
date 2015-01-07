console.log("Sharez Drawer script running");
var serverUrl = "http://127.0.0.1:3000";
chrome.extension.sendMessage({enabled: "enabled"}, function(response) {
  // check the response
  if(response.enabled == "true") { // inject overlay if necessary
    console.log("ShareZ Enabled: injecting drawer");

    $('head').append( $('<link rel="stylesheet" type="text/css" />')
        .attr('href', serverUrl+'/stylesheets/style.css')
        .attr('href', serverUrl+'/stylesheets/drawer.css')
        .load(function(){
      $.get(serverUrl+"/extension", function(data){
        console.log("Adding drawer");
        $('body').append(data);
      });
    }) );
  }
});     