'use strict';

/* Services */

var auth = angular.module('openmrs.auth', ['ngResource', 'openmrsServices']);

auth.factory('Auth', ['$injector','$rootScope','Base64', '$http', '$location', 'OpenmrsSessionService', 'OpenmrsUserService',
  function ($injector,$rootScope,Base64, $http, $location, OpenmrsSessionService, OpenmrsUserService) {
    var Auth = {};

    Auth.authenticated = null;
    Auth.setAuthenticated = function (authenticated) {
      this.authenticated = authenticated;
    };
    //Auth.isAuthenticated = function() { return true; }
    Auth.isAuthenticated = function () {
      return this.authenticated;
    };

    Auth.setPassword = function (password) {
      this.curPassword = password;
    };
    Auth.getPassword = function () {
      return this.curPassword;
    };

    Auth.authType = null;
    Auth.setAuthType = function (authType) {
      this.authType = authType;
    };
    Auth.getAuthType = function () {
      return this.authType;
    };


    Auth.setCredentials = function (username, password) {
      var encoded = Base64.encode(username + ':' + password);
      $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
    };

    Auth.clearCredentials = function () {
      document.execCommand("ClearAuthenticationCache");
      $http.defaults.headers.common.Authorization = 'Basic ';
    };

    //TO DO: Save formentry data to formentry.userdata[username].
    //       This data also needs to be reloaded if user logs back in.
    Auth.initUser = function(username) {
      var services = $rootScope.servicesWithUserData;
      for(var i in services) {
        var service = $injector.get(services[i]);
        service.initUser(username);
      }
    };

    Auth.hasRole = function (roleUuid, callback) {
      var username = sessionStorage.getItem('username');
      OpenmrsUserService.hasRole(username, roleUuid, function (data) {
        if (callback) {
          callback(data);
        }
      });
    };


    Auth.getRoles = function (callback) {
      var username = sessionStorage.getItem('username');
      console.log("getting roles for " + username);
      OpenmrsUserService.getRoles(username, function (data) {
        if (callback) {
          callback(data);
        }
      });
    };

    function setSalt() {
      var salt = CryptoJS.lib.WordArray.random(128 / 8);
      localStorage.setItem('openmrs.auth.salt', salt);
      return salt;
    }


    function getSalt() {
      var salt = localStorage.getItem('openmrs.auth.salt');

      //if there's no salt yet in this localStorage, set it
      if (salt === null) {
        salt = setSalt();
      }
      return salt;
    }

    function setIv() {
      var iv = CryptoJS.lib.WordArray.random(128 / 8);
      localStorage.setItem('openmrs.auth.iv', iv);
      return iv;
    }

    function getIv() {
      var iv = localStorage.getItem('openmrs.auth.iv');
      if (iv === null) {
        iv = setIv();
      }
      return iv;
    }


    function getHash(password) {
      var salt = getSalt();
      var key128Bits100Iterations = CryptoJS.PBKDF2(password, salt, {keySize: 128 / 32, iterations: 100});
      return key128Bits100Iterations;
    }


    function verifyLocalUser(username, password) {
      var user = getLocalUser(username);
      if (user) {
        var trialHash = getHash(password).toString();
        return (trialHash === user.password);
      }
      else {
        return undefined;
      }
    }


    function getLocalUser(username) {
      var users = angular.fromJson(localStorage.getItem('openmrs.users'));
      var user = users[username];

      if (user === undefined) {
        return undefined;
      }
      return angular.fromJson(user);


    }


    function setLocalUser(username, password) {
      var passwordHash = getHash(password).toString();
      var users = angular.fromJson(localStorage.getItem('openmrs.users'));
      if (users === null) {
        users = {};
      }
      users[username] = angular.toJson({username: username, password: passwordHash.toString()});
      localStorage.setItem('openmrs.users', angular.toJson(users));
    }


    Auth.authenticateLocal = function (username, password, callback) {

      console.log('Auth.authenticateLocal() : authenticating locally');
      Auth.setAuthType('local');
      var doesMatch = verifyLocalUser(username,password);
      if (doesMatch) {
        console.log('Authenticated: true');
        Auth.setAuthenticated(true);
        Auth.setPassword(password);
        Auth.clearCredentials();
        $location.path("/apps");
      }
      else {
        console.log('Local password does not match');
        Auth.setAuthenticated(false);
        Auth.setPassword(null);
        callback(false);
      }
    };




    Auth.authenticate = function (username, password, callback) {
      Auth.setAuthType('remote');
      Auth.setCredentials(username, password);
      if ($rootScope.online === true) {
        console.log('Auth.authenticateRemote() : authenticate on server');
        OpenmrsSessionService.getSession(function (data) {
          if (data.online) {
            if (data.authenticated) {
              var doesMatch = verifyLocalUser(username, password);
              if (doesMatch === undefined || doesMatch === false) { //user does not exist or password has changed
                Auth.initUser(username);
              }
              setLocalUser(username, password);

              Auth.setAuthenticated(true);
              Auth.setPassword(password);
              $location.path("/apps");
            }
            else {
              Auth.setAuthenticated(false);
              Auth.setPassword(null);
              callback(false);
            }
          }
          else {
            Auth.authenticateLocal(username, password, callback);
          }
        });
      }
      else {
        Auth.authenticateLocal(username, password, callback);
      }
    }


    Auth.authenticateOpenmrsContext = function(callback) {
      console.log('Authenticating new openmrs context');
      OpenmrsSessionService.getSession(function (data) {
        if (data.online) {
          if (data.authenticated) {
            callback(true);
          }
          else {
            callback(false);
          }
        }
      })
    }


    Auth.logout = function () {
      Auth.clearCredentials();
      OpenmrsSessionService.logout();
      Auth.setPassword(null);
      Auth.setAuthenticated(false);
    };

    return Auth;
  }]);

    auth.factory('Base64', function () {
  var keyStr = 'ABCDEFGHIJKLMNOP' +
    'QRSTUVWXYZabcdef' +
    'ghijklmnopqrstuv' +
    'wxyz0123456789+/' +
    '=';
  return {
    encode: function (input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;

      do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output = output +
        keyStr.charAt(enc1) +
        keyStr.charAt(enc2) +
        keyStr.charAt(enc3) +
        keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
      } while (i < input.length);

      return output;
    },

    decode: function (input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;

      // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
      var base64test = /[^A-Za-z0-9\+\/\=]/g;
      if (base64test.exec(input)) {
        alert("There were invalid base64 characters in the input text.\n" +
        "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
        "Expect errors in decoding.");
      }
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }

        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";

      } while (i < input.length);

      return output;
    }
  };
});;
