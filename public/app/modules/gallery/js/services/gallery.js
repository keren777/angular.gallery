app.factory('galleryService', function ($q, $http) {
    var service = this;

    return {
        init: function (setConfig) {
            service.config = setConfig;
        },
        getConfigData: function () {
            return service.config;
        },

        getData: function (url) {
            var d = $q.defer();
            $http.get(url, {headers: {'Content-type': 'application/json'}})
                .success(function (data) {
                    d.resolve(data);
                })
                .error(function (error) {
                    d.reject(error);
                });
            return d.promise;
        }
    }
});