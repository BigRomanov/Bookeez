$(function() {

  $("#openAppPage").click(function() {
    chrome.tabs.create({url: 'app.html'});
  });

});