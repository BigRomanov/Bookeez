define(
'directives/directives',
['bookiesApp'], 
function(bookiesApp) { 'use strict';


bookiesApp.directive('bookmarkTree', function() {
      return {
        template: '<ul><bookmark ng-repeat="bookmark in bookmarkTree"></bookmark></ul>',
        replace: true,
        transclude: true,
        restrict: 'E',
        scope: {
          bookmarkTree: '=ngModel'
        }
      };
});

bookiesApp.directive('bookmark', function($compile) {
  return { 
    restrict: 'E',
    //In the template, we do the thing with the span so you can click the 
    //text or the checkbox itself to toggle the check
    template: '<li>' +
      '<span>' +
        '<div class="bookmark"> ' +
          '<span ng-click="bookmarkClicked(bookmark, $event)">' +
            '<input type="checkbox" style="display:block;margin:2px;float:left;padding:2px" ng-checked="bookmark.checked"></input>' +
          '</span>' +
          '<a class="bookmark-title" href={{bookmark.url}} target="_blank">{{bookmark.title}}</a>' +
          '<a class="bookmark-edit" ng-click="editBookmark(bookmark, $event)"> <img src=images/edit.png height=20 width=20></a>' +
        '</div>' +
      '</span>' +
    '</li>',
    link: function(scope, elm, attrs) {
      scope.editBookmark = function(bookmark, $event) {
      };

      scope.bookmarkClicked = function(bookmark, $event) {
        bookmark.checked = !bookmark.checked;
        if (scope.bookmark.type=="folder" && scope.bookmark.children.length > 0) {
          if (scope.bookmark.checked == true)
          {
            var bookmarkChoice = $compile('<bookmark-tree ng-model="bookmark.children"></bookmark-tree>')(scope)
            elm.append(bookmarkChoice);
          }
          else
          {
            console.log(elm);
            $('ul',elm).remove(); 
          }
        }
      }; 
      
      //Add children by $compiling and doing a new choice directive
      if (scope.bookmark.type=="folder" && scope.bookmark.checked ==true && scope.bookmark.children.length > 0) {
        var bookmarkChoice = $compile('<bookmark-tree ng-model="bookmark.children"></bookmark-tree>')(scope)
        elm.append(bookmarkChoice);
      }
    }
  };
});

});