/**
 * Created by Jonathan on 3/31/2015.
 */

var header = angular.module('header', ['network-manager']);

auth.controller('HeaderCtrl',['$scope','$rootScope','$interval','NetworkManagerService',
  function($scope,$rootScope,$interval,NetworkManagerService) {

    $scope.$watch(
      function() {return NetworkManagerService.online;},
      function(newVal,oldVal) {
        if(newVal === true) $scope.online = "True";
        else $scope.online = "False"
      });

    $scope.$watch(
      function() {return NetworkManagerService.countdown;},
      function(newVal,oldVal) {
        if(newVal) $scope.countdown = newVal;
      });

    $scope.checkOnlineStatus = function() {
      NetworkManagerService.checkOnlineStatus();
    }

  }]);
