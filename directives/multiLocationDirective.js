(function(){
    goog.provide('dutch_multi_location_directive');

    goog.require('gn_thesaurus_service');

    var module = angular.module('dutch_multi_location_directive', ['gn_thesaurus_service']);

    module.directive('dutchMultiLocation', ['gnGlobalSettings', 'gnThesaurusService', '$location',
      '$q', '$cacheFactory', '$browser', '$translate',
        function(gnGlobalSettings, gnThesaurusService, $location, $q, $cacheFactory, $browser, $translate) {
            var cache = $cacheFactory('locations');
            var prefix = 'region:';
            return {
                restrict: 'A',
                scope: {
                    uriString: "=",
                    limit: '@'
                },
                link: function (scope, element, attrs) {

                  scope.thesaurusKey = attrs.thesaurusKey || '';
                    scope.max = gnThesaurusService.DEFAULT_NUMBER_OF_RESULTS;
                    scope.model = [];


                    var lang = gnGlobalSettings.locale.iso3lang;
                    var keywordsAutocompleter = gnThesaurusService.getKeywordAutocompleter({
                        thesaurusKey: scope.thesaurusKey,
                        lang: lang
                    });

                    var source = keywordsAutocompleter.ttAdapter();
                    // Init tagsinput object
                    var tagsinput = $(element).tagsinput({
                      itemValue: function(val) {
                        return val.props.uri;
                      },
                      itemText: function(val) {
                        return val.label;
                      }

                    });

                    $(element).bind('itemRemoved', function(itemRemoved) {
                        scope.$apply(function() {
                            if (!angular.isArray(scope.model)) {
                                scope.model = [];
                            }
                          removeFromModel(itemRemoved.item);
                        });
                    });
                    // init typeahead
                    var internalInput =  tagsinput[0].input();
                    var container = tagsinput[0].$container;

                    // add accessibility label
                    internalInput.attr("aria-label", $translate.instant('AtLocation'));

                    if (container) {
                        internalInput.on('focus', function() {
                            container.addClass('focused');
                        });
                        internalInput.on('blur', function() {
                            container.removeClass('focused');
                        });
                    }

                    internalInput.typeahead({
                        minLenght: 0,
                        highlight: true,
                        autoselect: true
                    }, {
                        name: 'keyword',
                        displayKey: 'label',
                        limit: scope.limit || 5,
                        source: source
                    }).bind('typeahead:selected typeahead:autocompleted', $.proxy(function(obj, datum) {
                        this.tagsinput('add', datum);
                        this.tagsinput('input').typeahead('close');
                        this.tagsinput('input').typeahead('val', '');
                        scope.$apply(function(){
                            if (!angular.isArray(scope.model)) {
                                scope.model = [];
                            }
                            addItemToModel(datum);
                        });
                    }, element)).bind('typeahead:selected', function(e, suggestion) {
                        //console.log('typeahead:selected -> ' + suggestion);
                    }).bind('typeahead:autocompleted', function(e, suggestion) {
                        //console.log('typeahead:autocompleted -> ' + suggestion);
                    });

                    // When clicking the element trigger input
                    // to show autocompletion list.
                    // https://github.com/twitter/typeahead.js/issues/798
                    internalInput.on('typeahead:opened', function () {
                        var initial = internalInput.val(),
                            ev = $.Event('keydown');
                        ev.keyCode = ev.which = 40;
                        internalInput.trigger(ev);
                        if (internalInput.val() != initial) {
                            internalInput.val('');
                        }
                        return true;
                    });


                    var addItemToModel = function (keyword) {
                      cache.put(keyword.props.uri, keyword);
                      if ($.inArray(keyword.props.uri, scope.model) == -1) {
                        scope.model.push(keyword.props.uri);
                        // update query string
                        var queryString = ((scope.model.length > 0 ) ? prefix : '') + scope.model.join(',');
                        scope.uriString = queryString;
                      }
                    };

                    var removeFromModel = function(keyword) {
                      var modified = false;
                      for (var i = 0; i < scope.model.length; i++) {
                        var currentUri = scope.model[i];
                          if (currentUri === keyword.props.uri) {
                            // Remove element from the model
                            scope.model.splice(i, 1);
                            modified = true;
                          }
                        }
                      if (modified) {
                        // update query string
                        var queryString = ((scope.model.length > 0 ) ? prefix : '') + scope.model.join(',');
                        scope.uriString = queryString;
                      }
                    };


                  scope.$watchCollection('model', function(newVal) {
                    angular.forEach(newVal, function(uri) {
                      if (!cache.get(uri)) {
                        gnThesaurusService.lookupURI(scope.thesaurusKey, uri).then(function(keyword) {
                          cache.put(uri, keyword);
                          //console.log("Item found:", keyword);
                        });
                      }
                      var keyword = cache.get(uri);

                    });
                  });

                  scope.$watch('uriString', function (newVal) {

                    //console.log("New uriString: " + scope.uriString);
                    if (!newVal || newVal == prefix) {
                      scope.model = [];
                      $(element).tagsinput('removeAll');
                    } else {
                      var uris = [];
                      if (scope.uriString && scope.uriString.indexOf(prefix) == 0) {
                        uris = scope.uriString.substring(prefix.length, scope.uriString.length).split(',');
                      }
                      scope.model = [];
                      var promises = [];
                      angular.forEach(uris, function(uri, index) {
                        var promise = getKeywordFromUri(uri).then(function(kw) {
                          scope.model[index] = kw.props.uri;
                        });
                        promises.push(promise);
                      });
                      $q.all(promises).then(function() {
                        // TODO update tagsinput
                        //console.log("All request done: ", scope.model);
                        $(element).tagsinput('removeAll');
                        angular.forEach(scope.model, function(item) {
                          $(element).tagsinput('add', cache.get(item));
                        });
                      });
                    }
                  });

                  var getKeywordFromUri = function(uri) {
                    var defer = $q.defer();
                    if (!cache.get(uri)) {
                      gnThesaurusService.lookupURI(scope.thesaurusKey, uri).then(function(keyword) {
                        if (keyword) {
                          var kw = {};
                          kw['label'] = keyword.prefLabel[Object.keys(keyword.prefLabel)[0]];
                          kw['props'] = {};
                          kw['props']['uri'] = keyword.uri;
                          cache.put(uri, kw);
                          defer.resolve(kw);
                        } else {
                          defer.reject(keyword);
                        }

                      }, function(rejected) {
                        defer.reject(rejected);
                      });
                    } else {
                      $browser.defer(function (){
                        defer.resolve(cache.get(uri))
                      });
                    }
                    return defer.promise;
                  };
                }
            };

        }
    ]);

}());
