/**
 * Created by Jonathan on 3/31/2015.
 */

'use strict';

var mod = angular.module('network-manager');

mod.factory('NetworkManagerService', ['$rootScope','$interval','$timeout',
  function($rootScope,$interval,$timeout) {

    var networkMgr = {};
    var appCache = window.applicationCache;
    var timer;
    var defaultInterval = 60;

    networkMgr.init = function() {

      //My experience is that navigator.onLine is good at knowing offline. Not good at knowing online.
      //We can use these events to trigger a more reliable method: checking the appcache.
      $( window ).bind(
        "online offline",
        function( event ){
          console.log("network status change");
          networkMgr.checkOnlineStatus();
        }
      );

      $(appCache).bind(
        "error",
        function (event) {
          console.log('Error retrieving appcache. User offline.')
          networkMgr.online = false;
          networkMgr.restartTimer(defaultInterval, networkMgr.checkOnlineStatus);
        }
      );

      $(appCache).bind(
        "noupdate cached downloading",
        function (event) {
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
      return networkMgr.online;
    }

    networkMgr.setOffline = function() {
      networkMgr.stopTimer();
      networkMgr.online = false;
      networkMgr.countdown = -1;
    }

    return networkMgr;

  }]);
