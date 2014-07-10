define(["dojo/dom","dijit/registry", "modules/HashController", "esri/urlUtils",
    "views/map/MapConfig", "modules/EventsController", "views/blog/BlogModel",  "dojo/Deferred", "dojo/_base/array"],
    function(dom, registry, HashController, urlUtils, MapConfig, EventsController, BlogModel, Deferred, array) {

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

                var feed = o.loadFeed(esri.config.defaults.io.proxyUrl);

                feed.then(function (res) {

                    var model = JSON.parse(res);

                    o.addPosts(model);

                    dom.byId(viewId).innerHTML = html;
                    EventsController.switchToView(viewObj);
                    BlogModel.applyBindings(viewId);

                }, function (error) {
                    console.log('There was an error in binding');

                });
            });

        },

        o.loadFeed = function(proxyUrl) {
            var deffered = new Deferred();

            require(["views/blog/BlogLoader"], function (BlogLoader) {

                var loader = BlogLoader.load_feed(proxyUrl);

                loader.then(function (res) {
                    deffered.resolve(res);
                }, function (err) {
                    console.dir('error');
                });


            });

            return deffered.promise;
        };

        o.addPosts = function (Posts) {
            // add arrays
            console.log(Posts)
            Posts['articles'].forEach(function (item) {
                item.getAuthors = function () {
                    var authors = this.author.split(",");

                    var result = [];
                    /**
                     *  We are currently in a blog post. We want to add a function that will
                     *  return all the authors in a nice array for us to print out to the view.
                     */
                    array.forEach(authors, function (item, index) {

                        /**
                         * Iterate over the authors that we now have in an array.
                         * The if statement correspond to the following rules:
                         * 1. if it is the first item in the array, take out the by
                         *    line and add it as two separate eateries into the array.
                         * 2. If there are only one author in the array, we have to everything in one go.
                         *    Separate the by line, and the date.
                         * 3. if we are -2 index away from the array, the last index holds the date and
                         *    current index holds the first half of the date. Separate the two things out and
                         *    add as two separate entities
                         * 4. do nothing
                         * 5. Just remove the empty white space and add the value to the array.
                         * */

                        if ( index == 0 && authors.length != 2 )
                        { // remove by from the author and add the author to the list
                            result.push("by");
                            result.push(item.substring(3,item.length));
                        }
                        else if ( authors.length == 2 && index == 0 )
                        {
                            var a = item.split("-");

                            result.push("by");
                            result.push(a[0].substring(3,item.length));
                            result.push(a[1].trim() + authors[index+1]);

                        }
                        else if ( index == authors.length-2)
                        { // seperate the n-2 index of the array and make it 3, and concat the string.
                            var a = authors[index].split("and");
                            // the first item in the set is fine
                            result.push(a[0].trim());
                            result.push("and");

                            // more logic
                            var b = a[1].split("-")
                            result.push(b[0].trim())
                            result.push(b[1]+authors[index+1]);
                        }
                        else if ( index == authors.length-1)
                        {
                            // do nothing
                        }
                        else
                        {
                            result.push(item.trim());
                        }
                    })
                    return result;
                };
            });

            BlogModel.vm.blogPost.push(Posts);


        }



        //listen to key

        //trigger event 

        return o;


    });