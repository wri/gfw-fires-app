define(["dojo/dom", "dojo/on", "dojo/dom", "dojo/dom-style", "dojox/validate/web", "dijit/registry", "modules/HashController", "modules/EventsController", "views/story/StoryModel", "views/story/StoryConfig", "dojo/_base/array", "esri/map", "esri/toolbars/edit", "esri/dijit/BasemapGallery", "esri/toolbars/draw", "esri/graphic", "esri/Color", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "dijit/layout/ContentPane", "dijit/TitlePane", "esri/layers/FeatureLayer", "esri/InfoTemplate", "esri/geometry/webMercatorUtils", ],
    function(dom, on, dom, domStyle, validate, registry, HashController, EventsController, StoryModel, StoryConfig, arrayUtil, Map, Edit, BasemapGallery, Draw, Graphic, Color, SimpleMarkerSymbol, PictureMarkerSymbol, ContentPane, TitlePane, FeatureLayer, InfoTemplate, webMercatorUtils) {

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
            o.StoryConfig = StoryConfig;
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
                center: [115, 0]
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
            // bg = new BasemapGallery({
            //     map: o.map,
            //     basemaps: basemaps,
            //     showArcGISBasemaps: true
            // }, "basemap-gallery");
            // bg.startup();


            var basemapGallery = new BasemapGallery({
                showArcGISBasemaps: true,
                map: o.map
            }, "basemapGallery");

            basemapGallery.startup();

            // basemapGallery.on("error", function(msg) {
            //     console.log("basemap gallery error:  ", msg);
            // });

            o.map.on("load", function() {
                o.initToolbar();
                //o.map.setInfoWindowOnClick(true);
                // var infoTitle = StoryModel.vm.storyTitleData();
                // var infoTemplate = new InfoTemplate(infoTitle, "${*}");

                var storiesLayer = new FeatureLayer(StoryModel.vm.storiesURL + StoryModel.vm.localToken, {
                    id: "storiesLayer",
                    outFields: ["*"]
                    //outFields: ["Title", "Details", "Video", "Name", "Email", "Publish"]
                });
                storiesLayer.setVisibility(false);
                storiesLayer.on("edits-complete", function() {
                    storiesLayer.refresh();
                });
                //var storiesLayer = new FeatureLayer("http://gis-potico.wri.org/arcgis/rest/services/Fires/fire_stories/FeatureServer/0?token=zUZRyzIlgOwnnBIAdoE5CrgOjZZqr8N3kBjMlJ6ifDM7Qm1qXHmiJ6axkFWndUs2");
                //storiesLayer.setInfoTemplate(infoTemplate);

                on.once(o.map, "update-end", function() {
                    o.map.addLayer(storiesLayer);
                });
                //on(dom.byId("basemap-gallery-button2"), "click", o.toggleBasemapGallery);
            });
        };

        o.initToolbar = function() {
            tb = new Draw(o.map);
            tb.on("draw-end", o.addGraphic);

            on(dom.byId("storiesMap"), "mouseover", function(evt) {
                tool = "point";
                //o.map.disableMapNavigation();
                tb.activate(tool);
            });



            // on(dom.byId("storiesMap"), "click", function(evt) {
            //     tool = "point";
            //     o.map.disableMapNavigation();
            //     tb.activate(tool);
            // });

        }


        o.addGraphic = function(evt) {
            o.map.graphics.clear();
            //var pictureMarkerSymbol = new PictureMarkerSymbol('app/images/RedStickpin.png', 32, 32);

            var symbol = new PictureMarkerSymbol({
                "angle": 0,
                "xoffset": 0,
                "yoffset": 10,
                "type": "esriPMS",
                "url": StoryConfig.markerJSONUrl,
                "imageData": StoryConfig.markerJSONImageData,
                "contentType": "image/png",
                "width": 24,
                "height": 24
            });
            tb.deactivate();
            o.map.enableMapNavigation();

            var graphic = new Graphic(evt.geometry, symbol);

            var title = StoryModel.vm.storyTitleData();
            if (!title) {
                title = (dom.byId("storyTitleInput")).placeholder;
            }

            // var infoTemplate = new InfoTemplate(title);

            // var originalPoint = webMercatorUtils.xyToLngLat(evt.geometry.x, evt.geometry.y);
            // var originalPointLat = originalPoint[0].toFixed(3);
            // var originalPointLng = originalPoint[1].toFixed(3);

            // infoTemplate.setContent("<tr><b>Lat:</b> <td>" + originalPointLat + "<br></tr></td> <tr><b>Lat:</b> <td>" + originalPointLng + "</tr></td>");

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

            //graphic.setInfoTemplate(infoTemplate);
            o.map.graphics.add(graphic);
            StoryModel.vm.pointGeom(graphic);
            // StoryModel.vm.storyTitleData.subscribe(function(newValue) {
            //     //var infoTemplate = new InfoTemplate(newValue, "${*}");
            //     //graphic.setInfoTemplate(infoTemplate);
            //     infoTemplate.setTitle(newValue);
            // });
            // StoryModel.vm.storyLocationData.subscribe(function(newValue) {
            //     var newContent = infoTemplate.content;
            //     newContent += "<br><tr><b>Location: </b><td>" + newValue + "</td></tr>";
            //     infoTemplate.setContent(newContent);
            // });
            // StoryModel.vm.storyDetailsData.subscribe(function(newValue) {
            //     var newContent = infoTemplate.content;
            //     newContent += "<br><tr><b>Details: </b><td>" + newValue + "</td></tr>";
            //     infoTemplate.setContent(newContent);
            // });
            // StoryModel.vm.storyNameData.subscribe(function(newValue) {
            //     var newContent = infoTemplate.content;
            //     newContent += "<br><tr><b>Name: </b><td>" + newValue + "</td></tr>";
            //     infoTemplate.setContent(newContent);
            // });
            // StoryModel.vm.storyEmailData.subscribe(function(newValue) {
            //     var newContent = infoTemplate.content;
            //     newContent += "<br><tr><b>Email: </b><td>" + newValue + "</td></tr>";
            //     infoTemplate.setContent(newContent);
            // });

            var dojoShape = graphic.getDojoShape();
            var moveable = new dojox.gfx.Moveable(dojoShape);

            var moveStopToken = dojo.connect(moveable, "onMoveStop", function(mover) {
                var tx = dojoShape.getTransform();

                var startPoint = graphic.geometry;
                var endPoint = o.map.toMap(o.map.toScreen(startPoint).offset(tx.dx, tx.dy));

                dojoShape.setTransform(null);

                var endPoint2 = webMercatorUtils.xyToLngLat(endPoint.x, endPoint.y);
                var endPointLat = endPoint2[0].toFixed(3);
                var endPointLng = endPoint2[1].toFixed(3);


                graphic.setGeometry(endPoint);
                //infoTemplate.setContent("<tr>Lat: <td>" + endPointLat + "<br></tr></td> <tr>Lat: <td>" + endPointLng + "</tr></td>");
                StoryModel.vm.pointGeom(graphic);
                console.log(StoryModel.vm.pointGeom()); //TODO: Find out why this geometry isn't updating!
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

        };
        o.handleUpload = function(obj, evt) {

            var graphicToAdd = StoryModel.vm.pointGeom(),
                email = StoryModel.vm.storyEmailData(),
                title = StoryModel.vm.storyTitleData(),
                video = StoryModel.vm.storyVideoData(),
                formIsValid = true,
                selectedOptions = [];

            if (!graphicToAdd) {
                alert(StoryModel.vm.noMapPoint);
                return;
            }
            graphicToAdd.attributes = {};
            StoryModel.vm.errorMessages([]);
            StoryModel.vm.showErrorMessages(false);
            //or instead of dojoForEach'ing through the selectedOptions, why don't we just push all of our Observables into an Observable Array, and onSubmit we'll see which have values


            // dojoQuery(".storiesInput").forEach(function(node, index) {
            //     console.log(node);
            //     console.log(index);

            // });

            if ((validate.isEmailAddress(email) && !video) || (validate.isEmailAddress(email) && validate.isUrl(video))) {
                $("#storyEmailInput").css("border-color", "#c0c0c0");
                $("#requiredEmail").css("color", "#464052");
                $("#storyVideoInput").css("border-color", "#c0c0c0");
                $(".storyHeader").css("color", "#464052");
            } else {
                formIsValid = false;
                //model.errorMessages.push("You must at least provide a phone number and/or an email.");
                if (!validate.isEmailAddress(email)) {
                    $("#storyEmailInput").css("border-color", "red");
                    $("#requiredEmail").css("color", "red");
                } else {
                    $("#storyEmailInput").css("border-color", "#c0c0c0");
                    $("#requiredEmail").css("color", "#464052");
                }
                if (!validate.isUrl(video) && (video)) {
                    $("#storyVideoInput").css("border-color", "red");
                    $("#videoHeader").css("color", "red");
                } else {
                    $("#storyVideoInput").css("border-color", "#c0c0c0");
                    $(".storyHeader").css("color", "#464052");
                }
            }

            if (!formIsValid) {
                //model.showErrorMessages(true);
                alert(StoryModel.vm.formInvalidText);
                return;
            }
            /*else {
                if (validate.isEmailAddress(email)) {
                    //self.postSubscribeRequest(selectedOptions, email, 'email').then(function(result) {
                    //Make a JSON object out of my selectedOptions array that is submittable as a feature
                    //});
                }
            }*/

            if (!StoryModel.vm.storyTitleData()) {
                $("#storyTitleInput").css("border-color", "red");
                $("#requiredTitle").css("color", "red");
                alert(StoryModel.vm.stopSubmissionText);
                return;
            } else {
                $("#storyTitleInput").css("border-color", "#c0c0c0");
                $("#requiredTitle").css("color", "#464052");
            }

            if (title) {
                selectedOptions.push(title);
                graphicToAdd.attributes.Title = title;
            }
            // if (StoryModel.vm.pointGeom()) {
            //     selectedOptions.push(StoryModel.vm.pointGeom());
            // }
            if (StoryModel.vm.storyLocationData()) {
                var locationsArray = (StoryModel.vm.storyLocationData()).split(",");
                selectedOptions.push(); // TODO: check if the JSON POST wants array or string & Find out Where in the Feature (what attribute) this should be added as

            }
            var currentDate = $("#storyDateInput").datepicker("getDate");
            var days = currentDate.getDate();
            var months = currentDate.getMonth() + 1;
            var years = currentDate.getFullYear();
            var date = months + "/" + days + "/" + years;
            selectedOptions.push(date);
            if (StoryModel.vm.storyDetailsData()) {
                selectedOptions.push(StoryModel.vm.storyDetailsData());
                //TODO: Create a Date Field in the Feature Service and decide on a Format, then fit that
            }
            if (video) {
                selectedOptions.push(video);
                graphicToAdd.attributes.Video = video;
            }
            if (StoryModel.vm.storyMediaData()) {
                selectedOptions.push(StoryModel.vm.storyMediaData());
                //TODO: Create a Video Field in the Feature Service and decide on a Format, then fit that
            }
            if (StoryModel.vm.storyNameData()) {
                selectedOptions.push(StoryModel.vm.storyNameData());
                graphicToAdd.attributes.Name = StoryModel.vm.storyNameData();
            }
            selectedOptions.push(StoryModel.vm.storyEmailData());
            graphicToAdd.attributes.Email = email;
            graphicToAdd.attributes.Publish = 'Y';

            var stories = o.map.getLayer("storiesLayer");
            var success = function() {
                //remove graphic from map!!
                alert(StoryModel.vm.submitSuccess);
            }
            var failure = function() {
                alert(StoryModel.vm.submitFailure);
            }
            stories.applyEdits([graphicToAdd], null, null, success, failure);

        };


        o.toggleBasemapGallery = function() {


            StoryModel.set('showBasemapGallery', !StoryModel.get('showBasemapGallery'));
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