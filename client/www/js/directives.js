angular.module('starter.directives', [])

    .directive('map', function(geoLocation, $compile, Beach) {
      return {
        restrict: 'E',
        scope: {
          onCreate: '&'
        },
        link: function ($scope, $element) {
          function initialize() {
            var mapOptions = {
              center: new google.maps.LatLng(geoLocation.getGeolocation().lat, geoLocation.getGeolocation().lng),
              zoom: 16,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map($element[0], mapOptions);

            //Marker + infowindow + angularjs compiled ng-click
            var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
            var compiled = $compile(contentString)($scope);

            var infowindow = new google.maps.InfoWindow({
              content: compiled[0]
            });

           Beach.getFirst(50000).then(function(allBeaches){      //in 50km range
              for(var i = 0; i < allBeaches.length; i++){
                var myLatlng = new google.maps.LatLng(parseFloat(allBeaches[i].lat),parseFloat(allBeaches[i].lng));
                console.log(myLatlng);
                new google.maps.Marker({
                  position: myLatlng,
                  map: map,
                  title: allBeaches[i].name
                });
              }
            });

            var marker = new google.maps.Marker({
              position: geoLocation.getGeolocation(),
              map: map,
              title: 'Uluru (Ayers Rock)'
            });

            google.maps.event.addListener(marker, 'click', function() {
              infowindow.open(map,marker);
            });

            $scope.onCreate({map: map});

            // Stop the side bar from dragging when mousedown/tapdown on the map
            google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
              e.preventDefault();
              return false;
            });
          }

          if (document.readyState === "complete") {
            initialize();
          } else {
            ionic.Platform.ready(initialize);
          }
        }
      }
    })

    .directive('ionSearch', function() {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          getData: '&source',
          model: '=?',
          search: '=?filter'
        },
        link: function(scope, element, attrs) {
          attrs.minLength = attrs.minLength || 0;
          scope.placeholder = attrs.placeholder || '';
          scope.search = {value: ''};

          if (attrs.class)
            element.addClass(attrs.class);

          if (attrs.source) {
            scope.$watch('search.value', function (newValue, oldValue) {
              if (newValue.length > attrs.minLength) {
                scope.getData({str: newValue}).then(function (results) {
                  scope.model = results;
                });
              } else {
                scope.model = [];
              }
            });
          }

          scope.clearSearch = function() {
            scope.search.value = '';
          };
        },
        template: '<div class="item-input-wrapper">' +
        '<i class="icon ion-android-search"></i>' +
        '<input type="search" placeholder="{{placeholder}}" ng-model="search.value">' +
        '<i ng-if="search.value.length > 0" ng-click="clearSearch()" class="icon ion-close"></i>' +
        '</div>'
      };
    });