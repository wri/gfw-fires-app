define(["dojo/dom", "dijit/registry", "modules/HashController", "modules/EventsController"],
    function(dom, registry, HashController, EventsController) {

        var o = {};
        var initialized = false;
        var viewName = "mapView";
        var viewObj = {
            viewName: "mapView"
        }
        o.init = function() {
            var that = this;
            if (initialized) {
                //switch to this view
                EventsController.switchToView(viewObj);

                return;
            }

            initialized = true;
            //otherwise load the view
            require(["dojo/text!views/home/home.html"], function(html) {

                dom.byId(viewName).innerHTML = html;


                EventsController.switchToView(viewObj);
            })
        }



        //listen to key

        //trigger event 



        return o;


    });