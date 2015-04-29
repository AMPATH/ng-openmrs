/**
 * Created by Jonathan on 4/25/2015.
 */
'use strict';

var mod = angular.module("etl");

mod.factory('etlService',["$resource",
  function ($resource) {
    var etlService = {};
    var context = 'http://localhost:3000',r;

    etlService.setContext = function(url) {context = url;}
    etlService.getContext = function() {return context;}

    function getResource(path) {
      var r = $resource(etlService.getContext() + path,
        {uuid: '@uuid'},
        {query: {method: "GET", isArray: false}}
      );
      return r;
    }

    etlService.getHivSummary = function(params,callback) {
      r = $resource(etlService.getContext() + "/etl/patient/:uuid/hiv-summary",
        {uuid: '@uuid'},
        {query: {method: "GET", isArray: false}}
      );
      //test
      r.get(params,function(result) {
        console.log(result);
        callback(result);
      })
    }

    etlService.getVitals= function(params,callback) {
      r = $resource(etlService.getContext() + "/etl/patient/:uuid/vitals",
        {uuid: '@uuid'},
        {query: {method: "GET", isArray: false}}
      );
      r.get(params,function(result) {
        callback(result);
      })
    }

    etlService.getData = function(params,callback) {
      r = $resource(etlService.getContext() + "/etl/patient/:uuid/data",
        {uuid: '@uuid'},
        {query: {method: "GET", isArray: false}}
      );
      r.get(params,function(result) {
        callback(result);
      })
    }


    etlService.getClinicSummary = function(params,callback) {
      r = $resource(etlService.getContext() + "/etl/location/:uuid/hiv-summary-indicators",
        {uuid: '@uuid'},
        {query: {method: "GET", isArray: false}}
      );
      r.get(params,function(result) {callback(result);})
    }


    etlService.getDefaulterList = function(params,callback) {
      r = $resource(etlService.getContext() + "/etl/location/:uuid/defaulter-list",
        {uuid: '@uuid'},
        {query: {method: "GET", isArray: false}}
      );
      r.get(params,function(result) {callback(result);})
    }


    etlService.getScheduledAppointments = function(params,callback) {
      r = $resource(etlService.getContext() + "/etl/location/:uuid/appointment-schedule",
        {uuid: '@uuid'},
        {query: {method: "GET", isArray: false}}
      );
      r.get(params,function(result) {callback(result);})
    }


    etlService.getMonthlySchedule = function(params,callback) {
      r = $resource(etlService.getContext() + "/etl/location/:uuid/monthly-appointment-schedule",
        {uuid: '@uuid'},
        {query: {method: "GET", isArray: false}}
      );
      r.get(params,function(result) {callback(result);})
    }




    return etlService;

  }

]);
