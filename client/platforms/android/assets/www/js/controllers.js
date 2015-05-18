angular.module('starter.controllers', [])

    .controller('AppCtrl', function($scope, $ionicModal, $timeout) {
        // Form data for the login modal
        $scope.loginData = {};

        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
        });

        // Triggered in the login modal to close it
        $scope.closeLogin = function() {
            $scope.modal.hide();
        };

        // Open the login modal
        $scope.login = function() {
            $scope.modal.show();
        };

        // Perform the login action when the user submits the login form
        $scope.doLogin = function() {
            console.log('Doing login', $scope.loginData);

            // Simulate a login delay. Remove this and replace with your login
            // code if using a login system
            $timeout(function() {
                $scope.closeLogin();
            }, 1000);
        };
    })

    .controller('HomeCtrl', function($scope, $ionicLoading, $cordovaGeolocation){

        $scope.mapCreated = function(map) {
            $scope.map = map;
        };

        $scope.centerOnMe = function () {
            console.log("Centering");
            if (!$scope.map) {
                return;
            }

            $scope.loading = $ionicLoading.show({
                content: 'Getting current location...',
                showBackdrop: false
            });

            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (position) {
                    var lat = position.coords.latitude,
                        long = position.coords.longitude,
                        initialLocation = new google.maps.LatLng(lat, long);

                    $scope.map.setCenter(initialLocation);
                    $ionicLoading.hide();


                });
        }

    })

    .controller('PlaylistsCtrl', function($scope) {
        $scope.playlists = [
            { title: 'Reggae', id: 1 },
            { title: 'Chill', id: 2 },
            { title: 'Dubstep', id: 3 },
            { title: 'Indie', id: 4 },
            { title: 'Rap', id: 5 },
            { title: 'Cowbell', id: 6 }
        ];
    })

    .controller('SearchCtrl', function($scope, Beach) {
        $scope.beaches = [];
        Beach.getFirst(35000).then(function(beaches){
            $scope.beaches = beaches;
        });
    })



    .controller('BeachCtrl', function($scope, Beach, $stateParams, $ionicSlideBoxDelegate,$cordovaCamera, $ionicLoading, $localStorage) {
        $scope.name = $stateParams.beachId;

        ionic.Platform.ready(function() {
            //console.log("ready get camera types");
            if (!navigator.camera)
            {
                // error handling
                return;
            }
            //pictureSource=navigator.camera.PictureSourceType.PHOTOLIBRARY;
            pictureSource=navigator.camera.PictureSourceType.CAMERA;
            destinationType=navigator.camera.DestinationType.FILE_URI;
        });


        var auxBeaches;
        var auxConds;
        Beach.getFirst(35000).then(function(beaches){
            auxBeaches = beaches;
            var beach = [];
            for(var i=0;i<auxBeaches.length;i++) {
                if (auxBeaches[i].name === $scope.name) {
                    $scope.beach = auxBeaches[i];
                }
            }
            Beach.getBeachConds($scope.beach._id).then(function(beaches){
                auxConds = beaches;
                $scope.weatherConds = auxConds;
            });
            $ionicSlideBoxDelegate.update();

        });



        $scope.getPhoto = function() {
            var local = "http://172.30.20.64:3000/beaches";
            var locali = "http://192.168.108.57:3000/beaches";
            var geny = "192.168.56.1:3000/beaches";
            console.log('Getting camera');
            Upload.getPicture({
                quality: 75,
                targetWidth: 320,
                targetHeight: 320,
                saveToPhotoAlbum: false
            }).then(function(imageURI) {
                console.log(imageURI);
                $scope.lastPhoto = imageURI;
            }, function(err) {
                console.err(err);
            })
        };

        $scope.upload = function() {
            var local = "http://172.30.20.64:3000/beaches";
            var locali = "http://192.168.108.57:3000/upload";
            var geny = "192.168.56.1:3000/beaches";
            var url = '';
            var fd = new FormData();

            //previously I had this
            //angular.forEach($scope.files, function(file){
            //fd.append('image',file)
            //});

            fd.append('image', $scope.lastPhoto);

            $http.post(local, fd, {

                transformRequest: angular.identity,
                headers: {
                    'Content-Type': 'image/jpeg'
                }
            })
                .success(function (data, status, headers) {
                    $scope.imageURL = data.resource_uri; //set it to the response we get
                })
                .error(function (data, status, headers) {

                })
        }

        $scope.doRefresh = function() {
            if($scope.newItems.length > 0){
                $scope.items = $scope.newItems.concat($scope.items);

                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');

                $scope.newItems = [];
            } else {
                PersonService.GetNewUsers().then(function(items){
                    $scope.items = items.concat($scope.items);

                    //Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                });
            }
        };





        $scope.data = { "ImageURI" :  "Select Image" };
        $scope.takePicture = function() {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URL,
                sourceType: Camera.PictureSourceType.CAMERA
            };
            $cordovaCamera.getPicture(options).then(
                function(imageData) {
                    $scope.picData = imageData;
                    $scope.ftLoad = true;
                    $localStorage.set('fotoUp', imageData);
                    $ionicLoading.show({template: 'Foto acquisita...', duration:500});
                },
                function(err){
                    $ionicLoading.show({template: 'Errore di caricamento...', duration:500});
                })
        }

        $scope.selectPicture = function() {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY
            };

            $cordovaCamera.getPicture(options).then(
                function(imageURI) {
                    window.resolveLocalFileSystemURI(imageURI, function(fileEntry) {
                        $scope.picData = fileEntry.nativeURL;
                        $scope.ftLoad = true;
                        var image = document.getElementById('myImage');
                        image.src = fileEntry.nativeURL;
                    });
                    $ionicLoading.show({template: 'Foto acquisita...', duration:500});
                },
                function(err){
                    $ionicLoading.show({template: 'Errore di caricamento...', duration:500});
                })
        };

        $scope.uploadPicture = function() {
            $ionicLoading.show({template: 'Sto inviando la foto...'});
            var fileURL = $scope.picData;
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
            options.mimeType = "image/jpeg";
            options.chunkedMode = true;

            var params = {};
            params.value1 = "someparams";
            params.value2 = "otherparams";

            options.params = params;

            var ft = new FileTransfer();
            var heroku = "https://beach-please.herokuapp.com/upload";
            ft.upload(fileURL, encodeURI(heroku), viewUploadedPictures, function(error) {$ionicLoading.show({template: 'Errore di connessione...'});
                $ionicLoading.hide();}, options);
        }

        var viewUploadedPictures = function() {
            var heroku = "https://beach-please.herokuapp.com/upload";
            $ionicLoading.show({template: 'Sto cercando le tue foto...'});
            server = "http://192.168.1.79:3000/upload";
            if (heroku) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange=function(){
                    if(xmlhttp.readyState === 4){
                        if (xmlhttp.status === 200) {
                            document.getElementById('server_images').innerHTML = xmlhttp.responseText;
                        }
                        else { $ionicLoading.show({template: 'Errore durante il caricamento...', duration: 1000});
                            return false;
                        }
                    }
                };
                xmlhttp.open("GET", heroku , true);
                xmlhttp.send()}	;
            $ionicLoading.hide();
        }

        $scope.viewPictures = function() {
            var heroku = "https://beach-please.herokuapp.com/upload";
            $ionicLoading.show({template: 'Sto cercando le tue foto...'});
            server = "http://192.168.1.79:3000/upload";
            if (heroku) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange=function(){
                    if(xmlhttp.readyState === 4){
                        if (xmlhttp.status === 200) {
                            document.getElementById('server_images').innerHTML = xmlhttp.responseText;
                        }
                        else { $ionicLoading.show({template: 'Errore durante il caricamento...', duration: 1000});
                            return false;
                        }
                    }
                };
                xmlhttp.open("GET", heroku , true);
                xmlhttp.send()}	;
            $ionicLoading.hide();
        }

    })



