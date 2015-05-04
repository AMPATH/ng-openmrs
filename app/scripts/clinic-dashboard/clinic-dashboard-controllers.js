/**
 * Created by Jonathan on 4/27/2015.
 */

var cd = angular.module('clinic-dashboard');

pd.controller('ClinicDashboardCtrl', ['$scope', '$stateParams','$timeout', 'etlService',
  function ($scope, $stateParams, $timeout,etlService) {
    $scope.locationUuid = null;

    $scope.clinicSummary = {};

    $scope.toTitleCase = function(str)
    {
      if(typeof str === "string")
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }
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
          $scope.defaulterList = result;
        }
      );

    }
  }]);

pd.controller('ClinicEncounterDataCtrl', ['$scope', '$stateParams','$timeout', 'etlService',
  function ($scope, $stateParams, $timeout,etlService) {

    $scope.filters = [];
    $scope.encounters = {};
    var params = {uuid:$stateParams.uuid,startDate:"2015-04-27"};
    etlService.getClinicEncounterData(params,function(data){
      $scope.encounters = data.result;
      console.log($scope.encounters);
      console.log(data);
    });

    $scope.filterResults = function() {
      console.log(Object.keys($scope.filters));
      _.each(a,function(o) {
        console.log('a');
        console.log(o);
        console.log(Object.keys(o));
      });
    }



  }
]);
