(function(){ 'use strict';

require.config({ 
  baseUrl: '/js',
  paths: {
    underscore: 'lib/underscore.min',
    jQuery: 'lib/jquery-2.0.3.min',
    angular: 'lib/angular.min',
    bootstrap: 'lib/bootstrap.min',
    'ui-bootstrap': 'lib/ui-bootstrap-custom-tpls-0.6.0-SNAPSHOT.min',
    controllers: 'controllers',
    filters: 'filters',
    models: 'models',
    'bootstrap-tagsinput': 'lib/bootstrap-tagsinput.min',
    'bootstrap-tagsinput-angular': 'lib/bootstrap-tagsinput-angular'
  },
  shim: {
    'jQuery': {
      exports : 'jQuery'
    },
    'underscore': {
      exports : '_'
    },
    'angular': {
      deps: ['jQuery'],
      exports : 'angular'
    },
    'bootstrap': {
      deps: ['jQuery'],
      exports : 'bootstrap'
    },
    'ui-bootstrap': {
      deps: ['jQuery','bootstrap', 'angular'],
      exports : 'ui-bootstrap'
    },
    'bootstrap-tagsinput': {
      deps: ['bootstrap']
    },
    'bootstrap-tagsinput-angular': {
      deps: ['bootstrap-tagsinput', 'angular']
    }
  }
});

require([
  'jQuery', 
  'angular', 
  'bootstrap', 
  'ui-bootstrap', 
  'bootstrap-tagsinput',
  'bootstrap-tagsinput-angular',
  'filters/filters',
  'directives/directives',
  'controllers/tree', 
  'controllers/header', ], function($, angular) {
    angular.bootstrap(document, ['bookiesApp']);
  });

})();