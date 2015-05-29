'use strict';

var openmrsSettings = angular.module('openmrs-settings',['local-storage-services','data-manager']);

openmrsSettings
  .run(['OpenmrsSettings','DataManagerService',
    function(OpenmrsSettings,dataMgr) {
      OpenmrsSettings.init();
      dataMgr.addOfflineDataService('OpenmrsSettings');
    }
  ]);

openmrsSettings.factory('OpenmrsSettings', ['$injector','localStorage.utils',
  function ($injector,local) {
    var settings = {};

    settings.context = "https://amrs.ampath.or.ke:8443/amrs";
    settings.contextOptions =
      [
        "https://amrs.ampath.or.ke:8443/amrs",
        "http://etl1.ampath.or.ke:8080/amrs"
      ];

    settings.getContextOptions = function() {
      return settings.contextOptions;
    };

    settings.addContext = function(url) {
      settings.contextOptions.push(url);
    };

    settings.setContext = function(url) {
      settings.context = url;
      //console.log(url);
      /*
      var Auth = $injector.get("Auth");
      Auth.authenticateOpenmrsContext(function(authenticated) {
        //console.log('authenticated: ' + authenticated);
      });
      */
      if(settings.contextOptions.indexOf(url) === -1) settings.addContext(url);
    };

    settings.getContext = function() {
      return settings.context;
    };

    settings.init = function () {
      var tables = ['openmrs.patient', 'expiration', 'openmrs.provider', 'openmrs.location', 'openmrs.encounter','openmrs.users','openmrs.settings'];
      local.init(tables);
    };

    settings.changeUser = function() {
      console.log('openmrs: changing user');
      local.reset(['openmrs.patient','openmrs.encounter']);
    };

    return settings;
  }]);
