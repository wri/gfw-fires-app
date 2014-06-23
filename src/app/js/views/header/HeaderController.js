define(["dojo/dom", "dijit/registry", "modules/HashController", "modules/EventsController"],
    function(dom, registry, HashController, EventsController) {

        var o = {};
        var initialized = false;
        var viewName = "app-header";

        o.init = function() {
            var that = this;
            if (initialized) {
                //switch to this view
                HashController.switchToView(viewName);

                return;
            }

            initialized = true;
            //otherwise load the view
            require(["dojo/text!views/header/header.html", "views/header/HeaderModel"], function(html, HeaderModel) {

                dom.byId(viewName).innerHTML = html;



                HeaderModel.applyBindings(viewName);



            });
        };


        o.dataLoaded = function(data) {
            console.log("events test");
        };

        o.clickNavLink = function(data) {
            var clickedItem = data;

            var updateHash = {
                v: clickedItem.viewId
            };
            HashController.updateHash(updateHash);

        };

        o.switchToView = function(data) {
            alert(data.viewName);
            require(["dijit/registry"], function(registry) {
                registry.byId("stackContainer").selectChild(data.viewName);
            });

        };



        //listen to key

        //trigger event 



        return o;


    });