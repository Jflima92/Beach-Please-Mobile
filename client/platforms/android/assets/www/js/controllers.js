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
        $ionicModal.fromTemplateUrl('templates/login-modal.html', {
            id: 1,
            scope: $scope
        }).then(function(modal) {
            $scope.modal1 = modal;
        });

        $ionicModal.fromTemplateUrl('templates/image-modal.html', {
            id: 2,
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal){
            $scope.modal2 = modal;
        });

        // Triggered in the login modal to close it
        $scope.closeModal = function(index) {
            if(index == 1) $scope.modal1.hide();
            else
                $scope.modal2.hide();
        };

        $scope.openPhotoModal = function(photo){
            $scope.image_src = photo;
            $scope.modal2.show();
        };


        // Open the login modal
        $scope.openModal = function(index) {
            if(index == 1) $scope.modal1.show();
            else
                $scope.modal2.show();
        };

        $scope.$on('$destroy', function(){
            $scope.modal1.remove();
            $scope.modal2.remove();
        })

        $scope.facebookLogin = function() {
            var localx = "http://172.30.13.163:3000";  //mudar aqui para o iraoCU !!!!!!!
            var local = "http://192.168.1.79:3000/upload";
            var heroku = "http://beach-please.herokuapp.com";
            if (!$localStorage.get('access_token')) {

                $cordovaFacebook.login(["public_profile, publish_actions"]).then(function (success) {
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
                        $scope.modal1.hide();
                        $cordovaToast
                            .show('Logged in!', 'long', 'bottom')
                            .then(function (success) {
                                //sucesso
                            }),
                            function (erro) {
                                console.log(erro);
                            }
                    })

                })
            }
        };

        $scope.logout = function(){
            // if ($localStorage.hasOwnProperty('access_token')) {
            $cordovaFacebook.logout().then(function(success){
                $localStorage.delete('access_token');
                $localStorage.delete('user');
                $timeout(function(){
                    $rootScope.$broadcast('logout', {});
                    $scope.$apply();
                    check_user();

                })
                $cordovaToast
                    .show('Logged out!', 'long', 'bottom')
                    .then(function (success) {
                        //sucesso
                    }),
                    function (erro) {
                        console.log(erro);
                    }
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
        Beach.getFirst(200000).then(function(beaches){
            $scope.beaches = beaches;
        });
    })



    .controller('BeachCtrl', function($scope, $ionicPopup, Beach, $stateParams, $timeout, $ionicLoading, $cordovaToast, $window, $ionicSlideBoxDelegate, $cordovaFacebook, $cordovaCamera, $ionicActionSheet, $ionicModal, $ionicLoading, $localStorage, $timeout, $http) {
        $scope.name = $stateParams.beachId;

        ionic.Platform.ready(function () {
            //console.log("ready get camera types");
            if (!navigator.camera) {
                // error handling
                return;
            }


            //pictureSource=navigator.camera.PictureSourceType.PHOTOLIBRARY;
            pictureSource = navigator.camera.PictureSourceType.CAMERA;
            destinationType = navigator.camera.DestinationType.FILE_URI;
        });


        var auxBeaches;
        var auxConds;
        Beach.getFirst(200000).then(function (beaches) {
            auxBeaches = beaches;
            var beach = [];
            for (var i = 0; i < auxBeaches.length; i++) {
                if (auxBeaches[i].name === $scope.name) {
                    $scope.beach = auxBeaches[i];
                }
            }
            Beach.getBeachConds($scope.beach._id).then(function (beaches) {
                auxConds = beaches;
                $scope.weatherConds = auxConds;
            });
            $ionicSlideBoxDelegate.update();

        });

        var update_comments = function () {
            Beach.getCommentsByBeach($scope.name).then(function (comments) {

                console.log("comments: " + angular.toJson(comments));

                $scope.beachComments = comments;

            });
        }

        update_comments();

        var myComments;
        var update_my_comments = function () {
            Beach.getUserCommentsOnBeach($localStorage.getObject('user').id, $scope.name).then(function (comments) {
                myComments = comments;
            })
        };

        update_my_comments();
        $scope.$on('logout', function () {
            update_comments();
            update_photos();
            update_my_comments();
        })
        $scope.$on('login_suc', function () {
            update_comments();
            update_photos();
            update_my_comments();
        })

        $scope.isOwnComment = function (comment_id) {
            for (var j = 0; j < myComments.length; j++) {
                if (comment_id === myComments[j].id) {

                    return true;
                }
            }
            return false;
        }

        $scope.showOptions = function (comment_id) {
            $ionicActionSheet.show({
                titleText: 'Comment Options',
                buttons: [
                    {
                        text: '<i class="icon ion-edit"></i> Edit'
                    },
                ],
                destructiveText: 'Delete',
                cancelText: 'Cancel',
                cancel: function () {
                    console.log("canceled");
                },
                buttonClicked: function (index) {
                    return true;
                },
                destructiveButtonClicked: function () {
                    Beach.deleteComment($scope.name, comment_id).then(function (success) {
                        console.log("success on delete");
                        update_comments();
                        update_my_comments();

                    })
                    return true;
                }
            });
        }


        var title = 'New comment on: ' + $scope.name;
        $scope.new_comment = function () {
            $scope.post = {};
            if ($localStorage.get('access_token')) {
                var newCommentPopup = $ionicPopup.show({
                    template: '<input type="text" ng-model="post.data">',
                    title: title,
                    scope: $scope,
                    buttons: [
                        {text: 'Cancel'},
                        {
                            text: '<b>Post</b>',
                            type: 'button-energized',
                            onTap: function (e) {
                                ''
                                if (!$scope.post.data) {
                                    e.preventDefault();
                                } else {
                                    console.log("wifi: " + $scope.post.data);
                                    Beach.postComment($scope.post.data, $localStorage.getObject('user').id, $scope.name).then(function (success) {
                                        console.log(success);

                                        $ionicLoading.show({
                                            template: 'Posting..',
                                            duration: 1000
                                        })


                                        update_comments();
                                        update_my_comments();

                                    });
                                    return $scope.post.data;
                                }
                            }
                        }
                    ]
                })
            } else {
                var showLoggedOut = $ionicPopup.alert({
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

        var heroku_like = "http://beach-please.herokuapp.com/beaches/comment/addlike";

        $scope.like = function (cmnt_id) {
            if ($localStorage.get('access_token')) {
                for (var i = 0; i < $scope.beachComments.length; i++) {
                    if ($scope.beachComments[i]._id == cmnt_id) {
                        var user = $localStorage.getObject('user');

                        $http.post(heroku_like, {'cmntid': cmnt_id, 'usrid': user.id});
                        update_comments();
                    }
                }

            }
        }

        var update_photos = function () {
            Beach.getBeachPhotos($scope.name).then(function (photos) {
                $scope.photos = photos;
            })
        }

        update_photos();  //possivelmente passar para o ng-init


        $scope.doCommentRefresh = function () {
            $timeout(function () {
                update_comments()
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        }

        $scope.doPhotoRefresh = function () {
            $timeout(function () {
                update_photos();
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        }

        $scope.show_photo_options = function (photo_uploader, photo_name) {
            console.log("quero aparecer + " + photo_uploader);
            var user = $localStorage.getObject('user');
            if (user) {
                if (photo_uploader === user.id) {
                    $ionicActionSheet.show({
                        destructiveText: 'Delete',
                        cancelText: 'Cancel',
                        cancel: function () {
                            console.log("canceled");
                        },
                        buttonClicked: function (index) {
                            return true;
                        },
                        destructiveButtonClicked: function () {
                            Beach.deletePhoto(photo_name, $scope.name).then(function (success) {
                                console.log("success on delete");
                                update_photos();
                                //place toaster or popup
                                $cordovaToast
                                    .show('Deleted!', 'long', 'bottom')
                                    .then(function (success) {
                                        //sucesso
                                    }),
                                    function (erro) {
                                        console.log(erro);
                                    }


                            })
                            return true;
                        }
                    });
                }
                else
                    var newPhotoPopup = $ionicPopup.alert({
                        title: "You don't have permissions to delete this photo!",
                        buttons: [
                            {
                                text: 'Ok',
                                type: 'button-assertive'
                            }
                        ]
                    });

            }
            else
                var newPhotoPopup = $ionicPopup.alert({
                    title: "Please login first!",
                    buttons: [
                        {
                            text: 'Ok',
                            type: 'button-assertive'
                        }
                    ]
                });

        }

        $scope.goToInfo = function (beach_name) {
            //$state.go('app.beach', { beachId: beach_name });
            $state.go('app.beach', {beachId: beach_name});

        }
        $scope.checkIn = function () {
            var user = $localStorage.get('access_token');

            if (user) {
                var message1 = encodeURIComponent('I have just checked in @ ' + $scope.name);
                var request1 = "https://graph.facebook.com/" + user.id + "/feed?method=post&message=" + message1 + "&access_token=" + $localStorage.get('access_token');

                var req = +user.id + "/feed?method=post&message=testes/" + $localStorage.get('access_token');
                console.log(request1);

                $ionicLoading.show({
                    template: 'Posting..',
                    duration: 2000
                });
                var request1 = "https://graph.facebook.com/" + user.id + "/feed?method=post&message=" + message1 + "&access_token=" + $localStorage.get('access_token');

                $http.post(request1).then(function (success) {
                        console.log(success);
                    },
                    function (err) {
                        console.log(JSON.stringify(err));
                    })
                $timeout(function () {
                    $cordovaToast
                        .show('Checked in!', 'long', 'bottom')
                        .then(function (success) {
                            //sucesso
                        }),
                        function (erro) {
                            console.log(erro);
                        }
                }, 2010)
            }else{
                var showLoggedOut = $ionicPopup.alert({
                    title: 'Unable to check in, please login and try again..',
                    buttons: [
                        {
                            text: 'Ok',
                            type: 'button-assertive'
                        }
                    ]
                })
            }
        }

        $scope.shout = function () {
            $scope.shout = {};
            var user = $localStorage.get('access_token');
            if(user) {
                var message1 = encodeURIComponent('I have just checked in @ ' + $scope.name);
                var request1 = "https://graph.facebook.com/" + user.id + "/feed?method=post&message=" + message1 + "&access_token=" + $localStorage.get('access_token');

                var req = +user.id + "/feed?method=post&message=testes/" + $localStorage.get('access_token');
                console.log(request1);

                var newCommentPopup = $ionicPopup.show({
                    template: '<input type="text" ng-model="shout.data"> @ ' + $scope.name,
                    title: "Say something!",
                    scope: $scope,
                    buttons: [
                        {text: 'Cancel'},
                        {
                            text: '<b>Shout!</b>',
                            type: 'button-energized',
                            onTap: function (e) {
                                ''
                                if (!$scope.shout.data) {
                                    e.preventDefault();
                                } else {
                                    console.log("wifi: " + $scope.shout.data);
                                    $ionicLoading.show({
                                        template: 'Shouting...',
                                        duration: 2000
                                    });
                                    var message = encodeURIComponent($scope.shout.data + " @ " + $scope.name);
                                    var request = "https://graph.facebook.com/" + user.id + "/feed?method=post&message=" + message + "&access_token=" + $localStorage.get('access_token');

                                    $http.post(request).then(function (success) {
                                            console.log(success);
                                        },
                                        function (err) {
                                            console.log(JSON.stringify(err));
                                        })
                                    $timeout(function () {
                                        $cordovaToast
                                            .show('Shouted out!', 'long', 'bottom')
                                            .then(function (success) {
                                                //sucesso
                                            }),
                                            function (erro) {
                                                console.log(erro);
                                            }
                                    }, 2010)
                                }
                            }
                        }
                    ]
                })
            }else{
                var showLoggedOut = $ionicPopup.alert({
                    title: 'Unable to shout, please login and try again..',
                    buttons: [
                        {
                            text: 'Ok',
                            type: 'button-assertive'
                        }
                    ]
                })
            }
        }


        $scope.data = {"ImageURI": "Select Image"};
        $scope.takePicture = function () {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URL,
                sourceType: Camera.PictureSourceType.CAMERA
            };
            $cordovaCamera.getPicture(options).then(
                function (imageData) {
                    $scope.picData = imageData;
                    $scope.ftLoad = true;
                    $localStorage.setObject('fotoUp', imageData);
                    $ionicLoading.show({template: 'Fotografia adquirida...', duration: 500});
                },
                function (err) {
                    $ionicLoading.show({template: 'Erro na câmara...', duration: 500});
                })
        }

        $scope.selectPicture = function () {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY
            };

            $cordovaCamera.getPicture(options).then(
                function (imageURI) {
                    window.resolveLocalFileSystemURI(imageURI, function (fileEntry) {
                        $scope.picData = fileEntry.nativeURL;
                        $scope.ftLoad = true;
                        var image = document.getElementById('myImage');
                        image.src = fileEntry.nativeURL;
                    });
                    $ionicLoading.show({template: 'Fotografia adquirida...', duration: 500});
                },
                function (err) {
                    $ionicLoading.show({template: 'Erro na câmara...', duration: 500});
                })
        }


        $scope.uploadPicture = function () {
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

            ft.upload(fileURL, encodeURI(heroku), function(success){

            }, function (error) {
                $ionicLoading.show({template: 'Erro de ligação...'});
                $ionicLoading.hide();
            }, options);

            delete $scope.picData;
            $timeout(function () {
                    update_photos();

                },
                3000);

        }
    })





