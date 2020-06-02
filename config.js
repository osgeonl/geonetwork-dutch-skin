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

  goog.require('gn_dutch_gazetteer_factory');

  var module = angular.module('gn_search_dutch_config', ['gn_dutch_gazetteer_factory',
    'gn_relatedresources_service']);


  module.value('gnTplResultlistLinksbtn',
      '../../catalog/views/default/directives/partials/linksbtn.html');

  module
      .run([
        'gnSearchSettings',
        'gnViewerSettings',
        'gnOwsContextService',
        'gnMap',
        'gnMapsManager',
        'gnDefaultGazetteer',
        'gnDutchGazetteer',
        function(searchSettings, viewerSettings, gnOwsContextService,
                 gnMap, gnMapsManager, gnDefaultGazetteer, gnDutchGazetteer) {

          if(viewerSettings.mapConfig.viewerMapLayers) {
            console.warn('[geonetwork] Use of "mapConfig.viewerMapLayers" is deprecated. ' +
              'Please configure layer per map type.')
          }

          // Keep one layer in the background
          // while the context is not yet loaded.
          viewerSettings.bgLayers = [
            gnMap.createLayerForType('osm')
          ];
          viewerSettings.servicesUrl =
            viewerSettings.mapConfig.listOfServices || {};

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

          gnMapsManager.initProjections(viewerSettings.mapConfig.switcherProjectionList);
          
          var searchMap = gnMapsManager.createMap(gnMapsManager.SEARCH_MAP);
          var viewerMap = gnMapsManager.createMap(gnMapsManager.VIEWER_MAP);

          // To configure a gazetteer provider
          viewerSettings.gazetteerProvider = gnDutchGazetteer;

          /* Custom templates for search result views */
          searchSettings.resultViewTpls = [{
            tplUrl: '../../catalog/views/dutch/templates/card.html',
            tooltip: 'Grid',
            icon: 'fa-th'
          }];

          // Mapping for md links in search result list.
          searchSettings.linkTypes = {
            links: ['LINK', 'pdf', 'docx'],
            downloads: ['DOWNLOAD','gml', 'kml', 'geojson', 'gpkg', 'x-sqlite3', 'json', 'jsonld', 'json-ld', 'rdf-xml', 'xml', 'zip', 'jp2',
              'tiff', 'csv', 'OGC:WFS', 'OGC:WCS', 'OGC:SOS', 'INSPIRE Atom', 'OASIS:OData', 'OGC:SensorThings', 'W3C:SPARQL', 'OAS'],
            //layers:['OGC', 'kml'],
            layers:['OGC'],
            maps: ['OGC:OWC']
          };
          // Map protocols used to load layers/services in the map viewer
          searchSettings.mapProtocols = {
            layers: [
              'OGC:WMS',
              'OGC:WFS',
              'OGC:WMS-1.1.1-http-get-map',
              'OGC:WMS-1.3.0-http-get-map',
              'OGC:WMTS-1.1.0-http-get-tile',
              'OGC:WMTS',
              'TMS',
              'KML',
              'GML'],
            services: [
              'OGC:WMS-1.3.0-http-get-capabilities',
              'OGC:WMS-1.1.1-http-get-capabilities',
              'OGC:WMTS-1.0.0-http-get-capabilities'
              ]
          };

          // Set custom config in gnSearchSettings
          angular.extend(searchSettings, {
            viewerMap: viewerMap,
            searchMap: searchMap
          });

        }]);
  
        module.config(['$LOCALES', function($LOCALES) {
          $LOCALES.push('../../catalog/views/dutch/locales/|core');
        }]);
})();
