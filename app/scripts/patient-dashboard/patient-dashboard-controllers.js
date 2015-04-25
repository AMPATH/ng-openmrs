'use strict';

/* Controllers */


var pd = angular.module('patient-dashboard');

pd.controller('PatientDashboardCtrl', ['$scope', '$stateParams','$timeout', 'PatientService','etlService',
  function ($scope, $stateParams, $timeout, PatientService,etlService) {
    $scope.patient = {};
    $scope.p = null;



    $timeout(function () {
      PatientService.get({uuid:$stateParams.uuid},
        function (data) {
          $scope.patient = data;
        });
    },1000);
  }]);
