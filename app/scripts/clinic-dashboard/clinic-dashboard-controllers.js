'use strict';

var cd = angular.module('clinic-dashboard');

function toTitleCase(str)
{
  if(typeof str === "string")
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

pd.controller('ClinicDashboardCtrl', ['$scope', '$stateParams','$timeout', 'etlService',
  function ($scope, $stateParams, $timeout,etlService) {
    $scope.locationUuid = null;

    $scope.clinicSummary = {};

    $scope.toTitleCase = toTitleCase;

    $(".panel").hide();
    $scope.$watch('locationUuid',function(newValue) {
      if(newValue === undefined) return;
      console.log('location = ' + newValue);
      $scope.getClinicSummary();
      $scope.schedule = null;
      $scope.startDate = new Date();
      $scope.endDate = null;
      $scope.monthlySchedule = null;
      $scope.startDateMonthly = null;
      $scope.defaulterList = null;
    });

    $scope.getClinicSummary = function() {
      etlService.getClinicSummary({uuid:$scope.locationUuid},
        function(result) {
          $scope.defaulterList = result;
        }
      );

    }

    $scope.getScheduledAppointments = function(startDate,endDate) {

      $(".panel").hide();
      $("#appointmentList").show();
      if(startDate === undefined)
        startDate = $scope.startDate ? $scope.startDate.toISOString().substring(0,10) : null;
      else $scope.startDate = new Date(startDate);

      if(endDate === undefined) {
        endDate = $scope.endDate ? $scope.endDate.toISOString().substring(0, 10) : null;
        if(endDate === null && $scope.startDate > new Date()) endDate = startDate;
      }
      else $scope.endDate = new Date(endDate);


      var params =
      {
        uuid: $scope.locationUuid,
        startDate : startDate,
        endDate : endDate,
      };
      etlService.getScheduledAppointments(params,
        function(result) {
          console.log(result);
          $scope.schedule = result.result;
          $scope.monthlySchedule = null;
        }
      );

    }

    $scope.getMonthlySchedule = function() {
      $(".panel").hide();
      $("#monthlySchedule").show();

      var startDateMonthly = $scope.startDateMonthly ? $scope.startDateMonthly.toISOString().substring(0,10) : null;
      var params =
      {
        uuid: $scope.locationUuid,
        startDate : startDateMonthly,
      };
      etlService.getMonthlySchedule(params,
        function(result) {
          console.log(result);
          $scope.monthlySchedule = result.result;

        }
      );

    }


    $scope.getDefaulterList = function() {
      $(".panel").hide();
      $("#defaulterList").show();

      etlService.getDefaulterList({uuid:$scope.locationUuid,defaulterPeriod:$scope.defaulterPeriod},
        function(result) {
          $scope.defaulterList = result.result;
        }
      );

    }
  }]);

pd.controller('ClinicEncounterDataCtrl', ['$scope', '$stateParams','$timeout', 'etlService','$state',
  function ($scope, $stateParams, $timeout,etlService,$state) {

    $scope.filters = [];
    $scope.encounters = {};
    var params = {uuid:$stateParams.uuid};
    $scope.toTitleCase = toTitleCase;

    $scope.toPatientDashboard = function(patientUuid) {
      $state.go("patient",{uuid:patientUuid});
    }

    etlService.getClinicEncounterData(params,function(data){
      $scope.encounters = data.result;
      console.log($scope.encounters);
      console.log(data);
    });

    $scope.filterResults = function() {
      console.log($scope.filters);
      var filters = [],curFilter;

      for(var column in $scope.filters) {
        curFilter = {column: column, filters: {}};
        for(var i in $scope.filters[column]) {
          if (i.startsWith("start"))
            curFilter.filters.start = $scope.filters[column][i];
          else if (i.startsWith("end"))
            curFilter.filters.end = $scope.filters[column][i];
          else
            curFilter.filters.like = $scope.filters[column][i];
        }
        filters.push(curFilter);
      }

      console.log(filters);

      var filterParams = {
        uuid: $stateParams.uuid,
        filters: angular.toJson(filters)
      };

      etlService.getClinicEncounterData(filterParams,function(data){
        $scope.encounters = data.result;
        console.log($scope.encounters);
        console.log(data);
      });

    }




  }
]);
