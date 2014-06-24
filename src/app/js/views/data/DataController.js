define(["dojo/dom", "dijit/registry", "modules/HashController", "modules/EventsController", "views/data/DataModel"],
    function(dom, registry, HashController, EventsController, DataModel) {

        var o = {};
        var initialized = false;
        var viewName = "dataView";
        var viewObj = {
            viewName: viewName
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
            require(["dojo/text!views/data/data.html"], function(html) {

                dom.byId(viewName).innerHTML = html;


                EventsController.switchToView(viewObj);


                DataModel.applyBindings(viewName);
            })
        }



        //listen to key

        //trigger event 



        return o;


    });