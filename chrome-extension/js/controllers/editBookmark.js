define(
'controllers/editBookmark',
[
  'jQuery', 
  'bookiesApp',
  'models/bookmarkModel',
], 
function($, bookiesApp) { 'use strict';

var EditBookmarkController = function ($scope, $modalInstance, bookmark, bookmarkModel) {
  $scope.bookmarkModel = {
    title: bookmark.title,
    url: bookmark.url,
    folders: _.map(_.filter(bookmark.tag, function(t) { return t.custom === false }), function(t) { return t.text }),
    customTags: _.map(_.filter(bookmark.tag, function(t) { return t.custom === true }), function(t) { return t.text }),
  }

  $scope.save = function() {
    bookmarkModel.update(bookmark, $scope.bookmarkModel);
    $modalInstance.close(bookmark);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.delete = function() {
    if (confirm('Are you sure that you want to delete current bookmark?')) {
      bookmarkModel.remove(bookmark);
      $modalInstance.close(null);
    }
  }
};

bookiesApp.controller(
  'editBookmarkController', 
  [
    '$scope', 
    '$modalInstance', 
    'bookmark', 
    'bookmarkModel',
    EditBookmarkController
  ]);

});