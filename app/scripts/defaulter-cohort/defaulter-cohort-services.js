'use strict';

/* Services */

var session = sessionStorage;
var DEFAULTER_COHORT_CONTEXT = "https://testserver1.ampath.or.ke";

var dc = angular.module('defaulter-cohort');

dc.factory('DefaulterCohort', ['$resource',
  function ($resource) {
    return $resource(
      (DEFAULTER_COHORT_CONTEXT + '/outreach/ajax_get_defaulter_cohort'),
      {query: {method: "GET", isArray: false}}
    )
  }]);

dc.factory('DefaulterCohortService', ['$http', 'spinnerService', 'localStorage.utils', 'Auth','DefaulterCohort','EncounterService','PatientService',
  function ($http, spinner, local, Auth,DefaulterCohort,EncounterService,PatientService) {
    var DefaulterCohortService = {};

    DefaulterCohortService.ping = function () {
      $http.get(DEFAULTER_COHORT_CONTEXT).success(function (data) {
        console.log(data);
      });
    };

    DefaulterCohortService.init = function () {
      var tables = ["defaulter-cohort", "defaulter-cohorts", "outreach-providers"];
      local.init(tables);
      DefaulterCohortService.getOutreachProviders();
    };

    DefaulterCohortService.changeUser = function (prevUsername,curUsername) {
      var tables = ["defaulter-cohort"];
      local.reset(tables);
    };


    DefaulterCohortService.get = function (uuid, callback) {
      spinner.show('waiting');
      if (uuid === undefined || uuid === "") {
        uuid = session.getItem("curDefaulterCohortUuid");
      }
      else {
        session.setItem("curDefaulterCohortUuid", uuid);
      }

      var dc = local.get('defaulter-cohort', uuid,Auth.getPassword());
      //console.log('dc: ' + dc + ' uuid: ' + uuid);
      if (dc) {
        callback(dc);
        spinner.hide('waiting');
      }
      else if (uuid !== undefined && uuid !== "") {
        console.log("Getting defaulter cohort from server...")
        DefaulterCohort.get({defaulter_cohort_uuid: uuid}, function (result) {
          //If the previous cohort was voided, remove from locally saved cohorts
          local.set('defaulter-cohort', uuid, result.defaulter_cohort, Auth.getPassword());
          var memberUuids = [];
          var patients = result.defaulter_cohort.patients;
          for(var i in patients) {
            memberUuids.push(patients[i].uuid);
          }
          DefaulterCohortService.getMemberData(memberUuids);
          if (callback) return callback(result);
          else return result;
        }, function(error) {
          callback({online:false,error:error});
        });
      }

      spinner.hide('waiting');

    };

    DefaulterCohortService.getMemberData = function (memberUuids) {
      var memberUuid, params, nextStartIndex, encounter, encounterUuids;
      for (var i in memberUuids) {
        memberUuid = memberUuids[i];
        params = {startIndex: 0, patient: memberUuid};
        PatientService.get(memberUuid, function (patient) {
          if(!patient.error) {
            EncounterService.patientQuery(params, function (encounters) {
              patient.encounters = encounters;
              local.set('openmrs.patient', patient.uuid, patient, Auth.getPassword())
            });
          }
          else console.log("patient not found");
        });
      }
    }

    DefaulterCohortService.getDefaulterCohorts = function (callback) {
      var dcs = local.getAll("defaulter-cohorts");
      if (Object.keys(dcs).length != 0) {
        console.log("getting defaulter cohorts from local");
        callback(dcs);
      }
      else {
        console.log("getting defaulter cohorts from server");

        $http.get(DEFAULTER_COHORT_CONTEXT + '/outreach/ajax_get_defaulter_cohorts').success(function (data) {
          //alert('success getting data from dc server');
          console.log(data);
          console.log(typeof data);
          local.setAll("defaulter-cohorts", data, function (dc) {
            if(dc.uuid !== "0") return dc.uuid;
            else return dc.id;
          });
          callback(data);
        }).error(function (error, status) {
          alert('error');
          alert(error);
          alert(status);
        });
      }
    };

    DefaulterCohortService.update = function (uuid, callback) {
      console.log("updateDefaulterCohort() : updating cohort...");
      var cohort, numUpdated = 0;
      if (navigator.onLine) {
        var url = DEFAULTER_COHORT_CONTEXT + '/outreach/ajax_get_retired_members?defaulter_cohort_uuid=' + uuid;
        $http.get(url).success(function (retiredPatients) {
          //The current cohort has been retired and needs to updated with the latest version
          if (retiredPatients.indexOf("*") != -1) {
            DefaulterCohortService.get(uuid, callback);
          }
          else {
            cohort = local.get('defaulter-cohort', uuid, Auth.getPassword());
            for (var i = 0; i < retiredPatients.length; i++) {
              var patientUuid = retiredPatients[i];
              if (patientUuid in cohort.patients) {
                var p = cohort.patients[patientUuid];
                if (p.retired == 0) {
                  cohort.patients[patientUuid].retired = 1;
                  numUpdated++;
                }
              }
            }
            local.setItem('defaulter-cohort', uuid, cohort, Auth.getPassword());
            callback(numUpdated);
          }
        });
      }
    };

    DefaulterCohortService.getNew = function (uuid, callback) {
      local.removeItem('defaulter-cohort', uuid);
      var url = DEFAULTER_COHORT_CONTEXT + '/outreach/ajax_get_new_defaulter_cohort?defaulter_cohort_uuid=' + uuid;
      $http.get(url).success(function (data) {
        local.set("defaulter-cohorts", data.defaulter_cohorts);
        local.set("defaulter-cohort", data.defaulter_cohort.uuid, data.defaulter_cohort, Auth.getPassword());
        callback(data.defaulter_cohort);
      });
    };


    DefaulterCohortService.getOutreachProviders = function (callback) {
      var url = DEFAULTER_COHORT_CONTEXT + '/outreach/ajax_get_outreach_providers';
      local.query('outreach-providers',null,null,false,
        function(providers) {
          if (providers === undefined || providers === null || Object.keys(providers).length == 0) {
            console.log('Getting outreach providers from server');
            $http.get(url).success(function (data) {
              local.setAll("outreach-providers", data, function (p) {
                return p.uuid;
              });
              providers = data;
              if (callback) callback(providers);
            }).error(function (error) {
              console.log(error);
            });
          }
          callback(providers);
        }
      );
    };


    return DefaulterCohortService;

  }]);

