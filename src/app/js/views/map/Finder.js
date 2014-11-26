/* global define, alert */
define([
    "dojo/dom",
    "dojo/_base/array",
    "dojo/on",
    "dojo/query",
    "dojo/Deferred",
    "dojo/promise/all",
    "esri/layers/FeatureLayer",
    "esri/graphic",
    "esri/geometry/Point",
    "esri/geometry/webMercatorUtils",
    "esri/symbols/PictureMarkerSymbol",
    "views/map/MapConfig",
    "views/map/MapModel",
    "views/map/LayerController",
    "esri/tasks/IdentifyTask",
    "esri/tasks/IdentifyParameters",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/geometry/Circle",
    "libs/moment",
    "libs/timezone"
], function(dom, arrayUtils, on, dojoQuery, Deferred, all, FeatureLayer, Graphic,
    Point, webMercatorUtils, PictureSymbol, MapConfig, MapModel, LayerController, IdentifyTask,
    IdentifyParameters, Query, QueryTask, Circle) {
    var _map;

    return {
        setMap: function(map) {
            _map = map;
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
            var map = _map;
            forestUseLayer = map.getLayer(MapConfig.forestUseLayers.id),
            conservationLayers = map.getLayer(MapConfig.conservationLayers.id),
            visLayers = [],
            isVisLayers = forestUseLayer.visibleLayers.indexOf(10) > -1 || conservationLayers.visible || forestUseLayer.visibleLayers.indexOf(26) > -1 || forestUseLayer.visibleLayers.indexOf(27) > -1 || forestUseLayer.visibleLayers.indexOf(28) > -1 || forestUseLayer.visibleLayers.indexOf(32) > -1,
            visible = forestUseLayer.visible;

            arrayUtils.forEach(forestUseLayer.visibleLayers, function(lid) {
                visLayers.push(lid);
            });

            if (conservationLayers.visible) {
                visLayers.push(25);
            }

            Array.prototype.move = function(from, to) {
                this.splice(to, 0, this.splice(from, 1)[0]);
            };
            visLayers.move(visLayers.indexOf(27), 0);

            if (isVisLayers) {

                var identifyTask = new IdentifyTask(forestUseLayer.url);

                identifyParams = new IdentifyParameters();
                identifyParams.tolerance = 3;
                identifyParams.returnGeometry = true;
                identifyParams.layerIds = visLayers;
                identifyParams.width = map.width;
                identifyParams.height = map.height;
                identifyParams.geometry = event.mapPoint;
                identifyParams.mapExtent = map.extent;
                identifyTask.execute(identifyParams, function(response) {
                    var node = response[0];
                    if (node) {
                        content = dom.byId("close-icon") === undefined ? "<div id='closePopup' class='close-icon'></div><table id='infoWindowTable'>" : "<table id='infoWindowTable'>";

                        if (node.layerId == 25) {
                            content += "<tr class='infoName'><td colspan='2'>" + node.feature.attributes.NAME + "</td></tr>";
                            content += "<tr><td>Local Name</td><td>" + node.feature.attributes.ORIG_NAME + "</td></tr>";
                            content += "<tr><td>Legal Designation</td><td>" + node.feature.attributes.DESIG_ENG + "</td></tr>";
                            content += "<tr><td>WDPA ID</td><td>" + node.feature.attributes.WDPAID + "</td></tr>";
                        } else if (node.layerId == 27) {
                            content += "<tr class='infoName'><td colspan='2'>" + node.feature.attributes.NAME + "</td></tr>";
                            content += "<tr><td>Concession Type</td><td>" + node.feature.attributes.TYPE + "</td></tr>";
                            content += "<tr><td>Country</td><td>" + node.feature.attributes.Country + "</td></tr>";
                            //content += "<tr><td>Group</td><td>" + node.feature.attributes.GROUP_NAME + "</td></tr>";
                            content += "<tr><td>Certification Status</td><td>" + node.feature.attributes.CERT_STAT + "</td></tr>";
                            content += "<tr><td>GIS Calculated Area (ha)</td><td>" + node.feature.attributes.AREA_HA + "</td></tr>";
                            content += "<tr><td>Certificate ID</td><td>" + node.feature.attributes.Certificat + "</td></tr>";
                            content += "<tr><td>Certificate Issue Date</td><td>" + node.feature.attributes.Issued + "</td></tr>";
                            content += "<tr><td>Certificate Expiry Date</td><td>" + node.feature.attributes.Expired + "</td></tr>";
                            content += "<tr><td>Mill name</td><td>" + node.feature.attributes.Mill + "</td></tr>";
                            content += "<tr><td>Mill location</td><td>" + node.feature.attributes.Location + "</td></tr>";
                            content += "<tr><td>Mill capacity (t/hour)</td><td>" + node.feature.attributes.Capacity + "</td></tr>";
                            content += "<tr><td>Certified CPO (mt)</td><td>" + node.feature.attributes.CPO + "</td></tr>";
                            content += "<tr><td>Certified PK (mt)</td><td>" + node.feature.attributes.PK + "</td></tr>";
                            //content += "<tr><td>Certified PKO (mt)</td><td>" + node.feature.attributes.PKO + "</td></tr>";
                            content += "<tr><td>Estate Suppliers</td><td>" + node.feature.attributes.Estate + "</td></tr>";
                            content += "<tr><td>Estate Area (ha)</td><td>" + node.feature.attributes.Estate_1 + "</td></tr>";
                            content += "<tr><td>Outgrower Area (ha)</td><td>" + node.feature.attributes.Outgrowe + "</td></tr>";
                            content += "<tr><td>Scheme Smallholder Area (ha)</td><td>" + node.feature.attributes.SH + "</td></tr>";
                            // content += "<tr><td>NPP Area (ha)</td><td>" + node.feature.attributes.NPP_Area + "</td></tr>";
                            //content += "<tr><td>HCV Area (ha)</td><td>" + node.feature.attributes.HCV_Area + "</td></tr>";
                        } else {
                            content += "<tr class='infoName'><td colspan='2'>" + node.feature.attributes.NAME + "</td></tr>";
                            content += "<tr><td>Concession Type</td><td>" + node.feature.attributes.TYPE + "</td></tr>";
                            content += "<tr><td>Country</td><td>" + node.feature.attributes.Country + "</td></tr>";
                            //content += "<tr><td>Group</td><td>" + node.feature.attributes.GROUP_NAME + "</td></tr>";
                            content += "<tr><td>Certification Status</td><td>" + node.feature.attributes.CERT_STAT + "</td></tr>";
                            content += "<tr><td>GIS Calculated Area (ha)</td><td>" + node.feature.attributes.AREA_HA + "</td></tr>";
                        }
                        content += "<tr><td>Source: </td><td>" + (node.feature.attributes.Source || "N/A") + "</td></tr>";
                        content += "</table>";

                        map.infoWindow.setContent(content);
                        map.infoWindow.show(event.mapPoint);
                        // on.once(dom.byId("closePopup"), "click", function() {
                        //     map.infoWindow.hide();
                        // });
                    }
                }, function(errback) {
                    console.dir(errback);
                });

            }
        },

        getTomnodInfoWindow: function(response) {
            var qconfig = MapConfig.tomnodLayer;
            var url = qconfig.url;
            var map = _map;
            var result = response;
            var _self = this;
            var content = '';

            if (result) {
                executeReturned = false;
                // content += "<tr class='infoName'><td colspan='3'>Active Fires</td><td colspan='2'></td></tr>";
                content += " <div><h3>" + result.attributes['name'] + "</h3></div>";
                content += "<tr><td><img src='" + qconfig.chipBucket + result.attributes['ChipLink'];
                content += "' style='width:300px' /></tc></tr>"
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
                //     console.log("CLICK prev",evt);
                // });
            } else {
                // _self.getActiveFiresInfoWindow(event);
            }
        },

        selectTomnodFeatures: function(event, arg2) {
            var qconfig = MapConfig.tomnodLayer,
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
                _self.getDigitalGlobeInfoWindow(event);

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
                    return;
                }
                _map.infoWindow.resize(340, 500);
                query.where += objectids.join(',') + ")"
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
                _self.mapClick(event);
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
            if (evt.graphic == undefined) {
                return;
            }

            query.geometry = evt.graphic.geometry;
            query.where = "Category = 1";
            query.returnGeometry = false;
            query.outFields = ['*'];

            // esri.config.defaults.io.corsEnabledServers.push("http://175.41.139.43");


            var layers = all(MapConfig.digitalGlobe.mosaics.map(function(i) {
                var deferred = new Deferred;
                query.geometry = evt.graphic.geometry;
                query.returnGeometry = false;
                query.outFields = ['*'];
                var task = new QueryTask(MapConfig.digitalGlobe.imagedir + i + "/ImageServer")
                task.execute(query, function(results) {
                    deferred.resolve(results.features);
                }, function(err) {

                    deferred.resolve([])
                })
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


                content += "<p>Click a date below to see the imagery.</p><ul class='popup-list'>";

                arrayUtils.forEach(features, function(f) {
                    var date = moment(f.attributes.AcquisitionDate).tz('Asia/Jakarta');
                    if (date >= start && date <= end) {
                        content += "<li><a class='popup-link' data-bucket='" + f.attributes.SensorName + "_id_" + f.attributes.OBJECTID + "'>Date: " + date.format("M/D/YYYY") + " Satellite: " + f.attributes.SensorName + "</a>" + "</li>"; //f.attributes.Date + "</a></li>";
                    }
                    // content += "<li><a class='popup-link' data-bucket='" + f.attributes.Tiles + "'>Date: " + f.attributes.Date + "</a></li>";

                });

                content += "</ul><a class='custom-zoom-to' id='custom-zoom-to'>Zoom To</a>";

                _map.infoWindow.setContent(content);
                _map.infoWindow.resize(270, 500);
                _map.infoWindow.show(point);

                // if (features.length === 1) {
                //     LayerController.showDigitalGlobeImagery(features[0].attributes.Tiles);
                //     activeFeatureIndex = 0;
                // } else {
                // LayerController.showDigitalGlobeImagery(features[0].attributes.Tiles);
                activeFeatureIndex = 0;
                dojoQuery(".contentPane .popup-link").forEach(function(node, index) {
                    handles.push(on(node, "click", function(evt) {
                        var target = evt.target ? evt.target : evt.srcElement,
                            bucket = target.dataset ? target.dataset.bucket : target.getAttribute("data-bucket");
                        LayerController.showDigitalGlobeImagery(bucket);
                        activeFeatureIndex = index;
                    }));
                });
                // }

                handles.push(on(dom.byId("custom-zoom-to"), "click", function(evt) {

                    var point = new Point(features[activeFeatureIndex].attributes.CenterX, features[activeFeatureIndex].attributes.CenterY,
                        _map.spatialReference);

                    _map.centerAndZoom(point, 12);
                    // _map.infoWindow.show(point);
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




        getFireTweetsInfoWindow: function(evt) {
            _map.infoWindow.anchor = "ANCHOR_UPPERRIGHT";
            var attr = evt.attributes;
            var html = "<table><tr><td>";
            html += "<td><img src='" + attr.UserProfileImage + "'/></td>";
            html += "<td>" + attr.UserName + "</td></tr>";
            html += "<p>" + attr.Text + "</p>";
            html += "<p>" + attr.Date + "</p>";
            //html += "</div>"

            return html;
        }

    };

});