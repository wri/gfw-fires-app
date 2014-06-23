define(["dojo/dom", "dijit/registry", "modules/HashController", "modules/EventsController"],
    function(dom, registry, HashController, EventsController) {

        var o = {};
        var initialized = false;
        var viewName = "homeView";
        var viewObj = {
            viewName: "homeView"
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
            require(["dojo/text!views/home/home.html", "views/home/HomeModel"], function(html, HomeModel) {

                dom.byId(viewName).innerHTML = html;


                EventsController.switchToView(viewObj);

                EventsController.startModeAnim();

                HomeModel.applyBindings(viewName);

            })
        }

        o.startModeAnim = function(data) {
            console.log("start mode animation");
        };

        o.stopModeAnmin = function(data) {
            console.log("stop mode animation");
        };


        //listen to key

        //trigger event 



        return o;


    });