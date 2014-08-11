define(["esri/request", 'dojo/io/script', 'dojo/request/xhr', "dojo/Deferred"],
    function(esriRequest, io, xhr, Deferred) {

        var o = {};

        o.init = function() {

        };

        //listen to key
        //trigger event
        o.load_feed = function(proxyUrl) {
            var deffered = new Deferred();

            var url = "http://gis-potico.wri.org/blogs/fireblog.txt";

            var request = esriRequest({
                url: url,
                handleAs: 'text'
            }, {useProxy: true, usePost: true});

            request.then(function (res) {
                o.response = res;
                deffered.resolve(res);
            });

            return deffered.promise;
        };


        return o;
    }
);