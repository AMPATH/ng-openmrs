'use strict';

var formEntry = angular.module('openmrs-formentry');

formEntry.factory('FormEntryService', ['localStorage.utils', 'EncounterService', 'PersonAttributeService', 'ObsService', 'PatientService','NetworkManagerService',
  function (local, EncounterService, PersonAttributeService, ObsService, PatientService,NetworkManagerService) {
    var FormEntryService = {};
    var pendingSubmissionTable = 'openmrs.formentry.pending-submission';
    var draftsTable = 'openmrs.formentry.drafts';
    var tables = [pendingSubmissionTable,draftsTable,"openmrs.formentry.saved-user-data"];

    FormEntryService.init = function() {
      local.init(tables);
    };


    FormEntryService.saveUserData = function(username) {
      var pending = local.getTable(pendingSubmissionTable);
      var drafts = local.getTable(draftsTable);

      if(Object.keys(pending).length === 0 && Object.keys(drafts).length === 0) return;

      var savedUserData = {};
      if (Object.keys(pending).length > 0) savedUserData["openmrs.formentry.pending-submission"] = pending;
      if (Object.keys(drafts).length > 0) savedUserData["openmrs.formentry.drafts"] = drafts;

      local.set('openmrs.formentry.saved-user-data', username, savedUserData);
      local.reset([pendingSubmissionTable,draftsTable]);
    }

    FormEntryService.loadUserData = function(username) {
      local.get('openmrs.formentry.saved-user-data',username,false,
        function(userData) {
          console.log(userData);
          if(userData) {
            if (userData['openmrs.formentry.pending-submission'])
              local.setTable('openmrs.formentry.pending-submission', userData['openmrs.formentry.pending-submission']);
            if (userData['openmrs.formentry.drafts'])
              local.setTable('openmrs.formentry.drafts', userData['openmrs.formentry.drafts']);
            local.remove('openmrs.formentry.saved-user-data', username);
          }
        });
    }

    FormEntryService.changeUser = function (prevUser,curUser) {
      FormEntryService.saveUserData(prevUser);
      FormEntryService.loadUserData(curUser);
    }


    function getHashCode(s) {
      var hash = 0, i, chr, len;
      if (s.length == 0) return hash;
      for (i = 0, len = s.length; i < len; i++) {
        chr = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    }


    var formMap = {
      "1eb7938a-8a2a-410c-908a-23f154bf05c0": {
        name: 'Outreach Follow-up Form',
        template: 'views/formentry/forms/outreach-form2.html',
        encounterType: "df5547bc-1350-11df-a1f1-0026b9348838"
      },
    };

    FormEntryService.getTemplate = function (formUuid) {
      return formMap[formUuid]['template'];
    };

    FormEntryService.getEncounterType = function (formUuid) {
      return formMap[formUuid]['encounterType'];
    };

    FormEntryService.getForms = function () {
      return formMap;
    };


    FormEntryService.getSavedForm = function(savedFormId,callback) {
      FormEntryService.getDrafts(savedFormId,function(data) {
        if(data) callback(data);
        else {
          FormEntryService.getPendingSubmission(savedFormId,function(data) {callback(data);});
        }
      });
    }


    //If savedFormId provided, return individual form. Otherwrise return all forms.
    FormEntryService.getDrafts = function (savedFormId,callback) {
      if (savedFormId) local.get(draftsTable, savedFormId, true,callback)
      else local.query(draftsTable,null,null,true,callback);
    };


    FormEntryService.removeFromDrafts = function (savedFormId) {
      local.remove(draftsTable, savedFormId);
    }


    FormEntryService.saveToDrafts = function (form) {
      if (form.savedFormId === undefined) {
        var s = JSON.stringify(form);
        form.savedFormId = getHashCode(s);
      }
      else {
        FormEntryService.removeFromPendingSubmission(form.savedFormId);
      }

      local.set(draftsTable, form.savedFormId, form, Auth.getPassword());
    }


    FormEntryService.getPendingSubmission = function (savedFormId, callback) {
      if (savedFormId) local.get(pendingSubmissionTable, savedFormId, true,callback)
      else local.query(pendingSubmissionTable,null,null,true,callback);
    }


    FormEntryService.removeFromPendingSubmission = function (savedFormId) {
      local.remove(pendingSubmissionTable, savedFormId);
    }


    function toRESTStyleObs(obs, obsToLoad) {
      var o, f = {};
      for (var i in obs) {
        o = obs[i];

        if (o === null || o.value === null || o.value === undefined) continue;
        //console.log(o);
        f = {concept: {uuid: o.concept}};
        if (o.uuid) f.uuid = o.uuid;
        if (o.existingValue) f.existingValue = o.existingValue;

        //if(o.obs) console.log('found obs');
        //if(o.value) console.log('found value');
        if (o.value) f.value = o.value;
        else if (o.obs) {
          f.groupMembers = [];
          toRESTStyleObs(o.obs, f.groupMembers);
        }
        obsToLoad.push(f);
      }
    }

    function toRestStyleEncounter(form) {
      var encounter = {
        uuid: form.encounter.uuid,
        patient: {uuid: form.encounter.patient},
        encounterDatetime: form.encounter.encounterDatetime,
        encounterType: {uuid:form.encounter.encounterType},
        location: {uuid:form.encounter.location},
        provider: {uuid:form.encounter.provider},
        form: {uuid:form.encounter.form}
        };
      var restObs = [];
      toRESTStyleObs(form.obs,restObs)
      encounter.obs = restObs;
      return encounter;
    }

    FormEntryService.saveToPendingSubmission = function (form) {
      console.log('saveToPendingSubmission()...');
      console.log(form);
      if (!form.savedFormId) {
        var s = JSON.stringify(form);
        form.savedFormId = getHashCode(s);
      }
      form.encounter = toRestStyleEncounter(form);

      local.set(pendingSubmissionTable, form.savedFormId, form, true);
    }


    FormEntryService.submit = function (form) {
      console.log('FormEntryService.submit() : submitting encounter');
      var restData = getEncounterRestData(form);
      var obsToUpdate = restData.obsToUpdate;
      delete restData.obsToUpdate;

      if(!NetworkManagerService.isOnline()) {
        form.restObs = restData.obs;
        form.obsToUpdate = obsToUpdate;
        FormEntryService.saveToPendingSubmission(form);
        return;
      }

      EncounterService.submit(restData, function (data) {
        if (form.savedFormId) FormEntryService.removeFromDrafts(form.savedFormId);

        if (data === undefined || data === null || data.error) {
          console.log("FormEntryService.submit() : error submitting. Saving to local");
          form.restObs = restData.obs;
          form.obsToUpdate = obsToUpdate;
          FormEntryService.saveToPendingSubmission(form);
        }
        else {
          EncounterService.removeLocal(form.encounter.uuid);
          if (form.savedFormId !== undefined) {
            FormEntryService.removeFromPendingSubmission(form.savedFormId);
          }
          if (obsToUpdate.length > 0) {
            ObsService.updateObsSet(obsToUpdate, function (data) {
              console.log(data);
            });
          }

          submitPersonAttributes(form);
        }
        return data;
      });

    };


    FormEntryService.submitPendingSubmission = function () {
      var forms = FormEntryService.getPendingSubmission();
      var errors = 0;
      var successes = 0;
      for (var i in forms) {
        var form = forms[i];
        FormEntryService.submit(form);
      }
    }


    function getRestObs(obs, newRestObs, obsToUpdate) {
      var hasChanged = false, o;
      for (var i in obs) {
        o = obs[i];
        if (o === null) continue;
        if ('obs' in o) {

          var obsGroup = {concept: o.concept, groupMembers: []};
          var groupHasChanged = getRestObs(o.obs, obsGroup.groupMembers, null);

          //this is an obsgroup which has no existing values and therfore changed from empty to with values


          //Because of the way REST WS works (requires each group member to have a person and obsDatetime),
          //  we will treat a group that has changed as a new group.
          if (groupHasChanged) {
            //only add the group if it has members
            if (obsGroup.groupMembers.length > 0) newRestObs.push(obsGroup);

            //this will cause the existing obs group to be voided
            if (o.uuid) obsToUpdate.push({uuid: o.uuid});
          }

        }

        //if obsToUpdate is null, it means we are in an obsGroup. The entire obsGroup will be reposted indedpendent of whether the values
        // have changed. This is done because of issues with the REST WS and updating obsGroups.
        else if (obsToUpdate !== null && o.existingValue) {
          if (o.value != o.existingValue) {
            obsToUpdate.push({concept: o.concept, value: o.value, uuid: o.uuid});
          }
        }
        else if (o.value !== null && o.value !== undefined) {
          //if(obsToUpdate === null) console.log(o);

          if (o.existingValue && o.existingValue != o.value) hasChanged = true;
          else if (o.existingValue === undefined && o.value.toString().trim() !== "") hasChanged = true;

          //No empty values will be saved for new obs
          if (o.value.toString().trim() !== "") newRestObs.push({concept: o.concept, value: o.value});
        }
      }
      return hasChanged;
    }


    function submitPersonAttributes(form) {

      var oldAttrs = form.patient.getAttributes() || [];
      var newAttrs = form.personAttributes;
      var restAttrs = [];
      var personUuid = form.patient.getUuid();
      var shouldPush, type,uuid,attr,params;
      for (var attrTypeUuid in newAttrs) {
        uuid = null;
        if (attrTypeUuid === "oldPersonAttributes") continue;
        shouldPush = true;
        for (var i in oldAttrs) {
          type = oldAttrs[i].attributeType.uuid;
          if (attrTypeUuid === type) {
            uuid = oldAttrs[i].uuid;
            //if the value has not changed, do not resubmit it
            if (newAttrs[attrTypeUuid] === oldAttrs[i].value) {
              console.log('attribute has not changed');
              shouldPush = false;
            }
            break;
          }
        }
        if (shouldPush) {
          params = {personUuid:personUuid,value: newAttrs[attrTypeUuid],attributeType:attrTypeUuid};
          /*
          if(uuid) params["uuid"] = uuid;
          else params["attributeType"] = attrTypeUuid;
          */
          restAttrs.push(params);
        }
      }

      for (var i in restAttrs) {
        params = restAttrs[i];
        console.log(params);
        PersonAttributeService.save(params,
          function (data) {
            console.log("Saved personAttribute");
          });
      }


      //Update local version of patient to reflect new personAttributes
      if(restAttrs) {
        form.patient.setAttributes(form.personAttributes);
        console.log(form.patient);
        PatientService.saveLocal(personUuid, form.patient.patientData);
      }
    }


    function getEncounterRestData(form) {
      console.log(form);
      var restObs1 = [], restObs = [], obsToUpdate = [];
      getRestObs(form.obs, restObs, obsToUpdate);

      var data = {
        uuid: form.encounter.uuid,
        patient: form.encounter.patient,
        encounterDatetime: form.encounter.encounterDatetime,
        encounterType: form.encounter.encounterType,
        location: form.encounter.location,
        provider: form.encounter.provider,
        form: form.encounter.form,
        obs: restObs,
        obsToUpdate: obsToUpdate
        //breaksubmit: true
      }
      return data;
    }


    return FormEntryService;
  }]);

