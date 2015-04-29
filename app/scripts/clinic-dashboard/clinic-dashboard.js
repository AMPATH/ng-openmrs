/**
 * Created by Jonathan on 4/27/2015.
 */

'use strict';

var clinic = angular.module('clinic-dashboard', ['ngResource', 'localStorageServices']);

clinic.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
  function ($stateProvider, $urlRouterProvider, $httpProvider) {
    $stateProvider
      .state('clinic-dashboard', {
        url: "/clinic-dashboard/:uuid",
        templateUrl: 'views/clinic-dashboard/clinic-dashboard.html',
        authenticate: true
      })
      .state('appointment-schedule', {
        url: "/clinic-dashboard/:uuid/appointment-schedule",
        templateUrl: 'views/clinic-dashboard/appointment-schedule.html',
        authenticate: true
      })
      .state('appointment-calendar', {
        url: "/clinic-dashboard/:uuid/monthly-appointment-schedule",
        templateUrl: 'views/clinic-dashboard/appointment-calendar.html',
        authenticate: true
      })
    ;


    $urlRouterProvider.otherwise("/apps");
  }])
