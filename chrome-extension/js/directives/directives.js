define(
'directives/directives',
['bookiesApp'], 
function(bookiesApp) { 'use strict';


bookiesApp.directive('bookmarkTree', function($compile) {
      return {
        template: '<ul><bookmark ng-repeat="bookmark in bookmarkTree" onEdit="onEdit(bookmark) prefix="prefix"></bookmark></ul>',
        replace: true,
        transclude: true,
        restrict: 'E',
        scope: {
          bookmarkTree: '=ngModel',
          prefix: "=",
          onEdit: '&'
        },
        link: function(scope, element, attrs) {
          $compile(element.contents())(scope);
        }
      };
});

bookiesApp.directive('bookmark', function($compile) {
  var bookmarkTemplate = '<li>' +
      '<span>' +
        '<div class="bookmark"> ' +
          '<div class="bookmark_handle">' +
            '<img src="images/bookmark_item.png"></img>' +
          '</div>' +
          '<div class="bookmark_content">' +
            '<a class="bookmark-title" href={{bookmark.url}} target="_blank" ng-bind-html-unsafe="bookmark.title | highlight:prefix"></a>' +
            '<a class="bookmark-context" ng-click="onEdit({bookmark:bookmark })"> <img src=images/edit.png height=20 width=20></a>' +
          '</div>' +
        '</div>' +
      '</span>' +
    '</li>';

  var folderTemplate = '<li>' +
      '<span>' +
        '<div class="bookmark"> ' +
          '<div class="bookmark_handle" ng-click="bookmarkClicked(bookmark, $event)">' +
            '<input type="checkbox" class="tree_handle" ng-checked="bookmark.checked"></input>' +
          '</div>' +
          '<div class="bookmark_content">' +
            '<span class="bookmark-folder" ng-bind-html-unsafe="bookmark.title | highlight:prefix"></span>' +
            '<span class="bookmark-context"> ({{bookmark.countChildren()}}) </span>' + 
            '<a class="bookmark-context" ng-click="onEdit({bookmark:bookmark})"> <img src=images/edit.png height=20 width=20></a>' +
          '</div>' +    
        '</div>' +
      '</span>' +
    '</li>';

  var getTemplate = function(bookmark) {
    if (bookmark.isFolder()) {
      return folderTemplate;
    }

    return bookmarkTemplate;

  }

  return { 
    restrict: 'E',

    link: function(scope, elm, attrs) {
      scope.bookmarkClicked = function(bookmark, $event) {
        bookmark.checked = !bookmark.checked;
        if (scope.bookmark.children.length > 0) {
          if (scope.bookmark.checked == true)
          {
            var bookmarks = $compile('<bookmark-tree on-edit="onEdit({bookmark:bookmark})" ng-model="bookmark.children" prefix="prefix"></bookmark-tree>')(scope)
            elm.append(bookmarks);
          }
          else
          {
            $('ul',elm).remove(); 
          }
        }
      }; 
      
      //console.log("Render", scope.bookmark);

      elm.append(getTemplate(scope.bookmark)).show();
      $compile(elm.contents())(scope);

      if ((scope.bookmark.checked == true || scope.bookmark.expanded == true) && scope.bookmark.children.length > 0) {
        var bookmarks = $compile('<bookmark-tree on-edit="onEdit({bookmark:bookmark})" ng-model="bookmark.children" prefix="prefix"></bookmark-tree>')(scope)
        elm.append(bookmarks);
      }
    }
  };
});

});