'use strict';

/* Directives */


angular.module('patientDashboard', ['openmrs-services-extended', 'utility.widgets']);


mod.config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('patient', {
        url: '/patient/:uuid',
        templateUrl: 'views/patient-dashboard/patient-dashboard.html',
        controller: 'PatientDashboardCtrl',
        authenticate: true,
      })
  }]);
