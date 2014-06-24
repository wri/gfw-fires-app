define(["dojo/dom", "dijit/registry", "modules/HashController", "modules/EventsController", "views/home/HomeModel", "dojo/_base/array"],
    function(dom, registry, HashController, EventsController, HomeModel, arrayUtil) {

        var o = {};
        var initialized = false;
        var viewName = "homeView";
        var viewObj = {
            viewName: "homeView"
        }
        var stopAnimation = false;
        o.init = function() {
            var that = this;
            if (initialized) {
                //switch to this view
                EventsController.switchToView(viewObj);

                return;
            }

            initialized = true;
            //otherwise load the view
            require(["dojo/text!views/home/home.html"], function(html) {

                dom.byId(viewName).innerHTML = html;


                EventsController.switchToView(viewObj);



                HomeModel.applyBindings(viewName);

                //ANIMATE ONLY AFTER BINDING DONE
                EventsController.startModeAnim({
                    resume: true
                });

            })
        }

        o.startModeAnim = function(data) {
            console.log("start mode animation");
            stopAnimation = false;

            var currentNodeId = 0;

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
                console.log(mappedHomModeOptions);
                HomeModel.vm.homeModeOptions(mappedHomModeOptions);
            }

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
                                console.log(nextNodeId);

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

        o.stopModeAnmin = function(data) {
            stopAnimation = true;
            console.log("stop mode animation ");
        };

        o.modeSelect = function(data) {
            var selectedMode = data;

            console.log(selectedMode);
        }



        return o;


    });