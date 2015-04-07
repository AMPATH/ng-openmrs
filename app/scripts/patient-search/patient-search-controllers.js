'use strict';

/* Controllers */


'use strict';

var mod = angular.module('patientSearch', ['openmrsServices', 'flex', 'openmrs.auth']);
mod.controller('PatientSearchCtrl', ['$scope', 'PatientService', 'Flex', 'Auth',
  function ($scope, PatientService) {
    $scope.filter = "";
    $scope.patients = [];

    $scope.$watch('searchString', function (searchString) {
      $scope.patients = [];
      var v = "custom:(uuid,";
      v += "person:(uuid,gender,birthdate,preferredName:(givenName,middleName,familyName),birthdate,attributes:(attributeType:(uuid),uuid)))";

      if (searchString && searchString.length > 3) {
        PatientService.query(searchString,
          function (data) {
            if (data.results) { //this is coming from server
              for (var i in data.results) {
                $scope.patients.push(PatientService.Patient(data.results[i]));
              }
            }
          }
        );
      }
    });
  }]);


