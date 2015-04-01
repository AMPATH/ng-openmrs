'use strict';

/* App Module */
//"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --user-data-dir="C:/Chrome dev session" --disable-web-security
var ngOpenmrsApp = angular.module('ngOpenmrsApp',
  [
    'ui.router',
    //'ui.bootstrap',
    'defaulterCohort',
    'openmrs.auth',
    'openmrs.formentry',
    'openmrsServices',
    'flex',
    'patientSearch',
    'patientDashboard',
    'spinner',
    'layout',
    'network-manager'
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
        authenticate: true,
      })
      .state('patient-search', {
        url: '/patient-search',
        templateUrl: 'views/patient-search/patient-search.html',
        controller: 'PatientSearchCtrl',
        authenticate: true,
      })
      .state('patient', {
        url: '/patient/:uuid',
        templateUrl: 'views/patient-dashboard/patient-dashboard.html',
        controller: 'PatientDashboardCtrl',
        authenticate: true,
      })

      .state('defaulter-cohort', {
        url: "/defaulter-cohort",
        templateUrl: 'views/defaulter-cohort/defaulter-cohort.html',
        controller: 'DefaulterCohortCtrl',
        authenticate: true,
      })
      .state('encounter-form', {
        url: "/encounter-form?formUuid&patientUuid&savedFormId",
        authenticate: true,
        templateProvider: function ($stateParams, FormEntryService, $templateFactory) {
          var template = FormEntryService.getTemplate($stateParams.formUuid);
          var html = $templateFactory.fromUrl(template);
          return html;
        },

      })
      .state('encounter-forms-saved', {
        url: "/encounter-forms-saved",
        templateUrl: 'views/formentry/encounter-forms-saved.html',
        authenticate: true,
      })
      .state('formentry', {
        url: "/formentry?encounterUuid&formUuid&patientUuid",
        authenticate: true,
        templateProvider: function ($stateParams, FormEntryService, $templateFactory) {
          var template = FormEntryService.getTemplate($stateParams.formUuid);
          var html = $templateFactory.fromUrl(template);
          return html;
        },
      });


    $urlRouterProvider.otherwise("/apps");
  }])
  .run(['$rootScope', '$state', 'Auth', 'OpenmrsFlexSettings', 'DefaulterCohortService', 'FormEntryService', 'NetworkManagerService',
    function ($rootScope, $state, Auth, OpenmrsFlexSettings, DefaulterCohortService, FormEntryService, NetworkManagerService) {
      $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
        if (toState.authenticate && !Auth.isAuthenticated()) {
          $state.transitionTo("login");
          event.preventDefault();
        }
        if (toState.url == "/logout") {
          Auth.logout();
        }

      });

      //console.log(checkIfOnline);
      $rootScope.servicesWithUserData = ['OpenmrsFlexSettings', 'FormEntryService', 'DefaulterCohortService'];
      NetworkManagerService.init();
      OpenmrsFlexSettings.init();
      DefaulterCohortService.init();
      FormEntryService.init();
    }]);
