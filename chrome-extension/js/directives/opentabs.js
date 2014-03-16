define(
'directives/opentabs',
['bookiesApp'], 
function(bookiesApp) { 'use strict';

  bookiesApp.directive( 'openTabs', function($compile, $timeout) {

    // TODO: Prefix highlighting is currently hard coded into the editor, we should consider refactoring this
    var template  = '<div>' +
                      'List of open tabs' +
                    '</div>';
    
    return {
      restrict: 'E',
      link: function ( $scope, element, attrs ) {
       

        $scope.editing = false;

        var getTemplate = function(attrs) {
          return template;
        }

        element.append(getTemplate(attrs)).show();
        $compile(element.contents())($scope);
      }
    };
  });

});