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
    "esri/request"
], function(dom, Deferred, registry, HashController, EventsController, FooterModel, MapConfig, MainConfig, arrayUtil, Query, QueryTask, esriRequest) {

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
                // add validation
            ], function (on, Dialog, domStyle, domConstruct, Select, validate, html) {
                var dialog = new Dialog({
                        title: "Sign up to receive fire alerts!",
                        style: "width: 550px;height: 400px;"
                    }),
                    content = html,
                    submitHandle,
                    telInput,
                    provinceHandle,
                    districtHandle,
                    subDistrictHandle;


                dialog.setContent(content);
                dialog.show();
                FooterModel.applyBindings("signUpAlertsForm");
                telInput = $("#phoneNumberForAlerts");
                telInput.intlTelInput({
                    validationScript: './app/libs/isValidNumber.js'
                });

                function cleanup () {
                    domConstruct.destroy(dom.byId("signUpAlertsForm"));
                    telInput.intlTelInput('destroy');
                    provinceHandle.remove();
                    districtHandle.remove();
                    submitHandle.remove();
                    subDistrictHandle.remove();
                }

                self.getProvinceValues().then(function(provinceArray) {
                    FooterModel.get('model').provincesAvailableForAlerts(provinceArray);


                    self.getDistrictValues().then(function (districtArray) {
                        var model = FooterModel.get('model');
    //                    if (districtArray) {
    //                        model.districtsAvailableForAlerts(districtArray);
    //                    }
                        // Reset the Model, then Fill it up on change of Province/District picker
                        model.districtsAvailableForAlerts([]);
                        model.subDistrictsAvailableForAlerts([]);

                        var provincesAvailable = FooterModel.get('provincesAvailableForAlerts');

                        //TODO add a select all object when creating new array
                        //TODO when creating the 2D array so they can select
                        //TODO all. then have select all districts add all subdistrs

                        var provinceDistrictMapping = new Array();
                        arrayUtil.forEach(provincesAvailable, function (province){
                            provinceDistrictMapping[province.value] = new Array();
                        });

                        arrayUtil.forEach(districtArray, function (district){
                            if(district.province){
                                provinceDistrictMapping[district.province].push(district);
                            }
                        })

                        provinceHandle = on(dom.byId("aoiProvincePicker"), "change", function (evt) {
                            var value = evt.target ? evt.target.value : evt.srcElement.value;
                            model.districtsAvailableForAlerts(provinceDistrictMapping[value]);
                        });

                        districtHandle = on(dom.byId("aoiDistrictPicker"), "change", function (evt) {
                            //var values = evt.target ? evt.target.selectedOptions : evt.srcElement.value;

                            var values;
                            if(evt.target) {
                                if(evt.target.selectedOptions){
                                    values = evt.target.selectedOptions;
                                } else {
                                    values = evt.target.value;
                                }
                            } else {
                                values = evt.srcElement.value;
                            }

                            if (values !== "NONE") {
                                self.getSubDistricts(values).then(function (subDistrictArray) {
                                    model.subDistrictsAvailableForAlerts(subDistrictArray);
                                });
                            }
                        });

                        subDistrictHandle = on(dom.byId("aoiSubDistrictPicker"), "change", function (evt) {
                            var warn = false;
                            if (evt.target.selectedOptions) {
                                if(evt.target.selectedOptions.length > 10){
                                    warn = true;
                                } else {
                                    warn = false;
                                }
                            }
                            if(evt.target.value == "ALL"){
                                warn = true;
                            }

                            if(warn){
                                model.showSubDistrictWarning(true);
                            } else {
                                model.showSubDistrictWarning(false);
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
                                    if (item.innerHTML !== "Select All") {
                                        selectedOptions.push({
                                            "aoi_id": parseInt(item.value),
                                            "aoi_name": item.innerHTML
                                        });
                                    }
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
                                formIsValid = false;
                            } else {
                                domStyle.set("aoiSubDistrictPicker","border","");
                            }

                            if (validate.isEmailAddress(email) || telInput.intlTelInput("isValidNumber")) {
                                domStyle.set("phoneNumberForAlerts","border","");
                                domStyle.set("emailForAlerts","border","");
                            } else {
                                formIsValid = false;
                                domStyle.set("emailForAlerts","border","1px solid red");
                                domStyle.set("phoneNumberForAlerts","border","1px solid red");
                                model.errorMessages.push("You must at least provide a phone number and/or an email.");
                            }

                            if (!formIsValid) {
                                model.showErrorMessages(true);
                            } else {
                                if (phone !== '') {
                                    phone = phone.replace(/[^\d]/g,'');
                                    self.postSubscribeRequest(selectedOptions, phone, 'sms').then(function (result) {
                                        if (result) {
                                            dialog.destroy();
                                            cleanup();
                                        }
                                    });
                                }
                                if (validate.isEmailAddress(email)) {
                                    self.postSubscribeRequest(selectedOptions, email, 'email').then(function (result) {
                                        if (result) {
                                            dialog.destroy();
                                            cleanup();
                                        }
                                    });
                                }
                            }
                        });

                        dialog.on('cancel', cleanup);

                    });
                });
                
            });
        };

        o.postSubscribeRequest = function (areas, address, type) {
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
                }, {usePost: true});

                req.then(function (res) {
                    dom.byId("alerts-submit-button").innerHTML = "Submit";
                    alert("You have successfully subscribed, you should start receiving alerts as they come in for your area(s) of interest.");
                    deferred.resolve(true);
                }, function (err) {
                    dom.byId("alerts-submit-button").innerHTML = "Submit";
                    alert("There was an error subcribing at this time. " + err.message);
                    deferred.resolve(false);
                });
            } else {
                deferred.resolve(true);
            }

            return deferred.promise;

        };

        o.getProvinceValues = function () {
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

                queryTask.execute(query, function (res) {
                    arrayUtil.forEach(res.features, function (feature) {
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
                    results.sort(function (a,b) {
                        if (a.label < b.label) { return -1; }
                        if (a.label > b.label) { return 1; }
                        return 0;
                    });
                    results.unshift({ label: 'Choose one', value: 'NONE', selected: true });
                    deferred.resolve(results);
                }, function (err) {
                    deferred.resolve(false);
                });

            return deferred.promise;
        }

        o.getDistrictValues = function () {
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

                queryTask.execute(query, function (res) {
                    arrayUtil.forEach(res.features, function (feature) {
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
                    results.sort(function (a,b) {
                        if (a.label < b.label) { return -1; }
                        if (a.label > b.label) { return 1; }
                        return 0;
                    });
                    results.unshift({ label: 'Choose one', value: 'NONE', selected: true });
                    deferred.resolve(results);
                }, function (err) {
                    deferred.resolve(false);
                });   
            }

            return deferred.promise;
        };

        o.getSubDistricts = function (districtNamesArray) {
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

            var whereClause = "DISTRICT = '";
            for(var key = 0; key < districtNamesArray.length; key++) {
                whereClause += districtNamesArray[key].value;
                if(key == districtNamesArray.length -1) {//last value
                    whereClause += "'";
                } else {
                    whereClause += "' OR DISTRICT = '";
                }
            }


            query.where = whereClause;

            queryTask.execute(query, function (res) {
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
                results.sort(function (a,b) {
                    if (a.label < b.label) { return -1; }
                    if (a.label > b.label) { return 1; }
                    return 0;
                });
                results.unshift({ label: 'Select All', value: 'ALL', selected: true });
                deferred.resolve(results);
            }, function (err) {
                deferred.resolve(false);
            });

            return deferred.promise; 
        };

        return o;


    });