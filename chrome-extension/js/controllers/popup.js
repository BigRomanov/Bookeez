define(
'controllers/popup',
[
  'jQuery', 
  'bookiesApp', 
  'filters/filters',
], 
function($, bookiesApp) { 'use strict';

/*
* Application controller.
*/
var PopupController = function($scope, $rootScope, $filter, $modal, $timeout) {
  $scope.searchText = ''; // Search text

  var tempFilterText = '', filterTextTimeout;

  $scope.$watch('searchText', function(val) {

    if (filterTextTimeout) $timeout.cancel(filterTextTimeout);

    tempFilterText = val;
    filterTextTimeout = $timeout(function() {
      $scope.searchText = tempFilterText;
      $rootScope.$broadcast('search', $scope.searchText);
    }, 250); // delay 250 ms

  });
  
}

bookiesApp.controller('popupController', ['$scope', '$rootScope','$filter', '$modal', '$timeout', PopupController]);

});