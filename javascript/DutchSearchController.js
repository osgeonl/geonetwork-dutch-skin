(function() {
    goog.provide('dutch_search_controller');
    goog.require('gn_searchsuggestion_service');
    goog.require('gn_thesaurus_service');
    goog.require('abc');
    goog.require('gn_catalog_service');
    goog.require('search_filter_tags_directive');



    var module = angular.module('dutch_search_controller', [
        'ui.bootstrap.typeahead',
        'gn_searchsuggestion_service',
        'gn_thesaurus_service',
        'gn_catalog_service',
        'search_filter_tags_directive'
    ]);

    /**
     * Main search controller attached to the first element of the
     * included html file from the base-layout.xsl output.
     */
    module.controller('DutchSearchController', [
        '$scope',
        '$q',
        '$http',
        'gnHttp',
        'suggestService',
        'gnAlertService',
        'gnSearchSettings',
        'gnUrlUtils',
        function($scope, $q, $http, gnHttp, suggestService,
                 gnAlertService, gnSearchSettings, gnUrlUtils) {

            /** Object to be shared through directives and controllers */
            $scope.searchObj = {
                params: {},
                permalink: true,
                sortbyValues: gnSearchSettings.sortbyValues,
                sortbyDefault: gnSearchSettings.sortbyDefault,
                hitsperpageValues: gnSearchSettings.hitsperpageValues
            };

            /** Default date query */
            $scope.dateType = "creation";

            /** Facets configuration */
            $scope.facetsSummaryType = gnSearchSettings.facetsSummaryType;

            /* Pagination configuration */
            $scope.paginationInfo = gnSearchSettings.paginationInfo;

            /* Default result view template */
            $scope.resultTemplate = gnSearchSettings.resultTemplate ||
                gnSearchSettings.resultViewTpls[0].tplUrl;

            $scope.getAnySuggestions = function(val) {
                return suggestService.getAnySuggestions(val);
            };

            $scope.keywordsOptions = {
                mode: 'remote',
                remote: {
                    url: suggestService.getUrl('QUERY', 'keyword', 'STARTSWITHFIRST'),
                    filter: suggestService.bhFilter,
                    wildcard: 'QUERY'
                }
            };

            $scope.orgNameOptions = {
                mode: 'remote',
                remote: {
                    url: suggestService.getUrl('QUERY', 'orgName', 'STARTSWITHFIRST'),
                    filter: suggestService.bhFilter,
                    wildcard: 'QUERY'
                }
            };

            $scope.inspirethemeOptions = {
                mode: 'remote',
                remote: {
                   filter: function(data) {
                    var datum = [];
                    data.forEach(function(item) {
                      datum.push({
                          id: item.value,
                          name: item.values.dut,
                          desc: item.definitions.dut
                        });
                      });
                      return datum;
                    },
                    url: gnUrlUtils.append('../api/registries/vocabularies/search',
                        gnUrlUtils.toKeyValue({
                          thesaurus: 'external.theme.httpinspireeceuropaeutheme-theme',
                          maxResults: 50,
                          pLang: ['dut','eng'],
                          q: 'KEYWORD*'
                        })
                    ),
                    wildcard: 'KEYWORD'
                }
            };

            $scope.categoriesOptions = {
              mode: 'prefetch',
              promise: (function () {
                var defer = $q.defer();
                $http.get('../api/tags', {cache: true}).success(function (data) {
                  var res = [];
                  for (var i = 0; i < data.length; i++) {
                    res.push({
                      id: data[i].name,
                      name: data[i].label.eng
                    });
                  }
                  defer.resolve(res);
                });
                return defer.promise;
              })()
            };

            $scope.sourcesOptions = {
              mode: 'prefetch',
              promise: (function () {
                var defer = $q.defer();
                $http.get('../api/sources', {cache: true}).success(function (a) {
                  var res = [];
                  for (var i = 0; i < a.length; i++) {
                    res.push({
                      id: a[i].id,
                      name: a[i].name
                    });
                  }
                  defer.resolve(res);
                });
                return defer.promise;
              })()
            };

            /**
             * Keep a reference on main cat scope
             * @return {*}
             */
            $scope.getCatScope = function() {return $scope};

            // TODO: see if not redundant with CatController event management
            $scope.$on('StatusUpdated', function(e, status) {
                gnAlertService.addAlert(status);
            });

        }]);
})();
