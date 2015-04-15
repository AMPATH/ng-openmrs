/**
 * Created by Jonathan on 4/15/2015.
 */
'use strict';
var mod = angular.module('network-manager', []);

mod
  .run(['NetworkManagerService',
    function(networkMgr) {
      networkMgr.init();
    }
  ]);
