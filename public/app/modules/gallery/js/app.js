'use strict';

var app = angular.module('gallery', []);

app.directive('modal', function(){return {restrict: 'E', templateUrl: 'app/modules/gallery/views/directives/modal.html'}});
app.directive('pageResults', function(){return {restrict: 'E', templateUrl: 'app/modules/gallery/views/directives/pageResults.html'}});
app.directive('searchbox', function(){return {restrict: 'E', templateUrl: 'app/modules/gallery/views/directives/searchbox.html'}});
app.directive('sorting', function(){return {restrict: 'E', templateUrl: 'app/modules/gallery/views/directives/sorting.html'}});
app.directive('pagination', function(){return {restrict: 'E', templateUrl: 'app/modules/gallery/views/directives/pagination.html'}});

app.filter('parseDateStrFilter', function () {
    return function (input) {
        if (input == null) {
            return "";
        }
        return new Date(input);
    };
});


var _range = function (start, end) {
    var myArray = [];
    for (var i = start; i <= end; i += 1) {
        myArray.push(i);
    }
    return myArray;
};
