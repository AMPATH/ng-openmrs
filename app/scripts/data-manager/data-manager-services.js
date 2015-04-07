'use strict';

var dataManager = angular.module('data-manager', ['localStorageServices','network-manager']);

dataManager.factory('DataManagerService', ['$resource','localStorage.utils','NetworkManagerService',
  function($resource,localStorageService,NetworkManagerService) {
    var dataManagerService = {};

    dataManagerService.ExtendedResource = function ($resource, storeOffline, tableName, usesEncryption, primaryKey, queryFields) {
      var that = this;
      this.$resource = $resource;
      this.storeOffline = storeOffline;
      this.usesEncryption = usesEncryption;
      this.primaryKey = primaryKey;
      this.queryFields = queryFields;
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
        local.get(this.resourceName, key, this.usesEncryption, callback);
      };

      this.getServer = function (params, callback) {
        var key = params[this.keyName];
        var that = this;
        this.$resource.get(params
          , function (item) {
            if (that.storeOffline)
              that.local.set(that.tableName, key, item, that.usesEncryption);
            callback(item);
          }
          , function (error) {
            callback(error);
          }
        );
      }

      this.get = function(params,callback) {
        if(!this.storeOffline || Object.keys(params).length > 1 || !(this.keyName in params)) {
          this.getServer(params,callback);
        }
        else {
          var key = params[this.keyName];
          this.getLocal(
            key,
            function (item) {
              if (item) callback(item);
              else this.getServer(params, callback);
            });
        }
      }

      this.queryServer = function (searchString, callback) {
        this.$resource.query({q: searchString}
          , function (data) {
            if (that.storeOffline) {
              local.setQuerySet(that.tableName, data.results, that.keyGetter, that.shouldEncrypt);
            }
            if (callback) callback(data);
          }
          , function (error) {
            callback(error);
          }
        );
      };

      this.queryLocal = function (searchString, callback) {
        console.log("querying locally...");
        local.query(this.tableName, searchString, callback, this.usesEncryption, this.queryFields);
      }

      this.query = function (searchString, callback) {
        if (NetworkManagerService.isOnline() === true) {
          this.queryServer(searchString, callback)
        }
        else if(this.storeOffline) this.queryLocal(searchString, callback, shouldEncrypt, queryFields);
      };


      this.removeLocal = function (key, callback) {
        local.remove(this.tableName, key, callback);
      }

      this.removeServer = function(key,callback) {
        var keyName = this.keyName;
        this.$resource.delete({keyName:key}
          ,function(data) {callback(data);}
          ,function(error) {callback(error);}
        );
      };

      this.remove = function(key,callback) {
        if(this.storeOffline) this.removeLocal(key,callback);
        this.removeServer(key,callback);
      }



      this.saveLocal = function (key,item) {
        local.set(this.resourceName, key, item, this.usesEncryption, callback);
      }

      this.save = function(params,callback) {
        this.$resource.$save(
          {uuid: obsUuid, value: value}
          ,function (data) {callback(data);}
          ,function(error) {callback({online:false,error:error});})
      }

    }

    return dataManagerService;

  }]);

