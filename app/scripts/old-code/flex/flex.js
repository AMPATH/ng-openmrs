'use strict';


var flex = angular.module('flex', ['ngResource', 'ngCookies', 'openmrsServices', 'openmrs.auth', 'localStorageServices','network-manager']);

flex.factory('OpenmrsFlexSettings', ['localStorage.utils','FormEntryService',
  function (local,FormEntryService) {
    var service = {};
    service.init = function () {
      var tables = ['openmrs.patient', 'expiration', 'openmrs.provider', 'openmrs.location', 'openmrs.encounter','openmrs.users','openmrs.settings'];
      local.init(tables);
      FormEntryService.init();
    }

    service.changeUser = function(prevUsername, curUsername) {
      FormEntryService.changeUser(prevUsername,curUsername);

      var tables = ['openmrs.patient','openmrs.encounter'];
      local.reset(tables);
    }

    service.saveUserData = function(username,tables) {
      var savedUserData = {}, t;
      for(var i in tables) {
        t = local.getTable(tables[i]);
        if(Object.keys(t).length > 0) savedUserData[tables[i]] = t;
      }
      if(Object.keys(savedUserData).length > 0)
        local.set('openmrs.saved-user-data', username, savedUserData);
      local.reset(tables);
    }

    service.loadUserData = function(username,tables) {
      var userData = local.get('openmrs.saved-user-data',username);

      for(var tableName in userData) {
        local.setTable(tableName,userData[tableName]);
      }
      local.remove('openmrs.formentry.saved-user-data', username);
    }

    return service;

  }]);


flex.factory('Flex', ['localStorage.utils','NetworkManagerService',
  function (local,NetworkManagerService) {
    var flexService = {};

    function getFromServer(service, key, storeOffline, encryptionPassword, callback) {
      service.get(key, function (item) {
        if (storeOffline) {
          var tableName = "openmrs." + service.getName();
          local.set(tableName, key, item, encryptionPassword);
        }
        if (callback) callback(item)
        else return item;
      });
    };


    function getAllFromServer(service, keyGetter, storeOffline, encryptionPassword, callback) {
      service.getAll(function (items) {
        if (storeOffline) {
          var tableName = "openmrs." + service.getName();
          local.setAll(tableName, items, keyGetter, encryptionPassword);
        }
        if (callback) callback(items);
      });
    };

    function queryServer(service, searchString, keyGetter, storeOffline, encryptionPassword, callback, onError) {
      service.query({q: searchString},
        function (items) {
          if (storeOffline) {
            var tableName = "openmrs." + service.getName();
            local.setQuerySet(tableName, items, keyGetter, encryptionPassword);
          }
          if (callback) callback(items);
        },
        function(error) {
          onError(error);
        });
    }




    flexService.getFromServer = function (service, key, storeOffline, encryptionPassword, callback) {
      getFromServer(service, key, storeOffline, encryptionPassword, callback);
    }


    flexService.getFromLocal = function (service, key, storeOffline, encryptionPassword, callback) {
      var tableName = "openmrs." + service.getName();
      var item = local.get(tableName, key, encryptionPassword);
      callback(item);
    }


    flexService.get = function (service, key, storeOffline, encryptionPassword, callback) {
      var tableName = "openmrs." + service.getName();
      var item = local.get(tableName, key, encryptionPassword);
      if (item) {
        callback(item);
      }
      else getFromServer(service, key, storeOffline, encryptionPassword, callback);
    }


    /* This is the only method that server is searched before client*/
    flexService.query = function (service, searchString, keyGetter, storeOffline, encryptionPassword, callback) {
      var tableName = "openmrs." + service.getName();
      if(NetworkManagerService.isOnline() === true) {
        var result = queryServer(service, searchString, keyGetter, storeOffline, encryptionPassword, callback,
          function(error) {
            if (error.online === false) {
              console.log('searching locally');
              var resultSet = local.query(tableName, null, searchString, encryptionPassword);
              callback(resultSet);
            }
          });
      }
      else {
        console.log("querying locally...");
        var resultSet = local.query(tableName, null, searchString, encryptionPassword);
        callback(resultSet);
      }
    }

    flexService.getAll = function (service, keyGetter, storeOffline, encryptionPassword, callback) {
      var tableName = "openmrs." + service.getName();
      var items = local.getAll(tableName);
      if (Object.keys(items).length > 0) {
        callback(items);
      }
      else getAllFromServer(service, keyGetter, storeOffline, encryptionPassword, callback);
    };

    flexService.remove = function (service, key, callback) {
      var tableName = "openmrs." + service.getName();
      local.remove(tableName, key);
      if (callback) callback();
    }


    /*
     Save : only store locally, do not communicate with server.
     For example, if data collection is incomplete, and form to be completed later.
     */
    flexService.save = function (service, key, item, encryptionPassword, callback) {
      var tableName = "openmrs." + service.getName();
      local.set(tableName, key, item, encryptionPassword);
      if (callback) callback();
    }

    return flexService;

  }]);
