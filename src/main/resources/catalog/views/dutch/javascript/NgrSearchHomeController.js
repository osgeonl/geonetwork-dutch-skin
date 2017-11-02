(function () {
  goog.provide('abc');

  var module = angular.module('ngr_search_home_controller', []);

  module.controller('NgrSearchHomeController', ['$scope', '$location', '$log',
    function ($scope, $location, $log) {

      $scope.resetHomeParams = function () {
        $scope.searchHomeParams = {
          any_OR__title: null,
          geometry: null,
          fast: 'index'
        };
      };


      $scope.performSearchHome = function () {
        var searchParams = angular.extend({}, $scope.searchHomeParams)
        if (!$scope.searchHomeParams.geometry) {
          delete searchParams.geometry;
        }

        $location.path('/search').search(searchParams);

      };


      $scope.$on('$locationChangeSuccess', function (event, newUrl) {
        var activeTab = $location.path().match(/^(\/[a-zA-Z0-9]*)($|\/.*)/)[1];
        // reset search paramameters
        if (activeTab === '/home') {
          $scope.resetHomeParams();
        }
      });

      // Init search params
      $scope.resetHomeParams();
    }]);


})();
