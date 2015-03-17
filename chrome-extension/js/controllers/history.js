define(
'controllers/history',
[
  'jQuery', 
  'bookiesApp', 
  'models/historyModel',
  'filters/filters',
], 
function($, bookiesApp) { 'use strict';

var HistoryController = function($scope, $filter, historyModel) {
  $scope.searchText = ''; 
  $scope.history = []; 

  $scope.selectedIndex = 0;


  var isElementInViewport = function(el) {
    var rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 && rect.bottom <= $(window).height() && rect.right <= $(window).width();
  }

  /*
  // Key down events handlers
  $('#mainContent').keydown(function(e) {
    var updated = false;
    if (e.which === 13) { // Enter press on page - go to the selected bookmark
      var result = getFilteredBookmarks();
      if (result.length > $scope.selectedIndex) {
        window.location.href = result[$scope.selectedIndex].url;
      } 
    } else if (e.which === 38) { // Up arrow key
      if ($scope.selectedIndex > 0) {
        $scope.selectedIndex--;
        updated = true;
      }
    } else if (e.which === 40) { // Down arrow key
      if (getAllPanels().length > $scope.selectedIndex + 1) {
        $scope.selectedIndex++;
        updated = true;
      }
    }
    if (updated) { // key up or key down pressed - select next element
      $scope.$apply();
      var panels = getAllPanels();
      var selectedElement = panels.get($scope.selectedIndex);
      if (selectedElement) {
        var rect = selectedElement.getBoundingClientRect(); // If element is not visible - scroll to it
        if (!(rect.top >= 0 && rect.left >= 0 && rect.bottom <= $(window).height() && rect.right <= $(window).width())) {
          $("body").animate({
            scrollTop: ($(panels.get($scope.selectedIndex)).offset().top - $(panels.get(0)).offset().top)
          }, 500);
        }
      }
      return false;
    }
  });
*/

  historyModel.load(function(history) {
    $scope.history = history;
    $scope.$apply();
  }.bind(this));

  // Handle search event
  // $scope.$on('search', function(event, searchText) {
  //   $scope.searchPrefix = searchText;

  //   if (searchText) {
  //     $scope.bookmarkTree = bookmarkModel.filterTree($scope.bookmarkTree, searchText);
  //   }
  //   else {
  //     $scope.bookmarkTree = $scope.loadedTree;
  //   }
  // });
}

bookiesApp.controller('historyController', ['$scope', '$filter', 'historyModel', HistoryController]);

});

