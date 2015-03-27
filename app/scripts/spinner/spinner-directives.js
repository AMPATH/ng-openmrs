'use strict';

/* Directives */


angular.module('spinner')
    .directive('spinner',[
	function() {
	    return {
		restrict: "E",
		controller : function($scope) {
		},
		link: function(scope, element, attrs) {
		},
		templateUrl : "views/spinner/spinner.html",
            }
	}
    ]);
