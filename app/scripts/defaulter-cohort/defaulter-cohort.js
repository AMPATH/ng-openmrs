'use strict';

var mod = angular.module('defaulter-cohort', ['ngResource', 'ngCookies', 'openmrs-services-extended', 'spinner', 'localStorageServices']);

mod.config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('defaulter-cohort', {
        url: "/defaulter-cohort",
        templateUrl: 'views/defaulter-cohort/defaulter-cohort.html',
        controller: 'DefaulterCohortCtrl',
        authenticate: true,
      })
  }]);
