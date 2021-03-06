'use strict';
/**
 * Created by Jonathan on 3/31/2015.
 */

var layout = angular.module('layout');

layout.controller('HeaderCtrl',['$scope','$rootScope','$interval','NetworkManagerService',
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
    };

    $scope.setOffline = function() {
      NetworkManagerService.setOffline();
    };

  }]);

layout.controller('FooterCtrl',['$scope','OpenmrsSettings','DataManagerService',
  function($scope,OpenmrsSettings,dataMgr) {

    $scope.amountStored = dataMgr.getAmountStored();

    $scope.openmrsContext = OpenmrsSettings.getContext();
    $scope.openmrsContextOptions = OpenmrsSettings.getContextOptions();

    $scope.setOpenmrsContext = function(url) {
      OpenmrsSettings.setContext(url);
    };

    $scope.$watch('openmrsContext',function(newUrl) {
      $scope.setOpenmrsContext(newUrl);
    });

    $scope.updateAmountStored = function() {
      $scope.amountStored = dataMgr.getAmountStored();
    }



  }]);


