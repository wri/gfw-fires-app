define(["dojo/dom", "dojo/on", "dijit/registry", "modules/HashController", "modules/EventsController", "views/story/StoryModel", "dojo/_base/array", "esri/map", "esri/dijit/BasemapGallery", "dijit/layout/ContentPane", "dijit/TitlePane", "esri/layers/FeatureLayer", "esri/InfoTemplate"],
    function(dom, on, registry, HashController, EventsController, StoryModel, arrayUtil, Map, BasemapGallery, ContentPane, TitlePane, FeatureLayer, InfoTemplate) {

        var o = {};
        var initialized = false;
        var viewId = "storyView";
        var viewObj = {
            viewId: viewId,
            viewName: "story"
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
            require(["dojo/text!views/story/story.html"], function(html) {

                dom.byId(viewId).innerHTML = html;
                o.createMap();

                EventsController.switchToView(viewObj);
                StoryModel.applyBindings(viewId);

            })
        };

        o.createMap = function() {
            var self = this;

            o.map = new Map("storiesMap", {
                zoom: 4,
                basemap: "satellite",
                minZoom: 3,
                maxZoom: 18,
                center: [115, 0],
                //sliderPosition: MapConfig.mapOptions.sliderPosition
            });

            /*var tp = new TitlePane({
                title: 'Switch Basemap',
                open: 'false',
                content: '<div id="basemapGallery"></div>'
            });
            debugger;
            tp.startup();
            tp.resize(50, 50);
            dom.byId("TitlePane").appendChild(tp.domNode);
            */



            var basemapGallery = new BasemapGallery({
                showArcGISBasemaps: true,
                map: o.map
            }, "basemapGallery");

            //basemapGallery.startup();

            // basemapGallery.on("error", function(msg) {
            //     console.log("basemap gallery error:  ", msg);
            // });

            o.map.on("load", function() {
                // Clear out default Esri Graphic at 0,0, dont know why its even there
                //o.map.graphics.clear();

                // Finder.setMap(o.map);
                // self.addWidgets();
                // self.bindEvents();
                // self.addLayers();
                var infoTemplate = new InfoTemplate("Attributes", "${*}");
                var storiesLayer = new FeatureLayer("http://gis-potico.wri.org/arcgis/rest/services/Fires/fire_stories/FeatureServer/0?token=zUZRyzIlgOwnnBIAdoE5CrgOjZZqr8N3kBjMlJ6ifDM7Qm1qXHmiJ6axkFWndUs2");
                storiesLayer.setInfoTemplate(infoTemplate);
                //debugger;

                // Hack to get the correct extent set on load, this can be removed
                // when the hash controller workflow is corrected
                on.once(o.map, "update-end", function() {
                    o.map.addLayer(storiesLayer);
                });
            });
        };

        o.toggleStoryNavList = function(obj) {
            var htmlToFetch = obj.htmlContent;
            var storymodel = StoryModel.getVM();
            // var vm = Model.getVM();
            var currentLanguage = "en";
            var leftLinks = storymodel.leftLinks();
            storymodel.leftLinks([]);
            arrayUtil.forEach(leftLinks, function(ds) {
                if (ds == obj) {
                    ds.selected = true;
                } else {
                    ds.selected = false;
                }
            });

            storymodel.leftLinks(leftLinks);
            //datamodel.leftLinks(leftLinks);
            this.reportAnalyticsHelper('view', 'content', 'The user viewed the ' + this.toTitleCase(obj.name) + ' content on the Data page.');

            require(["dojo/text!views/story/templates/" + htmlToFetch + ".htm"], function(content) {
                storymodel.htmlContent(content);
            });

        };

        o.toTitleCase = function(str) {
            return str.replace(/\w*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        };

        o.reportAnalyticsHelper = function(eventType, action, label) {
            ga('A.send', 'event', eventType, action, label);
            ga('B.send', 'event', eventType, action, label);
        };


        //listen to key

        //trigger event 



        return o;


    });