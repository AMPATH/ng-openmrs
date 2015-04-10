'use strict';

var formEntry = angular.module('openmrs-formentry', ['localStorageServices', 'spinner']);

formEntry.config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('formentry', {
        url: "/formentry?encounterUuid&formUuid&patientUuid&savedFormId",
        authenticate: true,
        templateProvider: function ($stateParams, FormEntryService, $templateFactory) {
          var template = FormEntryService.getTemplate($stateParams.formUuid);
          var html = $templateFactory.fromUrl(template);
          return html;
        }
      })
    .state('encounter-forms-saved', {
        url: "/encounter-forms-saved",
        templateUrl: 'views/formentry/encounter-forms-saved.html',
        authenticate: true,
      });

  }]);
