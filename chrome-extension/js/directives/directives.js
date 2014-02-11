define(
'directives/directives',
['bookiesApp'], 
function(bookiesApp) { 'use strict';


bookiesApp.directive('bookmarkTree', function($compile) {
      return {
        template: '<ul><bookmark ng-repeat="bookmark in bookmarkTree" onEdit="onEdit(bookmark)"></bookmark></ul>',
        replace: true,
        transclude: true,
        restrict: 'E',
        scope: {
          bookmarkTree: '=ngModel',
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
          '<span ng-click="bookmarkClicked(bookmark, $event)">' +
            '<input type="checkbox" style="display:block;margin:2px;float:left;padding:2px" ng-checked="bookmark.checked"></input>' +
          '</span>' +
          '<a class="bookmark-title" href={{bookmark.url}} target="_blank">{{bookmark.title}}</a>' +
          '<a class="bookmark-edit" ng-click="onEdit({bookmark:bookmark})"> <img src=images/edit.png height=20 width=20></a>' +
        '</div>' +
      '</span>' +
    '</li>';

  var folderTemplate = '<li>' +
      '<span>' +
        '<div class="bookmark"> ' +
          '<span ng-click="bookmarkClicked(bookmark, $event)">' +
            '<input type="checkbox" style="display:block;margin:2px;float:left;padding:2px" ng-checked="bookmark.checked"></input>' +
          '</span>' +
          '<span class="bookmark-folder">{{bookmark.title}}</span>' +
          '<a class="bookmark-edit" ng-click="onEdit({bookmark:bookmark})"> <img src=images/edit.png height=20 width=20></a>' +
        '</div>' +
      '</span>' +
    '</li>';

  var getTemplate = function(contentType) {
    var template = '';

    switch(contentType) {
        case 'folder':
            template = folderTemplate;
            break;
        case 'bookmark':
            template = bookmarkTemplate;
            break;
    }

    return template;
  }

  return { 
    restrict: 'E',

    link: function(scope, elm, attrs) {
      scope.bookmarkClicked = function(bookmark, $event) {
        bookmark.checked = !bookmark.checked;
        if (scope.bookmark.type=="folder" && scope.bookmark.children.length > 0) {
          if (scope.bookmark.checked == true)
          {
            var bookmarks = $compile('<bookmark-tree on-edit="onEdit({bookmark:bookmark})" ng-model="bookmark.children"></bookmark-tree>')(scope)
            elm.append(bookmarks);
          }
          else
          {
            console.log(elm);
            $('ul',elm).remove(); 
          }
        }
      }; 
      
      if (scope.bookmark.type=="folder" && scope.bookmark.checked == true && scope.bookmark.children.length > 0) {
        var bookmarks = $compile('<bookmark-tree on-edit="onEdit({bookmark:bookmark})" ng-model="bookmark.children"></bookmark-tree>')(scope)
        elm.append(bookmarks);
      }

      elm.append(getTemplate(scope.bookmark.type)).show();
      $compile(elm.contents())(scope);
    }
  };
});

});