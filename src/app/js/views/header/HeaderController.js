define(["dojo/dom", "dijit/registry", "modules/HashController", "modules/EventsController", "dojo/_base/array", "dojo/dom-construct", "dojo/dom-class"],
    function(dom, registry, HashController, EventsController, arrayUtil, domConstruct, domClass) {

        var o = {};
        var initialized = false;
        var viewName = "app-header";

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

                dom.byId(viewName).innerHTML = html;

                HeaderModel.applyBindings(viewName);



            });
        };


        o.dataLoaded = function(data) {

        };

        o.clickNavLink = function(data) {
            var clickedItem = data;

            var updateHash = {
                v: clickedItem.viewId
            };
            HashController.updateHash(updateHash);

        };

        o.switchToView = function(data) {
            require(["dijit/registry", "views/header/HeaderModel", "views/home/HomeController"], function(registry, HeaderModel, HomeController) {
                //alert(data.viewName);
                registry.byId("stackContainer").selectChild(data.viewName);
                //select the 
                var navigationLinks = HeaderModel.vm.navigationLinks();
                HeaderModel.vm.navigationLinks([]);
                var updatedNavigationLinks = arrayUtil.map(navigationLinks, function(nLink) {
                    if (data.viewName.toLowerCase() === nLink.domId.toLowerCase()) {
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

                //alert(data.viewName);
                domClass.remove("app-body", "mapView homeView blogView dataView aboutView");
                domClass.add("app-body", data.viewName)

                switch (data.viewName) {
                    case "homeView":
                        //domConstruct.place("");
                        domConstruct.place("footerMovableWrapper", "footerShareContainer");
                        break;

                    default:
                        domConstruct.place("footerMovableWrapper", data.viewName);
                }

                registry.byId("stackContainer").resize();
            });

        };



        //listen to key

        //trigger event 



        return o;


    });