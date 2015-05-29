'use strict';

/* App Module */
var ngOpenmrsApp = angular.module('ngOpenmrsApp',
  [
    'openmrs-auth',
    'ui.router',
    'local-storage-services',
    'data-manager',
    'ui.bootstrap',
    'etl',
    'defaulter-cohort',
    'network-manager',
    'openmrs-formentry',
    'openmrs-services-extended',
    'patient-search',
    'patient-dashboard',
    'clinic-dashboard',
    'patient-encounter',
    'spinner',
    'layout',
    'underscore',
    'infinite-scroll'
  ]);

ngOpenmrsApp.config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'views/auth/login.html'
      })
      .state('logout', {
        url: '/logout',
        templateUrl: 'views/auth/login.html'
      })
      .state('apps', {
        url: '/apps',
        templateUrl: 'views/apps.html',
        authenticate: true
      });

    $urlRouterProvider.otherwise('/apps');
  }])
  .run(['$rootScope', '$state','Auth',
    function ($rootScope, $state,Auth) {
      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        if (toState.authenticate && !Auth.isAuthenticated()) {
          $state.transitionTo('login');
          event.preventDefault();
        }
        if (toState.url == '/logout') {
          Auth.logout();
        }
    });
    }]);
