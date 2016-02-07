(function () {
    'use strict';

    var intervalPromise = null;
    var _range = function (start, end) {
        var myArray = [];
        for (var i = start; i <= end; i += 1) {
            myArray.push(i);
        }
        return myArray;
    };

    var galleryCtrl = function ($scope, $window, $timeout, $interval, $filter, sessionStorage) {
        $scope.pages = 1;
        $scope.resultsOnPage = ($scope.resultsOnPage ? $scope.resultsOnPage : 10);
        $scope.setResultsOnPage = function (value) {
            $scope.resultsOnPage = (value > 0) ? value : 1;
            $scope.pages = Math.round($scope.imagesOrig.length / $scope.resultsOnPage);
            $scope.pagesArr = _range(1, $scope.pages);
            $scope.searchImage = "";
            $scope.setPage(1);
        };
        $scope.openModal = false;
        $scope.imagesSlideshow = [];

        $scope.setPage = function (value) {
            $scope.page = value;
            $scope.searchImage = "";
            $scope.updateElementsRange();
            $scope.clearSlideShow();
        };

        $scope.updateElementsRange = function () {
            $scope.startFromElement = ($scope.page - 1) * $scope.resultsOnPage;
            $scope.endOnElement = $scope.resultsOnPage;

            // Filter images by page
            if ($scope.imagesOrig) {
                $timeout(function () {
                    $scope.images = angular.copy($scope.imagesOrig);
                    $scope.images = $scope.images.splice($scope.startFromElement, $scope.endOnElement);
                });
            }
        };

        $scope.isAllowToShowImage = function (index, image) {
            if (!$scope.isImageRemoved(image)) {
                return !!(index + 1 <= $scope.resultsOnPage);
            }
        };


        /* for slides */

        $scope.closeModal = function () {
            //angular.element('#openImage').modal('hide');
        };

        $scope.direction = 'left';
        $scope.currentIndex = 0;

        $scope.setCurrentSlideIndex = function (index) {
            $scope.direction = (index > $scope.currentIndex) ? 'left' : 'right';
            $scope.currentIndex = index;
        };

        $scope.isCurrentSlideIndex = function (index) {
            return $scope.currentIndex === index;
        };

        $scope.prevSlide = function () {
            $scope.direction = 'left';
            $scope.currentIndex = ($scope.currentIndex < $scope.images.length - 1) ? ++$scope.currentIndex : 0;
        };

        $scope.nextSlide = function () {
            $scope.direction = 'right';
            $scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.images.length - 1;
        };
        /**************/

        $scope.openImage = function (image) {
            angular.element('#openImage').modal('show');
            $scope.image = image;
            $scope.openModal = true;
            $scope.imageSlideshow = $scope.getSlideShowImage(image);
        };

        //angular.element('#openImage').on('hidden.bs.modal', function () {
        //    $timeout(function () {
        //        $interval.cancel(intervalPromise);
        //        $scope.openModal = false;
        //    });
        //});

        $scope.isImageRemoved = function (image) {
            var removedImages = sessionStorage.get("removedImages") || [];
            return !(removedImages.indexOf(image.url) == -1);
        };

        $scope.removeImage = function (image) {
            if ($window.confirm("Are you sure to delete image " + image.title + "?")) {
                var removedImages = sessionStorage.get("removedImages") || [];
                if (removedImages.indexOf(image.url) == -1) {
                    removedImages.push(image.url);
                }
                sessionStorage.set("removedImages", removedImages);
            }
        };

        $scope.clearSlideShow = function () {
            $scope.imagesSlideshow = [];
        };

        $scope.getSlideShowImage = function (image) {
            var startIndex = 0;

            for (var i = 0; i < $scope.filteredImages.length; i++) {
                if (!$scope.isImageRemoved(image.url) && $scope.filteredImages[i].url == image.url) {
                    startIndex = i;
                }
            }

            var j = startIndex;

            if ($scope.openModal && !$scope.isImageRemoved(image)) {
                $timeout(function () {
                    $scope.imageSlideshow = $scope.filteredImages[j];
                });
            }

            intervalPromise = $interval(function () {
                if ($scope.openModal) {
                    if (j > $scope.filteredImages.length) {
                        j = 0;
                    }
                    if (!$scope.isImageRemoved($scope.filteredImages[j])) {
                        $scope.imageSlideshow = $scope.filteredImages[j];
                    }
                    j++;
                } else {
                    j = startIndex;
                    $interval.cancel(intervalPromise);
                }

            }, $scope.slideshow * 1000);
        };
    };

    var galleryDirective = function (galleryService) {
        return {
            restrict: 'E',
            scope: {
                dataPath: '=path',
                dataSource: '=feed',
                dataEnableSearch: '=search',
                dataEnablePagination: '=pagination',
                dataSlideshow: '=slideshow',
                resultsOnPage: '=resultsPerPage',
                dataEnableSorting: '=sorting'
            },
            link: function (scope, element, attrs) {
                var config = {
                    dataPath: attrs.path.replace(/'/g, ''),
                    dataSource: attrs.feed.replace(/'/g, ''),
                    dataSlideshow: parseInt(attrs.slideshow)
                };

                galleryService.init(config);

                galleryService.getData(config.dataSource).then(function (data) {
                    scope.imagesOrig = angular.copy(data);
                    scope.images = data;
                    scope.pages = Math.ceil(scope.imagesOrig.length / scope.resultsOnPage);
                    scope.pagesArr = _range(1, scope.pages);
                    scope.slideshow = parseInt(config.dataSlideshow);
                });
            },
            controller: galleryCtrl,
            animation: galleryAnimate,
            templateUrl: function (tElement, tAttrs) {
                return tAttrs.path.replace(/'/g, '') + "views/gallery.html";
            }
        };
    };

    var galleryImageDirective = function ($timeout, galleryService) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var config = galleryService.getConfigData();

                // temporary hard-coded (plan to get from config variable)
                var modulePath = "./app/modules/gallery/";

                function emptyImage() {
                    element.attr('src', attrs.emptyImage || modulePath + "/images/empty.png");
                }

                element.bind('error', emptyImage);
                $timeout(function () {
                    if (!element.attr("src")) {
                        emptyImage();
                    }
                });
            }
        };
    };

    var galleryService = function ($q, $http) {
        var service = this;

        this.init = function (setConfig) {
            service.config = setConfig;
        };

        this.getConfigData = function () {
            return service.config;
        };

        this.getData = function (url) {
            var d = $q.defer();
            $http.get(url, {headers: {'Content-type': 'application/json'}})
                .success(function (data) {
                    d.resolve(data);
                })
                .error(function (error) {
                    d.reject(error);
                });
            return d.promise;
        };
    };

    var sessionStorageService = function ($window) {
        if (typeof(Storage) !== "undefined") {
            this.get = function (key) {
                return JSON.parse($window.sessionStorage.getItem(key) || null);
            };

            this.set = function (key, value) {
                $window.sessionStorage.setItem(key, JSON.stringify(value));
            };

            this.remove = function (key) {
                $window.sessionStorage.removeItem(key);
            };
        }
    };

    var parseDateStrFilter = function () {
        return function (input) {
            if (input == null) {
                return "";
            }
            return new Date(input);
        };
    };



    var galleryAnimate = function(){
        return {
            beforeAddClass: function (element, className, done) {
                var scope = element.scope();

                if (className == 'ng-hide') {
                    var finishPoint = element.parent().width();
                    if(scope.direction !== 'right') {
                        finishPoint = -finishPoint;
                    }
                    TweenMax.to(element, 0.5, {left: finishPoint, onComplete: done });
                }
                else {
                    done();
                }
            },
            removeClass: function (element, className, done) {
                var scope = element.scope();

                if (className == 'ng-hide') {
                    element.removeClass('ng-hide');

                    var startPoint = element.parent().width();
                    if(scope.direction === 'right') {
                        startPoint = -startPoint;
                    }

                    TweenMax.fromTo(element, 0.5, { left: startPoint }, {left: 0, onComplete: done });
                }
                else {
                    done();
                }
            }
        };
    }

    var module = angular.module('gallery', []);
    module.directive('myGallery', galleryDirective);
    module.directive('modal', function(){return {restrict: 'E', templateUrl: 'app/modules/gallery/views/directives/modal.html'}});
    module.directive('searchbox', function(){return {restrict: 'E', templateUrl: 'app/modules/gallery/views/directives/searchbox.html'}});
    module.directive('pagination', function(){return {restrict: 'E', templateUrl: 'app/modules/gallery/views/directives/pagination.html'}});
    module.directive('sorting', function(){return {restrict: 'E', templateUrl: 'app/modules/gallery/views/directives/sorting.html'}});
    module.directive('galleryImage', galleryImageDirective);
    module.service('galleryService', galleryService);
    module.service('sessionStorage', sessionStorageService);
    module.filter('parseDateStrFilter', parseDateStrFilter);
})();