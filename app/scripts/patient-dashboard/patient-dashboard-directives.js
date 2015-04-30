'use strict';

/* Directives */


angular.module('patient-dashboard')
  .directive('hivSummary', ['etlService',
    function(etlService) {
      return {
        restrict: "E",
        scope: {patientUuid:"@"},
        controller: function($scope,$state) {},
        link : function(scope, element, attrs) {
          attrs.$observe('patientUuid', function (newVal, oldVal) {
            if (newVal && newVal != "") {
              var params = {startIndex: scope.nextStartIndex, uuid: scope.patientUuid, limit: 20};
              //var params = {startIndex: scope.nextStartIndex, uuid: "58d12592-c07b-4538-992a-6da8ba69a68c",limit:1};

              etlService.getHivSummary(params,function(hivData) {
                  scope.hivSummary = hivData.result[0];
                }
              )
            }
          });

        },
        templateUrl: "views/patient-dashboard/hivSummaryPane.html",
      }
    }])
  .directive('encountersPane', ['$state', 'EncounterService', 'OpenmrsUtilityService','NetworkManagerService','PatientService',
    function ($state, EncounterService, OpenmrsUtilityService,networkMgr,PatientService) {
      return {
        restrict: "E",
        scope: {
          patientUuid: "@",
        },
        controller: function ($scope, $state) {
          $scope.encounters = [];
          $scope.busy = false;
          $scope.nextStartIndex = 0;

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
            console.log("loadMore: " + scope.busy);
            if (scope.busy === true) return;
            scope.busy = true;
            var params = {startIndex: scope.nextStartIndex, patient: scope.patientUuid, limit: 20};

            if(networkMgr.isOnline()) {
              EncounterService.patientQuery(params, function (data) {
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
                console.log(patient);
                if (patient.patientData.encounters) {
                  _.each(patient.patientData.encounters,
                    function (uuid) {
                      EncounterService.get({uuid: uuid}, function (e) {
                        scope.encounters.push(e);
                      });
                    }
                  );
                  scope.allDataLoaded = true;
                }
              });
            }
          }
        },
        templateUrl: "views/patient-dashboard/encountersPane.html",
      }
    }])
  .directive('formsPane', ['FormEntryService',
    function (FormEntryService) {
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
  .directive("vitalsPane",['etlService',
    function(etlService) {
      return {
        restict: "E",
        scope: {patientUuid: "@"},
        controller: function ($scope, $state) {
          $scope.encounters = [];
          $scope.busy = false;
          $scope.nextStartIndex = 0;
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

            var params = {startIndex: scope.nextStartIndex, uuid: scope.patientUuid, limit: 20};
            //var params = {startIndex: scope.nextStartIndex, uuid: "5b702292-1359-11df-a1f1-0026b9348838", limit: 20};

            etlService.getVitals(params, function (data) {
              console.log(data);
              scope.nextStartIndex = +data.startIndex + data.size;

              for (var e in data.result) {
                scope.encounters.push(data.result[e]);
              }
              if (data.size !== 0) {
                scope.busy = false;
              }
              else scope.allDataLoaded = true;
            });
          };

        },
        templateUrl: "views/patient-dashboard/vitalsPane.html"
      }
    }])
  .directive("labsAndImagingPane",['etlService',
    function(etlService) {
      return {
        restict:"E",
        scope: {patientUuid: "@"},
        controller: function ($scope, $state) {
          $scope.encounters = [];
          $scope.busy = false;
          $scope.nextStartIndex = 0;
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

            var params = {startIndex: scope.nextStartIndex, uuid: scope.patientUuid, limit: 20};
            //var params = {startIndex: scope.nextStartIndex, uuid: "58d12592-c07b-4538-992a-6da8ba69a68c", limit: 20};

            etlService.getData(params, function (data) {
              console.log(data);
              scope.nextStartIndex = +data.startIndex + data.size;

              for (var e in data.result) {
                scope.encounters.push(data.result[e]);
              }
              if (data.size !== 0) {
                scope.busy = false;
              }
              else scope.allDataLoaded = true;
            });
          };

        },
        templateUrl: "views/patient-dashboard/dataPane.html"
      }
    }])

;
