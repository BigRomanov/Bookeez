define(
'controllers/tree',
[
  'jQuery', 
  'bookiesApp', 
  'models/bookmarkModel',
  'filters/fieldsFilter',
  'controllers/editBookmark',
], 
function($, bookiesApp) { 'use strict';

/*
* Application controller.
*/
var TreeController = function($scope, $filter, $modal, bookmarkModel) {
  
  // Constant: default value of how many items we want to display on main page.
  var defaultTotalDisplayed = 30;

  $scope.searchText = ''; // Search text
  
  //$scope.bookmarks = []; // All bookmarks
  $scope.bookmarkTree = {}; // All bookmarks as tree
  $scope.orders = [ // Different sorting orders
                    {title:'Title', value: 'title'}, 
                    {title:'Date created', value: 'date'},
                    {title:'Url', value: 'url'}
                  ];
  $scope.currentOrder = $scope.orders[0]; // title is default sorting order

  // Maximum number of items currently displayed
  $scope.totalDisplayed = defaultTotalDisplayed;

  $scope.selectedIndex = 0;

  var getAllPanels = function() {
    return $('#list-bookmarks div.panel');
  }

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

  // Get bookmarks we show on the page (in right order)
  var getFilteredBookmarks = function() {
    var bookmarksFilter = $filter('fieldsFilter');
    return bookmarksFilter($scope.bookmarks, $scope.searchText, $scope.currentOrder.value);
  }

  // Show modal dialog for adding tags
  $scope.editBookmark = function(bookmark) {
    console.log("Edit bookmark");
    console.log(bookmark);

    var modalInstance = $modal.open({
      scope: $scope.$new(true /* isolate */),
      templateUrl: 'partials/editBookmark.tpl.html',
      controller: 'editBookmarkController',
      resolve: {
        bookmark: function() {
          return bookmark;
        }
      },
      keyboard: true,
      backdrop: 'static'
    });

    modalInstance.result.then(function (updatedBookmark) {
      if (!updatedBookmark) {
        // Bookmark was deleted
        $scope.bookmarks.splice(_.indexOf($scope.bookmarks, bookmark), 1);
      }
    });
    
    return false;
  };

  bookmarkModel.getTree(function(bookmarks) {
    $scope.loadedTree = bookmarks;
    $scope.$apply();
  }.bind(this));

  // Handle search event
  $scope.$on('search', function(event, searchText) {
    console.log("Searching:", searchText);

    // In the future we might need some manipulation to get to the prefix from search string
    $scope.searchPrefix = searchText;

    if (searchText)
    {
      $scope.bookmarkTree = bookmarkModel.filterTree($scope.bookmarkTree, searchText);
    }
    else
    {
      $scope.bookmarkTree = $scope.loadedTree;
    }
  });
 
  // On tag click we set search text
  $scope.selectTag = function(tag) {
    $scope.searchText = 'tag:' + tag;
  };

  // Change sorting order
  $scope.changeOrder = function(order) {
    $scope.currentOrder = order;
    resetView();
  };

  $scope.selectBookmark = function(index) {
    $scope.selectedIndex = index;
  }
}

bookiesApp.controller('treeController', ['$scope', '$filter', '$modal', 'bookmarkModel', TreeController]);

});

