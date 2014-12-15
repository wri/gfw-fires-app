define(["dojo/dom", "dojo/on", "dojo/dom", "dijit/registry", "modules/HashController", "modules/EventsController", "views/story/StoryModel", "dojo/_base/array", "esri/map", "esri/toolbars/edit", "esri/dijit/BasemapGallery", "esri/toolbars/draw", "esri/graphic", "esri/Color", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "dijit/layout/ContentPane", "dijit/TitlePane", "esri/layers/FeatureLayer", "esri/InfoTemplate", "esri/geometry/webMercatorUtils", ],
    function(dom, on, dom, registry, HashController, EventsController, StoryModel, arrayUtil, Map, Edit, BasemapGallery, Draw, Graphic, Color, SimpleMarkerSymbol, PictureMarkerSymbol, ContentPane, TitlePane, FeatureLayer, InfoTemplate, webMercatorUtils) {

        var o = {};
        var initialized = false;
        var viewId = "storyView";
        var viewObj = {
            viewId: viewId,
            viewName: "story"
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
            require(["dojo/text!views/story/story.html"], function(html) {

                dom.byId(viewId).innerHTML = html;
                o.createMap();

                EventsController.switchToView(viewObj);
                StoryModel.applyBindings(viewId);

            });
            // $("#addPoint").click(function(event) {
            //     event.preventDefault(); // cancel default behavior

            //     //... rest of add logic
            // });
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
            o.map.setInfoWindowOnClick(true);
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
                o.initToolbar();

                // Finder.setMap(o.map);
                // self.addWidgets();
                // self.bindEvents();
                // self.addLayers();
                var infoTemplate = new InfoTemplate("Attributes", "${*}");
                var storiesLayer = new FeatureLayer("http://gis-potico.wri.org/arcgis/rest/services/Fires/fire_stories/FeatureServer/0?token=zUZRyzIlgOwnnBIAdoE5CrgOjZZqr8N3kBjMlJ6ifDM7Qm1qXHmiJ6axkFWndUs2");
                storiesLayer.setInfoTemplate(infoTemplate);

                on.once(o.map, "update-end", function() {
                    o.map.addLayer(storiesLayer);
                });
            });
        };

        o.initToolbar = function() {
            tb = new Draw(o.map);
            tb.on("draw-end", o.addGraphic);

            // event delegation so a click handler is not
            // needed for each individual button
            on(dom.byId("addPoint"), "click", function(evt) {

                tool = "point";
                o.map.disableMapNavigation();
                tb.activate(tool);
            });
        }


        o.addGraphic = function(evt) {
            o.map.graphics.clear();
            var pictureMarkerSymbol = new PictureMarkerSymbol('app/images/RedStickpin.png', 32, 32);
            tb.deactivate();
            o.map.enableMapNavigation();

            var graphic = new Graphic(evt.geometry, pictureMarkerSymbol);

            var title = dom.byId("storyTitleInput");
            if (title.value) {
                title = title.value;
            } else {
                title = title.placeholder;
            }

            var infoTemplate = new InfoTemplate(title);

            var originalPoint = webMercatorUtils.xyToLngLat(evt.geometry.x, evt.geometry.y);
            var originalPointLat = originalPoint[0].toFixed(3);
            var originalPointLng = originalPoint[1].toFixed(3);

            infoTemplate.setContent("<tr><b>Lat:</b> <td>" + originalPointLat + "<br></tr></td> <tr><b>Lat:</b> <td>" + originalPointLng + "</tr></td>"); //titled the user's Story Title
            //STATENAEME will be graphic.x value or something
            // dojo.connect(o.map.graphics, "onMouseMove", function(evt) {
            //     //var g = evt.graphic;
            //     //debugger;
            //     o.map.infoWindow.setContent("<tr><b>Lat:</b> <td>" + originalPointLat + "<br></tr></td> <tr><b>Lat:</b> <td>" + originalPointLng + "</tr></td>");
            //     o.map.infoWindow.setTitle(title);


            //     //o.map.graphics.disableMouseEvents();
            //     //Allow mouse events again once the mouse moves
            //     //dojo.connect(o.map, "onMouseMove", o.map.graphics, o.map.graphics.enableMouseEvents());
            //     //o.map.infoWindow.show(evt.screenPoint, o.map.getInfoWindowAnchor(evt.screenPoint));

            //     o.map.infoWindow.show(evt.screenPoint, o.map.getInfoWindowAnchor(evt.screenPoint));
            // });
            // dojo.connect(o.map.graphics, "onMouseOut", function() {
            //     o.map.infoWindow.hide();
            // });

            graphic.setInfoTemplate(infoTemplate); // will be populated with whatever fields the user has filled out so far
            o.map.graphics.add(graphic);


            var dojoShape = graphic.getDojoShape();
            var moveable = new dojox.gfx.Moveable(dojoShape);

            var moveStopToken = dojo.connect(moveable, "onMoveStop", function(mover) {
                // Get the transformation that was applied to the shape since the last move  
                var tx = dojoShape.getTransform();

                var startPoint = graphic.geometry;
                var endPoint = o.map.toMap(o.map.toScreen(startPoint).offset(tx.dx, tx.dy));

                // clear out the transformation  
                dojoShape.setTransform(null);

                var endPoint2 = webMercatorUtils.xyToLngLat(endPoint.x, endPoint.y);
                var endPointLat = endPoint2[0].toFixed(3);
                var endPointLng = endPoint2[1].toFixed(3);
                // update the graphic geometry

                console.log(endPoint);

                console.log(endPoint2);
                graphic.setGeometry(endPoint);
                infoTemplate.setContent("<tr>Lat: <td>" + endPointLat + "<br></tr></td> <tr>Lat: <td>" + endPointLng + "</tr></td>");

                // You can find quite a bit of information about  
                // applying transformations to Dojo gfx shapes in this  
                // document:  
                // http://docs.dojocampus.org/dojox/gfx#coordinates-and-transformations  
            });

            // dojo.connect(o.map.graphics, "onMouseDown", o.holdGraphic);
            // dojo.connect(o.map, "onMouseDragEnd", o.releaseGraphic);
            //o.initEditing();
        };



        o.initEditing = function() {
            var graphicLayers = o.map.getLayersVisibleAtScale();
            var affectedArea = graphicLayers[1];

            var editToolbar = new Edit(o.map);
            editToolbar.on("deactivate", function(evt) {
                if (evt.info.isModified) {
                    affectedArea.applyEdits(null, [evt.graphic], null);
                }
            });
            debugger;
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

        // o.formatSubmission = function() {

        // }
        $("#storyMediaInput").on('dragenter', function(e) {
            console.log("sdgf");
            // e.stopPropagation();
            // e.preventDefault();
            if (event.target === this) {
                console.log('dragenter');
            } else {
                console.log(event.target);
            }
            var par = $(this).parent();
            $(par).css('background-color', 'orange');
        });

        return o;


    });