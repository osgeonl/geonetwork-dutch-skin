/*
 * Copyright (C) 2001-2016 Food and Agriculture Organization of the
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

(function() {

  goog.provide('gn_search_dutch_config');

  goog.require('ol.proj.EPSG28992');

  var module = angular.module('gn_search_dutch_config', ['ol.proj.EPSG28992']);

  module.value('gnTplResultlistLinksbtn',
        '../../catalog/views/default/directives/partials/linksbtn.html');

  module
      .run([
        'gnSearchSettings',
        'gnViewerSettings',
        'gnOwsContextService',
        'gnMap',
        'gnGlobalSettings',
        '$location',
        function(searchSettings, viewerSettings, gnOwsContextService,
                 gnMap, gnGlobalSettings, $location) {

          // Load the context defined in the configuration
          viewerSettings.defaultContext =
              (viewerSettings.mapConfig.map || '../../map/config-viewer.xml');
          viewerSettings.owsContext = $location.search().map;

          // these layers will be added along the default context
          // (transform settings to be usable by the OwsContextService)
          var viewerMapLayers = viewerSettings.mapConfig.viewerMapLayers
          viewerSettings.additionalMapLayers =
            viewerMapLayers && viewerMapLayers.map ?
            viewerMapLayers.map(function (layer) {
              return {
                name: '{type=' + layer.type + ', name=' + layer.name + '}',
                title: layer.title,
                group: 'Background layers',
                server: [{
                  service: 'urn:ogc:serviceType:WMS',
                  onlineResource: [{
                    href: layer.url
                  }]
                }]
              }
            }) : [];

          // Keep one layer in the background
          // while the context is not yet loaded.
          viewerSettings.bgLayers = [
            gnMap.createLayerForType('osm')
          ];

          viewerSettings.servicesUrl =
            (viewerSettings.mapConfig && viewerSettings.mapConfig.listOfServices)?viewerSettings.mapConfig.listOfServices:{};

          // WMS settings
          // If 3D mode is activated, single tile WMS mode is
          // not supported by ol3cesium, so force tiling.
          if (viewerSettings.mapConfig.is3DModeAllowed) {
            viewerSettings.singleTileWMS = false;
            // Configure Cesium to use a proxy. This is required when
            // WMS does not have CORS headers. BTW, proxy will slow
            // down rendering.
            viewerSettings.cesiumProxy = true;
          } else {
            viewerSettings.singleTileWMS = true;
          }

          var bboxStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'rgba(255,0,0,1)',
              width: 2
            }),
            fill: new ol.style.Fill({
              color: 'rgba(255,0,0,0.3)'
            })
          });
          searchSettings.olStyles = {
            drawBbox: bboxStyle,
            mdExtent: new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: 'orange',
                width: 2
              })
            }),
            mdExtentHighlight: new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: 'orange',
                width: 3
              }),
              fill: new ol.style.Fill({
                color: 'rgba(255,255,0,0.3)'
              })
            })

          };

          // Object to store the current Map context
          viewerSettings.storage = 'sessionStorage';

          var mapsConfig = viewerSettings.aoi || {
            center: [280274.03240585705, 6053178.654789996],
            zoom: 2
          };

    			//Configure the ViewerMap
    			var viewerMap = new ol.Map({
      			controls:[],
      			view: new ol.View(mapsConfig)
    			});

    			//configure the SearchMap
    			var searchMap = new ol.Map({
      			controls:[],
      			layers: [],
      			view: new ol.View(mapsConfig)
    			});

// initialize search map layers according to settings
          // (default is OSM)
          var searchMapLayers = viewerSettings.mapConfig.searchMapLayers;
          if (!searchMapLayers || !searchMapLayers.length) {
            searchMap.addLayer(new ol.layer.Tile({
              source: new ol.source.OSM()
            }));
          } else {
            searchMapLayers.forEach(function (layerInfo) {
              gnMap.createLayerForType(layerInfo.type, {
                name: layerInfo.name,
                url: layerInfo.url
              }, layerInfo.title, searchMap);
            });
          }

                   

/** Facets configuration */
          searchSettings.facetsSummaryType = 'details';

          /*
           * Hits per page combo values configuration. The first one is the
           * default.
           */
          searchSettings.hitsperpageValues = [20, 50, 100];

          /* Pagination configuration */
          searchSettings.paginationInfo = {
            hitsPerPage: searchSettings.hitsperpageValues[0]
          };

          /*
           * Sort by combo values configuration. The first one is the default.
           */
          searchSettings.sortbyValues = [{
            sortBy: 'relevance',
            sortOrder: ''
          }, {
            sortBy: 'changeDate',
            sortOrder: ''
          }, {
            sortBy: 'title',
            sortOrder: 'reverse'
          }, {
            sortBy: 'rating',
            sortOrder: ''
          }, {
            sortBy: 'popularity',
            sortOrder: ''
          }, {
            sortBy: 'denominatorDesc',
            sortOrder: ''
          }, {
            sortBy: 'denominatorAsc',
            sortOrder: 'reverse'
          }];

          /* Default search by option */
          searchSettings.sortbyDefault = searchSettings.sortbyValues[0];

          /* Custom templates for search result views */
          searchSettings.resultViewTpls = [{
            tplUrl: '../../catalog/views/dutch/templates/card.html',
            tooltip: 'Grid',
            icon: 'fa-th'
          }];

          // Mapping for md links in search result list.
          searchSettings.linkTypes = {
            links: ['LINK', 'kml', 'pdf', 'docx', 'gml', 'geojson'],
            downloads: ['DOWNLOAD','Inspire atom'],
            //layers:['OGC', 'kml'],
            layers:['OGC'],
            maps: ['OGC:OWC']
          };
          // Map protocols used to load layers/services in the map viewer
          searchSettings.mapProtocols = {
            layers: [
              'OGC:WMS',
              'OGC:WMS-1.1.1-http-get-map',
              'OGC:WMS-1.3.0-http-get-map',
              'OGC:WMTS-1.1.0-http-get-tile',
              'OGC:WMTS',
              'TMS',
              'KML',
              'GML',
              'geojson'
              ],
            services: [
              'OGC:WMS-1.3.0-http-get-capabilities',
              'OGC:WMS-1.1.1-http-get-capabilities',
              'OGC:WMTS-1.0.0-http-get-capabilities'
              ]
          };
          // Set the default template to use
          searchSettings.resultTemplate =
              searchSettings.resultViewTpls[0].tplUrl;

          // Set custom config in gnSearchSettings
          angular.extend(searchSettings, {
            viewerMap: viewerMap,
            searchMap: searchMap
          });
        }]);
})();
