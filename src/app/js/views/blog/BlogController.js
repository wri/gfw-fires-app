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
                    var completed = false;
                    authors[authors.length-2] = authors[authors.length-2]+authors[authors.length-1];
                    authors.pop();

                    /**
                     *  We are currently in a blog post. We want to add a function that will
                     *  return all the authors in a nice array for us to print out to the view.
                     */
                    array.forEach(authors, function (item, index) {

                        try
                        {
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
                            if (!completed) {
                                if (item.match('by') !== null) {
                                    var author = item.split('by');
                                    result.push('by');
                                    result.push(author[1].trim());
                                } else if (item.match('and') !== null &&
                                           item.match('-') !== null) {                                    
                                    // split item
                                    var tempAuthors = item.split('and');
                                    array.forEach(tempAuthors, function (item) {
                                        if (item.match('-') === null) {
                                            result.push(item.trim());
                                        } else {
                                            var lastAuthorAndDate = item.split('-');
                                            result.push('and');
                                            result.push(lastAuthorAndDate[0].trim());
                                            result.push(lastAuthorAndDate[1].trim());
                                            completed = true;
                                        };
                                    })
                                } else if (item.match('and') !== null) {
                                    var tempAuthors = item.split('and');
                                    result.push(tempAuthors[0].trim());
                                    result.push('and');
                                    result.push(tempAuthors[1].trim());
                                } else if (item.match('-') !== null) {
                                    var lastAuthorAndDate = item.split('-');
                                    result.push(lastAuthorAndDate[0].trim());
                                    result.push(lastAuthorAndDate[1].trim());
                                    completed = true;
                                } else {
                                    result.push(item.trim());
                                } 
                            };
                            
                        } catch (e) {
                            console.log(e);
                        }


                    })
                    // console.dir(result);
                    return result;
                };
            });

            BlogModel.vm.blogPost.push(Posts);


        }



        //listen to key

        //trigger event 

        return o;


    });