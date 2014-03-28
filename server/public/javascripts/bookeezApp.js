define(
[
  'angular', 
  'ui-bootstrap'
], 
function(angular) { 'use strict';

var app =  angular.module('bookeezApp', ['ui.bootstrap', 'bootstrap-tagsinput', 'ngRoute',  'ngTagsInput']);

app.config(['$routeProvider', function($routeProvider) {
   $routeProvider.when('/', {templateUrl: 'partials/page.tpl.html', controller: 'pageController'});
   $routeProvider.otherwise({redirectTo: '/'});
}]);

return app;

});




// angular.module('polls', [])
//           .config(['$routeProvider', function($routeProvider) {
//             $routeProvider.
//               when('/polls', { templateUrl: 'partials/list.html', controller: 
// PollListCtrl }).
//               when('/poll/:pollId', { templateUrl: 'partials/item.html', controller: 
// PollItemCtrl }).
//               when('/new', { templateUrl: 'partials/new.html', controller: 
// PollNewCtrl }).
//               otherwise({ redirectTo: '/polls' });
//           }]);