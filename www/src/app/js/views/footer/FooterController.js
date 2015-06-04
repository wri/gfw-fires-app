define([
    "dojo/dom",
    "dojo/Deferred",
    "dojo/topic",
    "dijit/registry",
    "modules/HashController",
    "modules/EventsController",
    "views/footer/FooterModel",
    "views/map/MapConfig",
    "main/Config",
    "dojo/_base/array",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/request"
], function(dom, Deferred, topic, registry, HashController, EventsController, FooterModel, MapConfig, MainConfig, arrayUtil, Query, QueryTask, esriRequest) {

    var o = {};
    var initialized = false;
    var viewId = "app-footer";
    var gfwFooterLoaded = false;

    o.init = function() {
        var that = this;

        if (initialized) {
            //switch to this view
            //HashController.switchToView(viewName);
            return;
        }
        initialized = true;
        //otherwise load the view

        require(["dojo/text!views/footer/footer.html", "views/footer/FooterModel"], function(html, FooterModel) {
            //debugger;
            dom.byId(viewId).innerHTML = html + dom.byId(viewId).innerHTML;
            //EventsController.initShareButton();

            FooterModel.applyBindings(viewId);

            that.initShareButton();

            var s = document.createElement('script'),
                h = document.getElementsByTagName('head')[0];
            s.src = 'http://www.globalforestwatch.org/gfw-assets';
            s.async = true;
            s.setAttribute('data-current', ".shape-fire");
            h.appendChild(s);

        });
    };


    o.initShareButton = function() {
        // twitter
        ! function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (!d.getElementById(id)) {
                js = d.createElement(s);
                js.id = id;
                js.src = "https://platform.twitter.com/widgets.js";
                fjs.parentNode.insertBefore(js, fjs);
            }
        }(document, "script", "twitter-wjs");

        // facebook
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.0";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        //google
        // (function() {
        //     var po = document.createElement('script');
        //     po.type = 'text/javascript';
        //     po.async = false;
        //     po.src = 'https://apis.google.com/js/plusone.js';
        //     var s = document.getElementsByTagName('script')[0];
        //     s.parentNode.insertBefore(po, s);
        // })();




    };


    o.footerSelect = function(data) {
        var selectedItem = data;
        eval("EventsController." + selectedItem.eventName + "()");
        //alert(selectedItem.event);
    };

    o.subscribeToAlerts = function() {
        var self = this;
        require([
            "dojo/on",
            "dijit/Dialog",
            // "dojo/dom-style",
            "dojo/dom-construct",
            // "dijit/form/Select",
            // "dojox/validate/web"
        ], function(on, Dialog, domConstruct) {
            var dialog = new Dialog({
                    title: "Sign up to receive fire alerts!",
                    style: "width: 350px;height: auto;"
                }),
                linker;

            dialog.setContent(MainConfig.alertsSignUpContent);
            dialog.show();

            linker = on(dom.byId('map-link-from-signup'), 'click', function() {
                EventsController.clickNavLink({
                    html: 'Map',
                    viewName: 'map',
                    domId: 'mapView',
                    selected: false
                });
                dialog.destroy();
                cleanup();
            });

            dialog.on('cancel', cleanup);


            function cleanup() {
                domConstruct.destroy(dom.byId("signUpAlertsForm"));
                linker.remove();
                // telInput.intlTelInput('destroy');
            }

        });
    };

    o.postSubscribeRequest = function(areas, address, type) {
        var subscribeUrl = MainConfig.emailSubscribeUrl,
            content = {
                areas: JSON.stringify(areas),
                msg_addr: address,
                msg_type: type
            },
            honeyPotValue = dom.byId("verifyEmailForAlerts").value,
            deferred = new Deferred(),
            req;


        if (honeyPotValue === '') {
            // Set status in submit button
            dom.byId("alerts-submit-button").innerHTML = "Submitting...";
            req = esriRequest({
                url: subscribeUrl,
                content: content,
                handleAs: "json"
            }, {
                usePost: true
            });

            req.then(function(res) {
                dom.byId("alerts-submit-button").innerHTML = "Submit";
                alert("You have successfully subscribed, you should start receiving alerts as they come in for your area(s) of interest.");
                deferred.resolve(true);
            }, function(err) {
                dom.byId("alerts-submit-button").innerHTML = "Submit";
                alert("There was an error subcribing at this time. " + err.message);
                deferred.resolve(false);
            });
        } else {
            deferred.resolve(true);
        }

        return deferred.promise;

    };

    o.getProvinceValues = function() {
        var deferred = new Deferred(),
            queryTask = new QueryTask(MapConfig.layerForProvinceQuery.url),
            query = new Query(),
            results = [],
            temp = [],
            name,
            attrs;

        query.returnGeometry = false;
        query.outFields = MapConfig.layerForProvinceQuery.outFields;
        query.where = "1 = 1";

        queryTask.execute(query, function(res) {
            arrayUtil.forEach(res.features, function(feature) {
                attrs = feature.attributes;
                name = attrs[MapConfig.layerForProvinceQuery.outFields[0]];
                if (arrayUtil.indexOf(temp, name) === -1) {
                    temp.push(name);
                    results.push({
                        label: name,
                        value: name
                    });
                }
            });
            results.sort(function(a, b) {
                if (a.label < b.label) {
                    return -1;
                }
                if (a.label > b.label) {
                    return 1;
                }
                return 0;
            });
            results.unshift({
                label: 'Choose one',
                value: 'NONE',
                selected: true
            });
            deferred.resolve(results);
        }, function(err) {
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    o.getDistrictValues = function() {
        var deferred = new Deferred(),
            queryTask = new QueryTask(MapConfig.layerForDistrictQuery.url),
            query = new Query(),
            results = [],
            temp = [],
            name,
            province,
            attrs;

        if (FooterModel.get('districtsAvailableForAlerts').length > 0) {
            deferred.resolve(false);
        } else {
            query.returnGeometry = false;
            query.outFields = MapConfig.layerForDistrictQuery.outFields;
            query.where = "1 = 1";

            queryTask.execute(query, function(res) {
                arrayUtil.forEach(res.features, function(feature) {
                    attrs = feature.attributes;
                    name = attrs[MapConfig.layerForDistrictQuery.outFields[0]];
                    province = attrs[MapConfig.layerForDistrictQuery.outFields[1].toUpperCase()];
                    if (arrayUtil.indexOf(temp, name) === -1) {
                        temp.push(name);
                        results.push({
                            label: name,
                            value: name,
                            province: province
                        });
                    }
                });
                results.sort(function(a, b) {
                    if (a.label < b.label) {
                        return -1;
                    }
                    if (a.label > b.label) {
                        return 1;
                    }
                    return 0;
                });
                results.unshift({
                    label: 'Choose one',
                    value: 'NONE',
                    selected: true
                });
                deferred.resolve(results);
            }, function(err) {
                deferred.resolve(false);
            });
        }

        return deferred.promise;
    };

    o.getSubDistricts = function(districtNamesArray) {
        var deferred = new Deferred(),
            queryTask = new QueryTask(MapConfig.layerForSubDistrictQuery.url),
            query = new Query(),
            results = [],
            temp = [],
            attrs,
            id;

        query.returnGeometry = false;
        // query.returnDistinctValues = true;
        query.outFields = MapConfig.layerForSubDistrictQuery.outFields;

        var whereClause;
        if (districtNamesArray[0].value === "ALL") {
            console.log("ALL");
            whereClause = "1 = 1";
        } else {
            var whereClause = "DISTRICT = '";
            for (var key = 0; key < districtNamesArray.length; key++) {
                whereClause += districtNamesArray[key].value;
                if (key == districtNamesArray.length - 1) { //last value
                    whereClause += "'";
                } else {
                    whereClause += "' OR DISTRICT = '";
                }
            }
        }

        query.where = whereClause;

        queryTask.execute(query, function(res) {
            arrayUtil.forEach(res.features, function(feature) {
                attrs = feature.attributes;
                id = attrs[MapConfig.layerForSubDistrictQuery.outFields[1]];
                if (arrayUtil.indexOf(temp, id) === -1) {
                    temp.push(id);
                    results.push({
                        label: attrs[MapConfig.layerForSubDistrictQuery.outFields[0]],
                        value: id
                    });
                }
            });
            results.sort(function(a, b) {
                if (a.label < b.label) {
                    return -1;
                }
                if (a.label > b.label) {
                    return 1;
                }
                return 0;
            });
            // results.unshift({
            //     label: 'Select All',
            //     value: 'ALL',
            //     selected: true
            // });
            deferred.resolve(results);
        }, function(err) {
            deferred.resolve(false);
        });

        return deferred.promise;
    };

    return o;


});