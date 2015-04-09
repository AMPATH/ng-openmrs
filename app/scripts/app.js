'use strict';

/* App Module */
//"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --user-data-dir="C:/Chrome dev session" --disable-web-security
var ngOpenmrsApp = angular.module('ngOpenmrsApp',
  [
    'ui.router',
    'localStorageServices',
    'data-manager',
    'ui.bootstrap',
    'defaulterCohort',
    'openmrs.auth',
    'network-manager',
    'openmrs.formentry',
    'openmrs-services-extended',
    'patientSearch',
    'patientDashboard',
    'patient-encounter',
    'spinner',
    'layout'
  ]);

ngOpenmrsApp.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
  function ($stateProvider, $urlRouterProvider, $httpProvider) {

    $stateProvider
      .state('login', {
        url: "/login",
        templateUrl: 'views/auth/login.html'
      })
      .state('logout', {
        url: "/logout",
        templateUrl: 'views/auth/login.html'
      })
      .state('apps', {
        url: "/apps",
        templateUrl: 'views/apps.html',
        authenticate: true
      });

    $urlRouterProvider.otherwise("/apps");
  }])
  .run(['$rootScope', '$state', 'Auth', 'OpenmrsSettings', 'DefaulterCohortService', 'FormEntryService', 'NetworkManagerService','DataManagerService',
    function ($rootScope, $state, Auth, OpenmrsSettings, DefaulterCohortService, FormEntryService, NetworkManagerService,DataManagerService) {
      $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
        if (toState.authenticate && !Auth.isAuthenticated()) {
          $state.transitionTo("login");
          event.preventDefault();
        }
        if (toState.url == "/logout") {
          Auth.logout();
        }

      });

      NetworkManagerService.init();
      DataManagerService.addOfflineDataService(['OpenmrsSettings','DefaulterCohortService']);
      /*
      $rootScope.servicesWithUserData = ['OpenmrsFlexSettings', 'DefaulterCohortService'];
      OpenmrsFlexSettings.init();
      DefaulterCohortService.init();
      */
    }]);
