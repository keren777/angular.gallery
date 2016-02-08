app.factory('storage', function ($window) {
    if (typeof(Storage) !== "undefined") {

        return{
            get: function (key) {
                return JSON.parse($window.sessionStorage.getItem(key) || null);
            },
            set: function (key, value) {
                $window.sessionStorage.setItem(key, JSON.stringify(value));
            },
            remove: function (key) {
                $window.sessionStorage.removeItem(key);
            }
        }
    }
});