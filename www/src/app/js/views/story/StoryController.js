define(["dojo/dom", "dojo/dom-construct", "dojo/on", "dojo/dom", "dojo/dom-style", "dojox/validate/web", "dijit/registry", "modules/HashController", "modules/EventsController", "views/story/StoryModel", "views/story/StoryConfig", "dojo/_base/array", "esri/map", "esri/toolbars/edit", "esri/dijit/BasemapGallery", "esri/toolbars/draw", "esri/graphic", "esri/Color", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "dijit/layout/ContentPane", "dijit/TitlePane", "esri/layers/FeatureLayer", "esri/InfoTemplate", "esri/geometry/webMercatorUtils", "dojo/parser", "esri/urlUtils", "utils/Analytics"],
    function(dom, domConstruct, on, dom, domStyle, validate, registry, HashController, EventsController, StoryModel, StoryConfig, arrayUtil, Map, Edit, BasemapGallery, Draw, Graphic, Color, SimpleMarkerSymbol, PictureMarkerSymbol, ContentPane, TitlePane, FeatureLayer, InfoTemplate, webMercatorUtils, parser, urlUtils, Analytics) {

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
                console.log(viewObj);
                EventsController.switchToView(viewObj);
                Analytics.sendPageview("/" + window.location.href.split('#')[1], viewObj.viewName);
                return;
            }

            initialized = true;
            //otherwise load the view
            require(["dojo/text!views/story/story.html"], function(html) {

                dom.byId(viewId).innerHTML = html;
                parser.parse(dom.byId("storyInnerContainer")).then(function() {

                    o.createMap();

                    EventsController.switchToView(viewObj);
                    StoryModel.applyBindings(viewId);
                });

            });

            Analytics.sendPageview("/" + window.location.href.split('#')[1], viewObj.viewName);

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

            var basemapGallery = new BasemapGallery({
                showArcGISBasemaps: true,
                map: o.map
            }, "basemapGallery");

            basemapGallery.startup();
            dojo.connect(basemapGallery, "onError", function(msg) {
                console.log(msg);
            });

            var mapLoad = o.map.on("load", function() {
                mapLoad.remove();
                o.initToolbar();

                var rule = {
                    proxyUrl: "/proxy/proxy.php",
                    urlPrefix: StoryModel.vm.storiesURL
                }

                urlUtils.addProxyRule(rule);
                // o.map.resize();
                // o.map.reposition();

                var storiesLayer = new FeatureLayer(StoryModel.vm.storiesURL, {
                    id: "storiesLayer",
                    outFields: ["*"]
                });

                storiesLayer.setVisibility(false);
                var attachmentSuccess = function() {
                    console.log(StoryModel.vm.attachSuccess);
                }
                var attachmentError = function() {
                    console.log(StoryModel.vm.attachFailure);
                }
                storiesLayer.on("edits-complete", function(adds, updates, deletes) {
                    //document.login[0].remove();

                    if (StoryModel.vm.inputFilesSelector().length > 1) {
                        var attachmentDoms = $(".uploadInput");
                        var objID = adds.adds[0].objectId;
                        var entireForm = document.login;
                        for (var i = StoryModel.vm.inputFilesSelector().length - 1; i > 0; i--) {
                            storiesLayer.addAttachment(objID, entireForm, attachmentSuccess, attachmentError);
                            domConstruct.destroy(attachmentDoms[i - 1]);
                        }
                    }
                    storiesLayer.refresh();
                });

                on.once(o.map, "update-end", function() {
                    o.map.addLayer(storiesLayer);

                });

                document.getElementById('stackContainer').onscroll = function() {
                    o.map.resize();
                };

                on(o.map, 'click', function(evt) {
                    o.testFix(evt);
                });
            });
        };

        o.testFix = function(evt) {
            require(["esri/geometry/ScreenPoint", "esri/geometry/screenUtils"], function(SP, Utils) {
                var point = new SP(evt.layerX, evt.layerY);
                var mapPoint = Utils.toMapPoint(o.map.extent, o.map.width, o.map.height, point);
                window.mapPoint = mapPoint;
                window.map = o.map;
                //debugger;
                o.addGraphic(mapPoint);
            });
        };

        o.initToolbar = function() {
            tb = new Draw(o.map);
            //tb.on("draw-end", o.addGraphic);
            tb.activate("point");

            on(dom.byId("storiesMap"), "mouseover", function(evt) {
                //tool = "point";
                //tb.activate(tool);
                // This resize is necessary every time the tool is activated so that the tool has the correct reference location on the page and the map. 
                // This fixed the graphic appearing above the mouse click (with an offset of the distance scrolled down the page) and the mapPoint geometry being incorrect.
                o.map.resize();
            });

            on(dom.byId("storiesMap"), "mouseout", function(evt) {
                o.map.resize();
            });

        }


        o.addGraphic = function(evt) {
            o.map.graphics.clear();
            o.map.resize();

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

            //var graphic = new Graphic(evt.geometry, symbol);
            var graphic = new Graphic(evt, symbol);

            o.map.graphics.add(graphic);
            StoryModel.vm.pointGeom(graphic);

            var dojoShape = graphic.getDojoShape();
            var moveable = new dojox.gfx.Moveable(dojoShape);

            //tb.deactivate();
            o.map.enableMapNavigation();

            var title = StoryModel.vm.storyTitleData();
            if (!title) {
                title = (dom.byId("storyTitleInput")).placeholder;
            }

            var moveStopToken = dojo.connect(moveable, "onMoveStop", function(mover) {
                var tx = dojoShape.getTransform();

                var startPoint = graphic.geometry;
                var endPoint = o.map.toMap(o.map.toScreen(startPoint).offset(tx.dx, tx.dy));

                dojoShape.setTransform(null);

                var endPoint2 = webMercatorUtils.xyToLngLat(endPoint.x, endPoint.y);
                var endPointLat = endPoint2[0].toFixed(3);
                var endPointLng = endPoint2[1].toFixed(3);

                graphic.setGeometry(endPoint);
                StoryModel.vm.pointGeom(graphic);
                console.log(StoryModel.vm.pointGeom());
            });

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

        o.handleFileChange = function(obj, evt) {

            var fileName = evt.currentTarget.files[0].name;
            var oldButton = evt.currentTarget;
            $(oldButton).css("opacity", "0");

            var oldContent = StoryModel.vm.mediaListData();

            StoryModel.vm.inputFilesSelector.push({
                display: true,
                name: evt.currentTarget.files[0].name
            });
        };

        o.handleAttachmentRemove = function(obj, evt) {
            var indexNumber = 0;
            var attachmentDoms = $(".uploadInput");
            for (var i = 0; i < attachmentDoms.length; i++) {
                if (attachmentDoms[i].files.length > 0) {
                    if (evt.currentTarget.firstChild.data === attachmentDoms[i].files[0].name) {
                        domConstruct.destroy(attachmentDoms[i]);
                        indexNumber = i;
                        console.log("destroyed");
                    }
                }

            }
            var attachmentDoms = $(".uploadInput");
            // if (indexNumber != 0) {
            //     StoryModel.vm.inputFilesSelector.remove(StoryModel.vm.inputFilesSelector()[indexNumber + 1]);
            // } else {
            StoryModel.vm.inputFilesSelector.remove(StoryModel.vm.inputFilesSelector()[indexNumber]);
            //}
            //if (attachmentDoms.length == 1) {
            if (indexNumber == 0) {
                evt.target.remove();
            }
            //}
        };

        /*o.previewStorySubmission = function(obj, evt) {

            var graphicToAdd = StoryModel.vm.pointGeom(),
                email = StoryModel.vm.storyEmailData(),
                video = StoryModel.vm.storyVideoData(),
                formIsValid = true;

            if (!graphicToAdd) {
                alert(StoryModel.vm.noMapPoint);
                return;
            }

            if ((validate.isEmailAddress(email) && !video) || (validate.isEmailAddress(email) && validate.isUrl(video))) {
                $("#storyEmailInput").css("border-color", "#c0c0c0");
                $("#requiredEmail").css("color", "#464052");
                $("#storyVideoInput").css("border-color", "#c0c0c0");
                $(".storyHeader").css("color", "#464052");
            } else {
                formIsValid = false;

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
                alert(StoryModel.vm.formInvalidText);
                return;
            }

            if (!StoryModel.vm.storyTitleData()) {
                $("#storyTitleInput").css("border-color", "red");
                $("#requiredTitle").css("color", "red");
                alert(StoryModel.vm.stopSubmissionText);
                return;
            } else {
                $("#storyTitleInput").css("border-color", "#c0c0c0");
                $("#requiredTitle").css("color", "#464052");
            }


            $("#storyBasemaps").hide();
            $("#previewDiv").dialog({
                title: "Confirm submission?",
                width: 600,
                height: 800,
                autoOpen: false,
                open: function() {
                    $("#storyBasemaps").hide();
                },
                close: function() {
                    $("#storyBasemaps").show();
                },
                show: "blind",
                buttons: [{
                    text: "Publish",
                    click: function(obj, evt) {

                        $(this).dialog("destroy");
                        //var attachmentDoms = $(".uploadInput");
                        // for (var i = 0; i < attachmentDoms.length; i++) {
                        //     if (attachmentDoms[i].readOnly == true) {
                        //         domConstruct.destroy(attachmentDoms[i]);
                        //     }

                        // }
                        // or just change the html of previewDiv so there's not another 'form' anymore?
                        setTimeout(function() {
                            o.handleUpload();
                        }, 1000);

                    }
                }, {
                    text: "Go back",
                    click: function() {
                        $(this).dialog("close");
                    }
                }]

            });
            var clonetext = $('#submitBox > form').clone(true);
            clonetext.className = "duplicate";
            $('#previewDiv').html(clonetext);
            $('#previewDiv input').attr('readonly', 'readonly');
            $("#previewDiv").dialog("open");
            return false;
        };*/

        o.handleUpload = function(obj, evt) {

            honeyPotValue = dom.byId("verifyEmailForStory").value;
            if (honeyPotValue) {
                console.log("honeyPot!");
                return;
            }

            var graphicToAdd = StoryModel.vm.pointGeom(),
                email = StoryModel.vm.storyEmailData(),
                title = StoryModel.vm.storyTitleData(),
                video = StoryModel.vm.storyVideoData(),
                formIsValid = true;

            if (!graphicToAdd) {
                alert(StoryModel.vm.noMapPoint);
                return;
            }

            if ((validate.isEmailAddress(email) && !video) || (validate.isEmailAddress(email) && validate.isUrl(video))) {
                $("#storyEmailInput").css("border-color", "#c0c0c0");
                $("#requiredEmail").css("color", "#464052");
                $("#storyVideoInput").css("border-color", "#c0c0c0");
                $(".storyHeader").css("color", "#464052");
            } else {
                formIsValid = false;

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
                alert(StoryModel.vm.formInvalidText);
                return;
            }

            if (!StoryModel.vm.storyTitleData()) {
                $("#storyTitleInput").css("border-color", "red");
                $("#requiredTitle").css("color", "red");
                alert(StoryModel.vm.stopSubmissionText);
                return;
            } else {
                $("#storyTitleInput").css("border-color", "#c0c0c0");
                $("#requiredTitle").css("color", "#464052");
            }

            graphicToAdd.attributes = {};

            if (StoryModel.vm.storyLocationData()) {
                //var locationsArray = (StoryModel.vm.storyLocationData()).split(",");
                graphicToAdd.attributes.Location = StoryModel.vm.storyLocationData();
            }
            var currentDate = $("#storyDateInput").datepicker("getDate");
            var days = currentDate.getDate();
            var months = currentDate.getMonth() + 1;
            var years = currentDate.getFullYear();
            var date = months + "/" + days + "/" + years;

            if (StoryModel.vm.storyDetailsData()) {
                graphicToAdd.attributes.Details = StoryModel.vm.storyDetailsData();
            }
            if (video) {
                graphicToAdd.attributes.Video = video;
            }
            if (StoryModel.vm.storyNameData()) {
                graphicToAdd.attributes.Name = StoryModel.vm.storyNameData();
            }

            graphicToAdd.attributes.Date = date;
            graphicToAdd.attributes.Title = title;
            graphicToAdd.attributes.Email = email;
            graphicToAdd.attributes.Publish = 'Y';

            var stories = o.map.getLayer("storiesLayer");
            var success = function() {
                alert(StoryModel.vm.submitSuccess);

                StoryModel.vm.storyTitleData(null);
                StoryModel.vm.pointGeom(null);
                StoryModel.vm.storyLocationData(null);
                StoryModel.vm.dateObserv(null);
                StoryModel.vm.storyDetailsData(null);
                StoryModel.vm.storyVideoData(null);
                StoryModel.vm.storyMediaData(null);
                StoryModel.vm.storyNameData(null);
                StoryModel.vm.storyEmailData(null);

                dom.byId("storyForm").reset();

                var attachmentDoms = $(".uploadInput");
                var uploadLabels = $(".uploadList");
                for (var i = 0; i < attachmentDoms.length; i++) {
                    if (i < (attachmentDoms.length - 1)) {
                        domConstruct.destroy(attachmentDoms[i]);
                        domConstruct.destroy(uploadLabels[i]);
                    }
                }

                require(["views/map/MapConfig", "modules/EventsController"], function(MapConfig, EventsController) {
                    MapConfig.storiesBool = true;
                    EventsController.goToMap();

                });
            }
            var failure = function() {
                alert(StoryModel.vm.submitFailure);
            }
            Analytics.sendEvent("Submit", "click", "User Story", "User is submitting a story via the Story Page.");
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
        // $("#storyMediaInput").on('dragenter', function(e) {
        //     console.log("sdgf");
        //     // e.stopPropagation();
        //     // e.preventDefault();
        //     if (event.target === this) {
        //         console.log('dragenter');
        //     } else {
        //         console.log(event.target);
        //     }
        //     var par = $(this).parent();
        //     $(par).css('background-color', 'orange');
        // });


        return o;


    });