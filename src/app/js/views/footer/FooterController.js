define([
    "dojo/dom", 
    "dojo/Deferred",
    "dijit/registry", 
    "modules/HashController", 
    "modules/EventsController", 
    "views/footer/FooterModel",
    "views/map/MapConfig",
    "main/Config",
    "dojo/_base/array",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/request",
    "views/footer/FooterModel"
], function(dom, Deferred, registry, HashController, EventsController, FooterModel, MapConfig, MainConfig, arrayUtil, Query, QueryTask, esriRequest, FooterModel) {

        var o = {};
        var initialized = false;
        var viewId = "app-footer";

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

                dom.byId(viewId).innerHTML = html;

                //EventsController.initShareButton();

                FooterModel.applyBindings(viewId);

                that.initShareButton();

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
            (function() {
                var po = document.createElement('script');
                po.type = 'text/javascript';
                po.async = true;
                po.src = 'https://apis.google.com/js/plusone.js';
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(po, s);
            })();




        };


        o.footerSelect = function(data) {
            var selectedItem = data;
            eval("EventsController." + selectedItem.eventName + "()");
            //alert(selectedItem.event);
        };

        o.subscribeToAlerts = function () {
            var self = this;
            require([
                "dojo/on",
                "dijit/Dialog",
                "dojo/dom-style",
                "dojo/dom-construct",
                "dijit/form/Select",
                "dojox/validate/web",
                "dojo/text!views/footer/emailAlertForm.html"
            ], function (on, Dialog, domStyle, domConstruct, Select, validate, html) {
                var dialog = new Dialog({
                        title: "Sign up to receive fire alerts!",
                        style: "width: 550px"
                    }),
                    content = html,
                    submitHandle,
                    districtHandle;

                dialog.setContent(content);
                dialog.show();
                FooterModel.applyBindings("signUpAlertsForm");

                self.getDistrictValues().then(function (districtArray) {
                    var model = FooterModel.get('model');
                    if (districtArray) {
                        model.districtsAvailableForAlerts(districtArray);
                    }
                    // Reset the Model, then Fill it up on change of district picker
                    model.subDistrictsAvailableForAlerts([]);

                    districtHandle = on(dom.byId("aoiDistrictPicker"), "change", function (evt) {
                        var value = evt.target ? evt.target.value : evt.srcElement.value;
                        if (value !== "NONE") {
                            self.getSubDistricts(value).then(function (subDistrictArray) {
                                model.subDistrictsAvailableForAlerts(subDistrictArray);
                            });
                        }
                    });
                    // Validate form on submit and then hand off to post the request
                    submitHandle = on(dom.byId("alerts-submit-button"), "click", function () {
                        var email = dom.byId("emailForAlerts").value,
                            phone = dom.byId("phoneNumberForAlerts").value,
                            formIsValid = true,
                            selectedOptions = [];

                        model.errorMessages([]);
                        model.showErrorMessages(false);

                        if (dom.byId("aoiSubDistrictPicker").value === "ALL") {
                            arrayUtil.forEach(dom.byId("aoiSubDistrictPicker").options, function (item) {
                                selectedOptions.push({
                                    "aoi_id": parseInt(item.value),
                                    "aoi_name": item.innerHTML
                                });
                            });
                        } else {
                            arrayUtil.forEach(dom.byId("aoiSubDistrictPicker").options, function (item) {
                                if (item.selected) {
                                    selectedOptions.push({
                                        "aoi_id": parseInt(item.value),
                                        "aoi_name": item.innerHTML
                                    });
                                }
                            });
                        }

                        if (selectedOptions.length === 0) {
                            domStyle.set("aoiSubDistrictPicker","border","1px solid red");
                            model.errorMessages.push("You need to select at least one subdistrict.");
                        } else {
                            domStyle.set("aoiSubDistrictPicker","border","");
                        }

                        if (validate.isEmailAddress(email) || phone !== "") {
                            domStyle.set("phoneNumberForAlerts","border","");
                            domStyle.set("emailForAlerts","border","");
                        } else {
                            formIsValid = false;
                            domStyle.set("emailForAlerts","border","1px solid red");
                            domStyle.set("phoneNumberForAlerts","border","1px solid red");
                            model.errorMessages.push("You must atleast provide a phone number and/or an email.");
                        }

                        if (model.errorMessages().length > 0) {
                            model.showErrorMessages(true);
                        } else {
                            self.postSubscribeRequest(selectedOptions, email, phone);
                        }

                    });

                    dialog.on('cancel', function () {
                        domConstruct.destroy(dom.byId("signUpAlertsForm"));
                        districtHandle.remove();
                        submitHandle.remove();
                    });

                });
                
            });
        };

        o.postSubscribeRequest = function (areas, email, phone) {
            var subscribeUrl = MainConfig.emailSubscribeUrl,
                content = {
                    areas: JSON.stringify(areas)
                },
                req;

            if (email !== '') {
                content.msg_type = 'email';
                content.msg_addr = email;
            } else {
                content.msg_addr = phone;
                content.msg_type = 'sms';
            }

            req = esriRequest({
                url: subscribeUrl,
                content: content,
                handleAs: "json"
            }, {usePost: true});

            req.then(function (res) {
                if (res.status_code === 200) {
                    alert("You have successfully subscribed.");
                }
            }, function (err) {
                alert("There was an error subcribing at this time.  Please try again later.");
            });


        };

        o.getDistrictValues = function () {
            var deferred = new Deferred(),
                queryTask = new QueryTask(MapConfig.layerForDistrictQuery.url),
                query = new Query(),
                results = [],
                attrs;

            if (FooterModel.get('districtsAvailableForAlerts').length > 0) {
                deferred.resolve(false);                
            } else {
                query.returnGeometry = false;
                query.outFields = MapConfig.layerForDistrictQuery.outFields;
                query.where = "1 = 1";

                queryTask.execute(query, function (res) {
                    results.push({ label: 'Choose one', value: 'NONE', selected: true });
                    arrayUtil.forEach(res.features, function (feature) {
                        attrs = feature.attributes;
                        results.push({ label: attrs.NAME, value: attrs.NAME });
                    });
                    deferred.resolve(results);
                }, function (err) {
                    deferred.resolve(false);
                });   
            }

            return deferred.promise;
        };

        o.getSubDistricts = function (districtName) {
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
            query.where = "DISTRICT = '" + districtName.toUpperCase() + "'";

            queryTask.execute(query, function (res) {
                results.push({ label: 'Select All', value: 'ALL', selected: true });
                arrayUtil.forEach(res.features, function (feature) {
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
                deferred.resolve(results);
            }, function (err) {
                deferred.resolve(false);
            });

            return deferred.promise; 
        };

        return o;


    });