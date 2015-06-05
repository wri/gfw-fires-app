/* global define, alert */
define([
    "dojo/dom",
    "dojo/_base/array",
    "dojo/on",
    "dojo/query",
    "dojo/Deferred",
    "dojo/promise/all",
    "dojo/request/xhr",
    "dojo/dom-attr",
    "dojo/keys",
    "esri/layers/FeatureLayer",
    "esri/graphic",
    "esri/request",
    "esri/tasks/ImageServiceIdentifyParameters",
    "esri/tasks/ImageServiceIdentifyTask",
    "esri/layers/RasterFunction",
    "esri/InfoTemplate",
    "esri/dijit/PopupTemplate",
    "esri/geometry/Point",
    "esri/geometry/webMercatorUtils",
    "esri/symbols/PictureMarkerSymbol",
    "main/Config",
    "views/map/MapConfig",

    "views/map/MapModel",
    "views/map/LayerController",
    "esri/tasks/IdentifyTask",
    "esri/tasks/IdentifyParameters",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/geometry/Circle",
    "utils/Analytics"
], function(dom, arrayUtils, on, dojoQuery, Deferred, all, xhr, domAttr, keys, FeatureLayer, Graphic, esriRequest,
    ImageServiceIdentifyParameters, ImageServiceIdentifyTask, RasterFunction, InfoTemplate, PopupTemplate, Point, webMercatorUtils,
    PictureSymbol, MainConfig, MapConfig, MapModel, LayerController, IdentifyTask, IdentifyParameters, Query, QueryTask, Circle, Analytics) {
    var _map;

    return {
        setMap: function(map) {
            _map = map;

            // Set Global Formatting Functions up here as well
            window.PopupDateFormat = function(value, key, attributes) {
                // Date should be in ms format
                return new Date(value);
            };

        },

        clickNext: '',
        searchAreaByCoordinates: function() {
            var values = {},
                latitude, longitude,
                invalidValue = false,
                invalidMessage = "You did not enter a valid value.  Please check that your location values are all filled in and nubmers only.",
                symbol = new PictureSymbol('app/images/RedStickpin.png', 32, 32),
                attributes = {},
                point,
                graphic,
                getValue = function(value) {
                    if (!invalidValue) {
                        invalidValue = isNaN(parseInt(value));
                    }
                    return isNaN(parseInt(value)) ? 0 : parseInt(value);
                },
                nextAvailableId = function() {
                    var value = 0;
                    arrayUtils.forEach(_map.graphics.graphics, function(g) {
                        if (g.attributes) {
                            if (g.attributes.locatorValue) {
                                value = Math.max(value, parseInt(g.attributes.locatorValue));
                            }
                        }
                    });
                    return value;
                };

            // If the DMS Coords View is present, get the appropriate corrdinates and convert them
            if (MapModel.get('showDMSInputs')) {
                values.dlat = getValue(dom.byId('degreesLatInput').value);
                values.mlat = getValue(dom.byId('minutesLatInput').value);
                values.slat = getValue(dom.byId('secondsLatInput').value);
                values.dlon = getValue(dom.byId('degreesLonInput').value);
                values.mlon = getValue(dom.byId('minutesLonInput').value);
                values.slon = getValue(dom.byId('secondsLonInput').value);
                latitude = values.dlat + (values.mlat / 60) + (values.slat / 3600);
                longitude = values.dlon + (values.mlon / 60) + (values.slon / 3600);
            } else { // Else, get LatLong Coordinates and Zoom to them
                latitude = getValue(dom.byId('latitudeInput').value);
                longitude = getValue(dom.byId('longitudeInput').value);
            }

            if (invalidValue) {
                alert(invalidMessage);
            } else {
                point = webMercatorUtils.geographicToWebMercator(new Point(longitude, latitude));
                attributes.locatorValue = nextAvailableId();
                attributes.id = 'LOCATOR_' + attributes.locatorValue;
                graphic = new Graphic(point, symbol, attributes);
                _map.graphics.add(graphic);
                _map.centerAndZoom(point, 7);
                MapModel.set('showClearPinsOption', true);
            }
        },

        fetchTwitterData: function(evt) {
            var target = evt.target ? evt.target : evt.srcElement;
            if (!target.checked) {
                return;
            }



        },

        mapClick: function(event) {
            console.log("Map Click event!");
            if ($('#uploadCustomGraphic').length > 0) {
                $("#uploadCustomGraphic").remove();
            }
            var map = _map,
                _self = this,
                mapPoint = event.mapPoint;

            var deferreds = [],
                features = [];

            map.infoWindow.clearFeatures();

            overlaysLayer = map.getLayer(MapConfig.overlaysLayer.id);
            if (overlaysLayer) {
                if (overlaysLayer.visible) {

                    deferreds.push(_self.identifyOverlays(mapPoint));
                }
            }

            forestUseLayer = map.getLayer(MapConfig.forestUseLayers.id);
            if (forestUseLayer) {
                if (forestUseLayer.visible) {
                    deferreds.push(_self.identifyForestUse(mapPoint));
                }
            }

            conservationLayers = map.getLayer(MapConfig.conservationLayers.id);
            if (conservationLayers) {
                if (conservationLayers.visible) {
                    deferreds.push(_self.identifyConservation(mapPoint));
                }
            }
            fireStoryLayer = map.getLayer(MapConfig.fireStories.id);
            if (fireStoryLayer) {
                if (fireStoryLayer.visible) {
                    deferreds.push(_self.identifyFireStories(mapPoint));
                }
            }

            fireTweets = map.getLayer(MapConfig.tweetLayer.id);
            if (fireTweets) {
                if (fireTweets.visible) {
                    deferreds.push(_self.identifyFireTweets(mapPoint));
                }
            }
            console.log(deferreds);

            if (deferreds.length === 0) {
                return;
            }

            all(deferreds).then(function(featureSets) {
                arrayUtils.forEach(featureSets, function(item) {

                    console.log(item);
                    switch (item.layer) {
                        case "Overlays_Layer":
                            features = features.concat(_self.setOverlaysTemplates(item.features));
                            break;
                        case "Forest_Use":
                            features = features.concat(_self.setForestUseTemplates(item.features));
                            break;
                        case "Conservation":
                            features = features.concat(_self.setConservationTemplates(item.features));
                            break;
                        case "Fire_Stories":
                            features = features.concat(_self.getFireStoriesInfoWindow(item.features));
                            break;
                        case "Fire_Tweets":
                            features = features.concat(_self.getFireTweetsInfoWindow(item.features));
                            break;
                            // case "CustomGraphics":
                            //     // This will only contain a single feature and return a single feature
                            //     // instead of an array of features
                            //     features.push(self.setCustomGraphicTemplates(item.feature));
                            //     break;
                        default: // Do Nothing
                            break;
                    }
                });

                if (features.length > 0) {

                    map.infoWindow.setFeatures(features);

                    map.infoWindow.show(mapPoint);
                }

            });


        },

        identifyOverlays: function(mapPoint) {
            var deferred = new Deferred(),
                identifyTask = new IdentifyTask(MapConfig.overlaysLayer.url),
                params = new IdentifyParameters();


            params.tolerance = 3;
            params.maxAllowableOffset = 100; //meters
            params.returnGeometry = true;
            params.width = _map.width;
            params.height = _map.height;
            params.geometry = mapPoint;
            params.mapExtent = _map.extent;
            params.layerIds = _map.getLayer(MapConfig.overlaysLayer.id).visibleLayers;
            params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

            identifyTask.execute(params, function(features) {
                if (features.length > 0) {
                    deferred.resolve({
                        layer: MapConfig.overlaysLayer.id,
                        features: features
                    });
                } else {
                    deferred.resolve(false);
                }
            }, function(error) {
                deferred.resolve(false);
            });

            return deferred.promise;
        },

        identifyForestUse: function(mapPoint) {
            var deferred = new Deferred(),
                identifyTask = new IdentifyTask(MapConfig.forestUseLayers.url),
                params = new IdentifyParameters();

            params.tolerance = 3;
            params.returnGeometry = true;
            params.width = _map.width;
            params.height = _map.height;
            params.geometry = mapPoint;
            params.mapExtent = _map.extent;
            params.layerIds = _map.getLayer(MapConfig.forestUseLayers.id).visibleLayers;
            params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

            identifyTask.execute(params, function(features) {
                if (features.length > 0) {
                    deferred.resolve({
                        layer: MapConfig.forestUseLayers.id,
                        features: features
                    });
                } else {
                    deferred.resolve(false);
                }
            }, function(error) {
                deferred.resolve(false);
            });

            return deferred.promise;
        },

        identifyConservation: function(mapPoint) {
            var deferred = new Deferred(),
                identifyTask = new IdentifyTask(MapConfig.conservationLayers.url),
                params = new IdentifyParameters();

            params.tolerance = 3;
            params.returnGeometry = true;
            params.width = _map.width;
            params.height = _map.height;
            params.geometry = mapPoint;
            params.mapExtent = _map.extent;
            params.layerIds = _map.getLayer(MapConfig.conservationLayers.id).visibleLayers;
            params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

            identifyTask.execute(params, function(features) {
                if (features.length > 0) {
                    deferred.resolve({
                        layer: MapConfig.conservationLayers.id,
                        features: features
                    });
                } else {
                    deferred.resolve(false);
                }
            }, function(error) {
                deferred.resolve(false);
            });

            return deferred.promise;
        },

        identifyFireStories: function(mapPoint) {
            var url = MapConfig.fireStories.url.split("/10");
            url = url[0];
            var deferred = new Deferred(),
                identifyTask = new IdentifyTask(url),
                params = new IdentifyParameters();

            params.tolerance = 5;
            params.returnGeometry = false;
            params.width = _map.width;
            params.height = _map.height;
            params.geometry = mapPoint;
            params.mapExtent = _map.extent;
            params.layerIds = [10];
            params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;


            identifyTask.execute(params, function(features) {

                if (features.length > 0) {

                    deferred.resolve({
                        layer: "Fire_Stories",
                        features: features
                    });
                } else {
                    deferred.resolve(false);
                }
            }, function(error) {
                deferred.resolve(false);
            });

            return deferred.promise;
        },

        identifyFireTweets: function(mapPoint) {
            var url = MapConfig.tweetLayer.url.split("/3");
            url = url[0];
            var deferred = new Deferred(),
                identifyTask = new IdentifyTask(url),
                params = new IdentifyParameters();

            params.tolerance = 5;
            params.returnGeometry = false;
            params.width = _map.width;
            params.height = _map.height;
            params.geometry = mapPoint;
            params.mapExtent = _map.extent;
            params.layerIds = [3];
            params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;


            identifyTask.execute(params, function(features) {

                if (features.length > 0) {

                    deferred.resolve({
                        layer: "Fire_Tweets",
                        features: features
                    });
                } else {
                    deferred.resolve(false);
                }
            }, function(error) {
                deferred.resolve(false);
            });

            return deferred.promise;
        },

        setOverlaysTemplates: function(featureObjects) {
            var template,
                handleUpSubsc,
                _self = this,
                features = [];

            arrayUtils.forEach(featureObjects, function(item) {
                if (item.layerId === 1) { // Villages
                    template = new InfoTemplate("Village: " + item.value,
                        "<table><tr><td>Subdistrict:</td><td>" + item.feature.attributes.SUBDISTRIC + "</td></tr><tr><td>District:</td><td>" + item.feature.attributes.DISTRICT + "</td></tr><tr style='height:10px;'></tr></table>"
                    );
                    item.feature.attributes.ALERTS_LABEL = item.value;

                } else if (item.layerId === 2) { //Subdistricts
                    template = new InfoTemplate("Subdistrict: " + item.value,
                        "<table><tr><td>District:</td><td>" + item.feature.attributes.DISTRICT + "</td></tr><tr><td>Province:</td><td>" + item.feature.attributes.PROVINCE + "</td></tr><tr style='height:10px;'></tr></table>"
                    );
                    item.feature.attributes.ALERTS_LABEL = item.value;

                } else if (item.layerId === 3) { //Districts
                    template = new InfoTemplate("District: " + item.feature.attributes.DISTRICT,
                        "<table><tr><td>Province:</td><td>" + item.feature.attributes.PROVINCE + "</td></tr><tr><td>Island:</td><td>" + item.feature.attributes.ISLAND + "</td></tr><tr style='height:10px;'></tr></table>"
                    );
                    item.feature.attributes.ALERTS_LABEL = item.feature.attributes.DISTRICT;

                } else { //Provinces
                    template = new InfoTemplate("Province: " + item.value,
                        "<table><tr><td>Island:</td><td>" + item.feature.attributes.ISLAND + "</td></tr><tr style='height:10px;'></tr></table>"
                    );
                    item.feature.attributes.ALERTS_LABEL = item.value;

                }

                //$(".sizer > .actionsPane").append("<div id='uploadCustomGraphic' class='uploadCustomGraphic'>Subscribe</div>");

                //template.content += "<br /><div id='uploadCustomGraphic' class='uploadCustomGraphic'>Subscribe</div>";
                item.feature.setInfoTemplate(template);

                features.push(item.feature);
            });
            if ($('#uploadCustomGraphic').length == 0) {
                $(".sizer > .actionsPane").append("<div id='uploadCustomGraphic' class='uploadCustomGraphic'>Subscribe</div>");
            }
            return features;

        },
        setForestUseTemplates: function(featureObjects) {
            var template,
                content = '',
                handleUpSubsc,
                _self = this,
                features = [];

            arrayUtils.forEach(featureObjects, function(item) {
                // if (item.layerId === 10) { // Logging

                //     content += "<table><tr><td>Concession Type</td><td>" + item.feature.attributes.TYPE + "</td></tr>";
                //     content += "<tr><td>Country</td><td>" + item.feature.attributes.Country + "</td></tr>";
                //     content += "<tr><td>Certification Status</td><td>" + item.feature.attributes.CERT_STAT + "</td></tr>";
                //     content += "<tr><td>GIS Calculated Area (ha)</td><td>" + item.feature.attributes.AREA_HA + "</td></tr>";
                //     content += "<tr><td>Source: </td><td>" + (item.feature.attributes.Source || "N/A") + "</td></tr>";
                //     content += "</table>";


                //     template = new InfoTemplate("<strong>" + item.value + "</strong>",
                //         content
                //     );

                //     item.feature.attributes.ALERTS_LABEL = item.value;

                // } else 
                if (item.layerId === 27) { //RSPO


                    content += "<table><tr><td>Concession Type</td><td>" + item.feature.attributes.TYPE + "</td></tr>";
                    content += "<tr><td>Country</td><td>" + item.feature.attributes.Country + "</td></tr>";
                    content += "<tr><td>Certification Status</td><td>" + item.feature.attributes.CERT_STAT + "</td></tr>";
                    content += "<tr><td>GIS Calculated Area (ha)</td><td>" + item.feature.attributes.AREA_HA + "</td></tr>";
                    content += "<tr><td>Certificate ID</td><td>" + item.feature.attributes.Certificat + "</td></tr>";
                    content += "<tr><td>Certificate Issue Date</td><td>" + item.feature.attributes.Issued + "</td></tr>";
                    content += "<tr><td>Certificate Expiry Date</td><td>" + item.feature.attributes.Expired + "</td></tr>";
                    content += "<tr><td>Mill name</td><td>" + item.feature.attributes.Mill + "</td></tr>";
                    content += "<tr><td>Mill location</td><td>" + item.feature.attributes.Location + "</td></tr>";
                    content += "<tr><td>Mill capacity (t/hour)</td><td>" + item.feature.attributes.Capacity + "</td></tr>";
                    content += "<tr><td>Certified CPO (mt)</td><td>" + item.feature.attributes.CPO + "</td></tr>";
                    content += "<tr><td>Certified PK (mt)</td><td>" + item.feature.attributes.PK + "</td></tr>";
                    content += "<tr><td>Estate Suppliers</td><td>" + item.feature.attributes.Estate + "</td></tr>";
                    content += "<tr><td>Estate Area (ha)</td><td>" + item.feature.attributes.Estate_1 + "</td></tr>";
                    content += "<tr><td>Outgrower Area (ha)</td><td>" + item.feature.attributes.Outgrowe + "</td></tr>";
                    content += "<tr><td>Scheme Smallholder Area (ha)</td><td>" + item.feature.attributes.SH + "</td></tr>";

                    content += "<tr><td>Source: </td><td>" + (item.feature.attributes.Source || "N/A") + "</td></tr><tr style='height:10px;'></tr></table>";

                    template = new InfoTemplate("<strong>" + item.value + "</strong>",
                        content
                    );
                    item.feature.attributes.ALERTS_LABEL = item.value;

                } else if (item.layerId === 16) { //Moratorium
                    //return;
                    content += "<table><tr><td>Base</td><td>" + item.feature.attributes.Base + "</td></tr>";
                    content += "<tr><td>AltMode</td><td>" + item.feature.attributes.AltMode + "</td></tr><tr style='height:10px;'></tr></table>";

                    template = new InfoTemplate("<strong>" + item.feature.attributes.Name + "</strong>",
                        content
                    );

                    item.feature.attributes.ALERTS_LABEL = item.value;
                } else { // Logging

                    content += "<table><tr><td>Concession Type</td><td>" + item.feature.attributes.TYPE + "</td></tr>";
                    content += "<tr><td>Country</td><td>" + item.feature.attributes.Country + "</td></tr>";
                    content += "<tr><td>Certification Status</td><td>" + item.feature.attributes.CERT_STAT + "</td></tr>";
                    content += "<tr><td>GIS Calculated Area (ha)</td><td>" + item.feature.attributes.AREA_HA + "</td></tr>";
                    content += "<tr><td>Source: </td><td>" + (item.feature.attributes.Source || "N/A") + "</td></tr><tr style='height:10px;'></tr></table>";

                    template = new InfoTemplate("<strong>" + item.value + "</strong>",
                        content
                    );

                    item.feature.attributes.ALERTS_LABEL = item.value;

                }
                // else if (item.layerId === 28) { //Wood Fiber 
                //     template = new InfoTemplate("District: " + item.feature.attributes.DISTRICT,
                //         "<table><tr><td>Province:</td><td>" + item.feature.attributes.PROVINCE + "</td></tr><tr><td>Island:</td><td>" + item.feature.attributes.ISLAND + "</td></tr></table>"
                //     );
                //     item.feature.attributes.ALERTS_LABEL = item.feature.attributes.DISTRICT;

                // } else if (item.layerId === 32) { //Oil Palm
                //     template = new InfoTemplate("District: " + item.feature.attributes.DISTRICT,
                //         "<table><tr><td>Province:</td><td>" + item.feature.attributes.PROVINCE + "</td></tr><tr><td>Island:</td><td>" + item.feature.attributes.ISLAND + "</td></tr></table>"
                //     );
                //     item.feature.attributes.ALERTS_LABEL = item.feature.attributes.DISTRICT;

                // } else { //Moratorium
                //     template = new InfoTemplate("Province: " + item.value,
                //         "<table><tr><td>Island:</td><td>" + item.feature.attributes.ISLAND + "</td></tr></table>"
                //     );
                //     item.feature.attributes.ALERTS_LABEL = item.value;

                // }

                //template.content += "<br /><div id='uploadCustomGraphic' class='uploadCustomGraphic'>Subscribe</div>";
                item.feature.setInfoTemplate(template);

                features.push(item.feature);
            });

            if ($('#uploadCustomGraphic').length == 0) {
                $(".sizer > .actionsPane").append("<div id='uploadCustomGraphic' class='uploadCustomGraphic'>Subscribe</div>");
            }

            return features;
        },
        setConservationTemplates: function(featureObjects) {

            var template,
                handleUpSubsc,
                _self = this,
                features = [];

            arrayUtils.forEach(featureObjects, function(item) {

                template = new InfoTemplate("Protected Areas ",
                    "<table><tr class='infoName'><td colspan='2'>" + item.feature.attributes.NAME + "</td></tr><tr><td>Local Name</td><td>" + item.feature.attributes.ORIG_NAME + "</td></tr><tr><td>Legal Designation</td><td>" + item.feature.attributes.DESIG_ENG + "</td></tr><tr><td>WDPA ID</td><td>" + item.feature.attributes.WDPAID + "</td></tr><tr style='height:10px;'></tr></table>"
                );

                item.feature.attributes.ALERTS_LABEL = item.value;

                //template.content += "<br /><div id='uploadCustomGraphic' class='uploadCustomGraphic'>Subscribe</div>";
                item.feature.setInfoTemplate(template);
                features.push(item.feature);
            });
            if ($('#uploadCustomGraphic').length == 0) {
                $(".sizer > .actionsPane").append("<div id='uploadCustomGraphic' class='uploadCustomGraphic'>Subscribe</div>");
            }

            return features;
        },

        getTomnodInfoWindow: function(response) {
            var qconfig = MapConfig.tomnodLayer;
            var url = qconfig.url;
            var map = _map;
            var result = response;
            var _self = this;
            var content = '';

            if (result) {
                var newDate = new Date(result.attributes['ImageAquisitionDate']);
                var months = newDate.getMonth() + 1;
                var day = newDate.getDate();
                var year = newDate.getFullYear();

                newDate = months + "/" + day + "/" + year;

                executeReturned = false;
                // content += "<tr class='infoName'><td colspan='3'>Active Fires</td><td colspan='2'></td></tr>";
                content += " <div><h3>" + result.attributes['name'] + "</h3></div>";
                content += "<tr><td><img src='" + qconfig.chipBucket + result.attributes['ChipLink'];
                content += "' style='width:300px' /></tc></tr>"
                content += "<div><strong>Image Acquisition Date:</strong> " + newDate + "</div>";
                content += "<div><strong>Confirmation:</strong> " + result.attributes['Confirmation'] + " people</div>";
                content += "<div><b>Crowd Rank:</b> " + result.attributes['CrowdRank'] + "%</div>";
                content += "<a href='" + result.attributes['ImageLink'];
                content += "' target='_blank'>See this point on ";
                content += "<img style='height:20px;width:100px;' src='app/images/tomnod_logo.png'></div>";
                return content;




                // map.infoWindow.setContent(content);
                // map.infoWindow.resize(500,450);
                // // map.infoWindow.setTitle("Title");
                // map.infoWindow.show(point);

                // var clicknext = on(dojo.byId('nexttomnod'),"click",function(evt){
                //     console.log("CLICK NEXT",evt);
                // });
                // var clickprev = on(dojo.byId('prevtomnod'),"click",function(evt){
                //     console.log("new Map prev",evt);
                // });
            } else {
                // _self.getActiveFiresInfoWindow(event);
            }
        },

        selectTomnodFeatures: function(event, arg2) {
            var qconfig = MapConfig.tomnodLayer,
                landsatCheck = dom.byId("landsat-image-checkbox"),
                _self = this,
                url = qconfig.url,
                itask = new IdentifyTask(url),
                iparams = new IdentifyParameters(),
                qtask = new QueryTask(url),
                query = new Query(),
                point = event.mapPoint,
                executeReturned = true,
                node = dojoQuery(".selected-fire-option")[0],
                time = new Date(),
                today = new Date(),
                todayString = '',
                dateString = '',
                defs = [];

            if (!_map.getLayer(qconfig.id).visible) {
                _self.getActiveFiresInfoWindow(event);
                _self.getArchiveFiresInfoWindow(event);

                var noaaCheck = dom.byId("noaa-fires-18");
                var archiveCheck = dom.byId("indonesia-fires");
                var firesCheck = dom.byId("fires-checkbox");

                if ((noaaCheck.getAttribute("aria-checked") == 'true' && archiveCheck.getAttribute("aria-checked") == 'true') || (noaaCheck.getAttribute("aria-checked") == 'true' && firesCheck.getAttribute("aria-checked") == 'true')) {
                    setTimeout(function() {
                        if (!_map.infoWindow.isShowing) {
                            _self.getArchiveNoaaInfoWindow(event);
                        }
                    }, 800);
                } else {
                    _self.getArchiveNoaaInfoWindow(event);
                }

                setTimeout(function() {
                    if (!_map.infoWindow.isShowing) {
                        _self.getDigitalGlobeInfoWindow(event);
                    }
                }, 400);

                // if (landsatCheck.checked && _map.getLevel() >= 10) {
                //     _self.getLandsatInfoWindow(event);
                // }

                return;
            }

            iparams.geometry = point;
            iparams.tolerance = 3;
            iparams.returnGeometry = false;
            iparams.layerDefinitions = defs;
            iparams.mapExtent = _map.extent;
            iparams.layerIds = [8];

            // iparams.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

            query.where = 'OBJECTID in (';
            query.returnGeometry = false;
            query.outFields = ['OBJECTID', 'ChipLink', 'CrowdRank', 'Confirmation', 'name', 'ImageLink'];
            var objectids = [];


            var content = "<div id='prevtomnod'><</div><div id='nexttomnod'>></div>";
            itask.execute(iparams, function(response) {
                arrayUtils.forEach(response, function(feature) {
                    objectids.push(feature.feature.attributes.OBJECTID);
                });
                if (objectids.length < 1) {
                    _map.infoWindow.setFeatures(undefined);

                    _self.getActiveFiresInfoWindow(event);

                    _self.getDigitalGlobeInfoWindow(event);
                    _self.getArchiveFiresInfoWindow(event);
                    _self.getArchiveNoaaInfoWindow(event);

                    // if (landsatCheck.checked && _map.getLevel() >= 10) {
                    //     _self.getLandsatInfoWindow(event);
                    // }

                    return;
                }
                _map.infoWindow.resize(340, 500);
                query.where += objectids.join(',') + ")";
                selected_features = _map.getLayer(MapConfig.tomnodLayer.sel_id).selectFeatures(query, FeatureLayer.SELECTION_NEW);

                selected_features.then(function(features) {
                    _map.infoWindow.setFeatures(features);
                    _map.infoWindow.resize(340, 500);

                    _map.infoWindow.show(event.mapPoint);
                });

            }, function(err) {
                _self.mapClick(event);
            });
        },


        getActiveFiresInfoWindow: function(event) {
            var qconfig = MapConfig.firesLayer,
                _self = this,
                url = qconfig.url,
                itask = new IdentifyTask(url),
                iparams = new IdentifyParameters(),
                point = event.mapPoint,
                executeReturned = true,
                node = dojoQuery(".selected-fire-option")[0],
                time = new Date(),
                today = new Date(),
                todayString = '',
                dateString = '',
                defs = [];


            // If the layer is not visible, then dont show it
            if (!_map.getLayer(qconfig.id).visible) {
                _self.mapClick(event);
                return;
            }

            switch (node.id) {
                case "fires72":
                    time.setDate(time.getDate() - 4);
                    today.setDate(today.getDate() - 3);
                    break;
                case "fires48":
                    time.setDate(time.getDate() - 3);
                    today.setDate(today.getDate() - 2);
                    break;
                case "fires24":
                    time.setDate(time.getDate() - 2);
                    today.setDate(today.getDate() - 1);
                    break;
                default:
                    time.setDate(time.getDate() - 8);
                    today.setDate(today.getDate() - 7);
                    break;
            }

            dateString = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + (time.getDate()) + " " +
                time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();

            todayString = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + (today.getDate()) + " " +
                today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

            // defs needs to be (date > dateString and time > hhmm) or date > todayString
            for (var i = 0, len = MapConfig.firesLayer.defaultLayers.length; i < len; i++) {
                defs[i] = "ACQ_DATE > date '" + dateString + "'";
                // AND CAST(\"ACQ_TIME\" AS INTEGER) >= " + time.getHours() + "" + time.getMinutes() + ")" + 
                //          " OR  ACQ_DATE > date '" + todayString + "'";
            }

            iparams.geometry = point;
            iparams.tolerance = 3;
            iparams.returnGeometry = false;
            iparams.layerDefinitions = defs;
            iparams.mapExtent = _map.extent;
            iparams.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

            var content = "</div><table id='infoWindowTable'>";

            itask.execute(iparams, function(response) {
                var map = _map;
                var result = response[0];

                if (result) {
                    executeReturned = false;
                    content += "<tr class='infoName'><td colspan='3'>Active Fires</td><td colspan='2'></td></tr>";
                    arrayUtils.forEach(qconfig.query.fields, function(field) {
                        content += "<tr><td colspan='3'>" + field.label + "</td>";
                        content += "<td colspan='2'>" + result.feature.attributes[field.name] + "</td></tr>";

                    });
                    content += "</table>";
                    map.infoWindow.setContent(content);
                    map.infoWindow.resize(270, 140);
                    map.infoWindow.show(point);
                } else {
                    _self.mapClick(event);
                }
            }, function(err) {
                _self.mapClick(event);
            });
        },

        getArchiveFiresInfoWindow: function(event) {

            var qconfig = MapConfig.indonesiaLayers,
                _self = this,
                url = qconfig.url,
                itask = new IdentifyTask(url),
                iparams = new IdentifyParameters(),
                point = event.mapPoint,
                executeReturned = true,
                time = new Date(),
                today = new Date(),
                todayString = '',
                dateString = '',
                defs = [];

            var checked = dom.byId("indonesia-fires");
            // If the layer is not visible or turned on, then dont show it
            if (!_map.getLayer(qconfig.id).visible || checked.checked != true) {

                //IndonesiaFires

                _self.mapClick(event);
                return;
            }

            iparams.layerDefinitions = _map.getLayer(qconfig.id).layerDefinitions;

            iparams.geometry = point;
            iparams.tolerance = 3;
            iparams.returnGeometry = false;
            iparams.mapExtent = _map.extent;
            iparams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
            iparams.layerIds = [0];

            var thisLayer = _map.getLayer(qconfig.id);

            var content = "</div><table id='infoWindowTable'>";

            itask.execute(iparams, function(response) {
                var map = _map;
                var result = response[0];

                if (result) {
                    if (result.layerId == 2) {
                        return;
                    }
                    executeReturned = false;
                    content += "<tr class='infoName'><strong>NASA archived fires for Indonesia</strong></tr>";
                    arrayUtils.forEach(qconfig.query.fields, function(field) {
                        content += "<tr><td colspan='3'>" + field.label + "</td>";
                        content += "<td colspan='2'>" + result.feature.attributes[field.name] + "</td></tr>";

                    });
                    content += "</table>";

                    map.infoWindow.setContent(content);
                    map.infoWindow.resize(270, 140);
                    map.infoWindow.show(point);
                } else {
                    _self.mapClick(event);
                }
            }, function(err) {
                _self.mapClick(event);
            });
        },

        getLandsatInfoWindow: function(evt) {

            var landSatConfig = MapConfig.landsat8;

            // This is returning malformed JSON throwing illegal syntax error
            var imageParams = new ImageServiceIdentifyParameters(),
                imageTask = new ImageServiceIdentifyTask(landSatConfig.url);

            imageParams.geometry = evt.mapPoint;
            imageParams.returnCatalogItems = true;
            imageParams.f = 'json';
            imageParams.returnGeometry = true;
            imageParams.renderingRule = new RasterFunction({
                "rasterFunction": "Stretch",
                "rasterFunctionArguments": {
                    "StretchType": 6,
                    "DRA": true,
                    "Gamma": [1.4, 1.4, 1.4],
                    "UseGamma": true,
                    "MinPercent": 0.5,
                    "MaxPercent": 0.5
                },
                "outputPixelType": "U8"
            });

            imageParams.pixelSizeX = 100;
            imageParams.pixelSizeY = 100;

            imageTask.execute(imageParams, function(res) {
                arrayUtils.forEach(res.catalogItems.features, function(feature) {
                    feature.infoTemplate = new InfoTemplate(
                        'Acquisition Date',
                        '<tr><td>${AcquisitionDate: PopupDateFormat}</td></td>'
                    );
                });
                _map.infoWindow.setFeatures(res.catalogItems.features);
                _map.infoWindow.show(evt.mapPoint);
            }, function(err) {
                console.dir(err);
            });

            // Manual Request Method
            // var content = {};
            // content.f = 'json';
            // content.renderingRule = '{"rasterFunction":"Stretch","rasterFunctionArguments": {"StretchType":6,"DRA":true,"Gamma":[1.4,1.4,1.4],"UseGamma":true,"MinPercent":0.5,"MaxPercent":0.5},"outputPixelType":"U8"}';
            // content.pixelSize = '{"x":' + _map.getScale() + ',"y": ' + _map.getScale() + ',"spatialReference":{"wkid":102100}}';
            // content.geometry = JSON.stringify(evt.mapPoint);
            // content.geometryType = 'esriGeometryPoint';
            // content.returnCatalogItems = true;
            // content.returnGeometry = true;

            // var req = esriRequest({
            //     url: landSatConfig.url + '/identify',
            //     content: content,
            //     handleAs: 'json',
            //     callbackParamName: "callback"
            // });

            // req.then(function (res) {
            //     console.dir(res.catalogItems.features);
            // }, function (err) {
            //     console.dir(err);
            // });

        },

        getArchiveNoaaInfoWindow: function(event) {

            var qconfig = MapConfig.indonesiaLayers,
                _self = this,
                url = qconfig.url,
                itask = new IdentifyTask(url),
                iparams = new IdentifyParameters(),
                point = event.mapPoint,
                executeReturned = true,
                time = new Date(),
                today = new Date(),
                todayString = '',
                dateString = '',
                defs = [];

            var otherCheck = dom.byId("noaa-fires-18");
            if (otherCheck.getAttribute("aria-checked") == 'false') {
                return;
            }
            // If the layer is not visible, then dont show it
            if (!_map.getLayer("IndonesiaFires").visible) {
                //_self.mapClick(event);
                return;
            }

            iparams.geometry = point;
            iparams.tolerance = 3;
            iparams.returnGeometry = false;
            iparams.mapExtent = _map.extent;
            iparams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
            iparams.layerIds = [9];

            var thisLayer = _map.getLayer(qconfig.id);

            itask.execute(iparams, function(response) {

                var map = _map;
                var result = response[0];

                if (result) {
                    if (result.layerId == 2) {
                        return;
                    }
                    executeReturned = false;
                    var date = result.feature.attributes.Date;
                    var dateFormatted = date.split(" ");
                    var dateFormatted = dateFormatted[0];

                    var content = "</div><table id='infoWindowTable'>";
                    content += "<tr class='infoName'><strong>NOAA-18 fires</strong></tr>";
                    content += "<tr><td colspan='3'>DATE</td>";
                    content += "<td colspan='2'>" + dateFormatted + "</td></tr>";
                    content += "</table>";

                    map.infoWindow.setContent(content);
                    map.infoWindow.resize(170, 50);
                    map.infoWindow.show(point);
                } else {
                    _self.mapClick(event);
                }
            }, function(err) {
                _self.mapClick(event);
            });
        },

        getNOAAFiresInfoWindow: function(event) {

            var qconfig = MapConfig.indonesiaLayers,
                _self = this,
                url = qconfig.url,
                itask = new IdentifyTask(url),
                iparams = new IdentifyParameters(),
                point = event.mapPoint,
                executeReturned = true,
                time = new Date(),
                today = new Date(),
                todayString = '',
                dateString = '',
                defs = [];

            // If the layer is not visible, then dont show it
            if (!_map.getLayer(qconfig.id).visible) {
                _self.mapClick(event);
                return;
            }

            iparams.geometry = point;
            iparams.tolerance = 10;
            iparams.returnGeometry = false;
            iparams.mapExtent = _map.extent;
            iparams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;

            var content = "</div><table id='infoWindowTable'>";

            itask.execute(iparams, function(response) {
                var map = _map;
                var result = response[0];

                if (result) {
                    executeReturned = false;
                    content += "<tr class='infoName'><strong>NASA archived fires for Indonesia</strong></tr>";
                    arrayUtils.forEach(qconfig.query.fields, function(field) {
                        content += "<tr><td colspan='3'>" + field.label + "</td>";
                        content += "<td colspan='2'>" + result.feature.attributes[field.name] + "</td></tr>";

                    });
                    content += "</table>";
                    map.infoWindow.setContent(content);
                    // map.infoWindow.setTitle("Title");
                    map.infoWindow.show(point);
                } else {
                    console.log("No result returned!");
                    _self.mapClick(event);
                }
            }, function(err) {
                _self.mapClick(event);
            });
        },

        getDigitalGlobeInfoWindow: function(evt) {

            var dgConf = MapConfig.digitalGlobe,
                dgLayer = _map.getLayer(MapConfig.digitalGlobe.graphicsLayerId),
                query = new Query(),
                extents = {};

            if (evt.graphic) {
                if (evt.graphic.attributes.Layer !== 'Digital_Globe') {
                    return;
                }
            }
            if (evt.graphic === undefined) {
                return;
            }

            query.geometry = evt.graphic.geometry;
            query.where = "Category = 1";
            query.returnGeometry = false;
            query.outFields = ['*'];

            // esri.config.defaults.io.corsEnabledServers.push("http://175.41.139.43");

            var layers = all(MapConfig.digitalGlobe.mosaics.map(function(i) {
                var deferred = new Deferred();
                query.geometry = evt.graphic.geometry;
                query.returnGeometry = false;
                query.outFields = ['*'];
                var task = new QueryTask(MapConfig.digitalGlobe.imagedir + i + "/ImageServer");
                task.execute(query, function(results) {
                    deferred.resolve(results.features);
                }, function(err) {

                    deferred.resolve([]);
                });
                return deferred.promise;
            })).then(function(results) {
                var content = '';
                var features = [];
                var thumbs = dijit.byId('timeSliderDG').thumbIndexes;
                var timeStops = dijit.byId('timeSliderDG').timeStops;
                var start = moment(timeStops[thumbs[0]]).tz('Asia/Jakarta');
                var end = moment(timeStops[thumbs[1]]).tz('Asia/Jakarta');
                results.map(function(featureArr) {
                    featureArr.map(function(feature) {
                        features.push(feature);
                    });
                });

                features.sort(function(left, right) {
                    return left.attributes.AcquisitionDate == right.attributes.AcquisitionDate ? 0 : (left.attributes.AcquisitionDate > right.attributes.AcquisitionDate ? -1 : 1);
                });

                content += "<p>Click a date below to see the imagery.</p><ul class='popup-list'><li><strong>Date <span class='satelliteColumn'>Satellite</span></strong></li>";

                arrayUtils.forEach(features, function(f) {
                    var date = moment(f.attributes.AcquisitionDate).tz('Asia/Jakarta');
                    if (date >= start && date <= end) {
                        content += "<li><a class='popup-link' data-bucket='" + f.attributes.SensorName + "_id_" + f.attributes.OBJECTID + "'> " + date.format("YYYY/MM/DD") + "  <span class='satelliteColumn' data-bucket='" + f.attributes.SensorName + "_id_" + f.attributes.OBJECTID + "'>" + f.attributes.SensorName + "</span></a>" + "</li>";
                    }

                });

                content += "</ul><a class='custom-zoom-to' id='custom-zoom-to'>Zoom To</a>";

                _map.infoWindow.setContent(content);
                _map.infoWindow.resize(270, 500);
                _map.infoWindow.show(point);

                activeFeatureIndex = 0;
                dojoQuery(".contentPane .popup-link").forEach(function(node, index) {
                    handles.push(on(node, "click", function(evt) {
                        var target = evt.target ? evt.target : evt.srcElement,
                            bucket = target.dataset ? target.dataset.bucket : target.getAttribute("data-bucket");

                        //pass in either bucket or target and have an 'if' saying whether the current row has an id = to the popup that was clicked

                        $("#imageryWindow > table > tbody > tr").each(function() {

                            $(this).removeClass("imageryRowSelected");

                            var selectedRow = this.firstElementChild;
                            selectedRow = $(selectedRow).html();
                            selectedRow = $(selectedRow).attr("data-bucket");

                            if (bucket == selectedRow) {
                                $(this).addClass("imageryRowSelected");

                                // var rowpos = $(this).position();
                                // $('#imageryWindow > table > tbody').scrollTop(rowpos.top);

                            }
                        });

                        var propertyArray = bucket.split("_");
                        var bucketObj = {};
                        bucketObj.feature = {};
                        bucketObj.feature.attributes = {};
                        bucketObj.feature.attributes.SensorName = propertyArray[0];
                        bucketObj.feature.attributes.OBJECTID = propertyArray[2];
                        LayerController.showDigitalGlobeImagery(bucketObj);
                        activeFeatureIndex = index;

                    }));
                });

                handles.push(on(dom.byId("custom-zoom-to"), "click", function(evt) {

                    var point = new Point(features[activeFeatureIndex].attributes.CenterX, features[activeFeatureIndex].attributes.CenterY,
                        _map.spatialReference);

                    _map.centerAndZoom(point, 12);
                }));

                on.once(_map.infoWindow, "hide", function() {
                    arrayUtils.forEach(handles, function(handle) {
                        handle.remove();
                    });
                });

            });

            // dgLayer.queryFeatures(query,function (res) {
            //     var features = [],
            //         content = "";

            //     console.log("DG FP RES", res);

            //     arrayUtils.forEach(res, function (item) {
            //         features.push(item.feature);
            //     });

            //     if (features.length === 0) {
            //         return;
            //     }

            //     content += "<p>Click a date below to see the imagery.</p><ul class='popup-list'>";

            //     arrayUtils.forEach(features, function (f) {
            //         content += "<li><a class='popup-link' data-bucket='" + f.attributes.Tiles + "'>Date: " + f.attributes.Date + "</a></li>";
            //     });

            //     content += "</ul><a class='custom-zoom-to' id='custom-zoom-to'>Zoom To</a>";

            //     _map.infoWindow.setContent(content);
            //     _map.infoWindow.show(point);

            //     if (features.length === 1) {
            //         LayerController.showDigitalGlobeImagery(features[0].attributes.Tiles);
            //         activeFeatureIndex = 0;
            //     } else {
            //         // LayerController.showDigitalGlobeImagery(features[0].attributes.Tiles);
            //         activeFeatureIndex = 0;
            //         dojoQuery(".contentPane .popup-link").forEach(function (node, index) {
            //             handles.push(on(node, "click", function (evt) {
            //                 var target = evt.target ? evt.target : evt.srcElement,
            //                     bucket = target.dataset ? target.dataset.bucket : target.getAttribute("data-bucket");
            //                 LayerController.showDigitalGlobeImagery(bucket);
            //                 activeFeatureIndex = index;
            //             }));
            //         });
            //     }

            //     handles.push(on(dom.byId("custom-zoom-to"), "click", function (evt) {                    
            //         var point = new Point(features[activeFeatureIndex].attributes.CenterX, features[activeFeatureIndex].attributes.CenterY);
            //         _map.centerAndZoom(point, 17);
            //         _map.infoWindow.show(point);
            //     }));

            //     on.once(_map.infoWindow, "hide", function () {
            //         arrayUtils.forEach(handles, function (handle) {
            //             handle.remove();
            //         });
            //     });

            // }, function (err) {
            //     console.dir(err);
            // });

            // LayerController.showDigitalGlobeImagery();

            // Temporary, Remove All Code below when done and import code from 
            // getDigitalGlobeServiceInfoWindow function
            // if (evt.graphic.attributes.Source === 'Digital_Globe') {
            //     this.getDigitalGlobeServiceInfoWindow(evt);
            //     return;
            // }

            var url = MapConfig.digitalGlobe.identifyUrl,
                itask = new IdentifyTask(url),
                iparams = new IdentifyParameters(),
                point = evt.mapPoint,
                handles = [],
                activeFeatureIndex;

            iparams.geometry = point;
            iparams.tolerance = 3;
            iparams.returnGeometry = true;
            iparams.mapExtent = _map.extent;
            iparams.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;
            iparams.layerIds = [0];

            function getContent(graphic) {
                return "<div>Date: " + graphic.attributes.Date + "</div>";
            }



            // itask.execute(iparams, function (res) {
            //     var features = [],
            //         content = "";
            //     arrayUtils.forEach(res, function (item) {
            //         features.push(item.feature);
            //     });

            //     if (features.length === 0) {
            //         return;
            //     }

            //     content += "<p>Click a date below to see the imagery.</p><ul class='popup-list'>";

            //     arrayUtils.forEach(features, function (f) {
            //         content += "<li><a class='popup-link' data-bucket='" + f.attributes.Tiles + "'>Date: " + f.attributes.Date + "</a></li>";
            //     });

            //     content += "</ul><a class='custom-zoom-to' id='custom-zoom-to'>Zoom To</a>";

            //     _map.infoWindow.setContent(content);
            //     _map.infoWindow.show(point);

            //     if (features.length === 1) {
            //         LayerController.showDigitalGlobeImagery(features[0].attributes.Tiles);
            //         activeFeatureIndex = 0;
            //     } else {
            //         // LayerController.showDigitalGlobeImagery(features[0].attributes.Tiles);
            //         activeFeatureIndex = 0;
            //         dojoQuery(".contentPane .popup-link").forEach(function (node, index) {
            //             handles.push(on(node, "click", function (evt) {
            //                 var target = evt.target ? evt.target : evt.srcElement,
            //                     bucket = target.dataset ? target.dataset.bucket : target.getAttribute("data-bucket");
            //                 LayerController.showDigitalGlobeImagery(bucket);
            //                 activeFeatureIndex = index;
            //             }));
            //         });
            //     }

            //     handles.push(on(dom.byId("custom-zoom-to"), "click", function (evt) {                    
            //         var point = new Point(features[activeFeatureIndex].attributes.CenterX, features[activeFeatureIndex].attributes.CenterY);
            //         _map.centerAndZoom(point, 17);
            //         _map.infoWindow.show(point);
            //     }));

            //     on.once(_map.infoWindow, "hide", function () {
            //         arrayUtils.forEach(handles, function (handle) {
            //             handle.remove();
            //         });
            //     });

            // }, function (err) {
            //     console.dir(err);
            // });

        },

        // getDigitalGlobeServiceInfoWindow: function (evt) {
        //     var layer = _map.getLayer(MapConfig.digitalGlobe.graphicsLayerId),
        //         mapPoint = evt.mapPoint,
        //         activeFeatureIndex = 0,
        //         query = new Query(),
        //         foundFeatures,
        //         handles = [],
        //         content = "",
        //         circle;

        //     circle = new Circle({
        //         center: mapPoint,
        //         geodesic: true,
        //         radius: 3,
        //         radiusUnit: "esriMiles"
        //     });

        //     query.geometry = circle.getExtent();

        //     layer.queryFeatures(query, function (res) {
        //         if (res.features.length === 0) {
        //             return;
        //         }
        //         foundFeatures = res.features;
        //         content += "<p>Click a date below to see the imagery.</p><ul class='popup-list'>";
        //         arrayUtils.forEach(foundFeatures, function (feature) {
        //             content += "<li><a class='popup-link' data-id='" + feature.attributes.featureId + "'>Date: " + feature.attributes.acquisitionDate + "</a></li>";
        //         });
        //         content += "</ul><a class='custom-zoom-to' id='custom-zoom-to'>Zoom To</a>";
        //         _map.infoWindow.setContent(content);
        //         _map.infoWindow.show(mapPoint);

        //         dojoQuery(".contentPane .popup-link").forEach(function (node, index) {
        //             handles.push(on(node, "click", function (evt) {
        //                 var target = evt.target ? evt.target : evt.srcElement,
        //                     id = target.dataset ? target.dataset.id : target.getAttribute("data-id");
        //                 LayerController.showDigitalGlobeService(id);
        //                 activeFeatureIndex = index;
        //             }));
        //         });

        //         handles.push(on(dom.byId("custom-zoom-to"), "click", function (evt) {                    
        //             _map.setExtent(foundFeatures[activeFeatureIndex].geometry.getExtent(), true);
        //         }));

        //         on.once(_map.infoWindow, "hide", function () {
        //             arrayUtils.forEach(handles, function (handle) {
        //                 handle.remove();
        //             });
        //         });

        //     });

        // },




        getFireTweetsInfoWindow: function(feats) {


            var attr, html, features = [];
            _map.infoWindow.anchor = "ANCHOR_UPPERRIGHT";
            // var attr = evt.attributes;
            // var html = "<table><tr><td>";
            // html += "<td><img src='" + attr.UserProfileImage + "'/></td>";
            // html += "<td>" + attr.UserName + "</td></tr>";
            // html += "<p>" + attr.Text + "</p>";
            // html += "<p>" + attr.Date + "</p>";
            //html += "</div>"
            // console.log(html);
            // if (evt._count > 0) {
            //     debugger;
            //     map.infoWindow.setContent(html);
            //     map.infoWindow.show(evt.geometry);
            // }

            for (var i = 0; i < feats.length; i++) {
                attr = feats[i].feature.attributes;
                html = "<table>";
                for (var propertyName in attr) {
                    if (attr[propertyName] && (propertyName == 'UserName' || propertyName == 'Text' || propertyName == 'Date' || propertyName == 'UserProfileImage')) {
                        if (propertyName == "UserProfileImage") {

                            html += "<tr><td><img src='" + feats[i].feature.attributes.UserProfileImage + "'/></td></tr>";

                        } else {
                            html += "<tr><td>" + propertyName + ": " + attr[propertyName] + "</td></tr>";
                        }

                    }
                }
                html += "</div>";
                template = new InfoTemplate(feats[i].feature.attributes.UserName, html);

                feats[i].feature.setInfoTemplate(template);
                features.push(feats[i].feature);

            }


            //evt.stopPropagation();
            return features;
        },

        getFireStoriesInfoWindow: function(feats) {

            //TODO: Add Attachments!
            _map.infoWindow.anchor = "ANCHOR_UPPERRIGHT";
            var attr, html, features = [];
            for (var i = 0; i < feats.length; i++) {
                // attr = feats[i].feature.attributes;
                // html = "<table>";
                // for (var propertyName in attr) {

                //     // if (attr[propertyName] != "Null" && (propertyName != 'OBJECTID' || propertyName != 'SHAPE' || propertyName != 'Publish')) {
                //     if (attr[propertyName] != "Null" && propertyName != 'OBJECTID' && propertyName != 'SHAPE' && propertyName != 'Publish') {
                //         html += "<tr><td>" + propertyName + ": " + attr[propertyName] + "</td></tr>";

                //     }
                // }
                // html += "</div>";
                // template = new InfoTemplate(feats[i].feature.attributes.Title, html);

                // feats[i].feature.setInfoTemplate(template);

                for (attr in feats[i].feature.attributes) {
                    if (feats[i].feature.attributes[attr] == "Null") {
                        feats[i].feature.attributes[attr] = "";
                    }
                }
                var fireStory_popupTemplate = new PopupTemplate({
                    title: "{Title}",
                    //"content": htmlContent,
                    fieldInfos: [{
                        fieldName: "Date",
                        label: "Date",
                        format: {
                            dateFormat: 'shortDate'
                        },
                        visible: true
                    }, {
                        fieldName: "Details",
                        label: "Details",
                        visible: true
                    }, {
                        fieldName: "Video",
                        label: "Video",
                        visible: true
                    }, {
                        fieldName: "Name",
                        label: "Name",
                        visible: true
                        // }, {
                        //     fieldName: "Email",
                        //     label: "Email",
                        //     visible: true
                    }],
                    "showAttachments": true

                });



                feats[i].feature.setInfoTemplate(fireStory_popupTemplate);

                features.push(feats[i].feature);

            }



            return features;
        },

        selectUploadOrDrawnGraphics: function(evt) {
            if ($('#uploadCustomGraphic').length > 0) {
                $("#uploadCustomGraphic").remove();
            }


            var graphic = evt.graphic,
                uniqueIdField = MapConfig.defaultGraphicsLayerUniqueId,
                labelField = MapConfig.defaultGraphicsLayerLabel,
                _self = this,
                content,
                handle,
                title;

            // Stop the event from propogating to prevent info window from closing immediately
            // by some other function
            evt.stopPropagation();

            title = "<strong>Custom Feature</strong>";
            content = "Name: <input id='editTitle' style='width:165px;' class='editshow' value='Custom Feature'/>" + "<br/>" +
                "<div id='uploadCustomGraphic' class='uploadCustomGraphic'><span id='customGraphicSymbol'></span>Subscribe</div>" +
                "<div id='deleteCustomGraphic' class='deleteGraphicLink'>&#10007 Remove</div>";


            var graphics = _map.graphics.graphics;


            // for (var i = 0; i < graphics.length; i++) {
            //     if (graphics[i].geometry.type !== "point") {
            //         if (!graphics[i].attributes) {

            //             graphics.splice(i, 1);
            //         }

            //     }
            // }

            var whereInArray = MapModel.vm.customFeaturesArray.indexOf(graphic);


            // if (MapModel.vm.customFeaturesArray()[0].attributes.ALERTS_LABEL == "Custom Drawn Feature - 1");
            //_map.infoWindow.setTitle(MapModel.vm.customFeaturesArray()[whereInArray].attributes.ALERTS_LABEL);
            //_map.infoWindow.setTitle(title);
            _map.infoWindow.setContent(content);
            $('#editTitle').val(graphic.attributes.ALERTS_LABEL);
            _map.infoWindow.show(evt.mapPoint);
            // debugger;
            // on(dom.byId('editTitle'), "focus", function(evt) {
            //     console.log("edit title fired");
            //     domAttr.set(dom.byId('editPtTitle'), 'value', title);
            // });
            // on(dom.byId('editTitle'), "keypress", function(evt) {

            //     var key = evt.keyCode;
            //     if (key === keys.ENTER) {

            //         var updatedFeature = MapModel.vm.customFeaturesArray()[(graphic.attributes.UNIQUE_GRAPHIC_ID - 1)];
            //         updatedFeature.attributes.ALERTS_LABEL = newtitle;
            //         var newtitle = dom.byId('editTitle').value;

            //         _map.infoWindow.setTitle("<strong>" + newtitle + "</strong>");
            //         graphic.attributes.ALERTS_LABEL = newtitle;
            //     }
            // });

            // on.once(_map.infoWindow, "show", function() {

            //     //if (newtitle) {
            //     $('#editTitle').val(graphic.attributes.ALERTS_LABEL);
            //     //}
            // });

            handle = on.once(dom.byId('deleteCustomGraphic'), 'click', function() {
                LayerController.removeGraphicWithId(graphic.attributes[uniqueIdField], uniqueIdField);
                if (_map.graphics.graphics.length === 0) {
                    MapModel.vm.customFeaturesPresence(false);
                }
                _map.infoWindow.hide();
            });

            handleSubscribe = on.once(dom.byId('uploadCustomGraphic'), 'click', function() {
                //LayerController.removeGraphicWithId(graphic.attributes[uniqueIdField], uniqueIdField);
                var geom = graphic;
                var newtitle = dom.byId('editTitle').value;
                graphic.attributes.ALERTS_LABEL = newtitle;

                _self.subscribeToAlerts(geom);
                _map.infoWindow.hide();
            });
            $('#editTitle').bind('input', function() {
                var newtitle = $(this).val(); // get the current value of the input field.
                graphic.attributes.ALERTS_LABEL = newtitle;
            });

            on.once(_map.infoWindow, "hide", function() {

                //graphic.attributes.ALERTS_LABEL = newtitle;
                handle.remove();
                handleSubscribe.remove();
            });


        },

        subscribeToAlerts: function(geom) {

            var _self = this;
            require([
                "dojo/on",
                "dijit/Dialog",
                "dojo/dom-construct",
            ], function(on, Dialog, domConstruct) {
                // $("#subscribeDialogWindow > div.dijitDialogTitleBar > span.dijitDialogCloseIcon").html("x");
                // $(".dijitDialog .closeText").css("display", "block !important");
                // $(".dijitDialog .closeText").css("position", "relative");
                var dialog = new Dialog({
                        id: "subscribeDialogWindow",
                        title: 'Subscribe to Alerts!',
                        refocus: false,
                        style: 'width: 300px;'
                    }),
                    linker,
                    content = "<div class='subscription-content'>" +
                    "<p>Enter your email below to receive fire alerts</p>" +
                    "<div class='email-container'><input id='userEmail' type='text' placeholder='Email'/></div>" +
                    "<p>Enter your phone number below to receive SMS alerts</p>" +
                    "<div class='phone-container'><input id='userPhone' type='tel' placeholder='Phone Number'/></div>" +
                    //"<span id='valid-msg' class='hide'>✓ Valid</span>" +
                    //"<span id='error-msg' class='hide'>Invalid number</span>" +
                    "<div class='submit-container'><button id='subscribe-now'>Subscribe</button></div>" +
                    "<div id='form-response' class='message-container'></div>" +
                    "</div>";
                content += "<input type='email' name='verify_email' id='verifyEmailForAlertsInMap' placeholder='Verify Email(Leave blank if your human)'/>";

                dialog.on('hide', cleanup);

                dialog.setContent(content);
                dialog.show();

                // var errorMsg = $("#error-msg"),
                //     validMsg = $("#valid-msg");
                telInput = $("#userPhone");
                telInput.intlTelInput({
                    validationScript: './app/libs/isValidNumber.js'
                    //utilsScript: "./app/libs/libphonenumber/build/utils.js"
                });

                // telInput.blur(function() {
                //     debugger;
                //     if ($.trim(telInput.val())) {
                //         if (telInput.intlTelInput("isValidNumber")) {
                //             validMsg.removeClass("hide");
                //         } else {
                //             telInput.addClass("error");
                //             errorMsg.removeClass("hide");
                //             validMsg.addClass("hide");
                //         }
                //     }
                // });

                function cleanup() {
                    linker.remove();
                    dialog.destroy();

                    telInput.intlTelInput('destroy');
                }

                linker = on(dom.byId("subscribe-now"), 'click', function() {
                    require([
                        "dojox/validate/web", "dojo/dom-style"
                    ], function(validate, domStyle) {
                        honeyPotValue = dom.byId("verifyEmailForAlertsInMap").value;
                        if (honeyPotValue !== '') {
                            dialog.destroy();
                            return;
                        }
                        emailValue = dom.byId("userEmail").value;
                        phoneValue = dom.byId("userPhone").value;

                        if (!emailValue && !phoneValue) {
                            domStyle.set("userPhone", "border", "1px solid red");
                            domStyle.set("userEmail", "border", "1px solid red");
                            alert("You must enter an email or phone number");
                            return;
                        }
                        if (emailValue) {

                            if (!validate.isEmailAddress(emailValue)) {
                                domStyle.set("userEmail", "border", "1px solid red");
                                alert("You must enter a valid email address!");
                                return;
                            }
                            domStyle.set("userEmail", "border", "1px solid gray");
                            dom.byId("subscribe-now").innerHTML = "Submitting...";

                            _self.postSubscribeRequest(geom, emailValue, "email", dialog);
                            Analytics.sendEvent("Subscribe", "click", "Fire Alerts", "User is subscribing to Fire Alerts via Email.");
                        }

                        if (phoneValue) {
                            // var test = validate.isNumberFormat(phoneValue, {
                            //     format: "+# (###) ###-####"
                            // });

                            // function isValidPhonenumber(value) {
                            //     return (/^\d{8,}$/).test(value.replace(/[\s()+\-\.]|ext/gi, ''));

                            // }
                            // var bool = isValidPhonenumber(phoneValue);

                            // //if (phoneValue.length < 17) {
                            // // if (!telInput.intlTelInput("isValidNumber")) {
                            // if (!bool) {

                            //     domStyle.set("userPhone", "border", "1px solid red");
                            //     alert("Please enter in a complete phone number");
                            //     return;
                            // }

                            domStyle.set("userPhone", "border", "1px solid gray");
                            dom.byId("subscribe-now").innerHTML = "Submitting...";
                            _self.postSubscribeRequest(geom, phoneValue, "sms", dialog);
                            Analytics.sendEvent("Subscribe", "click", "Fire Alerts", "User is subscribing to Fire Alerts via SMS.");
                        }
                        //dialog.destroy();
                    });
                });
            });
        },

        postSubscribeRequest: function(graphic, address, type, dialog) {
            var _self = this;

            if (type === "sms") {
                address = address.replace(/\D/g, '');
            }

            var subscribeUrl = MainConfig.emailSubscribeUrlPoly,
                deferred = new Deferred(),
                params = {
                    'features': JSON.stringify({
                        "rings": graphic.geometry.rings,
                        "spatialReference": graphic.geometry.spatialReference
                    }),
                    'msg_addr': address,
                    'msg_type': type,
                    'area_name': graphic.attributes.ALERTS_LABEL
                },
                res;

            xhr(subscribeUrl, {
                handleAs: "json",
                method: "POST",
                data: params
            }).then(function(res) {
                //dialog.destroy();
                if (emailValue && phoneValue) {
                    dialog.setContent("<p>You have successfully subscribed. You will receive an email asking you to <strong>verify your subscription</strong>. Please be sure to check your SPAM folder. Once verified, you will start receiving alerts for your area.</p>");
                } else if (emailValue && !phoneValue) {
                    dialog.setContent("<p>You have successfully subscribed. You will receive an email asking you to <strong>verify your subscription</strong>. Please be sure to check your SPAM folder. Once verified, you will start receiving alerts for your area.</p>");
                } else {
                    dialog.setContent("<p>You have successfully subscribed, you should start receiving SMS alerts as they come in for your area of interest.</p>");
                }
                // if (type === "email") {
                //     //alert("You have successfully subscribed, you should star receiving Email alerts as they come in for your area of interest.");
                //     dialog.setContent("<p>You have successfully subscribed, you should start receiving Email alerts as they come in for your area of interest.</p>")
                // } else {
                //     var newContent = dialog.content;
                //     if (!emailValue) {
                //         dialog.setContent("<p>You have successfully subscribed, you should start SMS receiving alerts as they come in for your area of interest.</p>");
                //     } else {
                //         newContent = "<p>You have successfully subscribed, you should start receiving Email alerts as they come in for your area of interest.</p><p>You have successfully subscribed, you should start SMS receiving alerts as they come in for your area of interest.</p>";
                //         dialog.setContent(newContent);
                //     }
                //     //alert("You have successfully subscribed, you should start SMS receiving alerts as they come in for your area of interest.");
                // }
                deferred.resolve(true);

            }, function(err) {
                alert("There was an error subsrcribing at this time. " + err.message);
                dialog.destroy();
                deferred.resolve(false);
            });

            return deferred.promise;
        },

        setupInfowindowListeners: function() {
            var handle,
                _self = this;

            on(map.infoWindow, 'selection-change', function() {
                setTimeout(function() {
                    if (dom.byId('uploadCustomGraphic')) {
                        if (handle) {
                            handle.remove();
                        }

                        handle = on(dom.byId('uploadCustomGraphic'), 'click', function() {
                            var index = map.infoWindow.selectedIndex;

                            var feat = map.infoWindow.features[index];
                            //feat.attributes.ALERTS_LABEL = item.value;
                            _self.subscribeToAlerts(feat);
                        });

                    }
                }, 0);
            });

            on(map.infoWindow, 'hide', function() {
                if (handle) {
                    handle.remove();
                }
            });
        }

    };

});