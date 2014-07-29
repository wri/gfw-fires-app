define(["dojo/dom", "dijit/registry", "dojo/query", "modules/HashController", "modules/EventsController", "views/home/HomeModel", "dojo/_base/array","views/map/LayerController", "views/map/MapConfig"],
    function(dom, domQuery, registry, HashController, EventsController, HomeModel, arrayUtil, LayerController, MapConfig) {

        var o = {};
        var initialized = false;
        var viewName = "homeView";
        var viewObj = {
            viewId: "homeView",
            viewName: "home"
        };
        var stopAnimation = false;
        o.init = function() {
            var that = this;
            if (initialized) {
                //switch to this view
                EventsController.switchToView(viewObj);

                EventsController.startModeAnim();
                return;
            }

            require(["dojo/text!views/home/home.html"], function(html) {

                initialized = true;
                //otherwise load the view


                dom.byId(viewName).innerHTML = html;


                EventsController.switchToView(viewObj);



                HomeModel.applyBindings(viewName);

                //ANIMATE ONLY AFTER BINDING DONE


                EventsController.getPeats();
                /*{
                    resume: true
                }*/


            });
        };

        o.startModeAnim = function(data) {
            console.log("start mode animation");
            stopAnimation = false;

            var currentNodeId = 2; //start with last one

            var currentModeOption = function(id) {
                var homeModeOptions = HomeModel.vm.homeModeOptions();

                var mappedHomModeOptions = arrayUtil.map(homeModeOptions, function(hmOpt, i) {
                    if (i === id) {
                        //alert(i);
                        hmOpt.display = true;
                    } else {
                        hmOpt.display = false;
                    }
                    return hmOpt;
                });
                HomeModel.vm.homeModeOptions([]);
                //console.log(mappedHomModeOptions);
                HomeModel.vm.homeModeOptions(mappedHomModeOptions);
            };

            currentModeOption(currentNodeId);

            require(["dojo/fx", "dojo/_base/fx", "dojo/query"], function(coreFx, baseFx, dojoQuery) {


                var runAnimation = function(id) {
                    console.log("animating " + id);
                    var itemsToAnimate = dojoQuery(".modeGroup");
                    var maxItems = itemsToAnimate.length;

                    var anim = coreFx.chain([
                        baseFx.animateProperty({
                            node: itemsToAnimate[id],
                            properties: {
                                marginLeft: {
                                    start: 0,
                                    end: -350
                                },
                                opacity: {
                                    start: 1,
                                    end: 0
                                }
                            },
                            onEnd: function() {
                                var nextNodeId;
                                if (currentNodeId < maxItems - 1) {
                                    nextNodeId = currentNodeId + 1;
                                    currentNodeId++;
                                } else {
                                    nextNodeId = 0;
                                    currentNodeId = 0;
                                }
                                //currentNodeId++;
                                //console.log(currentNodeId);
                                //console.log(nextNodeId);

                                setTimeout(function() {

                                    currentModeOption(nextNodeId);

                                    if (!stopAnimation) {
                                        setTimeout(function() {
                                            runAnimation(nextNodeId);
                                        }, 4000);
                                    }

                                }, 500);



                            },
                            units: "px",
                            duration: 500
                        })
                        /*baseFx.animateProperty({
                            node: itemsToAnimate[id + 1],
                            properties: {
                                opacity: {
                                    start: 0,
                                    end: 1
                                }
                            },
                            duration: 500
                        })*/

                    ]);

                    /*aspect.before(anim, "beforeBegin", function() {
                        domStyle.set(container, "backgroundColor", "#eee");
                    });*/

                    anim.play();

                    //.play();
                };

                runAnimation(currentNodeId);


            });
        };

        o.getPeats = function() {

            require(["modules/Loader", "modules/ErrorController", "dojo/promise/all"], function(Loader, ErrorController, all) {

                var today = new Date();
                var sevendaysback = new Date();
                sevendaysback.setDate(today.getDate() - 7);
                var yyyy = sevendaysback.getFullYear();

                var mm = "00" + (sevendaysback.getMonth() + 1).toString();
                mm = mm.substr(mm.length - 2);

                var dd = "00" + sevendaysback.getDate().toString();
                dd = dd.substr(dd.length - 2);

                var dateStr = yyyy.toString() + "-" + mm + "-" + dd;

                var queryObj = {
                    layer: "http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer/0",
                    where: "peat = 1 AND ACQ_DATE > date '" + dateStr + " 12:00:00'",
                    type: "executeForCount" //execute
                };
                var deferred1 = Loader.query(queryObj);

                var queryObj2 = {
                    layer: "http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer/0",
                    where: "ACQ_DATE > date '" + dateStr + " 12:00:00'",
                    type: "executeForCount" //execute
                };
                var deferred2 = Loader.query(queryObj2);

                all([deferred1, deferred2]).then(function(results) {

                    var peats = results[0];
                    var total = results[1];
                    var percent = Math.ceil((peats / total) * 100);

                    var homeModeOptions = HomeModel.vm.homeModeOptions();
                    var positionToUpdate = 0;
                    var newStr = "";
                    arrayUtil.some(homeModeOptions, function(item, i) {
                        var selected = item.html.indexOf("Fires occuring in peatland") > -1;
                        if (selected) {
                            positionToUpdate = i;
                            newStr = item.html.replace("Fires occuring in peatland", "<p>" + percent.toString() + " %</p> Fires occuring in peatland");
                        }
                        return selected;
                    });
                    homeModeOptions[positionToUpdate].html = newStr;
                    HomeModel.vm.homeModeOptions(homeModeOptions);
                    //once viewmodel is updated start animation
                    // setTimeout(function() {
                    //     EventsController.startModeAnim();
                    // }, 500);
                    EventsController.startModeAnim();                    

                });


            });

        };

        o.stopModeAnim = function(data) {
            stopAnimation = true;
            console.log("stop mode animation ");
        };

        o.getAnimStatus = function() {
            return stopAnimation;
        };

        o.modeSelect = function(data) {
            var selectedMode = data;
            if (selectedMode.eventName === '') {
                return;
            }
            if (data.html) {
                if (data.html.search("latest imagery") > -1) {
                    LayerController.updateLayersInHash('add', MapConfig.digitalGlobe.id, MapConfig.digitalGlobe.id);
                }
            }
            eval("EventsController." + selectedMode.eventName + "()");
        };

        o.isInitialized = function() {
            return initialized;
        };



        return o;


    });