/**
 * Created by Jonathan on 4/27/2015.
 */

'use strict';

var mod = angular.module('clinic-dashboard');

mod
  .directive('encounterDataTable',['etlService',
    function(etlService) {
      return {
        restrict: "E",
        scope:{
          locationUuid:'@',
          columns:'@',
          labels:'@',
        },
        controller: function($scope) {
          //$scope.filters = [];
          //$scope.encounters = [];

        },
        link: function (scope, element, attrs) {

          attrs.$observe('locationUuid',function(newValue) {
            if(newValue && newValue !== undefined) {
              scope.filterResults(newValue);
            }
          });

          scope.getFilterType = function(col) {
            if(col.indexOf(":") === -1) return null; //no filter for this column

            var s = col.split(':')[1];
            if(s.indexOf("{") !== -1)
              s = s.substring(0, s.indexOf("{"));
            console.log('filter type: ' + s);
            return s;
          }

          scope.getFilterOptions = function(col) {
            if(col.indexOf("{") === -1) return [];
            var options = col.substring(col.indexOf("{")+1,col.indexOf("}")).split('|');
            //_.each(options,function(item) {item = item.replace("'","")});
            return options;
          }

          scope.getFilterColumn = function(col) {
            if(col.indexOf(":") !== -1) col = col.substring(0,col.indexOf(":"));
            console.log('filter column: ' + col);
            return col;
          }


          scope.filterResults = function(locationUuid) {

            var filters = [],curFilter;
            for(var column in scope.filters) {
              curFilter = {column: column, filters: {}};
              for(var i in scope.filters[column]) {
                if (i.startsWith("start"))
                  curFilter.filters.start = scope.filters[column][i];
                else if (i.startsWith("end"))
                  curFilter.filters.end = scope.filters[column][i];
                else
                  curFilter.filters.like = scope.filters[column][i];
              }
              filters.push(curFilter);
            }

            console.log(filters);

            var filterParams = {
              uuid: locationUuid,
              filters: angular.toJson(filters)
            };

            scope.encounters = [{a:"hello",b:"good",c:"yes",d:'no',e:"bye"}];
            /*
            etlService.getClinicEncounterData(filterParams,function(data){
              scope.encounters = data.result;
            });
            */
          }

        },
        templateUrl:"views/clinic-dashboard/encounter-data-table.html"
      }
    }

]);
