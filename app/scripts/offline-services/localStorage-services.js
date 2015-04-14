'use strict';

var localStorageServices = angular.module('localStorageServices',[]);


localStorageServices.factory('localStorage.utils', [
  function (Auth) {
    var service = {};
    var encryptionPassword;

    service.getAmountStored = function() {
      var size = angular.toJson(localStorage).length;
      console.log(size);
      return (size/1024/1024).toFixed(2);
    }

    service.setPassword = function(password) {
      encryptionPassword = password;
    }

    service.init = function(tables) {
      var name,t;
      for(var i in tables) {
        name = tables[i];
        //console.log('creating table: ' + name)
        t = localStorage.getItem(name);
        if (t === undefined || t === null) localStorage.setItem(name,"{}");
      }
    }

    service.reset = function(tables) {
      var name,t;
      for(var i in tables) {
        name = tables[i];
        t = localStorage.setItem(name,"{}");
      }
    }


    function getTable(name) {
      return angular.fromJson(localStorage.getItem(name));
    }

    function setTable(name, table) {
      localStorage.setItem(name, angular.toJson(table));
    }


    //expects message to be a string
    function encrypt(message) {
      return CryptoJS.Rabbit.encrypt(message, encryptionPassword).toString();
    }

    function decrypt(message) {
      return CryptoJS.Rabbit.decrypt(message, encryptionPassword).toString(CryptoJS.enc.Utf8);
    }


    //expiration : number of days until expiration
    service.setExpirationDate = function (tableName, key, expiration) {
      var defaultDays = 7;
      var table = getTable("expiration")
      var expKey = tableName + "##" + key;
      var expDate = new Date();

      if (expiration) expDate.setDate(expDate.getDate() + expiration);
      else expDate.setDate(expDate.getDate() + defaultDays);

      var dateKey = expDate.toISOString().substring(0, 10);
      var group = [expKey];
      if (dateKey in table) {
        group = table[dateKey];
        group.push(expKey);
      }
      else table[dateKey] = group;
      setTable("expiration", table);
    }

    //dateKey : YYYY-MM-DD
    /* TO DO : Make this a loop such that all dates from a start date (e.g. 2015-01-01) are removed. */
    service.removeExpired = function (dateKey) {
      var expTable = getTable("expiration");
      var tables = {};

      if (!dateKey) {
        dateKey = (new Date()).toISOString().substring(0, 10);
      }
      var items = expTable[dateKey];
      for (var expKey in items) {
        var parts = expKey.split("##");
        var tableName = parts[0];
        var key = parts[1];
        var t;
        if (tableName in tables) t = tables[tableName];
        else {
          t = getTable(tableName);
          tables[tableName] = t;
        }
        delete t[key];
      }

      /*
       Restore all affected tables in localStorage
       */
      for (var t in tables) {
        setTable(t, tables[t]);
      }

      /*
       Remove this expiration day category from the expiration table
       */
      delete expTable[key];
    };


    service.remove = function (tableName, key) {
      var table = getTable(tableName);
      delete table[key];
      setTable(tableName, table);
    }

    /*
     Returns null if key not in table
     */
    service.get = function (tableName, key, usesEncryption, callback) {
      var table = getTable(tableName);
      var item = null;
      if (key in table) {
        var item = table[key];
        if (usesEncryption) {
          item = decrypt(item);
        }
        try {
          item = angular.fromJson(item);
        }
        catch(e) {
          console.log("item is encrypted, can not covert form json");
        }
      }
      callback(item);

    };


    service.getAll = function (tableName, usesEncryption,callback) {
      var table = getTable(tableName);
      var resultSet = new Array;
      for (var key in table) {
        var item = table[key];
        if (usesEncryption) {
          item = decrypt(item);
        }
        try {
          item = angular.fromJson(item);
        }
        catch(e) {
          console.log("item encrypted, can not be converted from json")
        }
        resultSet.push(item);
      }
      callback(resultSet);
    }

    service.getTable = function(tableName) {
      return angular.fromJson(localStorage.getItem(tableName));
    }

    service.set = function (tableName, key, item, usesEncryption,callback) {
      var table = getTable(tableName);
      item = angular.toJson(item);
      if (usesEncryption) {
        item = encrypt(item);
      }
      table[key] = item;
      setTable(tableName, table);
      service.setExpirationDate(tableName, key);
      if(callback) callback(true);
    }


    /*
     This will not overwrite but add each item in items to the table.
     */
    service.setQuerySet = function (tableName, items, keyGetter, usesEncryption,callback) {
      var table = getTable(tableName);
      for (var i in items) {
        var item = items[i];
        var key = keyGetter(item);
        item = angular.toJson(item);
        if (usesEncryption) {
          item = encrypt(item);
        }
        if(key in table) continue;
        else table[key] = item;
      }

      setTable(tableName,table);
      if(callback) callback(true);
    }



    /*
     tableName: name of the object in localStorage
     items: an array of items to be put into the table. This maps to a rest result which is typically an array of items.
     keyGetter: a function to pull the key from an array item. this is used to store within the table
     usesEncryption: if this is is to be encrypted, the password to encrypt with.
     */
    service.setAll = function (tableName, items, keyGetter, usesEncryption,callback) {
      var table = {};
      for (var i in items) {
        var key = keyGetter(items[i]);
        var item = angular.toJson(items[i]);
        if (usesEncryption) {
          item = encrypt(item);
        }
        table[key] = item;
      }
      localStorage.setItem(tableName, angular.toJson(table));
      callback(true);
    }


    service.setTable = function(tableName,table,callback) {
      localStorage.setItem(tableName,angular.toJson(table));
      if(callback) callback(true);
    }


    function escapeRegExp(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    //If searchString is empty, return all values.
    service.query = function (tableName, queryFields, searchString, usesEncryption,callback) {
      var table = getTable(tableName);
      var item, field, resultSet = [];
      //var re = new RegExp(searchString);
      if(searchString) searchString = searchString.toLowerCase();

      for (var i in table) {
        item = table[i];
        if (usesEncryption) {
          item = decrypt(item);
        }
        if(searchString === undefined || searchString === null) {
          resultSet.push(angular.fromJson(item));
        }
        else if (queryFields) {
          for (var j in queryFields) {
            field = queryFields[j];
            if (item.toLowerCase().indexOf(searchString) != -1) {
              resultSet.push(angular.fromJson(item));
              break;
            }
          }
        }
//        else if (re.test(escapeRegExp(angular.toJson(item)))) {
        else if (item.toLowerCase().indexOf(searchString) != -1) {
          resultSet.push(angular.fromJson(item));
        }
      }
      callback(resultSet);
    };


    return service;
  }]);


