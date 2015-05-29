'use strict';

var mod = angular.module('defaulter-cohort', ['ngResource', 'openmrs-services-extended', 'spinner', 'local-storage-services','data-manager']);

mod.config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('defaulter-cohort', {
        url: "/defaulter-cohort",
        templateUrl: 'views/defaulter-cohort/defaulter-cohort.html',
        controller: 'DefaulterCohortCtrl',
        authenticate: true
      });
  }])
  .run(['DefaulterCohortService','DataManagerService',
    function(DefaulterCohortService,dataMgr) {
      DefaulterCohortService.init();
      dataMgr.addOfflineDataService(['DefaulterCohortService']);
    }
  ])
;
