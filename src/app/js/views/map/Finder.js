/* global define, alert */
define([
    "dojo/dom",
    "dojo/_base/array",
    "dojo/on",
    "dojo/query",
    "esri/graphic",
    "esri/geometry/Point",
    "esri/geometry/webMercatorUtils",
    "esri/symbols/PictureMarkerSymbol",
    "views/map/MapConfig",
    "views/map/MapModel",
    "views/map/LayerController",
    "esri/tasks/IdentifyTask",
    "esri/tasks/IdentifyParameters"
], function(dom, arrayUtils, on, dojoQuery, Graphic, Point, webMercatorUtils, PictureSymbol, MapConfig, MapModel, LayerController, IdentifyTask, IdentifyParameters) {
    var _map;

    return {
        setMap: function(map) {
            _map = map;            
        },

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
                        content =  dom.byId("close-icon") === undefined ? "<div id='closePopup' class='close-icon'></div><table id='infoWindowTable'>" : "<table id='infoWindowTable'>";

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
                    // map.infoWindow.setTitle("Title");
                    map.infoWindow.show(point);
                } else {
                    _self.mapClick(event);
                }
            }, function(err) {
                _self.mapClick(event);
            });
        },

        getDigitalGlobeInfoWindow: function (evt) {
            if (evt.graphic) {
                if (evt.graphic.attributes.Layer !== 'Digital_Globe') {
                    return;
                }
            }

            var url = MapConfig.digitalGlobe.identifyUrl,
                itask = new IdentifyTask(url),
                iparams = new IdentifyParameters(),
                point = evt.mapPoint,
                handles = [];

            iparams.geometry = point;
            iparams.tolerance = 3;
            iparams.returnGeometry = false;
            iparams.mapExtent = _map.extent;
            iparams.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;
            iparams.layerIds = [0];

            function getContent(graphic) {
                return "<div>Date: " + graphic.attributes.Date + "</div>";
            }

            itask.execute(iparams, function (res) {
                var features = [],
                    content = "";
                arrayUtils.forEach(res, function (item) {
                    features.push(item.feature);
                });

                if (features.length === 0) {
                    return;
                }

                content += "Images: <br><ul style='margin-left: 10px;'>";

                arrayUtils.forEach(features, function (f) {
                    content += "<li><a class='popup-link' data-bucket='" + f.attributes.Tiles + "'>Date: " + f.attributes.Date + "</a></li>";
                });

                content += "</ul>";

                _map.infoWindow.setContent(content);
                _map.infoWindow.show(point);

                if (features.length === 1) {
                    LayerController.showDigitalGlobeImagery(features[0].attributes.Tiles);
                } else {
                    LayerController.showDigitalGlobeImagery(features[0].attributes.Tiles);
                    dojoQuery(".contentPane .popup-link").forEach(function (node) {
                        handles.push(on(node, "click", function (evt) {
                            var target = evt.target ? evt.target : evt.srcElement,
                                bucket = target.dataset ? target.dataset.bucket : target.getAttribute("data-bucket");
                            LayerController.showDigitalGlobeImagery(bucket);
                        }));
                    });

                    on.once(_map.infoWindow, "hide", function () {
                        arrayUtils.forEach(handles, function (handle) {
                            handle.remove();
                        });
                    });
                }

            }, function (err) {
                console.dir(err);
            });

            // _map.infoWindow.anchor = "ANCHOR_UPPERRIGHT";
            // LayerController.showDigitalGlobeImagery(evt);
            // var attr = evt.attributes;
            // var html = "<table><tr><td>Date:</td>";
            // html += "<td>" + attr.Date + "</td>";
            // html += "</tr></table>";
            // return html;
        },

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