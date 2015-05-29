// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-03-22 using
// generator-karma 0.9.0

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-touch/angular-touch.js',
      'bower_components/jquery-validation/dist/jquery.validate.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',
      'bower_components/underscore/underscore.js',
      'bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
      'bower_components/angu-fixed-header-table/angu-fixed-header-table.js',
      'bower_components/angular-mocks/angular-mocks.js',
      // endbower

      'app/scripts/app.js',

      'app/scripts/auth/auth.js',
      'app/scripts/auth/auth-services.js',
      'app/scripts/auth/auth-controllers.js',

      'app/scripts/cryptojs/cryptojs.js',

      'app/scripts/network-manager/network-manager.js',
      'app/scripts/network-manager/network-manager-services.js',

      'app/scripts/offline-services/local-storage-services.js',

      'app/scripts/data-manager/data-manager.js',
      'app/scripts/data-manager/data-manager-services.js',

      'app/scripts/auth/auth.js',
      'app/scripts/auth/auth-services.js',
      'app/scripts/auth/auth-controllers.js',

      'app/scripts/etl/etl.js',
      'app/scripts/etl/etl-services.js',

      'app/scripts/defaulter-cohort/defaulter-cohort.js',
      'app/scripts/defaulter-cohort/defaulter-cohort-services.js',
      'app/scripts/defaulter-cohort/defaulter-cohort-controllers.js',

      'app/scripts/formentry/formentry.js',
      'app/scripts/formentry/formentry-services.js',
      'app/scripts/formentry/formentry-controllers.js',
      'app/scripts/formentry/formentry-directives.js',

      'app/scripts/openmrs-services/openmrs-settings.js',
      'app/scripts/openmrs-services/openmrs-services-extended.js',

      'app/scripts/patient-encounter/patient-encounter.js',
      'app/scripts/patient-encounter/patient-encounter-controllers.js',

      'app/scripts/patient-dashboard/patient-dashboard.js',
      'app/scripts/patient-dashboard/patient-dashboard-directives.js',
      'app/scripts/patient-dashboard/patient-dashboard-controllers.js',

      'app/scripts/clinic-dashboard/clinic-dashboard.js',
      'app/scripts/clinic-dashboard/clinic-dashboard-controllers.js',
      'app/scripts/clinic-dashboard/clinic-dashboard-directives.js',

      'app/scripts/patient-search/patient-search.js',
      'app/scripts/patient-search/patient-search-controllers.js',
      'app/scripts/utility/utility-directives.js',

      'app/scripts/spinner/spinner.js',
      'app/scripts/spinner/spinner-directives.js',

      'app/scripts/layout/layout.js',
      'app/scripts/layout/layout-controllers.js',

      'app/scripts/ui.bootstrap/ui-bootstrap.js',
      'app/scripts/ui.bootstrap/ui-bootstrap-tpls.js',

      'test/mock/**/*.js',
      'test/spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'PhantomJS'
    ],

    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine'
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
