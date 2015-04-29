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
      return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }

    $scope.$watch('locationUuid',function(newValue) {
      console.log('location = ' + newValue);
      $scope.getClinicSummary();
      $scope.schedule = null;
      $scope.startDate = new Date();
      $scope.endDate = null;
      $scope.monthlySchedule = null;
      $scope.startDateMonthly = null;
    });

    $scope.getClinicSummary = function() {
      etlService.getClinicSummary({uuid:$scope.locationUuid},
        function(result) {
          $scope.defaulterList = result;
        }
      );

    }

    $scope.getScheduledAppointments = function(startDate,endDate) {

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
          $scope.schedule = null;
        }
      );

    }


    $scope.getDefaulterList = function() {
      etlService.getDefaulterList({uuid:$scope.locationUuid},
        function(result) {
          $scope.defaulterList = result;
        }
      );

    }
  }]);

pd.controller('AppointmentScheduleCtrl', ['$scope', '$stateParams','$timeout', 'etlService',
  function ($scope, $stateParams, $timeout,etlService) {

  }
]);
