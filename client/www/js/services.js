angular.module('starter.services', [])

    .factory('$localStorage', ['$window', function ($window) {
        return {
            set: function (key, value) {
                $window.localStorage[key] = value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        }
    }])
    .factory('geoLocation', function ($localStorage) {
        return {
            setGeolocation: function (latitude, longitude) {
                var _position = {
                    latitude: latitude,
                    longitude: longitude
                }
                $localStorage.setObject('geoLocation', _position)
            },
            getGeolocation: function () {
                return glocation = {
                    lat: $localStorage.getObject('geoLocation').latitude,
                    lng: $localStorage.getObject('geoLocation').longitude
                }
            }
        }
    })

    .factory('Beach', function($http, $q) {
        var self = this;

        self.getFirst = function(number) {
            var q = $q.defer();

            var beaches = $http.get('http://172.30.11.139:3000/beaches?dist='+number)
                .success(function(data) {
                    console.log('Got some data: ', data)
                    q.resolve(data);
                })
                .error(function(error){
                    console.log('Had an error')
                    q.reject(error);
                })

            var res = q.promise;
            return res;
        }





        self.getAllByName = function(name) {
            return DB.query("SELECT * FROM users WHERE name LIKE '%"+name.toLowerCase()+"%' ORDER BY name")
                .then(function(result){
                    return DB.fetchAll(result);
                });
        };
        return self;
    })