(function() {
  goog.provide('ol.proj.EPSG28992');

  var module = angular
      .module('ol.proj.EPSG28992', [])
      .config(
          function() {
            ol.proj.EPSG28992 = {};
            ol.proj['urn:ogc:def:crs:EPSG::28992'] = {};
            ol.proj['http://www.opengis.net/gml/srs/epsg.xml#28992'] = {};

            proj4
            .defs(
                "EPSG:28992",
                "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs");
            proj4
            .defs(
                "urn:ogc:def:crs:EPSG::28992",
                "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs");
            proj4
            .defs(
                "http://www.opengis.net/gml/srs/epsg.xml#28992",
                "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs");
           
            ol.proj.get('EPSG:28992').setExtent([
                -285401.92, 22598.08, 595401.92, 903401.92
            ]);
            ol.proj.get('EPSG:28992').setWorldExtent(
                [
                    -1.65729160235431, 48.0405018704265, 11.2902578747914,
                    55.9136415748388
                ]);
            
            ol.proj.get('urn:ogc:def:crs:EPSG::28992').setExtent(ol.proj.get('EPSG:28992').getExtent());
            ol.proj.get('urn:ogc:def:crs:EPSG::28992').setWorldExtent(ol.proj.get('EPSG:28992').getWorldExtent());
             
            ol.proj.get('http://www.opengis.net/gml/srs/epsg.xml#28992').setExtent(ol.proj.get('EPSG:28992').getExtent());
            ol.proj.get('http://www.opengis.net/gml/srs/epsg.xml#28992').setWorldExtent(ol.proj.get('EPSG:28992').getWorldExtent());
             

            // ngeo support for this projection:
            ol.proj.EPSG28992_ = function(code, opt_axisOrientation) {
              return {
                code : code,
                units : "m",
                extent : [
                    -285401.92, 22598.08, 595401.92, 903401.92
                ],
                axisOrientation : opt_axisOrientation || "enu",
                global : true,
                worldExtent : [
                    -1.65729160235431, 48.0405018704265, 11.2902578747914,
                    55.9136415748388
                ]
              };
            };

            var tempCtor = function() {
            };
            tempCtor.prototype = ol.proj.Projection.prototype;
            ol.proj.EPSG28992_.superClass_ = ol.proj.Projection.prototype;
            ol.proj.EPSG28992_.prototype = new tempCtor();
            ol.proj.EPSG28992_.prototype.constructor = ol.proj.EPSG28992_;

            ol.proj.EPSG28992.CODES = [
                'EPSG:28992', 'urn:ogc:def:crs:EPSG::28992',
                'http://www.opengis.net/gml/srs/epsg.xml#28992'
            ];

            ol.proj.EPSG28992.PROJECTIONS = [];

            ol.proj.EPSG28992.CODES
                .forEach(function(code) {
                  ol.proj.EPSG28992.PROJECTIONS[code] = new ol.proj.EPSG28992_(
                      code);
                });

            ol.proj.addEquivalentProjections(ol.proj.EPSG28992.PROJECTIONS);
            ol.proj.addCoordinateTransforms('EPSG:4326', 'EPSG:28992', proj4(
                'EPSG:4326', 'EPSG:28992').forward, proj4('EPSG:4326',
                'EPSG:28992').inverse);
          });
})();
