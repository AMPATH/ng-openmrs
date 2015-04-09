'use strict';

/* Controllers */


var pd = angular.module('patient-dashboard');

pd.controller('PatientDashboardCtrl', ['$scope', '$stateParams','$timeout', 'PatientService',
  function ($scope, $stateParams, $timeout, PatientService) {
    $scope.patient = {};
    $scope.p = null;

    $timeout(function () {
      PatientService.get($stateParams.uuid,
        function (data) {
          var p = PatientService.Patient(data.patientData);
          $scope.patient = p;
        });
    },1000);
  }]);
