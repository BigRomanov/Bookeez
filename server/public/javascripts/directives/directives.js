define(
'directives/directives',
['bookeezApp'], 
function(bookeezApp) { 'use strict';



bookeezApp.directive( 'inlineEditor', function($compile, $timeout) {

  // TODO: Prefix highlighting is currently hard coded into the editor, we should consider refactoring this
  var textTemplate  = '<div>' +
                        '<span  ng-bind="value" ng-click="edit()"></span>'+
                        '<input ng-model="value" ng-blur="done()"></input>' +
                      '</div>';
  
  var urlTemplate   = '<div>' +
                        '<a src="value" ng-bind="value" ng-click="edit()" ></a>'+
                        '<input ng-model="value" ng-blur="done()"></input>' +
                      '</div>';

  return {
    restrict: 'E',
    scope: { 
      value: '=',
    },
  
    link: function ( $scope, element, attrs ) {
     
      console.log("Editor");
      element.addClass( 'inlineEditor' );

      $scope.editing = false;

      var getTemplate = function(attrs) {
        return 'url' in attrs ? urlTemplate : textTemplate;
      }
      
      // ng-click handler to activate edit-in-place
      $scope.edit = function () {
        console.log("Editing");
        $scope.editing = true;
        element.addClass( 'active' );
        $timeout(function() { 
          $scope.input.focus();
        },0);
      };
      
      $scope.done = function() {
        $scope.editing = false;
        element.removeClass( 'active' );
        //$scope.update();
      }

      element.append(getTemplate(attrs)).show();
      $compile(element.contents())($scope);

      $scope.input = $(element).find("input")[0];
    }
  };
});


bookeezApp.directive('bookmarkTree', function($compile) {
      return {
        template: '<ul><bookmark ng-repeat="bookmark in bookmarkTree" prefix="prefix"></bookmark></ul>',
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

bookeezApp.directive('bookmark', function($compile, $timeout) {

  // TODO: Refactor directive templates into separate files
  var bookmarkTemplate = '<li>' +
        '<div class="bookmark"> ' +
          // handle
          '<div class="bookmark_handle"  ng-hide="editorActive" ng-click="editorActive = !editorActive"></div> '+
          '<div class="bm_edit_handle "  ng-show="editorActive">'+
            '<div class="bm_edit_ok"     ng-click="update(bookmark);editorActive=false"></div> '+
            '<div class="bm_edit_cancel" ng-click="editorActive=false"></div> '+
          '</div>' +
          
          //content
          '<div class="bookmark_content">' +

            // editor // TODO: Refactor this into a separate directive
            '<div class="bm_tree_edit" ng-show="editorActive">' +

              '<inline-editor value="bookmarkEdit.title"   > </inline-editor>' +
              '<inline-editor url value="bookmarkEdit.url" > </inline-editor>' +
              
              '<tags-input ng-model="bookmarkEdit.tags"></tags-input>' +
              '<a ng-click="bookmark.delete()" href="">Delete</a>' +

            '</div>' +

            // view
            '<div class="bm_tree_view" ng-hide="editorActive">' + 
              '<a class="bookmark-title" href={{bookmark.url}} target="_blank" ng-bind="bookmark.title | highlight:prefix"></a>' +
            '</div>' +
            
          '</div>' +
          '<div class="empty_div" style="clear:both"></div>' +
        '</div>' +
    '</li>';

  var folderTemplate = '<li>' +
        '<div class="bookmark"> ' +
          // handle
          '<div class="folder_handle" ng-click="expand(bookmark, $event)"></div>' +
          
          // content
          '<div class="bookmark_content" ng-init="isEditing=false">' +
            '<inline-editor value="bookmark.title" update="bookmark.updateTitle()"></inline-editor>' +
          '</div>' +  // ~content

          // counter (not visible when editing folder)
          '<div ng-hide="isEditing" class="bm_folder_counter"> ({{bookmark.countChildren()}}) </div>' + 

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

      // TODO: Refactor this part into a separate dicrective for the editor
      scope.bookmarkEdit = {
        title: scope.bookmark.title,
        url: scope.bookmark.url,
        tags : scope.bookmark.tags
      }
      scope.expand = function(bookmark, $event) {
        bookmark.expanded = !bookmark.expanded;

        if (scope.bookmark.children.length > 0) {
          if (scope.bookmark.expanded == true)
          {
            $('.folder_handle',elm).addClass('open');
            var bookmarks = $compile('<bookmark-tree ng-model="bookmark.children" prefix="prefix"></bookmark-tree>')(scope)
            elm.append(bookmarks);
          }
          else
          {
            $('.folder_handle',elm).removeClass('open');
            $('ul',elm).remove(); 
          }
        }
      }; 

      scope.cancel = function() {
        // reset
        scope.bookmarkEdit = scope.bookmark;
      };

      scope.update = function(bookmark) {
        bookmark.update(scope.bookmarkEdit);
      };

      elm.append(getTemplate(scope.bookmark)).show();
      $compile(elm.contents())(scope);

      if ((scope.bookmark.expanded == true) && scope.bookmark.children.length > 0) {
        var bookmarks = $compile('<bookmark-tree  ng-model="bookmark.children" prefix="prefix"></bookmark-tree>')(scope)
        elm.append(bookmarks);
      }
    }
  };
});

});