/**
 * Created by Jonathan on 4/9/2015.
 */
'use strict';
var mod = angular.module('patient-search', ['openmrs-services-extended']);

mod.config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('patient-search', {
        url: '/patient-search',
        templateUrl: 'views/patient-search/patient-search.html',
        controller: 'PatientSearchCtrl',
        authenticate: true,
      })
  }]);

