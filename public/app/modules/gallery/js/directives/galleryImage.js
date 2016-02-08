'use strict';

app.directive('galleryImage', ['galleryService', '$timeout', function (galleryService, $timeout) {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            var config = galleryService.getConfigData();
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
        },
        templateUrl: 'app/modules/gallery/views/directives/galleryImage.html'
    };
}]);