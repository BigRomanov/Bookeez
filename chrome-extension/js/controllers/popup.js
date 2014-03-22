define(
'controllers/popup',
[
  'jQuery', 
  'bookiesApp', 
  'filters/filters',
], 
function($, bookiesApp) { 'use strict';

bookiesApp.directive( 'openTab', function($compile, $timeout) {
  return {
    restrict: 'E',
    templateUrl: 'partials/openTab.tpl.html'
  };
});

/*
* Extension popup window controller.
*/
var PopupController = function($scope, $rootScope, $filter, $http, $timeout) {

 var realTab = function(tab) {
    // filter out system tabs and empty urls
    if (tab.url) {
      if (tab.url.indexOf("chrome://") === 0)
        return false;

      return true;
    }
    return false;
  }

  $scope.addAllTabs = function() {

    $scope.notice = "" + $scope.openTabs.length + " tabs were added";
    console.log($scope.notice);

    $http.post("http://localhost:2000/api/add_session", $scope.openTabs)
      .success(function(data, status, headers, config) {
        console.log(data);
        //$scope.data = data;
      }).error(function(data, status, headers, config) {
        console.log(data);
        //$scope.status = status;
      });
  }
  
  chrome.tabs.query({currentWindow:true}, function(tabs) {
    $scope.openTabs = _.filter(tabs, realTab);
    $scope.$apply();
  });  
  
}

bookiesApp.controller('popupController', ['$scope', '$rootScope','$filter', '$http', '$timeout', PopupController]);

});