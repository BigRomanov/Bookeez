define(
'directives/directives',
['bookiesApp'], 
function(bookiesApp) { 'use strict';

bookiesApp.directive('contenteditable', function() {
  return {
    restrict: 'A', // only activate on element attribute
    require: '?ngModel', // get a hold of NgModelController
    link: function(scope, element, attrs, ngModel) {
      if(!ngModel) return; // do nothing if no ng-model

      // Specify how UI should be updated
      ngModel.$render = function() {
        element.html(ngModel.$viewValue || '');
      };

      // Listen for change events to enable binding
      element.on('blur keyup change', function() {
        scope.$apply(read);
      });
      read(); // initialize

      // Write data to the model
      function read() {
        var html = element.html();
        // When we clear the content editable the browser leaves a <br> behind
        // If strip-br attribute is provided then we strip this out
        if( attrs.stripBr && html == '<br>' ) {
          html = '';
        }
        ngModel.$setViewValue(html);
      }
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
          '<div class="bookmark_handle"> <img src="images/bookmark_item.png"></img> </div>' +
          '<div class="bookmark_content">' +
            '<a class="bookmark-title" href={{bookmark.url}} target="_blank" ng-bind="bookmark.title | highlight:prefix"></a>' +
            '<a class="bookmark-context" ng-click="editorEnabled=!editorEnabled"> <img src=images/edit.png height=20 width=20></a>' +
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
          '<div class="bookmark_handle" ng-click="bookmarkClicked(bookmark, $event)">' +
            '<input type="checkbox" class="tree_handle" ng-checked="bookmark.checked"></input>' +
          '</div>' +
          '<div class="bookmark_content" ng-init="editorEnabled=false">' +

            '<div ng-hide="editorEnabled"  ng-click="clicked()" ' +
                'ng-bind="bookmark.title | highlight:prefix" class="bookmark-folder" ></div>' +
          
            '<input ng-show="editorEnabled" ng-model="bookmark.title" ng-change="bookmark.updateTitle()" class="inlineEditor"></input>' +
          
            '<div class="bookmark_actions" style="float:right">' + 
              '<span class="bookmark-context"> ({{bookmark.countChildren()}}) </span>' + 
              '<a class="bookmark-context" ng-click="editorEnabled=!editorEnabled"> <img src=images/edit.png height=20 width=20></a>' +
            '</div>' +
          '</div>' +    
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

      scope.clicked = function()
      {
        console.log("Clicked");
        scope.editorEnabled = true;
        $timeout(function() { 
          console.log("Focused");
          scope.input.focus();
         },0);
      }

      elm.append(getTemplate(scope.bookmark)).show();
      $compile(elm.contents())(scope);

      scope.input = $("input:text", elm.contents());

      if ((scope.bookmark.checked == true || scope.bookmark.expanded == true) && scope.bookmark.children.length > 0) {
        var bookmarks = $compile('<bookmark-tree on-edit="onEdit({bookmark:bookmark})" ng-model="bookmark.children" prefix="prefix"></bookmark-tree>')(scope)
        elm.append(bookmarks);
      }
    }
  };
});

});