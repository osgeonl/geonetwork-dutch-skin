(function(){
    goog.provide('dutch_pdok_load_controller');

    goog.require('gn_cat_controller');

    var module = angular.module('dutch_pdok_load_controller', ['gn_cat_controller']);

    module.controller('dutchPdokLoad', 
        [
          '$http',
          'gnLangs',
          '$scope',
          '$attrs',
          '$element',
          'gnGlobalSettings',
        function($http, gnLangs, $scope, $attrs, $element,gnGlobalSettings) {

            var lang = gnGlobalSettings.lang;

            $http.get("https://www.pdok.nl/" + lang + "/ngr.xml").
              success(function(data, status) {
                var xml = $.parseXML(data);
                if (xml){
                $.each(xml.getElementsByTagName("item"), function(i, item) {
                  var tmp = item.getElementsByTagName("link")[0];
                  var link = tmp.innerText || tmp.textContent;
                  if(link == $attrs[lang]) {
                    var tmp = item.getElementsByTagName("title")[0];
                    $scope.title = tmp.innerText || tmp.textContent;
                    $scope.link = link;
                    var tmp = item.getElementsByTagName("description")[0];
                    $scope.description = tmp.innerText || tmp.textContent;
                    $($element.find(".content")).html($scope.description);
                   }
                  });
          }
        });
      }  
    ]);
}());