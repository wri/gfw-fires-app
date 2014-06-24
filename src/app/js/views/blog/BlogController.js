define(["dojo/dom", "dijit/registry", "modules/HashController", "modules/EventsController"],
    function(dom, registry, HashController, EventsController) {

        var o = {};
        var initialized = false;
        var viewName = "blogView";
        o.init = function(viewObj) {
            var that = this;
            that.getHtml();
            if (initialized) {
                //switch to this view
                HashController.switchToView(viewName);

                return;
            }

            initialized = true;
            //otherwise load the view
            textPluginHeaders = {
                "X-Requested-With": null
            };
            require(["dojo/text!views/blog/blog.html", "views/blog/BlogModel", "dojo/text!//www.wri.org/blog-tags/8705"], function(html, BlogModel, Blog) {

                EventsController.getHtml({});
                dom.byId(viewName).innerHTML = html;
                console.log(Blog);

                HashController.switchToView(viewName);
                BlogModel.applyBindings(viewName);


            });

        },

        o.getHtml = function(data) {
            console.log("getHtml() <<<<<<<<<<<<<<<<<<");
            require(["dojo/request/xhr"], function(xhr) {
                xhr("http://www.wri.org/blog-tags/8705", {}).then(function(data) {
                    // Do something with the handled data
                    console.log(data);
                }, function(err) {
                    // Handle the error condition
                }, function(evt) {
                    // Handle a progress event from the request if the
                    // browser supports XHR2
                });
            });
        }

        //listen to key

        //trigger event 

        return o;


    });