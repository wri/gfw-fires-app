define(["esri/request"],
    function(esriRequest) {

        var o = {};

        o.init = function() {

        };

        //listen to key

        //trigger event 
        o.load_feed = function() {
            var url = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=200&q=http://feeds.feedburner.com/WRI_News_and_Views";
        };


        return o;


    });