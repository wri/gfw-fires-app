define(["dojo/on", "dojo/dom", "dojo/dom-class", "dojo/query", "dijit/registry", "modules/HashController", "modules/EventsController", "views/data/DataModel", "dojo/_base/array"],
    function(on, dom, domClass, dojoQuery, registry, HashController, EventsController, DataModel, arrayUtil) {

        var o = {};
        var initialized = false;
        var viewId = "dataView";
        var handles = [];
        var viewObj = {
            viewId: viewId,
            viewName: "data"
        };
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
                dom.byId(viewId).innerHTML = html;
                EventsController.switchToView(viewObj);
                DataModel.applyBindings(viewId);
            });
        };

        o.toggleDataNavList = function(obj) {
            console.log(obj)
            var htmlToFetch = obj.htmlContent;
            var datamodel = DataModel.getVM();
            console.log(datamodel)
            // var vm = Model.getVM();
            var currentLanguage = "en";
            var leftLinks = datamodel.leftLinks();
            var self = this;
            datamodel.leftLinks([]);
            arrayUtil.forEach(leftLinks, function(ds) {
                console.log(ds)
                if (ds == obj) {
                    ds.selected = true;
                } else {
                    ds.selected = false;
                }
            });

            datamodel.leftLinks(leftLinks);
            self.reportAnalyticsHelper('view', 'content', 'The user viewed the ' + self.toTitleCase(obj.name) + ' content on the Data page.');

            require(["dojo/text!views/data/templates/" + htmlToFetch + ".htm"], function(content) {
                datamodel.htmlContent(content);
                if (obj.name === "FOREST USE") {
                    self.bindEvents();
                } else {
                    self.disconnectEvents();
                }
            });

        };

        o.bindEvents = function() {
            var self = this;
            handles.push(on(dom.byId("woodFiberDropdown"), "click", function() {
                self.toggleSelect("woodFiberDropdown");
            }));

            handles.push(on(dom.byId("oilPalmDropdown"), "click", function() {
                self.toggleSelect("oilPalmDropdown");
            }));

            handles.push(on(dom.byId("loggingDropdown"), "click", function() {
                self.toggleSelect("loggingDropdown");
            }));

            dojoQuery(".source_download_links a").forEach(function(anchor) {
                handles.push(
                    on(anchor, "click", self.showDownloadOptions)
                );
            });
        };

        o.disconnectEvents = function() {
            arrayUtil.forEach(handles, function(handle) {
                handle.remove();
            });
        };

        o.showDownloadOptions = function(evt) {
            console.log(evt)
            var target = evt.target ? evt.target : evt.srcElement,
                id = target.dataset ? target.dataset.slug : target.getAttribute("data-slug"),
                titleId = target.dataset ? target.dataset.container + "Title" : target.getAttribute("data-container") + "Title";

            dojoQuery(".source_dropdown .active").forEach(function(node) {
                if (!domClass.contains(node, "source_dropdown_menu")) {
                    domClass.remove(node, "active");
                }
            });

            domClass.add(id, "active");
            dom.byId(titleId).innerHTML = target.innerHTML;
        };

        o.toggleSelect = function(id) {
            
            if (domClass.contains(id + "Menu", "active")) {
                dojoQuery(".source_dropdown .active").forEach(function(node) {
                    domClass.remove(node, "active");
                });
                dom.byId(id + "Title").innerHTML = "Select a country";
            } else {
                domClass.add(id + "Menu", "active");
            }
        };

        o.toTitleCase = function(str) {
            return str.replace(/\w*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        };

        o.reportAnalyticsHelper = function(eventType, action, label) {
            ga('A.send', 'event', eventType, action, label);
            ga('B.send', 'event', eventType, action, label);
            ga('C.send', 'event', eventType, action, label);
        };

        return o;

    });