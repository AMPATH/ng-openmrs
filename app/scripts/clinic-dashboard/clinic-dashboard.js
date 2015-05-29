/**
 * Created by Jonathan on 4/27/2015.
 */

'use strict';

var clinic = angular.module('clinic-dashboard', ['ngResource', 'local-storage-services']);

clinic.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
  function ($stateProvider, $urlRouterProvider, $httpProvider) {
    $stateProvider
      .state('clinic-dashboard', {
        url: "/clinic-dashboard/:uuid",
        templateUrl: 'views/clinic-dashboard/clinic-dashboard.html',
        authenticate: true
      })
      .state('clinic-encounter-data', {
        url: "/clinic-dashboard/:uuid/clinic-encounter-data",
        templateUrl: 'views/clinic-dashboard/clinic-encounter-data.html',
        authenticate: true
      })
    ;


    $urlRouterProvider.otherwise("/apps");
  }]);
