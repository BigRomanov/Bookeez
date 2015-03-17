(function(){ 'use strict';

require.config({ 
  baseUrl: '/js',
  waitSeconds: 30,
  paths: {
    jQuery: 'lib/jquery-2.0.3.min',
    underscore: 'lib/underscore.min',
    angular: 'lib/angular',
    angularRoute: 'lib/angular-route',
    
    //analyzer : 'analyzer',
    controllers: 'controllers',
    filters: 'filters',
    models: 'models',
    directives : 'directives',
  },
  shim: {
    // 'jQuery': {
    //   exports : 'jQuery'
    // },
    'underscore': {
      exports : '_',
      deps: [ 'jQuery']
    },
    'angular': {
      deps: ['jQuery'],
      exports : 'angular'
    },
    'angularRoute': {
      deps: ['angular']
    }
  }
});

require([
  'jQuery', 
  'angular', 
  'angularRoute', 

  // Analyzer
  //'analyzer/analyzer',

  // Directives
  'directives/directives',

  // Filters
  'filters/filters',

  // Controllers
  'controllers/history', 
  'controllers/header', 

  ], 
  function($, angular) {
    angular.bootstrap(document, ['bookiesApp']);
  });

})();