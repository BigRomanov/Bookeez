define(
[
  'angular', 
], 
function(angular) { 'use strict';

var app =  angular.module('bookiesApp', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
   $routeProvider.when('/tree', {templateUrl: 'partials/tree.tpl.html', controller: 'treeController'});
   $routeProvider.when('/history', {templateUrl: 'partials/history.tpl.html', controller: 'historyController'});
   $routeProvider.otherwise({redirectTo: '/history'});
}]);

return app;

});