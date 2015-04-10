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
          console.log(data);
          $scope.patient = data;
        });
    },1000);
  }]);
