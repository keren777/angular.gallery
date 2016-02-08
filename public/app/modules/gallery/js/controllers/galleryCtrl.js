'use strict';

app.controller('galleryCtrl', function galleryCtrl($scope, $window, $timeout, $interval, $filter, storage) {
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

    $scope.setPage = function (value) {
        $scope.page = value;
        $scope.searchImage = "";
        $scope.updateElementsRange();
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

    $scope.endInterval = function(){
        $interval.cancel($scope.intervalPromise);
    }

    $scope.openSlideshow = function (image, enableAuto) {
        angular.element('#openImage').modal('show');
        $scope.image = image;
        $scope.openModal = true;
        $scope.direction = 'left';
        $scope.currentIndex = $scope.filteredImages.indexOf(image);

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

        if($scope.slideshow && enableAuto) {
            $scope.intervalPromise = $interval(function () {
                $scope.nextSlide();
            }, $scope.slideshow * 1000);
        }
    };

    $scope.isImageRemoved = function (image) {
        var removedImages = storage.get("removedImages") || [];
        return !(removedImages.indexOf(image.url) == -1);
    };

    $scope.removeImage = function (image) {
        if ($window.confirm("Are you sure to delete image " + image.title + "?")) {
            var removedImages = storage.get("removedImages") || [];
            if (removedImages.indexOf(image.url) == -1) {
                removedImages.push(image.url);
            }
            storage.set("removedImages", removedImages);
        }
    };
});