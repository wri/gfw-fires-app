/* global define */
define([
    "knockout",
    "dojo/on",
    "dojo/mouse",
    "dojo/dom",
    "dojo/dom-attr",
    "dojo/hash",
    "dojo/query",
    "dojo/cookie",
    "dijit/Dialog",
    "dojo/io-query",
    "dojo/Deferred",
    "dojo/_base/array",
    "dojo/promise/all",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dijit/registry",
    "dijit/form/CheckBox",
    "dijit/TooltipDialog", 
    "dijit/Tooltip", 
    "views/map/MapModel",
    "views/map/MapConfig",
    "modules/HashController",
    "esri/layers/LayerDrawingOptions",
    "esri/request",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/geometry/webMercatorUtils",
    "esri/layers/MosaicRule",

    "esri/TimeExtent",
    "esri/dijit/TimeSlider",
    // Temporary Modules to add Graphic to Map
    "esri/Color",
    "esri/graphic",
    "esri/geometry/Point",
    "esri/geometry/Polygon",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/PictureMarkerSymbol",
    // Modules for Terraformer
    "esri/SpatialReference",
    "libs/moment",
    "libs/timezone"
], function (ko,on, mouse, dom, domAttr,  hash, dojoQuery, cookie, Dialog, ioQuery, Deferred, arrayUtils, all, domConstruct, domStyle,
    registry, CheckBox, TooltipDialog, Tooltip, MapModel, MapConfig, HashController, LayerDrawingOptions, esriRequest, 
    Query, QueryTask, webMercatorUtils, MosaicRule, 
    TimeExtent, TimeSlider, Color, Graphic, Point, Polygon, SimpleLineSymbol, 
    SimpleFillSymbol, PictureSymbol, SpatialReference) {
    'use strict';
    var _map,
        _dgGlobeFeaturesFetched = false;

    return {

        setMap: function(map) {
            _map = map;
        },

        refreshLegend: function() {
            var legendLayer = _map.getLayer(MapConfig.landCoverLayers.id),
                visibleLayers = legendLayer.visibleLayers,
                layerDrawingOption = new esri.layers.LayerDrawingOptions(),
                optionsArray = [],
                numArray = [29],
                num;
            layerDrawingOption.transparency = 0;

            if (_map.getLayer(MapConfig.treeCoverLayer.id).visible) {
                num = 29;
            }

            arrayUtils.forEach(numArray, function(n) {
                if (visibleLayers.indexOf(n) > -1) {
                    visibleLayers.splice(visibleLayers.indexOf(n), 1);
                    legendLayer.setVisibleLayers(visibleLayers);
                }
            });

            if (_map.getLayer(MapConfig.treeCoverLayer.id).visible) {
                visibleLayers.push(num);
                optionsArray[num] = layerDrawingOption;
                legendLayer.setVisibleLayers(visibleLayers);
                legendLayer.setLayerDrawingOptions(optionsArray);
            }

            registry.byId("legend").refresh();
        },

        setTransparency: function(layerId, value) {
            var opaqueValue = Math.floor(value) / 100,
                layer = _map.getLayer(layerId);

            if (layer) {
                layer.setOpacity(opaqueValue);
            }

            // If Land_Cover Slider was adjusted, set opacity on Tree Cover Image Service and Primary Forests Image Service
            // as well as it is under the same slider in UI and should have it's transparency the same as the other Land_Cover layers
            if (layerId === 'Land_Cover') {
                layer = _map.getLayer(MapConfig.treeCoverLayer.id);
                if (layer) {
                    layer.setOpacity(opaqueValue);
                }
                layer = _map.getLayer(MapConfig.primaryForestsLayer.id);
                if (layer) {
                    layer.setOpacity(opaqueValue);
                }
            }
            this.refreshLegend();
        },

        toggleLayerVisibility: function(layerId, visibility, valueForHash) {
            var layer = _map.getLayer(layerId);
            if (layer) {
                if (layer.visible !== visibility) {
                    layer.setVisibility(visibility);
                }
                if (visibility) {
                    this.updateLayersInHash('add', layerId, valueForHash || layerId);
                } else {
                    this.updateLayersInHash('remove', layerId, layerId);
                }
            }
            this.refreshLegend();
        },

        updateFiresLayer: function(updateVisibleLayers) {
            var node = dojoQuery(".selected-fire-option")[0],
                checkboxStatus = dom.byId("confidence-fires-checkbox").checked,
                defs = [],
                where = "",
                visibleLayers,
                layer;

            var today = new Date();
            var backdate = new Date();

            switch (node.id) {
                case "fires72":
                    backdate.setDate(today.getDate() - 4);
                    today.setDate(today.getDate() - 3);
                    break;
                case "fires48":
                    backdate.setDate(today.getDate() - 3);
                    today.setDate(today.getDate() - 2);
                    break;
                case "fires24":
                    backdate.setDate(today.getDate() - 2);
                    today.setDate(today.getDate() - 1);
                    break;
                default:
                    where = "1 = 1";
                    break;
            }

            if (arrayUtils.indexOf(["fires72", "fires48", "fires24"], node.id) > -1) {

                var yyyy = backdate.getFullYear();

                var mm = "00" + (backdate.getMonth() + 1).toString();
                mm = mm.substr(mm.length - 2);

                var dd = "00" + backdate.getDate().toString();
                dd = dd.substr(dd.length - 2);

                var todayDD = "00" + today.getDate().toString();
                todayDD = todayDD.substring(todayDD.length - 2);

                var hh = backdate.getHours();
                var min = backdate.getMinutes();
                var ss = backdate.getSeconds();

                // defs needs to be (date > dateString and time > hhmm) or date > todayString
                var dateString = yyyy.toString() + "-" + mm + "-" + dd + " " + hh + ":" + min + ":" + ss;
                var todayString = yyyy.toString() + "-" + mm + "-" + todayDD + " " + hh + ":" + min + ":" + ss;
                where += "ACQ_DATE > date '" + dateString + "'";
                    // AND CAST(\"ACQ_TIME\" AS INTEGER) >= " + hh + "" + min + ")" +
                    //  " OR ACQ_DATE > date '" + todayString + "'";

            }

            for (var i = 0, length = MapConfig.firesLayer.defaultLayers.length; i < length; i++) {
                defs[i] = where;
            }

            layer = _map.getLayer(MapConfig.firesLayer.id);

            if (layer) {
                layer.setLayerDefinitions(defs);
                if (!updateVisibleLayers) {
                    this.refreshLegend();
                }
            }

            if (updateVisibleLayers) {
                if (checkboxStatus) {
                    visibleLayers = [0, 1];
                } else {
                    visibleLayers = [0, 1, 2, 3];
                }
                if (layer) {
                    layer.setVisibleLayers(visibleLayers);
                }
                this.refreshLegend();
            }
        },

        updateAdditionalVisibleLayers: function(queryClass, configObject) {
            var layer = _map.getLayer(configObject.id),
                visibleLayers = [],
                valueForHash = '',
                layerID;

            dojoQuery("." + queryClass).forEach(function(node) {
                if (node.checked) {
                    layerID = configObject[node.value];
                    if (layerID) {
                        visibleLayers.push(layerID);
                    }
                }
            });

            if (visibleLayers.length === 0) {
                // If nothing checked, turn all layers off
                visibleLayers.push(-1);
            }

            if (layer) {
                layer.setVisibleLayers(visibleLayers);
                if (!layer.visible) {
                    valueForHash = "/" + visibleLayers.join(",");
                    this.toggleLayerVisibility(configObject.id, true, configObject.id + valueForHash);
                } else if (visibleLayers[0] === -1) {
                    this.toggleLayerVisibility(configObject.id, false);
                } else {
                    valueForHash = "/" + visibleLayers.join(",");
                    this.updateLayersInHash('add', configObject.id, configObject.id + valueForHash);
                }
            }

            this.refreshLegend();

        },

        updateLandCoverLayers: function (evt) {
        	var target = evt.target ? evt.target : evt.srcElement;
            // Update the Peat Lands Layer
            this.updatePeatLandsLayer(target.id);

            // Update the Tree Cover Layer
            this.updateTreeCoverLayer(target.id === "tree-cover-density-radio");

            // Update the Primary Forest Layer
            this.updatePrimaryForestsLayer(target.id === "primary-forests-radio");

        },

        toggleDigitalGlobeLayer: function (visibility) {
            var self = this,
                layer = _map.getLayer(MapConfig.digitalGlobe.id);
            var disp = visibility ? 'block':'none';

            domStyle.set(dom.byId("timeSliderPanel"),'display',disp);

            this.getBoundingBoxesForDigitalGlobe().then(function (results) {
                if (visibility) {
                    self.promptAboutDigitalGlobe();
                }
                self.toggleDigitalGlobeLayerVisibility(MapConfig.digitalGlobe.id, visibility);
                self.showHelperLayers(MapConfig.digitalGlobe.graphicsLayerId, visibility);
                self.generateTimeSlider("timeSliderDG","timeSliderPanel");

            });
        },

        toggleDigitalGlobeLayerVisibility: function (layerId, visibility) {
            if (visibility) {
                this.updateLayersInHash('add', layerId, layerId);
            } else {
                this.updateLayersInHash('remove', layerId, layerId);
                // var layer = _map.getLayer(layerId);
                // if (layer) {
                //     layer.setVisibility(false);
                // }
                var layers = MapConfig.digitalGlobe.mosaics.map(function(i){
                    var layer = _map.getLayer(i);

                    if (!layer.visible && visibility) {
                        layer.setVisibility(visibility);
                    }
                    if(!visibility){
                        layer.setVisibility(visibility)
                    }

                });
            }
        },

        // show helper layers does not add layer ids to the URL and do not have a UI element to turn them on
        showHelperLayers: function (layerId, visibility) {
            var layer = _map.getLayer(layerId);
            if (layer) {
                if (layer.visible !== visibility) {
                    layer.setVisibility(visibility);
                }
            }
        },

        filter_footprints: function(attribute, minimum, maximum){
                var dglyr = _map.getLayer(MapConfig.digitalGlobe.graphicsLayerId);
                var graphics = MapModel.get('model').DigitalGlobeExtents();
                var dgrp = graphics.filter(function(graphic){
                    return (graphic.attributes[attribute] >= minimum && graphic.attributes[attribute] <= maximum);
                });
                dglyr.clear();
                dgrp.map(function(gp){dglyr.add(gp)});
        },

        getBoundingBoxesForDigitalGlobe: function () {
            var deferred = new Deferred(),
                model = MapModel.get('model'),
                dgConf = MapConfig.digitalGlobe,
                dgLayer = _map.getLayer(MapConfig.digitalGlobe.graphicsLayerId),
                extents = {},
                dgMoment = '',
                moment_arr = [],
                self = this;

            if (_dgGlobeFeaturesFetched) {
                deferred.resolve();
            } else {
                var layers = MapConfig.digitalGlobe.mosaics.map(function(i){
                    var queryTask = new QueryTask(dgConf.imagedir + i +'/ImageServer'),
                        qdef = new Deferred(),
                        query = new Query();
                        var footprints = [];

                    query.outFields = ['OBJECTID','Name', 'AcquisitionDate'];//, 'Date','Tiles'];
                    query.where = 'Category = 1';
                    query.returnGeometry = true;
                    queryTask.execute(query, function (res) {
                        // deferred.resolve(true);

                        _dgGlobeFeaturesFetched = true;
                        arrayUtils.forEach(res.features, function (feature) {
                            feature.setSymbol(
                                new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0]), 2),
                                new Color([0,255,0,0]))
                            );
                            // Give the feature a layer attribute so It's easier to tell which layer a 
                            // clicked feature belongs to
                            feature.attributes.Layer = "Digital_Globe";
                            dgMoment = moment(feature.attributes.AcquisitionDate)
                            moment_arr.push(dgMoment);
                            feature.attributes.moment = dgMoment;
                            dgLayer.add(feature);
                            footprints.push(feature);
                            extents[feature.attributes.Tiles] = webMercatorUtils.geographicToWebMercator(feature.geometry).getExtent();
                        });
                        
                        if(moment_arr.length){
                            model.dgMoments(moment_arr.sort(function(a,b){return a-b;}));

                        }
                        model.DigitalGlobeExtents(model.DigitalGlobeExtents().concat(footprints));
                        qdef.resolve(true);

                    }, function (err) {
                        console.error(err);
                        // deferred.resolve(false);
                        qdef.resolve(true);
                        return 
                    });
                    return qdef.promise;


                });
                    all(layers).then(function(){ deferred.resolve(true); })

                // Test Hitting WFS Service for GeoJson
                // var req = esriRequest({
                //     url: "http://suitability-mapper.s3.amazonaws.com/wind/imageryFootprints.json.gz",
                //     handleAs: "json"
                // });

                // req.then(function (res) {
                //     try {
                //         var esriJson = Terraformer.ArcGIS.convert(res),
                //             feature,
                //             symbol,
                //             newGeo,
                //             poly;

                //         symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                //             new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0,255,0]), 2),
                //             new Color([0,255,0,0]));


                //         arrayUtils.forEach(esriJson, function (item) {
                //             item.geometry.rings[0] = arrayUtils.map(item.geometry.rings[0], function (ring) {
                //                 return ring.reverse();
                //             });
                //             poly = new Polygon(item.geometry);
                //             item.attributes.Layer = "Digital_Globe";
                //             item.attributes.Source = 'Digital_Globe';
                //             feature = new Graphic(poly, symbol, item.attributes);
                //             dgLayer.add(feature);
                //         });

                //     } catch (e) {
                //         alert(e);
                //     }
                // }, function (err) {
                //     console.dir(err);
                // });

            }
            return deferred.promise;
        },

        showDigitalGlobeImagery: function (bucket) {
            var sensor_id = bucket.split('_id_');
            var rasterId = sensor_id[1];
            var sensorType = sensor_id[0];
            var layer = _map.getLayer(MapConfig.digitalGlobe.sensorTypes[sensorType]);
            var mrule = new MosaicRule();
            mrule.method = MosaicRule.METHOD_LOCKRASTER
            var layers = MapConfig.digitalGlobe.mosaics.map(function(i){
                var layer = _map.getLayer(i);
                if (layer && layer.visible) {
                    layer.setVisibility(false);
                }
            })
            if (layer && !layer.visible) {
                mrule.lockRasterIds = [rasterId];
                layer.setMosaicRule(mrule);
                layer.setVisibility(true);
            }
        },

        getSliderTicLabels: function(timeSlider){
                var toolsmodel = MapModel.get('model');
                dojoQuery(".dijitRuleLabel.dijitRuleLabelH").forEach(function(node,i){
                        var month = moment(timeSlider.timeStops[i]).format("MMM YYYY")
                                domAttr.set(node,'title',month);
                        if (node.innerHTML.length <= 0){
                                domStyle.set(node,'width','10px');
                                domStyle.set(node,'height','20px');
                                domStyle.set(node,'top','-20px');
                        }
                });

                // var valuenode = timeSlider._slider.valueNode
                // domAttr.set(valuenode,'data-bind','value:valuenodes,attr:{testv:4}')
                // toolsmodel.valuenodes.subscribe(function(value){
                //     console.log("model value subscribe",value)
                // })
                // ko.applyBindings(toolsmodel,valuenode)
                // on(valuenode,'Change',function(){console.log("VALUE NODE CHANGE")});
        },

        generateTimeTooltips: function(timeSlider){
            var selector = "#timeSliderDG .dijitSliderImageHandle";
            var timeNodes = dojoQuery(selector);
            dojoQuery(".dijitRuleMark.dijitRuleMarkH").forEach(function(node,i){
                domAttr.set(node,"title",moment(timeSlider.timeStops[i]).format("MMM YY"));
            });
            timeNodes.forEach(function(node,i){
                domAttr.set(node,"thumbIndex",i);

                var ttnode = domConstruct.toDom("<div id = 'thumbIndex_" + i + "class='TimeTT' thumbIndex=" + i +" ></div>")
                domConstruct.place(ttnode, node, 'before');
                on(node,mouse.enter,function(){
                    domStyle.set(ttnode,'display','block');
                })
                on(node,mouse.leave,function(){
                    domStyle.set(ttnode,'display','none');

                })
            });

            this.getSliderTicLabels(timeSlider);

            var tt = new Tooltip({
                       connectId: "timeSliderDG",
                       selector: ".dijitSliderImageHandle",
                       defaultPosition: "above",
                       showDelay:1,
                       getContent: function (matchedNode) {
                            var valuenode = timeSlider._slider.valueNode
                            var vals = domAttr.get(valuenode,'value').split(',');

                            var thumbIndex = domAttr.get(matchedNode,"thumbIndex");
                            var slider_val = vals[thumbIndex];
                            var timestep = 100/timeSlider.timeStops.length
                            var index = parseInt(slider_val/timestep)
                            return moment(timeSlider.timeStops[index]).format('MMM YY');
                       }
                   });

            return tt;
        },

        generateTimeSlider: function(location, parent) {
                var self = this,
                    timeSlider,
                    locked = true,
                    toolsmodel = MapModel.get('model'),
                    mmts = '';

                domConstruct.create("div", {
                    "id": location
                }, dom.byId(parent));
                if (registry.byId("timeSliderDG")) {
                    registry.byId("timeSliderDG").destroy();
                }
                timeSlider = new TimeSlider({
                    style: "width: 100%;",
                    id: "timeSliderDG"
                }, dom.byId(location));

                var timeExtent = new TimeExtent();
                timeSlider.setThumbCount(2);
                timeSlider.setThumbMovingRate(2000);
                timeSlider.setLoop(true);

                domConstruct.destroy(registry.byId(timeSlider.nextBtn.id).domNode.parentNode);
                registry.byId(timeSlider.previousBtn.id).domNode.style["vertical-align"] = "text-bottom";
                registry.byId(timeSlider.playPauseBtn.id).domNode.style["vertical-align"] = "text-bottom";

                // If toolspanel is open, adjust left position of slider
                // domStyle.set("timeSliderPanel", "left", "310px");
                        mmts = toolsmodel.dgMoments();
                        timeExtent.startTime = new Date(mmts[0].format('MM/DD/YYYY'));//new Date("1/1/2013 UTC");
                        timeExtent.endTime = new Date(mmts[mmts.length-1].format('MM/DD/YYYY'));
                        self.filter_footprints('moment',mmts[0],mmts[1]);

                        timeSlider.createTimeStopsByTimeInterval(timeExtent,1,'esriTimeUnitsMonths');
                        var curyear = timeExtent.startTime.getUTCFullYear();
                        var labels = timeSlider.timeStops.map(function(timeStop,i){ 
                            if (i===0){
                                return curyear;
                            }

                            if( timeStop.getUTCFullYear() != curyear){
                                curyear = timeStop.getUTCFullYear();
                              return curyear; }
                            else{
                              return '';
                            }
                          });
                        
                        timeSlider.setLabels(labels);
                        timeSlider.startup();
                        var tt = self.generateTimeTooltips(timeSlider);
                        _map.setTimeSlider(timeSlider);

                timeSlider.on("change",function(evt,obj){
                    var te = timeSlider.getCurrentTimeExtent()
                });

                timeSlider.on("time-extent-change", function(evt) {
                    var values;
                    // These values are not updated immediately, call setTimeout to 0 to execute on next pass in the event loop
                    setTimeout(function() {
                        _map.infoWindow.hide();
                        values = locked ? [0, timeSlider.thumbIndexes[0]] : [timeSlider.thumbIndexes[0], timeSlider.thumbIndexes[1]];
                        var stops = timeSlider.timeStops;
                        self.filter_footprints('moment',moment(evt.startTime),moment(evt.endTime));
                    }, 0);
                });
        },

        promptAboutDigitalGlobe: function () {
            if (registry.byId("digitalGlobeInstructions")) {
                registry.byId("digitalGlobeInstructions").destroy();
            }
            var dialog = new Dialog({
                    title: "Digital Globe - First Look",
                    style: "width: 350px",
                    id: "digitalGlobeInstructions",
                    content: "Click inside a footprint to display the imagery.<div class='dijitDialogPaneActionBar'>" + 
                             "<button id='closeDGInstructions'>Ok</button></div>" +
                             "<div class='dialogCheckbox'><input type='checkbox' id='remembershowInstructions' />" +
                             "<label for='rememberBasemapDecision'>Don't show me this again.</label></div>"
                }),
                currentCookie,
                setCookie,
                okHandle,
                cleanup,
                cbox;

            setCookie = function () {
                if(dom.byId("remembershowInstructions")) {
                    if(dom.byId("remembershowInstructions").checked) {
                        cookie("digitalGlobeInstructions", 'dontShow', { expires: 7 });
                    }
                }
            };

            cleanup = function (destroyDialog) {
                setCookie();

                if (cbox) {
                    cbox.destroy();
                }

                if (okHandle) {
                    okHandle.remove();
                }

                if (destroyDialog) {
                    dialog.destroy();
                }
            };

            currentCookie = cookie("digitalGlobeInstructions");

            if (currentCookie === undefined || currentCookie !== "dontShow") {
                dialog.show();
                cbox = new CheckBox({
                    checked: false,
                }, "remembershowInstructions");
                okHandle = on(dom.byId("closeDGInstructions"), "click", function () {
                    cleanup(true);
                });
                dialog.on('cancel', function () {
                    cleanup(false);
                });
            } else {
                cleanup(true);
            }

        },

        updatePeatLandsLayer: function (target) {
            var configObject = MapConfig.landCoverLayers,
                layer = _map.getLayer(configObject.id),
                visibleLayers = [],
                valueForHash = '';

            if (target === 'peat-lands-radio') {
                visibleLayers.push(configObject.peatLands);
                valueForHash = "/" + visibleLayers.join(",");
            } else {
                visibleLayers.push(-1);
            }

            layer.setVisibleLayers(visibleLayers);
            // Only Hide the layer if we are on primary forests layer or none, we need it visible 
            // for Tree Cover Loss to show the legend, so show if target is tree-cover-density-radio
            // or peat lands radio
            if (valueForHash !== '') {
                this.toggleLayerVisibility(configObject.id, (target === "tree-cover-density-radio" || target === "peat-lands-radio"), configObject.id + valueForHash);
            } else {
                this.toggleLayerVisibility(configObject.id, (target === "tree-cover-density-radio" || target === "peat-lands-radio"));
            }
        },

        updateTreeCoverLayer: function(visibility) {
            this.toggleLayerVisibility(MapConfig.treeCoverLayer.id, visibility);
        },

        updatePrimaryForestsLayer: function(visibility) {
            var ID = MapConfig.primaryForestsLayer.id, 
                layer = _map.getLayer(ID),
                valueForHash = '',
                layerIds = [];

            // Show or hide the various options for this layer
            MapModel.set('showPrimaryForestOptions', visibility);

            dojoQuery("#primary-forests-options input:checked").forEach(function (input) {
                layerIds.push(input.value);
            });
            
            if (layerIds.length === 0) {
                layerIds.push(-1);
            }

            if (layer) {
                layer.setVisibleLayers(layerIds);
            }

            valueForHash = "/" + layerIds.join(",");
            this.toggleLayerVisibility(ID, visibility, ID + valueForHash);
        },

        addTemporaryGraphicForDigitalGlobe: function () {
            var graphic, point, symbol;

            point = new Point(100.45, 2.015);
            symbol = new PictureSymbol({
                "angle": 0,
                "xoffset": 0,
                "yoffset": 10,
                "type": "esriPMS",
                "imageData": "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADImlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1MzA4NzI3NkQyN0MxMUUwQUU5NUVFMEYwMTY0NzUwNSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1MzA4NzI3N0QyN0MxMUUwQUU5NUVFMEYwMTY0NzUwNSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjUzMDg3Mjc0RDI3QzExRTBBRTk1RUUwRjAxNjQ3NTA1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjUzMDg3Mjc1RDI3QzExRTBBRTk1RUUwRjAxNjQ3NTA1Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQg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",
                "contentType": "image/png",
                "width": 24,
                "height": 24
            });
            graphic = new Graphic(point, symbol, {
                id: 'temp_graphic'
            });
            _map.graphics.add(graphic);
        },

        removeDigitalGlobeTemporaryGraphic: function () {
            arrayUtils.forEach(_map.graphics.graphics, function (g) {
                if (g.attributes) {
                    if (g.attributes.id === 'temp_graphic') {
                        _map.graphics.remove(g);
                    }
                }
            });
        },

        adjustOverlaysLayer: function () {
            var layerIds = [],
                layer = _map.getLayer(MapConfig.overlaysLayer.id),
                valueForHash = '';
            
            dojoQuery(".overlays-checkboxes .dijitCheckBoxInput").forEach(function (node) {
                switch (node.id) {
                    case "provinces-checkbox":
                        if (node.checked) {
                            layerIds.push(4);
                        }
                        break;
                    case "districts-checkbox":
                        if (node.checked) {
                            layerIds.push(3);
                        }
                        break;
                    case "subdistricts-checkbox":
                        if (node.checked) {
                            layerIds.push(2);
                        }
                        break;
                    case "villages-checkbox":
                        if (node.checked) {
                            layerIds.push(1);
                        }
                        break;
                }
            });

            if (layerIds.length === 0) {
                layerIds.push(-1);
                this.toggleLayerVisibility(MapConfig.overlaysLayer.id, false);
            } else if (layer) {
                layer.setVisibleLayers(layerIds);
                valueForHash = "/" + layerIds.join(",");
                this.toggleLayerVisibility(MapConfig.overlaysLayer.id, true, MapConfig.overlaysLayer.id + valueForHash);
            }
            
        },

        setOverlayLayerOrder: function (evt) {
            var layer = _map.getLayer(MapConfig.overlaysLayer.id),
                layerInfos = evt.target.createDynamicLayerInfosFromLayerInfos();

            // We dont want layer 0 and we need to reverse the order of the array
            layerInfos = layerInfos.slice(1);
            layerInfos.reverse();
            layer.setDynamicLayerInfos(layerInfos);

        },

        updateLayersInHash: function (operation, key, value) {
            var queryObj = ioQuery.queryToObject(hash()),
                layers = queryObj.lyrs,
                layersArray = layers.split(':'),
                length = layersArray.length, 
                index = 0, 
                indexToRemove;

            if (operation === "remove") {
                for(index; index < length; index++) {
                    if (layersArray[index].search(key) > -1) {
                        indexToRemove = index;
                    }
                }
                if (indexToRemove !== undefined) {
                    layersArray.splice(indexToRemove, 1);
                }
            } else if (operation === "add") {
                for(index; index < length; index++) {
                    if (layersArray[index].search(key) > -1) {
                        indexToRemove = index;
                    }
                }
                if (indexToRemove !== undefined) {
                    layersArray.splice(indexToRemove, 1, value);
                } else {
                    layersArray.push(value);
                }
            }

            layersArray = arrayUtils.filter(layersArray, function (item) {
                return item !== '';
            });

            HashController.updateHash({
                lyrs: layersArray.join(':')
            });

        },

        updateLegend: function(layer, title) {

        }

    };

});