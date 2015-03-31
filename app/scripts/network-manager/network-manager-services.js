/**
 * Created by Jonathan on 3/31/2015.
 */

var mod = angular.module('network-manager', []);

mod.factory('NetworkManagerService', ['$rootScope','$interval','$timeout',
  function($rootScope,$interval,$timeout) {

    var networkMgr = {};
    var appCache = window.applicationCache;
    var timer;
    var defaultInterval = 300;

    networkMgr.init = function() {
      $(appCache).bind(
        "error",
        function (event) {
          console.log('Error retrieving appcache. User offline.')
          $rootScope.online = false;
          networkMgr.online = false;
          networkMgr.restartTimer(defaultInterval, networkMgr.checkOnlineStatus);
        }
      );

      $(appCache).bind(
        "noupdate cached downloading",
        function (event) {
          console.log('Success retrieving appcache. User online.')
          $rootScope.online = true;
          networkMgr.online = true;
          console.log("User is online: " + new Date().toISOString());
          networkMgr.restartTimer(defaultInterval, networkMgr.checkOnlineStatus);
        }
      );
    };


    networkMgr.startTimer = function (interval,callback) {
      networkMgr.countdown = interval;
      timer = $interval(function() {
        networkMgr.countdown -= 1;
        if(networkMgr.countdown == 0) callback();
      },1000,interval);
    }

    networkMgr.stopTimer = function () {
      $interval.cancel(timer);
    }

    networkMgr.restartTimer = function(interval,callback) {
      if(timer) networkMgr.stopTimer();
      networkMgr.startTimer(interval,callback);
    }

    networkMgr.checkOnlineStatus = function() {
      appCache.update();
    };

    networkMgr.isOnline = function() {
      networkMgr.checkOnlineStatus();
      $timeout(function() {},1500);
      return networkMgr.online;
    }

    return networkMgr;

  }]);
