define(["dojo/dom", "dijit/registry", "modules/HashController", "dojo/_base/array", "dojo/dom-construct", "dojo/dom-class"],
    function(dom, registry, HashController, arrayUtil, domConstruct, domClass) {

        var o = {};
        var initialized = false;
        var viewId = "app-header";

        o.init = function() {
            var that = this;
            if (initialized) {
                //switch to this view
                //HashController.switchToView(viewName);

                return;
            }

            initialized = true;
            //otherwise load the view
            require(["dojo/text!views/header/header.html", "views/header/HeaderModel"], function(html, HeaderModel) {

                dom.byId(viewId).innerHTML = html;

                HeaderModel.applyBindings(viewId);



            });
        };


        o.dataLoaded = function(data) {

        };

        o.clickNavLink = function(data) {
            var clickedItem = data;

            if (clickedItem.url) {
                window.open(clickedItem.url, "_blank")
                return;
            }

            var updateHash = {
                v: clickedItem.viewId
            };
            HashController.updateHash(updateHash);

        };

        o.switchToView = function(data) {
            require(["dijit/registry", "views/header/HeaderModel", "views/home/HomeController", "modules/EventsController"],
                function(registry, HeaderModel, HomeController, EventsController) {
                    //alert(data.viewName);
                    console.log(data);

                    //select the 
                    var navigationLinks = HeaderModel.vm.navigationLinks();
                    HeaderModel.vm.navigationLinks([]);
                    var updatedNavigationLinks = arrayUtil.map(navigationLinks, function(nLink) {
                        if (data.viewId.toLowerCase() === nLink.domId.toLowerCase()) {
                            nLink.selected = true;
                        } else {
                            nLink.selected = false;
                        }
                        return nLink;
                    });
                    HeaderModel.vm.navigationLinks(updatedNavigationLinks);
                    /*if (data.viewName.toLowerCase() == "homeview" && HomeController.isInitialized()) {
                    EventsController.startModeAnim();
                }

                if (data.viewName.toLowerCase() != "homeview" && HomeController.isInitialized()) {
                    EventsController.stopModeAnim();
                }*/

                    var allViews = "mapView homeView blogView dataView aboutView";
                    domClass.remove("app-body", allViews);
                    domClass.add("app-body", data.viewId);
                    domClass.remove("app-header", allViews);
                    domClass.add("app-header", data.viewId);

                    switch (data.viewId) {
                        case "homeView":
                            //domConstruct.place("");
                            setTimeout(function() {

                                domConstruct.place("footerMovableWrapper", "footerShareContainer");

                            }, 1000);
                            // EventsController.startModeAnim();
                            break;

                        default:
                            //domConstruct.place("footerMovableWrapper", data.viewId);
                            EventsController.stopModeAnim();
                    }
                    console.log("MOVED FOOTER");

                    registry.byId("stackContainer").selectChild(data.viewId);
                    registry.byId("stackContainer").resize();
                });

        };



        //listen to key

        //trigger event 



        return o;


    });