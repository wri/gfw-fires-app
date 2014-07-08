define(["dojo/dom","dijit/registry", "modules/HashController", "esri/urlUtils",
    "views/map/MapConfig", "modules/EventsController", "views/blog/BlogModel",  "dojo/Deferred"],
    function(dom, registry, HashController, urlUtils, MapConfig, EventsController, BlogModel, Deferred) {

        var o = {};
        var initialized = false;
        var viewId = "blogView";
        var viewObj = {
            viewId: viewId,
            viewName: "blog"
        };

        o.addConfigurations = function() {

            // http://gis-potico.wri.org/blogs/fireblog.txt

            var proxies = MapConfig.proxies;

            var url = document.location.href;
            var proxyUrl = "/proxy/proxy.ashx";

            for (var domain in proxies) {

                if (url.indexOf(domain) === 0) {
                    proxyUrl = proxies[domain];
                }
            }

            esri.config.defaults.io.proxyUrl = proxyUrl;

            /*urlUtils.addProxyRule({
                urlPrefix: "http://gis-potico.wri.org/blogs/fireblog.txt",
                proxyUrl: proxyUrl
            });*/

        };


        o.init = function() {

            o.addConfigurations();


            var that = this;

            if (initialized) {
                //switch to this view
                EventsController.switchToView(viewObj);

                return;
            }

            initialized = true;

            //"dojo/text!//www.wri.org/blog-tags/8705"
            require(["dojo/text!views/blog/blog.html"], function(html) {


                var feed = o.loadFeed("");

                feed.then(function (res) {

                    var model = JSON.parse(res);

                    BlogModel.addPosts(model);

                    dom.byId(viewId).innerHTML = html;
                    EventsController.switchToView(viewObj);
                    BlogModel.applyBindings(viewId);

                }, function (error) {
                    console.log('There was an error in binding');

                });
            });

        },

        o.loadFeed = function(data) {
            var deffered = new Deferred();

            require(["views/blog/BlogLoader",], function (BlogLoader, Deferred) {

                var loader = BlogLoader.load_feed()

                loader.then(function (res) {
                    deffered.resolve(res);
                }, function (err) {
                    console.dir('error');
                });


            });

            return deffered.promise;
        };

        //listen to key

        //trigger event 

        return o;


    });