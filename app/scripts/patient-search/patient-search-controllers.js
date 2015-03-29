'use strict';

/* Controllers */


'use strict';

var mod = angular.module('patientSearch',['openmrsServices','flex']);

mod.controller('PatientSearchCtrl', ['$scope','PatientService','Flex',
  function($scope,PatientService,Flex) {
      $scope.filter = "";
      $scope.patients = [];

      $scope.$watch('searchString',function(searchString) {

        var v = "custom:(uuid,";
        v += "person:(uuid,gender,birthdate,preferredName:(givenName,middleName,familyName),birthdate,attributes:(attributeType:(uuid),uuid)))";

        if (searchString && searchString.length > 3) {
          Flex.query(PatientService, searchString, null, false, null,
            function (data) {
              $scope.patients = data.results;
            }
          );
        }
      });
  }]);


