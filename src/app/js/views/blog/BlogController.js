define(["dojo/dom", "dijit/registry", "modules/HashController","modules/EventsController","dojo/text!http://www.wri.org/blog-tags/8705"],
    function(dom, registry, HashController, EventsController, Blog) {

        var o = {};
        var initialized = false;
        var viewName = "homeView";
        o.init = function() {
            var that = this;
            that.getHtml();
            if (initialized) {
                //switch to this view
                HashController.switchToView(viewName);

                return;
            }

            initialized = true;
            //otherwise load the view
            require(["dojo/text!views/blog/blog.html", "views/blog/BlogModel"], function(html, BlogModel) {

                EventsController.getHtml({});
                dom.byId(viewName).innerHTML = html;

                HashController.switchToView(viewName);
                BlogModel.applyBindings(viewName);
                

            });

        },

        o.getHtml = function(data){
            console.log(Blog);
        }

        //listen to key

        //trigger event 

        return o;


    });