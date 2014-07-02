define(["dojo/dom", "dijit/registry", "modules/HashController", "modules/EventsController", "views/blog/BlogModel"],
    function(dom, registry, HashController, EventsController, BlogModel) {

        var o = {};
        var initialized = false;
        var viewId = "blogView";
        var viewObj = {
            viewId: viewId,
            viewName: "blog"
        };
        o.init = function() {
            var that = this;

            if (initialized) {
                //switch to this view
                EventsController.switchToView(viewObj);

                return;
            }

            initialized = true;

            //"dojo/text!//www.wri.org/blog-tags/8705"
            require(["dojo/text!views/blog/blog.html"], function(html) {


                that.loadFeed();

                dom.byId(viewId).innerHTML = html;


                EventsController.switchToView(viewObj);

                BlogModel.applyBindings(viewId);


            });

        },

        o.loadFeed = function(data) {
            console.log("loadFeed");


        };

        //listen to key

        //trigger event 

        return o;


    });