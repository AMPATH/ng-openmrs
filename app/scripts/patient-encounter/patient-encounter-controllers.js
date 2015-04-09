'use strict';

/* Controllers */


var pd = angular.module('patient-encounter');

pd.controller('PatientEncounterCtrl', ['$scope', '$stateParams','PatientService','EncounterService',
  function ($scope, $stateParams, PatientService,EncounterService) {
    $scope.encounter = {};
    $scope.patient = {};

    var params = {uuid:$stateParams.uuid};
    EncounterService.get(params,
      function (data) {
        console.log(data);
        if(data.obs) $scope.encounter = data;
        else {
          EncounterService.getServer(params,function(data) {
            $scope.encounter = data;
            console.log(data);
          });
        }

      });
  }]);
