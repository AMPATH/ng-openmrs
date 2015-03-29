'use strict';

/* Services */

var session = sessionStorage;
var DEFAULTER_COHORT_CONTEXT = "https://testserver1.ampath.or.ke";

var dc = angular.module('defaulterCohort', ['ngResource', 'ngCookies', 'openmrsServices', 'spinner','localStorageServices']);


dc.factory('DefaulterCohort',['$resource',
  function($resource) {
    return $resource(
      (DEFAULTER_COHORT_CONTEXT + '/outreach/ajax_get_defaulter_cohort?defaulter_cohort_uuid=' + uuid),
      {uuid: '@uuid'},
      {query: {method: "GET", isArray: false}}
    )
  }]);

dc.factory('DefaulterCohortService', ['$http', 'spinnerService','localStorage.utils','Auth',
  function ($http, spinner, local,Auth) {
    var DefaulterCohort = {};

    DefaulterCohort.ping = function () {
      $http.get(DEFAULTER_COHORT_CONTEXT).success(function (data) {
        console.log(data);
      });
    };

    DefaulterCohort.init = function () {
      var tables = ["defaulter-cohort", "defaulter-cohorts", "outreach-providers"];
      local.init(tables);
      DefaulterCohort.getOutreachProviders();
    };

    DefaulterCohort.get = function (uuid, callback) {
      spinner.show('waiting');
      if (uuid === undefined || uuid === "") {
        uuid = session.getItem("curDefaulterCohortUuid");
      }
      else {
        session.setItem("curDefaulterCohortUuid", uuid);
      }

      var dc = local.get('defaulter-cohort',uuid);
      //console.log('dc: ' + dc + ' uuid: ' + uuid);
      if (dc) {
        callback(dc);
        spinner.hide('waiting');
      }
      else if (uuid !== undefined && uuid !== "") {
        DefaulterCohort.get({uuid: patientUuid}, function (data, status, headers) {

          //If the previous cohort was voided, remove from locally saved cohorts
          if (uuid != data.defaulter_cohort.uuid) local.remove('defaulterCohort',uuid);

          local.set('defaulter-cohort',uuid,data.defaulter_cohort,Auth.getPassword());
          if (callback) return callback(p);
          else return p;
        });
      };
      spinner.hide('waiting');

    };

    DefaulterCohort.getMemberData = function(memberUuids) {
      var memberUuid,params,nextStartIndex,encounter,encounterUuids;
      for(var i in memberUuids) {
        memberUuid = memberUuids[i];
        params = {startIndex:0, patient:memberUuid};
        PatientService.get(memberUuid,function(patient) {
          EncounterService.patientQuery(params,function(encounters) {
            patient.encounters = encounters;
            local.set('amrs.patient',patient.uuid,patient,Auth.getPassword())
          });
        });
      }
    }

    DefaulterCohort.getDefaulterCohorts = function (callback) {
      var dcs = local.getAll("defaulter-cohorts");
      if (dcs) {
        console.log("getting defaulter cohorts from local");
        callback(dcs);
      }
      else {
        console.log("getting defaulter cohorts from server");

        $http.get(DEFAULTER_COHORT_CONTEXT + '/outreach/ajax_get_defaulter_cohorts').success(function (data) {
          //alert('success getting data from dc server');
          local.set("defaulter-cohorts", data);
          callback(data);
        }).error(function (error, status) {
          alert('error');
          alert(error);
          alert(status);
        });
      }
    };

    DefaulterCohort.update = function (uuid, callback) {
      console.log("updateDefaulterCohort() : updating cohort...");
      var cohort, numUpdated = 0;
      if (navigator.onLine) {
        var url = DEFAULTER_COHORT_CONTEXT + '/outreach/ajax_get_retired_members?defaulter_cohort_uuid=' + uuid;
        $http.get(url).success(function (retiredPatients) {
          //The current cohort has been retired and needs to updated with the latest version
          if (retiredPatients.indexOf("*") != -1) {
            DefaulterCohort.get(uuid, callback);
          }
          else {
            cohort = local.get('defaulter-cohort',uuid,Auth.getPassword());
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
            local.setItem('defaulter-cohort',uuid,cohort,Auth.getPassword());
            callback(numUpdated);
          }
        });
      }
    };

    DefaulterCohort.getNew = function (uuid, callback) {
      local.removeItem('defaulter-cohort',uuid);
      var url = DEFAULTER_COHORT_CONTEXT + '/outreach/ajax_get_new_defaulter_cohort?defaulter_cohort_uuid=' + uuid;
      $http.get(url).success(function (data) {
        local.set("defaulter-cohorts", data.defaulter_cohorts);
        local.set("defaulter-cohort",data.defaulter_cohort.uuid, data.defaulter_cohort,Auth.getPassword());
        callback(data.defaulter_cohort);
      });
    };


    DefaulterCohort.getOutreachProviders = function (callback) {
      var url = DEFAULTER_COHORT_CONTEXT + '/outreach/ajax_get_outreach_providers';
      var providers = local.get('outreach-providers');

      if (providers === undefined || providers === null) {
        console.log('Getting outreach providers from server');
        $http.get(url).success(function (data) {
          console.log('got outreach providers');
          local.setItem("outreach-providers", data);
          providers = data;
          if (callback) callback(providers);
        }).error(function (error) {
          console.log(error);
        });
      }
      else {
        if (callback) callback(providers);
        else return providers;
      }
    };


    return DefaulterCohort;

  }]);

