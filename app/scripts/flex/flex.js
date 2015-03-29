'use strict';


var flex = angular.module('flex', ['ngResource', 'ngCookies', 'openmrsServices', 'openmrs.auth', 'localStorageServices']);

flex.factory('OpenmrsFlexSettings', [
  function () {
    var service = {};
    service.init = function () {
      var tables = ['openmrs.patient', 'expiration', 'openmrs.provider', 'openmrs.location', 'openmrs.encounter', 'openmrs.formentry', 'openmrs.users'];
      local.init(tables);
    }
    return service;

  }]);


flex.factory('Flex', ['localStorage.utils',
  function (local) {
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

    function queryServer(service, searchString, keyGetter, storeOffline, encryptionPassword, callback) {
      service.query({q: searchString}, function (items) {
        if (storeOffline) {
          var tableName = "openmrs." + service.getName();
          local.setQuerySet(tableName, items, keyGetter, encryptionPassword);
        }
        if (callback) callback(items);
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


    flexService.query = function (service, searchString, keyGetter, storeOffline, encryptionPassword, callback) {
      var tableName = "openmrs." + service.getName();
      if (navigator.onLine) {
        queryServer(service, searchString, keyGetter, storeOffline, encryptionPassword, callback);
      }
      else {
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
     For example, if data collection is incomplete, and form to completed later.
     */
    flexService.save = function (service, key, item, encryptionPassword, callback) {
      var tableName = "openmrs." + service.getName();
      local.set(tableName, key, item, encryptionPassword);
      if (callback) callback();
    }

    return flexService;

  }]);
