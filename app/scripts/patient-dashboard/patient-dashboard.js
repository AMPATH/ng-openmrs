'use strict';

/* Directives */


angular.module('patient-dashboard', ['openmrs-services-extended', 'utility.widgets','etl','infinite-scroll']);


mod.config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('patient', {
        url: '/patient/:uuid',
        templateUrl: 'views/patient-dashboard/patient-dashboard.html',
        controller: 'PatientDashboardCtrl',
        authenticate: true
      })
  }]);
