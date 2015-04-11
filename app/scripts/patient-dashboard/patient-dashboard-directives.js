'use strict';

/* Directives */


angular.module('patient-dashboard')
  .directive('encountersPane', ['$state', 'EncounterService', 'OpenmrsUtilityService','NetworkManagerService',
    function ($state, EncounterService, OpenmrsUtilityService,networkMgr) {
      return {
        restrict: "E",
        scope: {
          patientUuid: "@",
        },
        controller: function ($scope, $state) {
          $scope.encounters = [];
          $scope.busy = false;
          $scope.nextStartIndex = -1;

          $scope.showEncounter = function (encUuid, formUuid) {
            for (var i in $scope.encounters) {
              if ($scope.encounters[i].uuid === encUuid) {
                formUuid = $scope.encounters[i].form.uuid;
              }
            }

            //$state.go('formentry', {encounterUuid: encUuid, patientUuid: $scope.patientUuid, formUuid: formUuid});

            $state.go('encounter', {uuid: encUuid});
          };

        },

        link: function (scope, element, attrs) {
          attrs.$observe('patientUuid', function (newVal, oldVal) {
            if (newVal && newVal != "") {
              scope.busy = false;
              scope.allDataLoaded = false;
              scope.nextStartIndex = 0;
              scope.encounters = [];
              scope.loadMore();
            }
          });

          scope.loadMore = function () {
            if (scope.busy === true) return;
            scope.busy = true;

            var params = {startIndex: scope.nextStartIndex, patient: scope.patientUuid, limit: 20};

            if(networkMgr.isOnline()) {
              EncounterService.patientQueryWithObs(params, function (data) {
                scope.nextStartIndex = OpenmrsUtilityService.getStartIndex(data);
                for (var e in data.results) {
                  scope.encounters.push(data.results[e]);
                }
                if (scope.nextStartIndex !== undefined) {
                  scope.busy = false;
                }
                else scope.allDataLoaded = true;
              });
            }
            else {
              PatientService.get({uuid: scope.patientUuid}, function (patient) {
                if (patient.encounters) scope.encounters = patient.encounters;
                scope.allDataLoaded = true;
              });
            }
          }
        },
        templateUrl: "views/patient-dashboard/encountersPane.html",
      }
    }])
  .directive('formsPane', ['FormEntryService', function (FormEntryService) {
    return {
      restrict: "E",
      scope: {patientUuid: "@",},
      controller: function ($scope) {
        $scope.forms = FormEntryService.getForms();
      },
      link: function (scope, element, attrs) {

        /*
         attrs.$observe('patientUuid',function(newVal,oldVal) {
         if(newVal && newVal != "") {
         scope.patientUuid = newVal;
         }
         });
         */
      },
      templateUrl: "views/patient-dashboard/formsPane.html",
    }
  }])
  .directive("dataPane",['EncounterService',
    function(EncounterService) {
      return {
        restict:"E",
        scope: {patientUuid: "@"},
        controller: function ($scope, $state) {
          $scope.encounters = [];
          $scope.busy = false;
          $scope.nextStartIndex = -1;
        },
        link: function(scope, element,attrs) {

          attrs.$observe('patientUuid', function (newVal, oldVal) {
            if (newVal && newVal != "") {
              scope.busy = false;
              scope.allDataLoaded = false;
              scope.nextStartIndex = 0;
              scope.encounters = [];
              scope.loadMore();
            }
          });

          scope.loadMore = function () {
            if (scope.busy === true) return;
            scope.busy = true;

            var params = {startIndex: scope.nextStartIndex, patient: scope.patientUuid, limit: 20};

            EncounterService.patientQueryWithObs(params, function (data) {
              scope.nextStartIndex = OpenmrsUtilityService.getStartIndex(data);
              for (var e in data.results) {
                scope.encounters.push(data.results[e]);
              }
              if (scope.nextStartIndex !== undefined) {
                scope.busy = false;
              }
              else scope.allDataLoaded = true;
            });
          };

        },
        templateUrl: "views/patient-dashboard/dataPane.html"
      }
    }

  ]
)
;
