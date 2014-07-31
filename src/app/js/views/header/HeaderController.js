define(["dojo/dom", "dijit/registry", "modules/HashController", "dojo/_base/array", "dojo/dom-construct", "dojo/dom-class", "dojo/aspect","dojo/on"],
    function(dom, registry, HashController, arrayUtil, domConstruct, domClass, aspect, on) {

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

                // Add Listener to go home if logo is clicked
                on(dom.byId("logo"), "click", function () {
                    var mock = {
                        domId: "homeView",
                        html: "Home",
                        selected: true,
                        viewId: "homeView",
                        viewName: "home"
                    };
                    that.clickNavLink(mock);
                });

                // Load in Google Translate
                (function(d, s) {
                    var gt = d.createElement(s),
                        as = d.getElementsByTagName(s)[0];

                    gt.type = 'text/javascript';
                    gt.async = true;
                    gt.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
                    as.parentNode.insertBefore(gt, as);
                })(document, 'script');

            });
        };


        o.dataLoaded = function(data) {

        };

        o.clickNavLink = function(data) {
            var clickedItem = data;

            this.reportAnalyticsHelper('link', 'navigate', 'The user navigated to the ' + clickedItem.html + ' page.');

            if (clickedItem.url) {
                window.open(clickedItem.url, "_blank");
                return;
            }

            var updateHash = {
                v: clickedItem.viewName
            };

            HashController.updateHash(updateHash);

        };

        o.switchToView = function(data) {
            require(["dijit/registry", "views/header/HeaderModel", "views/home/HomeController", "modules/EventsController"],
                function(registry, HeaderModel, HomeController, EventsController) {
                    //alert(data.viewName);
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

                    /*aspect.after(registry.byId("stackContainer"), "selectChild", function() {
                        //registry.byId("stackContainer").selectedChildWidget.id;
                        registry.byId("stackContainer").resize();
                        switch (data.viewId) {
                            case "homeView":
                                //domConstruct.place("");
                                domConstruct.place("footerMovableWrapper", "footerShareContainer");
                                setTimeout(function() {


                                }, 1000);
                                // EventsController.startModeAnim();
                                break;

                            default:

                                domConstruct.place("footerMovableWrapper", data.viewId);
                                EventsController.stopModeAnim();
                        }
                        console.log("MOVED FOOTER");
                        //debugger;

                    })*/
                    switch (data.viewId) {
                        case "homeView":
                            //domConstruct.place("");
                            setTimeout(function() {

                                domConstruct.place("footerMovableWrapper", "footerShareContainer");

                            }, 1000);
                            // EventsController.startModeAnim();
                            break;

                        default:
                            //EventsController.stopModeAnim();
                            domConstruct.place("footerMovableWrapper", data.viewId);
                    }

                    registry.byId("stackContainer").selectChild(data.viewId);
                    registry.byId("stackContainer").resize();
                });

        };

        o.reportAnalyticsHelper = function (eventType, action, label) {
            ga('A.send', 'event', eventType, action, label);
            ga('B.send', 'event', eventType, action, label);
        };

        //listen to key

        //trigger event 



        return o;


    });