app.directive('myGallery', ['galleryService', function (galleryService) {
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
        templateUrl: function (tElement, tAttrs) {
            return tAttrs.path.replace(/'/g, '') + "views/gallery.html";
        }
    };
}]);