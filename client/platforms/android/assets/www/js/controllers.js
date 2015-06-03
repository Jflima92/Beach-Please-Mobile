angular.module('starter.controllers', [])

    .controller('AppCtrl', function($rootScope, $scope, $ionicModal, $timeout, $localStorage, $cordovaFacebook, $http) {
        // Form data for the login modal
        $scope.loginData = {};

        var check_user = function(){

            var token = $localStorage.get('access_token')
            if(token){
                console.log("qui");
                $scope.user = $localStorage.getObject('user');
                $scope.$root.is_logged = true;
            }
            else
                $scope.$root.is_logged = false;
        }

        check_user();

        //event listeners to update login mode
        $scope.$on('login_suc', function (event, data){
            $scope.user = data;
            console.log(data);
            $scope.$root.is_logged = true;

        })

        $scope.$on('logout', function (event, data){
            $scope.$root.is_logged = false;

        })


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



        $scope.facebookLogin = function() {
            var localx = "http://172.30.13.163:3000";  //mudar aqui para o iraoCU !!!!!!!
            var local = "http://192.168.1.79:3000/upload";
            var heroku = "http://beach-please.herokuapp.com";
            if (!$localStorage.get('access_token')) {

                $cordovaFacebook.login(["public_profile"]).then(function (success) {
                    $localStorage.set('access_token',  success.authResponse.accessToken);

                    $cordovaFacebook.api("me",["public_profile"]).then(function(success){

                        var pic_link = 'http://graph.facebook.com/' + success.id + '/picture?width=270&height=270';
                        success['profile_picture'] = pic_link;
                        success['is_logged'] = true;
                        $localStorage.setObject('user',success);

                        $timeout(function(){
                            $rootScope.$broadcast('login_suc', success);
                            $scope.$apply();

                        });
                        check_user();
                        $http.post(heroku+"/users/verify",{id:success.id,name:success.name});
                        $scope.modal.hide();
                    })

                })
            }
        };

        $scope.logout = function(){
            // if ($localStorage.hasOwnProperty('access_token')) {
            $cordovaFacebook.logout().then(function(success){
                $localStorage.delete('access_token');
                $localStorage.setObject('user', null);
                $timeout(function(){
                    $rootScope.$broadcast('logout', {});
                    $scope.$apply();
                    check_user();

                })
                console.log("aa " + success);
            })
            /*}
             else
             alert("faz login primeiro");*/
        };



        // $scope.profile_pic = $localStorage.user['profile_picture'];
    })

    .controller('HomeCtrl', function($scope, $ionicPlatform, $rootScope, $state, $timeout, $ionicLoading, $cordovaGeolocation, $cordovaFacebook, $localStorage){
        $scope.mapCreated = function(map) {
            $scope.map = map;
        };

        $scope.centerOnMe = function () {
            console.log("Centering");
            if (!$scope.map) {
                return;
            }

            $scope.loading = $ionicLoading.show({
                template: 'A localizar...',
                showBackdrop: false
            });

            var posOptions = {timeout: 10000, enableHighAccuracy: false};

            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (position) {
                    var lat = position.coords.latitude,
                        long = position.coords.longitude,
                        initialLocation = new google.maps.LatLng(lat, long);
                    console.log(angular.toJson(position));
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



    .controller('BeachCtrl', function($scope, $ionicPopup, Beach, $stateParams, $timeout, $window, $ionicSlideBoxDelegate,$cordovaCamera, $ionicActionSheet, $ionicLoading, $localStorage, $http) {
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

        var update_comments = function(){
            Beach.getCommentsByBeach($scope.name).then(function(comments){

                console.log("comments: " + angular.toJson(comments));

                $scope.beachComments = comments;

            });
        }

        update_comments();


        $scope.isOwnComment = function(comment_id){

            return false;

        }

        var title = 'New comment on: ' + $scope.name;
        $scope.new_comment = function(){
            $scope.post = {};
            if($localStorage.get('access_token')){
                var newCommentPopup = $ionicPopup.show({
                    template: '<input type="password" ng-model="post.data">',
                    title: title,
                    scope:$scope,
                    buttons: [
                        {text: 'Cancel'},
                        {
                            text: '<b>Post</b>',
                            type: 'button-energized',
                            onTap: function(e){''
                                if(!$scope.post.data){
                                    e.preventDefault();
                                } else {
                                    console.log("wifi: " + $scope.post.data);
                                    Beach.postComment($scope.post.data, $localStorage.getObject('user').id, $scope.name).then(function(success){
                                        console.log(success);
                                        update_comments();

                                    });
                                    return $scope.post.data;
                                }
                            }
                        }
                    ]
                })
            } else {
                var showLoggedOut =  $ionicPopup.alert({
                    title: 'Unable to post comment, please login and try again..',
                    buttons: [
                        {
                            text: 'Ok',
                            type: 'button-assertive'
                        }
                    ]
                })
            }
        }


        var updateCommentLikes = function(cmnt_id, cb){


            Beach.getLikesByComment(cmnt_id).then(function(likes){
                console.log("likes: " + likes)

                cb(likes);
            });
        }



        $scope.getCommentLikes = function(comment_id){

            updateCommentLikes(comment_id, function(likes) {
                console.log("LIKKKKKKKKKKKKKKKKKKKKKKKKKKKES: " +likes);
                return likes;
            });

        }


        var heroku_like = "http://beach-please.herokuapp.com/beaches/comment/addlike";

        $scope.like = function(cmnt_id){
            if($localStorage.get('access_token')){
                for(var i = 0; i < $scope.beachComments.length; i++){
                    if($scope.beachComments[i]._id == cmnt_id){
                        var user = $localStorage.getObject('user');

                        $http.post(heroku_like, {'cmntid': cmnt_id, 'usrid': user.id});
                        update_comments();
                    }
                }

            }
        }

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
                    $localStorage.setObject('fotoUp', imageData);
                    $ionicLoading.show({template: 'Fotografia adquirida...', duration:500});
                },
                function(err){
                    $ionicLoading.show({template: 'Erro na câmara...', duration:500});
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
                        console.log(picData);
                        $scope.ftLoad = true;
                        var image = document.getElementById('myImage');
                        image.src = fileEntry.nativeURL;
                    });
                    $ionicLoading.show({template: 'Fotografia adquirida...', duration:500});
                },
                function(err){
                    $ionicLoading.show({template: 'Erro na câmara...', duration:500});
                })
        };

        $scope.uploadPicture = function() {
            $ionicLoading.show({template: 'A enviar...'});
            var fileURL = $scope.picData;
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
            options.mimeType = "image/jpeg";
            options.chunkedMode = true;

            var params = {};
            params.beach = $scope.name;
            params.user = $scope.user;

            options.params = params;

            var ft = new FileTransfer();
            var heroku = "https://beach-please.herokuapp.com/upload";
            var local = "http://localhost:3000/upload";
            ft.upload(fileURL, encodeURI(heroku), viewUploadedPictures, function(error) {$ionicLoading.show({template: 'Erro de ligação...'});
                $ionicLoading.hide();}, options);
        }

        var viewUploadedPictures = function() {
            var heroku = "https://beach-please.herokuapp.com/upload";
            $ionicLoading.show({template: 'A recolher fotografias...'});
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



