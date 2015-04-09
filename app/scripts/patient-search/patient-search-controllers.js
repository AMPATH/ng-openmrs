'use strict';

/* Controllers */


'use strict';

var mod = angular.module('patientSearch');
mod.controller('PatientSearchCtrl', ['$scope', 'PatientService',
  function ($scope, PatientService) {
    $scope.filter = "";
    $scope.patients = [];

    $scope.$watch('searchString', function (searchString) {
      $scope.patients = [];
      var v = "custom:(uuid,";
      v += "person:(uuid,gender,birthdate,preferredName:(givenName,middleName,familyName),birthdate,attributes:(attributeType:(uuid),uuid)))";

      if (searchString && searchString.length > 3) {
        PatientService.query({q:searchString},
          function (data) {
            if (data.results) data = data.results;
            for (var i in data) {
              $scope.patients.push(PatientService.Patient(data[i]));
            }
          }
        );
      }
    });
  }]);


