define(
[
  'angular', 
  'ui-bootstrap'
], 
function(angular) { 'use strict';

return angular.module('bookiesApp', ['ui.bootstrap', 'bootstrap-tagsinput']).
config(['$routeProvider', function($routeProvider) {
   $routeProvider.when('/tree', {templateUrl: 'partials/tree.tpl.html', controller: 'treeController'});
   $routeProvider.otherwise({redirectTo: '/tree'});
}]);

});