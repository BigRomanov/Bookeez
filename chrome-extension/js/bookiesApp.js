define(
[
  'angular', 
  'ui-bootstrap'
], 
function(angular) { 'use strict';

var app =  angular.module('bookiesApp', ['ui.bootstrap', 'bootstrap-tagsinput']);

app.config(['$routeProvider', function($routeProvider) {
   $routeProvider.when('/tree', {templateUrl: 'partials/tree.tpl.html', controller: 'treeController'});
   $routeProvider.otherwise({redirectTo: '/tree'});
}]);

return app;

});