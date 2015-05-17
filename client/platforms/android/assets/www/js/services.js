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


    .factory('Beach', function($http, $q, geoLocation) {
        var self = this;
        var location = geoLocation.getGeolocation();
        console.log(geoLocation.getGeolocation());
        self.getFirst = function(number) {
            var q = $q.defer();

            var locali = "http://192.168.108.57:3000/beaches";
            var heroku = "https://beach-please.herokuapp.com/beaches";
            var local = "172.30.20.64:3000/beaches";
            var geny = "192.168.56.1:3000/beaches";
            var string = heroku + '?dist='+number+'&lat='+location.lat+'&long='+location.lng;
            console.log(string);
            var beaches = $http.get(string)
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

        self.getBeachConds = function(id) {
            var q = $q.defer();

            var locali = "http://192.168.108.57:3000/beaches";
            var heroku = "https://beach-please.herokuapp.com/beaches";
            var local = "http://172.30.20.64:3000/beaches";
            var geny = "192.168.56.1:3000/beaches";
            var string = heroku + '/WeatherReq/'+id;
            console.log(string);
            var beaches = $http.get(string)
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

    .factory('Camera', ['$q', function($q) {

        return {
            getPicture: function(options) {
                var q = $q.defer();

                navigator.camera.getPicture(function(result) {
                    // Do any magic you need
                    q.resolve(result);
                }, function(err) {
                    q.reject(err);
                }, options);

                return q.promise;
            }
        }
    }])

    .factory('Upload', ['$q', function($q, $cordovaCamera, $cordovaFile, Constants) {

        return {

            getPicture: function(){
                var q = $q.defer();
                var options =   {
                    quality: 100
                    , destinationType: Camera.DestinationType.FILE_URI
                    , sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                    , encodingType: Camera.EncodingType.JPEG
                }

                $cordovaCamera.getPicture(options).then(

                    function(fileURL) {

                        q.resolve(fileURL);

                    }, function(err){
                        deferred.reject(err);
                    })
            },

            fileTo: function(serverURL, FileUrl) {

                var deferred = $q.defer();

                if (ionic.Platform.isWebView()) {

                    var options =   {
                        quality: 100
                        , destinationType: Camera.DestinationType.FILE_URI
                        , sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                        , encodingType: Camera.EncodingType.JPEG
                    }

                    $cordovaCamera.getPicture(options).then(

                        function(fileURL) {

                            var uploadOptions = new FileUploadOptions();
                            uploadOptions.fileKey = "file";
                            uploadOptions.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                            uploadOptions.mimeType = "image/jpeg";
                            uploadOptions.chunkedMode = false;

                            $cordovaFile.uploadFile(serverURL, fileURL, uploadOptions).then(

                                function(result) {
                                    deferred.resolve(result);
                                }, function(err) {
                                    deferred.reject(err);
                                })

                            ;

                        }, function(err){
                            deferred.reject(err);
                        })

                    ;

                }
                else {
                    deferred.reject('Uploading not supported in browser');
                }

                return deferred.promise;

            }

        }

    }])