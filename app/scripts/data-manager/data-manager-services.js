'use strict';

var dataManager = angular.module('data-manager');

dataManager.factory('DataManagerService', ['$resource','$injector','localStorage.utils','NetworkManagerService',
  function($resource,$injector,localStorageService,NetworkManagerService) {
    var dataManagerService = {};
    var offlineDataServices = [];

    dataManagerService.getAmountStored = function() {return localStorageService.getAmountStored();};

    dataManagerService.ExtendedResource = function ($resource, storeOffline, tableName, usesEncryption, primaryKey, offlineQueryFields) {
      var that = this;
      this.$resource = $resource;
      this.storeOffline = storeOffline;
      this.usesEncryption = usesEncryption;
      this.primaryKey = primaryKey;
      this.offlineQueryFields = offlineQueryFields;
      this.tableName = tableName;
      this.keyGetter = function (item) {
        return item[that.primaryKey];
      };
      var local = localStorageService;

      this.getOfflineServiceModule = function (mod) {
        return this.local;
      };

      this.setOfflineServiceModule = function (mod) {
        this.local = mod;
      };


      this.getLocal = function (key, callback) {
        local.get(that.tableName, key, that.usesEncryption, callback);
      };

      this.getServer = function (params, callback) {
        var key = params[that.primaryKey];
        that.$resource.get(params
          , function (item) {
            if (that.storeOffline)
              local.set(that.tableName, key, item, that.usesEncryption);
            callback(item);
          }
          , function (error) {
            callback(error);
          }
        );
      };

      this.get = function(params,callback) {
        if(!that.storeOffline || Object.keys(params).length > 1 || !(that.primaryKey in params)) {
          that.getServer(params,callback);
        }
        else {
          var key = params[that.primaryKey];
          that.getLocal(
            key,
            function (item) {
              if (item) callback(item);
              else that.getServer(params, callback);
            });
        }
      };

      this.queryServer = function (params, storeOffline, callback) {
        this.$resource.query(params
          , function (data) {
            if (that.storeOffline && storeOffline) {
              local.setQuerySet(that.tableName, data.results, that.keyGetter, that.usesEncryption);
            }
            if (callback) callback(data);
          }
          , function (error) {
            callback(error);
          }
        );
      };

      //Assumes there is a param "q" with the search string
      this.queryLocal = function (params, callback) {
        var searchString;
        if("q" in params) searchString = params["q"];
        local.query(that.tableName, that.offlineQueryFields, searchString, that.usesEncryption, callback);
      };


      this.query = function (params, storeOffline, callback) {
        if (NetworkManagerService.isOnline() === true) {
          this.queryServer(params, storeOffline, callback)
        }
        else if(that.storeOffline) that.queryLocal(params, callback);
      };


      this.removeLocal = function (key, callback) {
        local.remove(this.tableName, key, callback);
      };

      this.removeServer = function(params,callback) {
        this.$resource.delete(params
          ,function(data) {callback(data);}
          ,function(error) {callback(error);}
        );
      };

      this.remove = function(params,callback) {
        if(this.storeOffline) this.removeLocal(params[that.primaryKey],callback);
        this.removeServer(params,callback);
      };



      this.saveLocal = function (key,item,callback) {
        local.set(that.tableName, key, item, that.usesEncryption,callback);
      };

      this.save = function(params,callback) {
        that.$resource.save(
          params
          ,function (data) {callback(data);}
          ,function(error) {callback({error:error});})
      }

    };


    dataManagerService.addOfflineDataService = function(serviceNames) {
      offlineDataServices = offlineDataServices.concat(serviceNames);
    };

    dataManagerService.changeUser = function(prevUsername,curUsername) {
      var service;
      console.log(offlineDataServices);
      for (var i in offlineDataServices) {
        service = $injector.get(offlineDataServices[i]);
        service.changeUser(prevUsername, curUsername);
      }
    };


    dataManagerService.setPassword = function(password) {
      local.setPassword(password);
    };

    return dataManagerService;

  }]);

