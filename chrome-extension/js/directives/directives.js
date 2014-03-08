define(
'directives/directives',
['bookiesApp'], 
function(bookiesApp) { 'use strict';


bookiesApp.directive( 'inlineEditor', function($compile, $timeout) {

  // TODO: Prefix highlighting is currently hard coded into the editor, we should consider refactoring this
  var textTemplate  = '<span ng-bind="value| highlight:prefix" ng-click="edit()" >'+
                      '</span><input ng-model="value" ng-blur="done()"></input>';
  
  var urlTemplate   = '<a src="value" ng-bind="value | highlight:prefix" ng-click="edit()" ></a>'+
                      '<input ng-model="value" ng-blur="done()"></input>';

  return {
    restrict: 'E',
    scope: { 
      value: '=',
      update:  '&'
    },
  
    link: function ( $scope, element, attrs ) {
     
      element.addClass( 'inlineEditor' );

      $scope.editing = false;

      var getTemplate = function(attrs) {
        return 'url' in attrs ? urlTemplate : textTemplate;
      }
      
      // ng-click handler to activate edit-in-place
      $scope.edit = function () {
        $scope.editing = true;
        element.addClass( 'active' );
        $timeout(function() { 
          $scope.input.focus();
        },0);
      };
      
      $scope.done = function() {
        $scope.editing = false;
        element.removeClass( 'active' );
        $scope.update();
      }

      element.append(getTemplate(attrs)).show();
      $compile(element.contents())($scope);

      $scope.input = $(element).find("input")[0];
    }
  };
});


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

bookiesApp.directive('bookmark', function($compile, $timeout) {
  var bookmarkTemplate = '<li>' +
        '<div class="bookmark"> ' +
          // handle
          '<div class="bookmark_handle"> <img src="images/bookmark_item.png"></img> </div>' +
          //content
          '<div class="bookmark_content" ng-init="isEditing=false">' +

            '<inline-editor value="bookmark.title" update="bookmark.updateTitle()"></inline-editor>' +
            '(<inline-editor url value="bookmark.url"  update="bookmark.updateUrl()">  </inline-editor>)' +

            // tags
            '<div ng-blur="bookmark.saveTags()" ng-show="bookmark.tags.length > 0" class="bookmark-tags" >' +
                '<input type="text" class="form-control bookmark-tag-input"' + 
                      'placeholder="Input custom tags"' +
                      'ng-model="bookmark.tags"' +
                      'tagclass="badge badge-custom"' +
                      'bootstrap-tagsinput>'+
             '</div>' +
          '</div>' +
        '</div>' +
    '</li>';

  var folderTemplate = '<li>' +
        '<div class="bookmark"> ' +
          // handle
          '<div class="bookmark_handle" ng-click="expand(bookmark, $event)">' +
            '<input type="checkbox" class="tree_handle" ng-checked="bookmark.checked"></input>' +
          '</div>' +
          // content
          '<div class="bookmark_content" style="float:left" ng-init="isEditing=false">' +
            '<inline-editor value="bookmark.title" update="bookmark.updateTitle()"></inline-editor>' +
          '</div>' +  // ~content
          // actions (not visible in editor)
          '<div ng-hide="isEditing" class="bookmark_actions bookmark-context" style="float:left"> ({{bookmark.countChildren()}}) </div>' + 
          '<div style="clear:both"></div>' +
        '</div>' +
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
      scope.expand = function(bookmark, $event) {
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