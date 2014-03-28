define(
'controllers/page',
[
  'jQuery', 
  'bookeezApp', 
], 
function($, bookeezApp) { 'use strict';

/*
* Tree view controller.
*/
var PageController = function($scope, $filter, $modal, bookmarkService) {
  $scope.searchText = ''; // Search text
  $scope.bookmarkTree = {}; // All bookmarks as tree

  console.log("Page controller running");


  // TODO: Tie the view code to the controller

  // bookmarkModel.load(function(bookmarks) {
  //   $scope.loadedTree = bookmarks;
  //   $scope.$apply();
  // }.bind(this));

}

bookeezApp.controller('pageController', ['$scope', '$filter', '$modal', 'bookmarkService', PageController]);

});

