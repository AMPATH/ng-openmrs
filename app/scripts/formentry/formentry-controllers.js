'use strict';

/* Controllers */

var formEntry = angular.module('openmrs-formentry');

formEntry.controller('SavedFormsCtrl', ['$scope', '$stateParams', 'FormEntryService', 'PatientService',
  function ($scope, $stateParams, FormEntryService, PatientService) {


    function loadPatient(patientUuid, obj) {
      PatientService.get({uuid:patientUuid}, function (p) {
        obj.p = p;
      });
    };


    $scope.loadDrafts = function () {
      FormEntryService.getDrafts(null,
        function(savedDrafts) {
          for (var i in savedDrafts) {
            savedDrafts[i].patient = PatientService.Patient(savedDrafts[i].patient.patientData);
          }
          $scope.savedDrafts = savedDrafts;
        }
      );

    };


    $scope.loadPendingSubmission = function () {
      FormEntryService.getPendingSubmission(null,
        function(forms) {
          console.log(forms);
          for (var i in forms) {
            forms[i].p = PatientService.Patient(forms[i].patient.patientData);
          }
          $scope.pendingSubmission = forms;
        }
      );
    };


    $scope.submitPendingSubmission = function () {
      FormEntryService.submitPendingSubmission();
    }

    $scope.loadDrafts();
    $scope.loadPendingSubmission();

  }]);


formEntry.controller('FormEntryCtrl', ['$scope', '$stateParams', 'EncounterService', 'PatientService', 'FormEntryService', 'spinnerService',
  function ($scope, $stateParams, EncounterService, PatientService, FormEntryService, spinner) {
    $scope.patientUuid = $stateParams.patientUuid;
    PatientService.get({uuid:$stateParams.patientUuid},
      function (patient) {
        $scope.patient = patient;
      }
    );


    if ($stateParams.savedFormId) { //loading a saved form
      console.log("loading saved form");
      FormEntryService.getSavedForm($stateParams.savedFormId,
        function (savedForm) {
          console.log(savedForm);
          if (savedForm) {
            $scope.form = {personAttributes: savedForm.personAttributes};
            $scope.existingEncounter = savedForm.encounter;
          }
        }
      )
    }
    else if ($stateParams.encounterUuid) { //loading a form for an existing encounter
      console.log('loading existing form');
      $scope.encounterUuid = $stateParams.encounterUuid;
      var params = {uuid:$stateParams.encounterUuid};
      console.log(params);
      EncounterService.get(params, function (data) {
        if ("obs" in data) {
          console.log(data);
          $scope.existingEncounter = data;
        }
        else {
          EncounterService.getServer(params,function(data){
            $scope.existingEncounter = data;
            console.log(data);
          });
        }

      });

    }
    else { //This is loading a new form
      console.log("loading new form");
      var d = new Date();
      $scope.encounter = {
        patient: $scope.patientUuid,
        form: $stateParams.formUuid,
        encounterType: FormEntryService.getEncounterType($stateParams.formUuid),
        isNewEncounter: true,
        encounterDatetime: d.toISOString()
      };
    }


  }]);
