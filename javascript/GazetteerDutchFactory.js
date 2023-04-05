/*
 * Copyright (C) 2001-2023 Food and Agriculture Organization of the
 * United Nations (FAO-UN), United Nations World Food Programme (WFP)
 * and United Nations Environment Programme (UNEP)
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or (at
 * your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301, USA
 *
 * Contact: Jeroen Ticheler - FAO - Viale delle Terme di Caracalla 2,
 * Rome - Italy. email: geonetwork@osgeo.org
 */

(function () {
  goog.provide('gn_dutch_gazetteer_factory');

  var module = angular.module('gn_dutch_gazetteer_factory', []);

  module.constant('serviceUrls', {
    'lookupServiceUrl': 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/lookup',
    'suggestServiceUrl': 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest'
  });

  module.provider("gnDutchGazetteer", ['serviceUrls', function (serviceUrls) {
    return {
      $get: [
        '$http',
        'gnGlobalSettings',
        'gnViewerSettings',
        'gnGetCoordinate',
        function ($http, gnGlobalSettings, gnViewerSettings, gnGetCoordinate) {
          var zoomTo = function (extent, map, zoom) {
            // fit geometry
            map.getView().fit(extent, map.getSize());
            // zoom in
            if (zoom) {
              map.getView().setZoom(zoom);
            }
          }
          return {
            onClick: function (scope, loc, map) {
              // get the details from the lookup service
              $http
                .get(serviceUrls.lookupServiceUrl, {
                  params: {
                    id: loc.id
                  }
                })
                .then(function (response) {
                  if (response.data.response.numFound > 0) {
                    var dataPoint = response.data.response.docs[0].centroide_ll;
                    var mapProjection = map.getView().getProjection().getCode();
                    // turn it into a geometry and convert
                    var geom = new ol.format.WKT()
                      .readGeometry(dataPoint)
                      .transform("EPSG:4326", mapProjection);
                    // zoom to the coordinates
                    //
                    // zoom depends on type
                    var zoom = 10;
                    var type = response.data.response.docs[0].type;

                    if (type == 'gemeente') {
                      zoom = 8;
                    } else if (type == 'woonplaats') {
                      zoom = 9;
                    } else if (type == 'weg' || type == 'postcode') {
                      zoom = 12;
                    } else if (type == 'adres' || type == 'hectometerpaal' || type == 'perceel') {
                      zoom = 13;
                    }

                    // fit the geometry and zoom
                    zoomTo(geom, map, zoom);
                    scope.query = loc.name;
                    scope.collapsed = true;
                  }
                });
            },
            search: function (scope, loc, query) {
              if (query.length < 3) return;

              var coord = gnGetCoordinate(
                scope.map.getView().getProjection().getWorldExtent(), query);

              if (coord) {
                function moveTo(map, zoom, center) {
                  var view = map.getView();

                  view.setZoom(zoom);
                  view.setCenter(center);
                }
                moveTo(scope.map, 5, ol.proj.transform(coord,
                  'EPSG:4326', 'EPSG:28992'));
                return;
              }
              var formatter = function (loc) {
                var props = [];
                ['toponymName', 'adminName1', 'countryName'].
                  forEach(function (p) {
                    if (loc[p]) { props.push(loc[p]); }
                  });
                return (props.length == 0) ? '' : '—' + props.join(', ');
              };
              $http
                .get(serviceUrls.suggestServiceUrl, {
                  params: {
                    q: query
                  }
                })
                .then(function (response) {
                  // array for the search results
                  scope.results = [];

                  // no results, just stop, don't build the dropdown
                  var numResults = response.data.response.numFound;

                  if (numResults == 0) {
                    return;
                  }
                  // get the results
                  $features = response.data.response.docs;
                  // loop through the results
                  $.each($features, function (i, item) {
                    // create the result
                    scope.results.push({
                      id: item.id,
                      name: item.weergavenaam,
                      type: item.type,
                      score: item.score
                    });
                  });
                });
            }
          };
        }
      ]
    };
  }]);
})();
