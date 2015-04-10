'use strict';

/* Controllers */


var dc = angular.module('defaulter-cohort');

dc.controller('DefaulterCohortCtrl', ['$scope', '$http', 'Auth', 'DefaulterCohortService',
  function ($scope, $http, Auth, DefaulterCohortService) {
    $scope.defaulterCohorts = "";
    $scope.defaulterCohortUuid = "";
    $scope.defaulterCohort = {};
    $scope.numRetired = 0;
    $scope.riskCategories = {
      0: 'Being Traced',
      1: 'High',
      2: 'Medium',
      3: 'Low',
      4: 'LTFU',
      5: 'no_rtc_date',
      6: 'Untraceable'
    };


    DefaulterCohortService.getOutreachProviders(function(providers) {$scope.outreachProviders = providers});
    //Get defaulter cohort if one exists in session

    function setNumRetired() {
      var numRetired = 0;
      for (var i in $scope.defaulterCohort.patients) {
        if ($scope.defaulterCohort.patients[i].retired) {
          numRetired++;
        }
      }
      $scope.numRetired = numRetired;
    }


    $scope.getDefaulterCohort = function () {
      var prevCohortUuid = sessionStorage.getItem('curDefaulterCohortUuid');
      if ($scope.defaulterCohortUuid === undefined || $scope.defaulterCohortUuid === null || $scope.defaulterCohortUuid === "") {
        if (prevCohortUuid) $scope.defaulterCohortUuid = prevCohortUuid;
        else return;
      }

      console.log("Getting defaulter cohort...");

      DefaulterCohortService.get($scope.defaulterCohortUuid, function (data) {
        if(data.online === false) {
          alert("You must be online to download this cohort.")
          return;
        }
        //console.log(data);
        $scope.defaulterCohort = data;

        if (data.uuid != $scope.defaulterCohortUuid) {
          DefaulterCohortService.getDefaulterCohorts(function (cohorts) {
            $scope.defaulterCohorts = cohorts;
            $scope.defaulterCohortUuid = data.uuid
          });
        }
        setNumRetired();
      });
    };

    $scope.getDefaulterCohort();


    $scope.updateDefaulterCohort = function () {
      if ($scope.defaulterCohortUuid != "") {
        DefaulterCohortService.update($scope.defaulterCohortUuid, function (data) {
          if (typeof data == "number") {
            alert(data + " patients retired.");
            setNumRetired();
          }
          else {
            $scope.defaulterCohort = data;
          }
        });
      }

    };

    $scope.getNewDefaulterCohort = function () {
      if ($scope.defaulterCohortUuid != "" && confirm('This will retire the current list. Are you sure you want to create a new defaulter list?')) {
        DefaulterCohortService.getNew($scope.defaulterCohortUuid, function (data) {
          $scope.defaulterCohort = data;
          setNumRetired();
          DefaulterCohortService.getDefaulterCohorts(function (data) {
            $scope.defaulterCohorts = data;
          });
        });
      }

    };

    //Load defaulter cohorts
    DefaulterCohortService.getDefaulterCohorts(function (data) {
      //alert(angular.toJson(data));
      $scope.defaulterCohorts = data;
    });

  }]);


