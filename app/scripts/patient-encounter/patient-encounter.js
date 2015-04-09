/**
 * Created by Jonathan on 4/9/2015.
 */
'use strict';
var mod = angular.module('patient-encounter', []);

mod.config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('encounter', {
        url: "/encounter/:uuid",
        templateUrl: 'views/patient-encounter/patient-encounter.html',
        authenticate: true
      })
  }]);
