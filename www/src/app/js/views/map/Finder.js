/* global define, alert */
define([
    'dojo/dom',
    'dojo/_base/array',
    'dojo/on',
    'dojo/mouse',
    'dojo/query',
    'dojo/Deferred',
    'dojo/promise/all',
    'dojo/request/xhr',
    'dojo/dom-attr',
    'dojo/dom-class',
    'dojo/keys',
    'esri/layers/FeatureLayer',
    'esri/graphic',
    'esri/request',
    'esri/tasks/ImageServiceIdentifyParameters',
    'esri/tasks/ImageServiceIdentifyTask',
    'esri/layers/RasterFunction',
    'esri/InfoTemplate',
    'esri/dijit/PopupTemplate',
    'esri/geometry/Point',
    'esri/geometry/webMercatorUtils',
    'esri/symbols/PictureMarkerSymbol',
    'main/Config',
    'views/map/MapConfig',
    'views/map/MapModel',
    'views/map/LayerController',
    'esri/tasks/IdentifyTask',
    'esri/tasks/IdentifyParameters',
    'esri/tasks/query',
    'esri/tasks/QueryTask',
    'esri/geometry/Circle',
    'utils/Analytics',
    'esri/geometry/geometryEngine'
], function(dom, arrayUtils, on, mouse, dojoQuery, Deferred, all, xhr, domAttr, domClass, keys, FeatureLayer, Graphic, esriRequest,
    ImageServiceIdentifyParameters, ImageServiceIdentifyTask, RasterFunction, InfoTemplate, PopupTemplate, Point, webMercatorUtils,
    PictureSymbol, MainConfig, MapConfig, MapModel, LayerController, IdentifyTask, IdentifyParameters, Query, QueryTask, Circle, Analytics, geometryEngine) {
    var _map;

    var titleHandlers = [];
    var fireItemHandlers = [];
    var currentFootprints = [];

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
                invalidMessage = 'You did not enter a valid value.  Please check that your location values are all filled in and nubmers only.',
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
            console.log('Map Click event!');
            if ($('#uploadCustomGraphic').length > 0) {
                $('#uploadCustomGraphic').remove();
            }
            var map = _map,
                _self = this,
                isForestUsePop,
                mapPoint = event.mapPoint;

            var deferreds = [],
                features = [];

            map.infoWindow.clearFeatures();

            var overlaysLayer = map.getLayer(MapConfig.overlaysLayer.id);
            if (overlaysLayer) {
                if (overlaysLayer.visible) {
                    deferreds.push(_self.identifyOverlays(mapPoint));
                }
            }

            var forestUseLayer = map.getLayer(MapConfig.forestUseLayers.id);
            if (forestUseLayer) {
                if (forestUseLayer.visible) {
                    deferreds.push(_self.identifyForestUse(mapPoint));
                }
            }

            var landUseLayer = map.getLayer(MapConfig.landUseLayers.id);
            if (landUseLayer) {
                if (landUseLayer.visible) {
                    deferreds.push(_self.identifyLandUse(mapPoint));
                }
            }

            var conservationLayers = map.getLayer(MapConfig.conservationLayers.id);
            if (conservationLayers) {
                if (conservationLayers.visible) {
                    deferreds.push(_self.identifyConservation(mapPoint));
                }
            }
            var fireStoryLayer = map.getLayer(MapConfig.fireStories.id);
            if (fireStoryLayer) {
                if (fireStoryLayer.visible) {
                    deferreds.push(_self.identifyFireStories(mapPoint));
                }
            }

            var fireTweets = map.getLayer(MapConfig.tweetLayer.id);
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
                        case 'Overlays_Layer':
                            features = features.concat(_self.setOverlaysTemplates(item.features));
                            break;
                        case 'Forest_Use':
                            isForestUsePop = true;
                            features = features.concat(_self.setForestUseTemplates(item.features));
                            break;

                        case 'Land_Use':
                            isForestUsePop = true;
                            features = features.concat(_self.setForestUseTemplates(item.features));
                            break;

                        case 'Conservation':
                            features = features.concat(_self.setConservationTemplatesFull(item.features));
                            break;
                        case 'Fire_Stories':
                            _self.getFireStoriesInfoWindow(item.features);
                            features = [];
                            // map.infoWindow.hide();
                            break;
                        case 'Fire_Tweets':
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
                    if (featureSets[0].layer === 'Fire_Stories') {
                        map.infoWindow.resize(550,300);
                    } else {
                        map.infoWindow.resize(300,300);
                    }


                    if(isForestUsePop){
                        _self.connectFirePopEvents();
                    }
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
            }, function() {
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
                    var queries = features.map(function(feature){
                        var qDeferred = new Deferred();
                        var queryTask = new QueryTask(MapConfig.firesLayer.url + '4');
                        var query = new Query();
                        query.geometry = feature.feature.geometry;
                        query.where = '1=1';
                        query.outFields = ['Date'];
                        queryTask.execute(query).then(function(results){
                                feature.fires = results.features;

                                setTimeout(function() {
                                    qDeferred.resolve(false);
                                }, 3000);
                                qDeferred.resolve(feature);
                        });
                        return qDeferred;
                    });
                    all(queries).then(function(qResults){
                                deferred.resolve({
                                    layer: MapConfig.forestUseLayers.id,
                                    features: qResults
                                });
                    });

                } else {
                    deferred.resolve(false);
                }
            }, function() {
                deferred.resolve(false);
            });

            return deferred.promise;
        },

        identifyLandUse: function(mapPoint) {
            var deferred = new Deferred(),
                identifyTask = new IdentifyTask(MapConfig.landUseLayers.url),
                params = new IdentifyParameters();

            params.tolerance = 3;
            params.returnGeometry = true;
            params.width = _map.width;
            params.height = _map.height;
            params.geometry = mapPoint;
            params.mapExtent = _map.extent;
            params.layerIds = _map.getLayer(MapConfig.landUseLayers.id).visibleLayers;
            params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

            identifyTask.execute(params, function(features) {
                if (features.length > 0) {
                    var queries = features.map(function(feature){
                        var qDeferred = new Deferred();
                        var queryTask = new QueryTask(MapConfig.firesLayer.url + '4');
                        var query = new Query();
                        query.geometry = feature.feature.geometry;
                        query.where = '1=1';
                        query.outFields = ['Date'];
                        queryTask.execute(query).then(function(results){
                                feature.fires = results.features;
                                qDeferred.resolve(feature);
                        });
                        return qDeferred;
                    });
                    all(queries).then(function(qResults){
                                deferred.resolve({
                                    layer: MapConfig.landUseLayers.id,
                                    features: qResults
                                });
                    });

                } else {
                    deferred.resolve(false);
                }
            }, function() {
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
                    var queries = features.map(function(feature){
                        var qDeferred = new Deferred();
                        var queryTask = new QueryTask(MapConfig.firesLayer.url + '4');
                        var query = new Query();
                        query.geometry = feature.feature.geometry;
                        query.where = '1=1';
                        query.outFields = ['Date'];
                        queryTask.execute(query).then(function(results){
                                feature.fires = results.features;

                                setTimeout(function() {
                                    qDeferred.resolve(false);
                                }, 3000);
                                qDeferred.resolve(feature);
                        });
                        return qDeferred;
                    });
                    all(queries).then(function(qResults){
                                deferred.resolve({
                                    layer: MapConfig.conservationLayers.id,
                                    features: qResults
                                });
                    });

                } else {
                    deferred.resolve(false);
                }
            }, function() {
                deferred.resolve(false);
            });

            return deferred.promise;

        },

        identifyFireStories: function(mapPoint) {
            var url = MapConfig.fireStories.url.split(MapConfig.fireStories.layerId);
            url = url[0];
            var deferred = new Deferred(),
                identifyTask = new IdentifyTask(url),
                params = new IdentifyParameters();

            params.tolerance = 5;
            params.maxAllowableOffset = 5000; //meters
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
                        layer: 'Fire_Stories',
                        features: features
                    });
                } else {
                    deferred.resolve(false);
                }
            }, function() {
                deferred.resolve(false);
            });

            return deferred.promise;
        },

        identifyFireTweets: function(mapPoint) {
            var url = MapConfig.tweetLayer.url.split('/3');
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
                        layer: 'Fire_Tweets',
                        features: features
                    });
                } else {
                    deferred.resolve(false);
                }
            }, function() {
                deferred.resolve(false);
            });

            return deferred.promise;
        },

        setOverlaysTemplates: function(featureObjects) {
            var template,
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
            if ($('#uploadCustomGraphic').length === 0) {
                $(".sizer > .actionsPane").append("<div id='uploadCustomGraphic' class='uploadCustomGraphic'>Subscribe</div>");
            }
            return features;

        },

        updateFirePopSelection: function(itemNode, updatePanel){
            var popnodes = dojoQuery('.fire-pop-item');
            if(popnodes.length < 1){return;}

            popnodes.forEach(function(popnode){
                domClass.remove(popnode, 'selected');
            });
            domClass.add(itemNode, 'selected');

            if(updatePanel){
                var panelFireOptionNode = dom.byId(itemNode.id.split('-')[0]);
                var mpc = require('views/map/MapController');
                mpc.toggleFireOption({srcElement: panelFireOptionNode});

            }
        },

        connectFirePopEvents: function(){
            var _self = this;
            var firepopnodes = dojoQuery('.fire-pop-item');
            titleHandlers.forEach(function(handler){
                handler.remove();
            });
            fireItemHandlers.forEach(function(handler){
                handler.remove();
            });

            titleHandlers = [dojoQuery('.titlePane > .prev')[0],dojoQuery('.titlePane > .next')[0]].map(function(node){
                return on(node, 'click', function(){
                            _self.connectFirePopEvents();
                        });
            });
            fireItemHandlers = firepopnodes.map(function(popnode){
                if(popnode.id.split('-')[0] === MapModel.vm.currentFireTime()){
                    domClass.add(popnode, 'selected');
                }
                return on(popnode, 'click', function(evt){
                    var itemNode = evt.currentTarget;
                    _self.updateFirePopSelection(itemNode, true);
                });
            });
        },

        getFirePopupContent: function(item) {
                var isFires = item.fires.length > 0;

                var firesDiv = '<div class="fire-popup-list" id="fireResults">Recent Fires';
                var noFiresDiv = '<div class="fire-popup-list no-fires" id="fireResults">No fires in past 7 days';
                var fire_results = isFires ? [firesDiv] : [noFiresDiv];

                if(isFires){
                    var fireCounts = [1, 2, 3, 7].map(function(numdays){
                    return item.fires.filter(function(fire){
                        return moment(fire.attributes.Date) > moment().subtract(numdays + 1, 'days');
                        }).length;
                    });

                    fire_results = fire_results.concat([
                                        '<div class="fire-pop-item-cont">',
                                        '<div id="firesWeek-pop" class="fire-pop-item"><div class="fire-pop-count">',fireCounts[3],'</div><div class="fire-pop-label">Week</div></div>',
                                        '<div id="fires72-pop" class="fire-pop-item"><div class="fire-pop-count">',fireCounts[2],'</div><div class="fire-pop-label">72 hrs</div></div>',
                                        '<div id="fires48-pop" class="fire-pop-item"><div class="fire-pop-count">',fireCounts[1],'</div><div class="fire-pop-label">48 hrs</div></div>',
                                        '<div id="fires24-pop" class="fire-pop-item"><div class="fire-pop-count">',fireCounts[0],'</div><div class="fire-pop-label">24 hrs</div></div>',
                                        '</div>'
                                ]);
                }

                fire_results.push('</div>');
                return fire_results;
        },

        getAdditonalInfoContent: function(item){
            var attr = item.feature.attributes;
            var tables = {
                    0: [
                        "<table class='forest-use-pop'>",
                            "<tr><td>Country</td><td>", attr.Country, "</td>",
                            "</tr><tr><td>Certification Status</td><td>", attr.CERT_STAT, "</td></tr>",
                            "<tr><td>Source </td><td>", (attr.Source || "N/A"), "</td></tr>",
                            "<tr style='height:10px;'></tr>",
                        "</table>"
                    ],
                    1: [
                        "<table class='forest-use-pop'>",
                            "<tr><td>Country</td><td>", attr.Country, "</td>",
                            "</tr><tr><td>Certification Status</td><td>", attr.CERT_STAT, "</td></tr>",
                            "<tr><td>Source </td><td>", (attr.Source || "N/A"), "</td></tr>",
                            "<tr style='height:10px;'></tr>",
                        "</table>"
                    ],
                    3: [
                        "<table class='forest-use-pop'>",
                            "<tr><td>Country</td><td>", attr.Country, "</td>",
                            "</tr><tr><td>Certification Status</td><td>", attr.CERT_STAT, "</td></tr>",
                            "<tr><td>Source </td><td>", (attr.Source || "N/A"), "</td></tr>",
                            "<tr style='height:10px;'></tr>",
                        "</table>"
                    ],

                    4: [
                        "<table class='forest-use-pop'>",
                            "<tr><td>Country</td><td>", attr.Country, "</td></tr>",
                            "<tr><td>Certification Status</td><td>", attr["cert_schem"], "</td>",
                            "<tr><td>Certificate ID</td><td>", attr["certificat"], "</td></tr>",
                            "<tr><td>Certificate Issue Date</td><td>", attr.issued, "</td></tr>",
                            "<tr><td>Certificate Expiry Date</td><td>", attr.expired, "</td></tr>",
                            "<tr><td>Mill name</td><td>", attr.mill, "</td></tr>",
                            "<tr><td>Mill location</td><td>", attr.location, "</td></tr>",
                            "<tr><td>Mill capacity (t/hour)</td><td>", attr.capacity, "</td></tr>",
                            "<tr><td>Certified CPO (mt)</td><td>", attr.cpo, "</td></tr>",
                            "<tr><td>Certified PK (mt)</td><td>", attr.pk, "</td></tr>",
                            "<tr><td>Estate Suppliers</td><td>", attr.estate, "</td></tr>",
                            "<tr><td>Estate Area (ha)</td><td>", attr.estate_1, "</td></tr>",
                            "<tr><td>Outgrower Area (ha)</td><td>", attr.outgrower, "</td></tr>",
                            "<tr><td>Scheme Smallholder Area (ha)</td><td>", attr.sh, "</td></tr>",
                            "<tr><td>Source </td><td>", (attr.Source || "N/A"), "</td></tr>",
                            "<tr style='height:10px;'></tr>",
                        "</table>"
                    ],
                    7: false

                };
                return tables[item.layerId];
        },

        getAdditonalInfoContentProtected: function(item){

            var attr = item.feature.attributes;
            var tables = {
                    0:[
                        "<table class='conservation-use-pop'>",
                            "<tr><td>Local Name</td><td>", attr["Local Name"], "</td>",
                            "</tr><tr><td>Local Designation</td><td>", attr["Local Designation"], "</td></tr>",
                            "<tr><td>WDPA ID </td><td>", (attr["WDPA ID"] || "N/A"), "</td></tr>",
                            "<tr style='height:10px;'></tr>",
                        "</table>"
                    ]



                };
                return tables[item.layerId];
        },

        getTemplateContent:function(item){
            console.log(item)
                var fire_results = this.getFirePopupContent(item);

                var template_content_block = [
                                "<div>", item.feature.attributes.TYPE , "</div>",
                                "<div>Area (ha): ", item.feature.attributes.AREA_HA , "</div>",
                            ].concat(fire_results);


                template_content_block.push("<div>Additional Info</div>");
                var template_table;

                if (item.layerName === "WDPA Protected areas") {
                    template_table = this.getAdditonalInfoContentProtected(item);
                } else {
                    template_table = this.getAdditonalInfoContent(item);
                }


                if(!template_table){
                    return false;
                }

                var content = template_content_block.concat(template_table).join("");

                return content;
        },

        setForestUseTemplates: function(featureObjects) {
            var template,
                content = '',
                handleUpSubsc,
                _self = this,
                features = [];



            arrayUtils.forEach(featureObjects, function(item) {


                var template_title = ["<strong>" , item.value , "</strong>"].join('');
                var content = _self.getTemplateContent(item);
                if(!content){
                    return;
                }

                template = new InfoTemplate(template_title,content);
                item.feature.setInfoTemplate(template);
                item.feature.attributes.ALERTS_LABEL = item.value;

                features.push(item.feature);
            });

            if ($('#uploadCustomGraphic').length == 0) {
                $(".sizer > .actionsPane").append("<div id='uploadCustomGraphic' class='uploadCustomGraphic'>Subscribe</div>");
            }

            return features;
        },
        setConservationTemplatesFull: function(featureObjects) {
            var template,
                content = '',
                handleUpSubsc,
                _self = this,
                features = [];



            arrayUtils.forEach(featureObjects, function(item) {


                var template_title = ["<strong>" , item.value , "</strong>"].join('');
                var content = _self.getTemplateContent(item);
                if(!content){
                    return;
                }

                template = new InfoTemplate(template_title,content);
                item.feature.setInfoTemplate(template);
                item.feature.attributes.ALERTS_LABEL = item.value;

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
                    "<table><tr class='infoName'><td colspan='2'>" + item.feature.attributes.Name + "</td></tr><tr><td>Local Name</td><td>" + item.feature.attributes["Local Name"] + "</td></tr><tr><td>Legal Designation</td><td>" + item.feature.attributes["Local Designation"] + "</td></tr><tr><td>WDPA ID</td><td>" + item.feature.attributes["WDPA ID"] + "</td></tr><tr style='height:10px;'></tr></table>"
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
                // content += " <div><h3>" + result.attributes['name'] + "</h3></div>";
                content += "<tr><td><img src='" + qconfig.chipBucket + result.attributes['ChipLink'];
                content += "' style='width:300px' /></tc></tr>"
                content += "<div><strong>Image Acquisition Date:</strong> " + newDate + "</div>";
                if (result.attributes['Confirmation'] !== 1) {
                  content += "<div><strong>Confirmation:</strong> " + result.attributes['Confirmation'] + " people</div>";
                } else {
                  content += "<div><strong>Confirmation:</strong> " + result.attributes['Confirmation'] + " person</div>";
                }
                content += "<div><b>Crowd Rank:</b> " + result.attributes['CrowdRank'] + "%</div>";

                // content += "<a href='https://s3.amazonaws.com/explorationlab/" + result.attributes['ChipURL'];
                // content += "' target='_blank'>See this point on ";
                // content += "<img style='height:20px;width:100px;' src='app/images/tomnod_logo.png'></div>";

                // content += "<a href='" + result.attributes['ImageLink'];
                // content += "' target='_blank'>See this point on ";
                // content += "<img style='height:20px;width:100px;' src='app/images/tomnod_logo.png'></div>";
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

        showInfoWindowContent: function(point,content){
                map.infoWindow.setContent(content);
                map.infoWindow.resize(270, 140);
                map.infoWindow.show(point);
        },

        identifyInfoWindows: function(event){
                var _self = this;
                var noaaCheck = dom.byId("noaa-fires-18");
                var archiveCheck = dom.byId("indonesia-fires");
                var firesCheck = dom.byId("fires-checkbox");
                var dgCheck = dom.byId("digital-globe-footprints-checkbox");
                var tomnodCheck = dom.byId("tomnod-checkbox");

                var tasks = [
                    [_self.getActiveFiresInfoWindow(event), _self.showInfoWindowContent, firesCheck],
                    [_self.getArchiveFiresInfoWindow(event), _self.showInfoWindowContent, archiveCheck],
                    [_self.getArchiveNoaaInfoWindow(event), _self.showInfoWindowContent, noaaCheck],
                    [_self.selectTomnodFeatures(event), _self.renderTomnodInfoWindow, tomnodCheck],

                    [_self.getDigitalGlobeInfoWindow(event), _self.renderDGInfoWindow, dgCheck]
                ];

                //only run task if checkbox is selected
                var identifyTasks = tasks.filter(function(task){
                    if (task[2].id === "fires-checkbox" && MapModel.vm.smartRendererName() === "Heat map") {
                        return false
                    }
                    return task[2].getAttribute("aria-checked") === 'true';
                });
                console.log(identifyTasks)

                identifyTasks.forEach(function(task,i){
                    var precendentTrue = false;
                    var precedents = identifyTasks.slice(0,i).map(function(task){return task[0];});//wait for tasks in front to finish
                    all(precedents).then(function(results){
                        if(results.filter(function(result){return result}).length > 0) //if tasks before this one in array have a response, don't render infowindow
                            {  return; }
                        else{
                            task[0].then(function(result){
                                if(result){
                                    task[1](event.mapPoint, result);
                                    dojo.byId("uploadCustomGraphic") && dojo.byId("uploadCustomGraphic").remove();
                                }
                            });
                        }
                    });
                });

                 all(identifyTasks.map(function(task){return task[0]})).then(function(results){
                    //run the _self.mapClick function if none of the tasks have results
                        if(results.filter(function(result){return result}).length > 0)
                            {  return; }
                        _self.mapClick(event);
                });

                // if (landsatCheck.checked && _map.getLevel() >= 10) {
                //     _self.getLandsatInfoWindow(event);
                // }

                return;
        },

        selectTomnodFeatures: function(event, arg2) {
            var qconfig = MapConfig.tomnodLayer,
                landsatCheck = dom.byId("landsat-image-checkbox"),
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

            var deferred = new Deferred();

            // if (!_map.getLayer(qconfig.id).visible) {
            //     _self.getActiveFiresInfoWindow(event);
            //     _self.getArchiveFiresInfoWindow(event);

            //     var noaaCheck = dom.byId("noaa-fires-18");
            //     var archiveCheck = dom.byId("indonesia-fires");
            //     var firesCheck = dom.byId("fires-checkbox");

            //     if ((noaaCheck.getAttribute("aria-checked") == 'true' && archiveCheck.getAttribute("aria-checked") == 'true') || (noaaCheck.getAttribute("aria-checked") == 'true' && firesCheck.getAttribute("aria-checked") == 'true')) {
            //         setTimeout(function() {
            //             if (!_map.infoWindow.isShowing) {
            //                 _self.getArchiveNoaaInfoWindow(event);
            //             }
            //         }, 800);
            //     } else {
            //         _self.getArchiveNoaaInfoWindow(event);
            //     }

            //     setTimeout(function() {
            //         if (!_map.infoWindow.isShowing) {
            //             _self.getDigitalGlobeInfoWindow(event);
            //         }
            //     }, 400);

            //     // if (landsatCheck.checked && _map.getLevel() >= 10) {
            //     //     _self.getLandsatInfoWindow(event);
            //     // }

            //     return;
            // }

            iparams.geometry = point;
            iparams.tolerance = 3;
            iparams.returnGeometry = false;
            iparams.layerDefinitions = defs;
            iparams.mapExtent = _map.extent;
            iparams.layerIds = [8];

            // iparams.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;




            var content = "<div id='prevtomnod'><</div><div id='nexttomnod'>></div>";
            itask.execute(iparams, function(response) {
                if (response.length<1){
                    deferred.resolve(false);
                }
                deferred.resolve(response);

            }, function(err) {
                deferred.resolve(false);
            });

            return deferred
        },

        renderTomnodInfoWindow: function(event,response){
                var qconfig = MapConfig.tomnodLayer;
                var url = qconfig.url;
                var qtask = new QueryTask(url),
                query = new Query();

                query.where = 'OBJECTID in (';
                query.returnGeometry = false;
                query.outFields = ['OBJECTID', 'ChipLink', 'CrowdRank', 'Confirmation', 'name', 'ImageLink'];
                var objectids = [];

                arrayUtils.forEach(response, function(feature) {
                    objectids.push(feature.feature.attributes.OBJECTID);
                });
                if (objectids.length < 1) {
                    return;
                }
                _map.infoWindow.resize(340, 500);
                query.where += objectids.join(',') + ")";
                // deferred.resolve()
                selected_features = _map.getLayer(MapConfig.tomnodLayer.sel_id).selectFeatures(query, FeatureLayer.SELECTION_NEW);

                selected_features.then(function(features) {
                    _map.infoWindow.setFeatures(features);
                    _map.infoWindow.resize(340, 500);
                    _map.infoWindow.show(event);
                });
        },

        // selectTomnodFeatures: function(event, arg2) {
        //     var qconfig = MapConfig.tomnodLayer,
        //         landsatCheck = dom.byId("landsat-image-checkbox"),
        //         _self = this,
        //         url = qconfig.url,
        //         itask = new IdentifyTask(url),
        //         iparams = new IdentifyParameters(),
        //         qtask = new QueryTask(url),
        //         query = new Query(),
        //         point = event.mapPoint,
        //         executeReturned = true,
        //         node = dojoQuery(".selected-fire-option")[0],
        //         time = new Date(),
        //         today = new Date(),
        //         todayString = '',
        //         dateString = '',
        //         defs = [];

        //     if (!_map.getLayer(qconfig.id).visible) {
        //         _self.getActiveFiresInfoWindow(event);
        //         _self.getArchiveFiresInfoWindow(event);

        //         var noaaCheck = dom.byId("noaa-fires-18");
        //         var archiveCheck = dom.byId("indonesia-fires");
        //         var firesCheck = dom.byId("fires-checkbox");

        //         if ((noaaCheck.getAttribute("aria-checked") == 'true' && archiveCheck.getAttribute("aria-checked") == 'true') || (noaaCheck.getAttribute("aria-checked") == 'true' && firesCheck.getAttribute("aria-checked") == 'true')) {
        //             setTimeout(function() {
        //                 if (!_map.infoWindow.isShowing) {
        //                     _self.getArchiveNoaaInfoWindow(event);
        //                 }
        //             }, 800);
        //         } else {
        //             _self.getArchiveNoaaInfoWindow(event);
        //         }

        //         setTimeout(function() {
        //             if (!_map.infoWindow.isShowing) {
        //                 _self.getDigitalGlobeInfoWindow(event);
        //             }
        //         }, 400);

        //         // if (landsatCheck.checked && _map.getLevel() >= 10) {
        //         //     _self.getLandsatInfoWindow(event);
        //         // }

        //         return;
        //     }

        //     iparams.geometry = point;
        //     iparams.tolerance = 3;
        //     iparams.returnGeometry = false;
        //     iparams.layerDefinitions = defs;
        //     iparams.mapExtent = _map.extent;
        //     iparams.layerIds = [8];

        //     // iparams.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

        //     query.where = 'OBJECTID in (';
        //     query.returnGeometry = false;
        //     query.outFields = ['OBJECTID', 'ChipLink', 'CrowdRank', 'Confirmation', 'name', 'ImageLink'];
        //     var objectids = [];


        //     var content = "<div id='prevtomnod'><</div><div id='nexttomnod'>></div>";
        //     itask.execute(iparams, function(response) {
        //         arrayUtils.forEach(response, function(feature) {
        //             objectids.push(feature.feature.attributes.OBJECTID);
        //         });
        //         if (objectids.length < 1) {
        //             _map.infoWindow.setFeatures(undefined);

        //             _self.getActiveFiresInfoWindow(event);

        //             _self.getDigitalGlobeInfoWindow(event);
        //             _self.getArchiveFiresInfoWindow(event);
        //             _self.getArchiveNoaaInfoWindow(event);

        //             // if (landsatCheck.checked && _map.getLevel() >= 10) {
        //             //     _self.getLandsatInfoWindow(event);
        //             // }

        //             return;
        //         }
        //         _map.infoWindow.resize(340, 500);
        //         query.where += objectids.join(',') + ")";
        //         selected_features = _map.getLayer(MapConfig.tomnodLayer.sel_id).selectFeatures(query, FeatureLayer.SELECTION_NEW);

        //         selected_features.then(function(features) {
        //             _map.infoWindow.setFeatures(features);
        //             _map.infoWindow.resize(340, 500);

        //             _map.infoWindow.show(event.mapPoint);
        //         });

        //     }, function(err) {
        //         _self.mapClick(event);
        //     });
        // },

        getActiveFiresInfoWindow: function(event){
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
            var deferred = new Deferred();

            // If the layer is not visible, then dont show it
            // if (!_map.getLayer(qconfig.id).visible) {
            //     _self.mapClick(event);
            //     return;
            // }

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
                    //debugger; //todo: sift out non-visible feats and make sure they're using the right acquistion date & time!
                    executeReturned = false;
                    content += "<tr class='infoName'><td colspan='3'>Active Fires</td><td colspan='2'></td></tr>";
                    arrayUtils.forEach(qconfig.query.fields, function(field) {
                        content += "<tr><td colspan='3'>" + field.label + "</td>";
                        content += "<td colspan='2'>" + result.feature.attributes[field.name] + "</td></tr>";

                    });
                    content += "</table>";
                    deferred.resolve(content);
                    // map.infoWindow.setContent(content);
                    // map.infoWindow.resize(270, 140);
                    // map.infoWindow.show(point);
                } else {
                    deferred.resolve(false);
                }
            }, function(err) {
                deferred.resolve(false)
            });

            return deferred;
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

            var deferred = new Deferred();

            var checked = dom.byId("indonesia-fires");
            // If the layer is not visible or turned on, then dont show it
            // if (!_map.getLayer(qconfig.id).visible || checked.checked != true) {

            //     //IndonesiaFires

            //     _self.mapClick(event);
            //     return;
            // }

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
                    deferred.resolve(content);
                    // map.infoWindow.setContent(content);
                    // map.infoWindow.resize(270, 140);
                    // map.infoWindow.show(point);
                } else {
                    deferred.resolve(false);
                }
            }, function(err) {
                deferred.resolve(false);
            });
            return deferred;
        },

        getLandsatInfoWindow: function(evt) {
            var deferred = new Deferred();
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
                if(res.catalogItems.features.length<1){
                    deferred.resolve(false);
                }
                arrayUtils.forEach(res.catalogItems.features, function(feature) {
                    feature.infoTemplate = new InfoTemplate(
                        'Acquisition Date',
                        '<tr><td>${AcquisitionDate: PopupDateFormat}</td></td>'
                    );
                });
                deferred.resolve(features);
                // _map.infoWindow.setFeatures(res.catalogItems.features);
                // _map.infoWindow.show(evt.mapPoint);
            }, function(err) {
                console.dir(err);
                deferred.resolve(false);
            });
            return deferred

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
            var deferred = new Deferred();
            var otherCheck = dom.byId("noaa-fires-18");
            if (otherCheck.getAttribute("aria-checked") == 'false') {
                deferred.resolve(false);
                return deferred;
            }
            // If the layer is not visible, then dont show it
            if (!_map.getLayer("IndonesiaFires").visible) {
                //_self.mapClick(event);
                deferred.resolve(false);
                return deferred;
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

                    deferred.resolve(content);
                    // map.infoWindow.setContent(content);
                    // map.infoWindow.resize(170, 50);
                    // map.infoWindow.show(point);
                } else {
                    deferred.resolve(false);
                }
            }, function(err) {
                deferred.resolve(false);
            });

            return deferred;
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
            var deferred = new Deferred();
            // If the layer is not visible, then dont show it
            // if (!_map.getLayer(qconfig.id).visible) {
            //     _self.mapClick(event);
            //     return;
            // }

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

                    deferred.resolve(content);

                    // map.infoWindow.setContent(content);
                    // // map.infoWindow.setTitle("Title");
                    // map.infoWindow.show(point);
                } else {
                    deferred.resolve(false);
                }
            }, function(err) {
                deferred.resolve(false);
            });
            return deferred;
        },

        getDigitalGlobeInfoWindow: function(evt) {

            var mainDeferred = new Deferred();

            var dgConf = MapConfig.digitalGlobe,
                dgLayer = _map.getLayer(MapConfig.digitalGlobe.graphicsLayerId),
                query = new Query(),
                extents = {};

            if (evt.graphic) {
                if (evt.graphic.attributes.Layer !== 'Digital_Globe') {
                    mainDeferred.resolve(false);
                    return mainDeferred;
                }
            }
            if (evt.graphic === undefined) {
                mainDeferred.resolve(false);
                return mainDeferred;
            }

            query.geometry = evt.graphic.geometry;
            query.where = "Category = 1";
            query.returnGeometry = false;
            query.outFields = ['*'];

            // esri.config.defaults.io.corsEnabledServers.push("http://175.41.139.43");

            // var layers = all(MapConfig.digitalGlobe.mosaics.map(function(i) {

            var layers = all(MapConfig.digitalGlobe.imageServices.map(function (service) {
                var deferred = new Deferred();
                query.geometry = evt.graphic.geometry;
                query.returnGeometry = true;
                query.outFields = ['AcquisitionDate', 'SensorName', 'OBJECTID', 'CenterX', 'CenterY'];
                var task = new QueryTask(service.url);
                (function (serviceConfig) {
                  task.execute(query, function(results) {
                      arrayUtils.forEach(results.features, function (feature) {
                        feature.attributes.LayerId = serviceConfig.id;
                      });
                      deferred.resolve(results.features);
                  }, function(err) {
                      deferred.resolve([]);
                  });
                })(service);
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

                console.dir(features);

                features.sort(function(left, right) {
                    return left.attributes.AcquisitionDate == right.attributes.AcquisitionDate ? 0 : (left.attributes.AcquisitionDate > right.attributes.AcquisitionDate ? -1 : 1);
                });

                content += "<p>Click a date below to see the imagery.</p><ul class='popup-list'><li><strong>Date <span class='satelliteColumn'>Satellite</span></strong></li>";
                currentFootprints = [];
                arrayUtils.forEach(features, function(f,i) {
                    var date = moment(f.attributes.AcquisitionDate).tz('Asia/Jakarta');
                    currentFootprints.push(f);
                    if (date >= start && date <= end) {
                        content += "<li class='dg-image-item' value='" + i + "'><a class='popup-link' data-layer='" + f.attributes.LayerId + "' data-bucket='" + f.attributes.SensorName + "_id_" + f.attributes.OBJECTID + "'> " +
                            date.format("YYYY/MM/DD") + "  <span class='satelliteColumn' data-layer='" + f.attributes.LayerId + "' data-bucket='" + f.attributes.SensorName + "_id_" + f.attributes.OBJECTID + "'>" + f.attributes.SensorName + "</span>" +
                            "</a></li>";
                    }

                });

                content += "</ul><a class='custom-zoom-to' id='custom-zoom-to'>Zoom To</a>";

                mainDeferred.resolve(content);
            });
            return mainDeferred;
                // _map.infoWindow.setContent(content);
                // _map.infoWindow.resize(270, 500);
                // _map.infoWindow.show(point);
        },

        renderDGInfoWindow: function(point,content){
            _map.infoWindow.setContent(content);
            _map.infoWindow.resize(270, 500);
            _map.infoWindow.show(point);

            var handles = [];
            activeFeatureIndex = 0;
                dojoQuery(".contentPane .popup-link").forEach(function(node, index) {
                    handles.push(on(node, "click", function(evt) {
                        var target = evt.target ? evt.target : evt.srcElement,
                            bucket = target.dataset ? target.dataset.bucket : target.getAttribute("data-bucket"),
                            layerId = target.getAttribute('data-layer');

                        dojoQuery(".contentPane .popup-link").forEach(function(node){
                            domClass.remove(node.parentElement,'selected');
                        })
                        domClass.add(evt.currentTarget.parentElement,"selected");

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
                        bucketObj.feature.attributes.LayerId = layerId;
                        LayerController.showDigitalGlobeImagery(bucketObj);
                        activeFeatureIndex = index;

                    }));

                    handles.push(on(node,mouse.enter,function(evt){
                            var target = evt.target ? evt.target : evt.srcElement;
                            var bucket = target.dataset ? target.dataset.bucket : target.getAttribute("data-bucket");

                            dojoQuery("td > .popup-link").forEach(function(node){
                                if(domAttr.get(node,"data-bucket") === bucket){
                                    var select = node.parentElement.parentElement;
                                    domClass.add(select,"hover");
                                }
                                else{
                                    var select = node.parentElement.parentElement;
                                    domClass.remove(select,"hover");
                                }
                            });
                            var MapController = require("views/map/MapController");
                            var feature = currentFootprints[index];
                            MapController.handleImageryOver({feature:feature},evt);
                    }));

                    handles.push(on(node,mouse.leave,function(evt){
                            var MapController = require("views/map/MapController");
                            var feature = currentFootprints[index];
                            MapController.handleImageryOut({feature:feature},evt);
                            dojoQuery("td > .popup-link").forEach(function(node){
                                    var select = node.parentElement.parentElement;
                                    domClass.remove(select,"hover");
                            });
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

            // var url = MapConfig.digitalGlobe.identifyUrl,
            //     itask = new IdentifyTask(url),
            //     iparams = new IdentifyParameters(),
            //     point = evt.mapPoint,
            //     handles = [],
            //     activeFeatureIndex;

            // iparams.geometry = point;
            // iparams.tolerance = 3;
            // iparams.returnGeometry = true;
            // iparams.mapExtent = _map.extent;
            // iparams.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;
            // iparams.layerIds = [0];

            function getContent(graphic) {
                return "<div>Date: " + graphic.attributes.Date + "</div>";
            }
        },

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
            $('#storyClose').click(function(){
              $('#storyInfoWindow').hide();
            });
            //TODO: Add Attachments!
            // _map.infoWindow.anchor = "ANCHOR_UPPERRIGHT";
            var attr, html = "<table style='min-width:500px;'>", features = [];
            for (var i = 0; i < feats.length; i++) {

                for (attr in feats[i].feature.attributes) {
                    if (feats[i].feature.attributes[attr] == "Null") {
                        feats[i].feature.attributes[attr] = "";
                    }
                }
                attr = feats[i].feature.attributes;

                html += "<tr><td>" + feats[i].feature.attributes['Name'] + "</td></tr>" +
                // "<tr><td>" + feats[i].feature.attributes['Title'] + "</td></tr>" +
                "<tr><td>" + feats[i].feature.attributes['Details'] + "</td></tr>" +
                "<tr><td><a style='color:#97bd3d;cursor:pointer;' href='" + feats[i].feature.attributes.Video + "' target='blank'>" + feats[i].feature.attributes.Video + "</a></td></tr>" +
                "<tr><td>Published on " + feats[i].feature.attributes['Date'] + "</td></tr></table>";


                // for (var propertyName in attr) {
                //     console.log(propertyName)


                //     // Title,Details,Video,Name,Email,SHAPE,Publish,Date

                //     if (propertyName == "Video") {

                //         html += "<tr><td><a style='color:green;cursor:pointer;' href='" + feats[i].feature.attributes.Video + "'>" + feats[i].feature.attributes.Video + "</a></td></tr>";

                //     } else {
                //         html += "<tr><td>" + attr[propertyName] + "</td></tr>";
                //     }

                // }
                // html += "</div>";

                // template = new InfoTemplate(feats[i].feature.attributes.UserName, html);

                var title = feats[i].feature.attributes['Title'] ? feats[i].feature.attributes['Title'] : 'User Story';

                var fireStory_popupTemplate = new InfoTemplate(title, html);

                // var fireStory_popupTemplate = new PopupTemplate({
                //     title: "{Title}",
                //     //"content": htmlContent,
                //     // fieldInfos: [{
                //     //     fieldName: "Date",
                //     //     label: "Date",
                //     //     format: {
                //     //         dateFormat: 'shortDate'
                //     //     },
                //     //     visible: true
                //     // }, {
                //     //     fieldName: "Details",
                //     //     label: "Details",
                //     //     visible: true
                //     // }, {
                //     //     fieldName: "Video",
                //     //     label: "Video",
                //     //     visible: true
                //     // }, {
                //     //     fieldName: "Name",
                //     //     label: "Name",
                //     //     visible: true
                //     // }, {
                //     //     fieldName: "Attachments",
                //     //     label: "Attachments",
                //     //     visible: true
                //     //     // }, {
                //     //     //     fieldName: "Email",
                //     //     //     label: "Email",
                //     //     //     visible: true
                //     // }],
                //     "showAttachments": true

                // });
                // fireStory_popupTemplate.setContent()

                var id = feats[i].feature.attributes.OBJECTID;
                var layer = map.getLayer("Fire_Stories");
                // map.infoWindow.resize(550,300);

                (function(feature) {
                    console.log(id);
                    layer.queryAttachmentInfos(id, function(infos) {
                        console.log(infos);
                        if (infos[0] && !!infos[0].url) {

                            feature.attributes.Attachments = "<img id='forceBlock'; src='" + infos[0].url + "' />";

                            if (infos.length > 1) {
                                for (var k = 1; k < infos.length; k++) {
                                    if (!!infos[k].url) {
                                        feature.attributes.Attachments += "<img id='forceBlock'; src='" + infos[k].url + "' />";
                                    }
                                }
                            }

                            var newFeats = [];
                            for (var j = 0; j < map.infoWindow.features.length; j++) {
                                if (map.infoWindow.features[j].attributes.OBJECTID === feature.attributes.OBJECTID) {
                                    newFeats.push(feature);
                                } else {
                                    newFeats.push(map.infoWindow.features[j]);
                                }
                            }

                            map.infoWindow.setFeatures(newFeats);

                        }

                    });

                })(feats[i].feature);
                console.log("inn")
                // debugger
                console.log("<p>" + fireStory_popupTemplate.content + "</p>")
                var result = "<p>" + fireStory_popupTemplate.content + "</p>";
                result = fireStory_popupTemplate.content.replace(/\r\n\r\n/g, "</p><p>").replace(/\n\n/g, "</p><p>");
                // result += "</p>";
                console.log(result)
                $('#storyInfoTitle').html(fireStory_popupTemplate.title);
                $('#storyInfoBody').html(result);
                $('#storyInfoWindow').show();

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
            _map.infoWindow.setTitle('&nbsp;');
            _map.infoWindow.show(evt.mapPoint);
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

                if (newtitle.length > 50) {
                    $('#editTitle').val(newtitle.substring(0,50))
                    newtitle = newtitle.substring(0,50);
                }
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
                    "<p>Enter your email(s) below to receive fire alerts. Multiple emails must be separated by commas.</p>" +
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
                        "dojox/validate/web", "dojo/dom-style", "views/map/MapController"
                    ], function(validate, domStyle, MapController) {
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

                            if (emailValue.indexOf(',') > -1) {

                                var emails = emailValue.split(",");
                                for (var j = 0; j < emails.length; j++) {
                                    var email = emails[j].replace(/\s/g, ''); //remove whitespaces

                                    if (!validate.isEmailAddress(email)) {
                                        domStyle.set("userEmail", "border", "1px solid red");
                                        dom.byId("subscribe-now").innerHTML = "Subscribe";
                                        alert("You must enter valid email addresses, separated by commas.");
                                        return;
                                    }
                                    console.log(email);

                                    _self.postSubscribeRequest(geom, email, "email", dialog);
                                    // Analytics.sendEvent("Subscribe", "click", "Fire Alerts", "User is subscribing to Fire Alerts via Email.");
                                    MapController.reportAnalyticsHelper("Subscribe", "click",  "The user is subscribing to Fire Alerts via Email.");


                                }

                                domStyle.set("userEmail", "border", "1px solid gray");
                                dom.byId("subscribe-now").innerHTML = "Submitting...";

                                return;
                            }

                            if (!validate.isEmailAddress(emailValue)) {
                                domStyle.set("userEmail", "border", "1px solid red");
                                alert("You must enter a valid email address!");
                                return;
                            }


                            domStyle.set("userEmail", "border", "1px solid gray");
                            dom.byId("subscribe-now").innerHTML = "Submitting...";

                            _self.postSubscribeRequest(geom, emailValue, "email", dialog);
                            // Analytics.sendEvent("Subscribe", "click", "Fire Alerts", "User is subscribing to Fire Alerts via Email.");
                            MapController.reportAnalyticsHelper("Subscribe", "click",  "The user is subscribing to Fire Alerts via Email.");
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
                            // Analytics.sendEvent("Subscribe", "click", "Fire Alerts", "User is subscribing to Fire Alerts via SMS.");
                            MapController.reportAnalyticsHelper("Subscribe", "click",  "The user is subscribing to Fire Alerts via SMS.");
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
                    'msg_addr': address,
                    'msg_type': type,
                    'area_name': graphic.attributes.ALERTS_LABEL
                },
                res;

            // Simplify the geometry and then add a stringified and simpler version of it to params.features
            var simplifiedGeometry = geometryEngine.simplify(graphic.geometry);
            params.features = JSON.stringify({
                "rings": simplifiedGeometry.rings,
                "spatialReference": simplifiedGeometry.spatialReference
            });

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
