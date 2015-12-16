/* global define */
define([
    "knockout",
    "dijit/registry",
    "dijit/Dialog",
    "main/Config",
    "views/map/MapConfig",
    "dojo/dom"
], function(ko, registry, Dialog, Config, MapConfig, dom) {

    var o = {};

    o.vm = {};

    var vm = o.vm;

    vm.appState = ko.observable({});

    // Simple Text Labels
    vm.locatorContainerHeader = ko.observable(MapConfig.text.locatorContainerHeader);
    vm.alertToolboxHeader = ko.observable(MapConfig.text.alertToolboxHeader);
    vm.locatorSearchLabel = ko.observable(MapConfig.text.locatorSearchLabel);
    vm.dmsSearch = ko.observable(MapConfig.text.dmsSearch);
    vm.latLongSearch = ko.observable(MapConfig.text.latLongSearch);
    vm.degreesLabel = ko.observable(MapConfig.text.degreesLabel);
    vm.minutesLabel = ko.observable(MapConfig.text.minutesLabel);
    vm.secondsLabel = ko.observable(MapConfig.text.secondsLabel);
    vm.latitudeLabel = ko.observable(MapConfig.text.latitudeLabel);
    vm.longitudeLabel = ko.observable(MapConfig.text.longitudeLabel);
    vm.searchOptionGoButton = ko.observable(MapConfig.text.searchOptionGoButton);
    vm.clearSearchPins = ko.observable(MapConfig.text.clearSearchPins);
    vm.legend = ko.observable(MapConfig.text.legend);
    vm.firesCheckbox = ko.observable(MapConfig.text.firesCheckbox);
    vm.noaaFiresCheckbox = ko.observable(MapConfig.text.noaaFiresCheckbox);
    vm.noaaSubLabel = ko.observable(MapConfig.text.noaaSubLabel);
    vm.indonesiaFiresCheckbox = ko.observable(MapConfig.text.indonesiaFiresCheckbox);
    vm.indonesiaSubLabel = ko.observable(MapConfig.text.indonesiaSubLabel);
    vm.firesSubLabel = ko.observable(MapConfig.text.firesSubLabel);
    vm.confidenceFiresCheckbox = ko.observable(MapConfig.text.confidenceFiresCheckbox);
    vm.activateSmartCheckbox = ko.observable(MapConfig.text.activateSmartCheckbox);
    vm.firesWeek = ko.observable(MapConfig.text.firesWeek);
    vm.fires72 = ko.observable(MapConfig.text.fires72);
    vm.fires48 = ko.observable(MapConfig.text.fires48);
    vm.fires24 = ko.observable(MapConfig.text.fires24);
    vm.none = ko.observable(MapConfig.text.none);
    vm.oilPalmCheckbox = ko.observable(MapConfig.text.oilPalmCheckbox);
    vm.rspoOilPalmCheckbox = ko.observable(MapConfig.text.rspoOilPalmCheckbox);
    vm.woodFiberCheckbox = ko.observable(MapConfig.text.woodFiberCheckbox);
    vm.loggingCheckbox = ko.observable(MapConfig.text.loggingCheckbox);
    vm.protectedAreasCheckbox = ko.observable(MapConfig.text.protectedAreasCheckbox);
    vm.indicativeMoratoriumCheckbox = ko.observable(MapConfig.text.indicativeMoratoriumCheckbox);
    vm.burnedScarsCheckbox = ko.observable(MapConfig.text.burnedScarsCheckbox);
    vm.tomnodCheckbox = ko.observable(MapConfig.text.tomnodCheckbox);

    vm.disableAirQuality = true;

    vm.peatLandsRadio = ko.observable(MapConfig.text.peatLandsRadio);
    vm.treeCoverDensityRadio = ko.observable(MapConfig.text.treeCoverDensityRadio);
    vm.primaryForestsRadio = ko.observable(MapConfig.text.primaryForestsRadio);
    vm.southeastLandCoverRadio = ko.observable(MapConfig.text.southeastLandCoverRadio);
    vm.peatLandsSubLabel = ko.observable(MapConfig.text.peatLandsSubLabel);
    vm.treeCoverDensitySubLabel = ko.observable(MapConfig.text.treeCoverDensitySubLabel);
    vm.southeastLandCoverSubLabel = ko.observable(MapConfig.text.southeastLandCoverSubLabel);
    vm.forestUseCheckboxSubLabelSelect = ko.observable(MapConfig.text.forestUseCheckboxSubLabelSelect);
    vm.rspoOilPalmCheckboxSubLabel = ko.observable(MapConfig.text.rspoOilPalmCheckboxSubLabel);
    vm.primaryForestsSubLabel = ko.observable(MapConfig.text.primaryForestsSubLabel);
    vm.conservationCheckboxSubLabelGlobal = ko.observable(MapConfig.text.conservationCheckboxSubLabelGlobal);
    vm.indicativeMoratoriumCheckboxSubLabel = ko.observable(MapConfig.text.indicativeMoratoriumCheckboxSubLabel);
    vm.indicativeMoratoriumCheckboxSubLabel2 = ko.observable(MapConfig.text.indicativeMoratoriumCheckboxSubLabel2);

    vm.airQuality = ko.observable(MapConfig.text.airQuality);
    vm.digitalGlobeCheckbox = ko.observable(MapConfig.text.digitalGlobeCheckbox);
    vm.digitalGlobeFootprintsCheckbox = ko.observable(MapConfig.text.digitalGlobeFootprintsCheckbox);
    vm.landsatImageCheckbox = ko.observable(MapConfig.text.landsatImageCheckbox);
    vm.landsatImageSubLabel = ko.observable(MapConfig.text.landsatImageSubLabel);
    vm.twitterConversationsCheckbox = ko.observable(MapConfig.text.twitterConversationsCheckbox);
    vm.fireStoriesCheckbox = ko.observable(MapConfig.text.fireStoriesCheckbox);
    vm.transparencySliderLabel = ko.observable(MapConfig.text.transparencySliderLabel);
    vm.alertErrorMessages = ko.observableArray([]);
    vm.showAlertErrorMessages = ko.observable(false);
    vm.smartRendererName = ko.observable("Choose one");
    vm.customFeatureName = ko.observable("Drawn/Uploaded Feature");
    vm.customFeaturesArray = ko.observableArray([]);
    vm.getReportLink = ko.observable(MapConfig.text.getReportLink);
    vm.getDates = ko.observable(MapConfig.text.getDates);
    vm.windyLayerCheckbox = ko.observable(MapConfig.text.windyLayerCheckbox);
    vm.windySubLabelAdvice = ko.observable(MapConfig.text.windySubLabelAdvice);
    vm.windySubLabel = ko.observable(MapConfig.text.windySubLabel);
    vm.provincesCheckbox = ko.observable(MapConfig.text.provincesCheckbox);
    vm.districtsCheckbox = ko.observable(MapConfig.text.districtsCheckbox);
    vm.subDistrictsCheckbox = ko.observable(MapConfig.text.subDistrictsCheckbox);
    vm.digitalGlobeSubLabel = ko.observable(MapConfig.text.digitalGlobeSubLabel);
    vm.digitalGlobeFootprintsSubLabel = ko.observable(MapConfig.text.digitalGlobeFootprintsSubLabel);
    vm.villagesCheckbox = ko.observable(MapConfig.text.villagesCheckbox);
    vm.pf2000Radio = ko.observable(MapConfig.text.pf2000Radio);
    vm.pf2005Radio = ko.observable(MapConfig.text.pf2005Radio);
    vm.pf2010Radio = ko.observable(MapConfig.text.pf2010Radio);
    vm.pf2012Radio = ko.observable(MapConfig.text.pf2012Radio);
    vm.imageIconPath = ko.observable(MapConfig.text.imageSourcePath);
    vm.timeOfDay = ko.observable("00");
    vm.wind00Radio = ko.observable("00");
    vm.wind06Radio = ko.observable("06");
    vm.wind12Radio = ko.observable("12");
    vm.wind18Radio = ko.observable("18");

    vm.wind00Enable = ko.observable();
    vm.wind06Enable = ko.observable();
    vm.wind12Enable = ko.observable();
    vm.wind18Enable = ko.observable();
    vm.windDisabledDates = ["2015-01-15"];

    vm.customFeaturesPresence = ko.observable(false);

    vm.currentFireTime = ko.observable("firesWeek");

    vm.triggerFireLayerInfo = function(model,event) {
        var htmlToFetch = event.currentTarget.id;
        htmlToFetch = htmlToFetch.split("-icon")[0];
        require(["dojo/text!views/data/templates/dataFires.htm"], function(content) {

            var fireInfo = $(content).find("#" + htmlToFetch).parent();
            if (fireInfo.length === 0) {
                return;
            }

            var title;
            if (htmlToFetch === "dataForestChange-1") {
                title = "NASA ACTIVE FIRES";
            } else if (htmlToFetch === "dataForestChange-3") {
                title = "NOAA-18 FIRES";
            } else if (htmlToFetch === "dataForestChange-2") {
                title = "BURN SCARS";
            }

            var childInfo = fireInfo.find(".ac-auto");

            if (registry.byId("fireLayerInfoDialog")) {
                registry.byId("fireLayerInfoDialog").destroy();
            }
            var dialog = new Dialog({
                title: title,
                style: "width: 600px",
                id: "fireLayerInfoDialog",
                content: childInfo//fireInfo
            });

            dialog.show();

        });
    }

    vm.triggerLandUseLayerInfo = function(model,event) {
        var htmlToFetch = event.currentTarget.id;
        htmlToFetch = htmlToFetch.split("-icon")[0];
        require(["dojo/text!views/data/templates/dataForestUse.htm"], function(content) {

            var fireInfo = $(content).find("#" + htmlToFetch).parent();
            if (fireInfo.length === 0) {
                return;
            }

            var title;
            if (htmlToFetch === "dataLandUse-1") {
                title = "LOGGING";
            } else if (htmlToFetch === "dataLandUse-3") {
                title = "OIL PALM";
            } else if (htmlToFetch === "dataLandUse-4") {
                title = "WOOD FIBER PLANTATION";
            } else if (htmlToFetch === "dataLandUse-5") {
                title = "RSPO CONCESSIONS";
            } else if (htmlToFetch === "dataLandUse-6") {
                title = "Indonesia Forest Moratorium";
            }

            var childInfo = fireInfo.find(".ac-auto");

            if (registry.byId("landUseLayerInfoDialog")) {
                registry.byId("landUseLayerInfoDialog").destroy();
            }
            var dialog = new Dialog({
                title: title,
                style: "width: 600px",
                id: "landUseLayerInfoDialog",
                content: childInfo//fireInfo
            });

            dialog.show();

        });
    }

    vm.triggerConservationLayerInfo = function(model,event) {
        var htmlToFetch = event.currentTarget.id;
        htmlToFetch = htmlToFetch.split("-icon")[0];
        require(["dojo/text!views/data/templates/dataConservation.htm"], function(content) {

            var fireInfo = $(content).find("#" + htmlToFetch).parent();
            if (fireInfo.length === 0) {
                return;
            }

            var childInfo = fireInfo.find(".ac-auto");

            if (registry.byId("conservationLayerInfoDialog")) {
                registry.byId("conservationLayerInfoDialog").destroy();
            }
            var dialog = new Dialog({
                title: "PROTECTED AREAS",
                style: "width: 600px",
                id: "conservationLayerInfoDialog",
                content: childInfo//fireInfo
            });

            dialog.show();

        });
    }

    vm.triggerLandCoverLayerInfo = function(model,event) {
        var htmlToFetch = event.currentTarget.id;
        htmlToFetch = htmlToFetch.split("-icon")[0];
        require(["dojo/text!views/data/templates/dataLandCover.htm"], function(content) {

            var fireInfo = $(content).find("#" + htmlToFetch).parent();
            if (fireInfo.length === 0) {
                return;
            }

            var title;
            if (htmlToFetch === "dataForestAndLandCover-1") {
                title = "<label for='dataForestAndLandCover-1' class='source_title'><span class='metadataTitle'>Tree Cover Density</span><em class='source_description'>(year 2000, 30m global, Hansen/UMD/Google/USGS/NASA)</em></label>";
            } else if (htmlToFetch === "dataForestAndLandCover-8") {
                title = "PRIMARY FORESTS";
            } else if (htmlToFetch === "dataForestAndLandCover-3") {
                title = "PEAT LANDS";
            }

            var childInfo = fireInfo.find(".ac-auto");

            if (registry.byId("landCoverLayerInfoDialog")) {
                registry.byId("landCoverLayerInfoDialog").destroy();
            }
            var dialog = new Dialog({
                title: title,
                style: "width: 600px",
                id: "landCoverLayerInfoDialog",
                content: childInfo//fireInfo
            });

            dialog.show();

        });
    }

    vm.triggerAirQualityLayerInfo = function(model,event) {
        var htmlToFetch = event.currentTarget.id;
        htmlToFetch = htmlToFetch.split("-icon")[0];
        require(["dojo/text!views/data/templates/dataAirQuality.htm"], function(content) {

            var fireInfo = $(content).find("#" + htmlToFetch).parent();
            if (fireInfo.length === 0) {
                return;
            }

            var title;
            if (htmlToFetch === "dataSuitability-1") {
                title = "AIR QUALITY";
            } else if (htmlToFetch === "dataSuitability-2") {
                title = "WIND DIRECTION";
            }

            var childInfo = fireInfo.find(".ac-auto");

            if (registry.byId("airQualityLayerInfoDialog")) {
                registry.byId("airQualityLayerInfoDialog").destroy();
            }
            var dialog = new Dialog({
                title: title,
                style: "width: 600px",
                id: "airQualityLayerInfoDialog",
                content: childInfo//fireInfo
            });

            dialog.show();

        });
    }

    vm.triggerImageryLayerInfo = function(model,event) {
        var htmlToFetch = event.currentTarget.id;
        htmlToFetch = htmlToFetch.split("-icon")[0];

        require(["dojo/text!views/data/templates/dataImagery.htm"], function(content) {

            var fireInfo = $(content).find("#" + htmlToFetch).parent();
            if (fireInfo.length === 0) {
                return;
            }

            var title;
            if (htmlToFetch === "dataPolicy-1") {
                title = "DIGITAL GLOBE – FIRST LOOK IMAGERY";
            } else if (htmlToFetch === "dataPolicy-2") {
                title = "LANDSAT 8 PAN-SHARPENED";
            }

            var childInfo = fireInfo.find(".ac-auto");

            if (registry.byId("imageryLayerInfoDialog")) {
                registry.byId("imageryLayerInfoDialog").destroy();
            }
            var dialog = new Dialog({
                title: title,
                style: "width: 600px",
                id: "imageryLayerInfoDialog",
                content: childInfo//fireInfo
            });

            dialog.show();

        });
    }


    vm.clearCustomFeatures = function() {
        require(["views/map/MapController"], function(MapController) {
            MapController.removeCustomFeatures();
        });
    }

    vm.wind00Disable = function() {
        var now = new Date();
        var now3 = new Date();
        var currentHours = now.getHours();
        var nowRefined = moment(now);
        now = nowRefined.tz('Atlantic/Cape_Verde').format('ha z');

        if (now.indexOf("am") != -1) {
            var dataUpdateTime = now.split("am");
            dataUpdateTime = dataUpdateTime[0];
        } else {
            var dataUpdateTime = now.split("pm");
            dataUpdateTime = dataUpdateTime[0];
            dataUpdateTime = parseInt(dataUpdateTime) + 12;
        }

        if (dataUpdateTime < 0) {
            vm.wind00Enable(false);
            $("#wind00 > label").css("color", "grey");
            return true;
        } else {
            vm.wind00Enable(true);
            return false;
        }
    }
    vm.wind06Disable = function() {
        var now = new Date();
        var now3 = new Date();
        var currentHours = now.getHours();
        var nowRefined = moment(now);
        now = nowRefined.tz('Atlantic/Cape_Verde').format('ha z');

        if (now.indexOf("am") != -1) {
            var dataUpdateTime = now.split("am");
            dataUpdateTime = dataUpdateTime[0];
        } else {
            var dataUpdateTime = now.split("pm");
            dataUpdateTime = dataUpdateTime[0];
            dataUpdateTime = parseInt(dataUpdateTime) + 12;
        }

        if (dataUpdateTime < 6) {
            vm.wind06Enable(false);
            $("#wind06 > label").css("color", "grey");
            return true;
        } else {
            vm.wind06Enable(true);
            return false;
        }
    }
    vm.wind12Disable = function() {
        var now = new Date();
        var nowRefined = moment(now);
        now = nowRefined.tz('Atlantic/Cape_Verde').format('ha z');
        if (now.indexOf("am") != -1) {
            var dataUpdateTime = now.split("am");
            dataUpdateTime = dataUpdateTime[0];
        } else {
            var dataUpdateTime = now.split("pm");
            dataUpdateTime = dataUpdateTime[0];
            dataUpdateTime = parseInt(dataUpdateTime) + 12;
        }

        if (dataUpdateTime < 12) {
            vm.wind12Enable(false);
            $("#wind12 > label").css("color", "grey");
            return true;
        } else {
            vm.wind12Enable(true);
            return false;
        }
    }
    vm.wind18Disable = function() {
        var now = new Date();
        var nowRefined = moment(now);
        // var newDayCheck = nowRefined.tz('Asia/Tokyo');
        // if (newDayCheck._d.getDay() != newDayCheck._i.getDay()) {
        //     console.log("day is different, this button must be enabled")
        // }
        now = nowRefined.tz('Atlantic/Cape_Verde').format('ha z');
        if (now.indexOf("am") != -1) {
            var dataUpdateTime = now.split("am");
            dataUpdateTime = dataUpdateTime[0];
        } else {
            var dataUpdateTime = now.split("pm");
            dataUpdateTime = dataUpdateTime[0];
            dataUpdateTime = parseInt(dataUpdateTime) + 12;
        }
        if (dataUpdateTime < 18) {
            vm.wind18Enable(false);
            $("#wind18 > label").css("color", "grey");
            return true;
        } else {
            vm.wind18Enable(true);
            return false;
        }
    }

    vm.months = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    vm.reportAOIs = ko.observableArray([]);
    vm.selectedAOIs = ko.observableArray([]);
    vm.reportText = ko.observable(MapConfig.text.reportOptions);
    vm.reportTextImagery = ko.observable(MapConfig.text.digitalGlobeWindowText);

    var today = new Date();
    var days = today.getDate();
    var months = today.getMonth() + 1;
    var years = today.getFullYear();
    var date = months + "/" + days + "/" + years;

    var oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7));
    var days2 = oneWeekAgo.getDate();
    var months2 = oneWeekAgo.getMonth() + 1;
    var years2 = oneWeekAgo.getFullYear();
    var date2 = months2 + "/" + days2 + "/" + years2;


    vm.firesPickerFrom = function() {
        var newDate = jQuery('#firesDateFrom').datepicker({
            minDate: (new Date(2013, 1 - 1, 1)),
            //minDate: "+0M -7D",
            maxDate: "+0M +0D",
            onSelect: function(selectedDate) {
                console.log(selectedDate);
                vm.firesObservFrom(selectedDate);
                $("#firesDateTo").datepicker("option", "minDate", selectedDate);
                return selectedDate;
            }
        });
        var oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7));
        var days2 = oneWeekAgo.getDate();
        var months2 = oneWeekAgo.getMonth() + 1;
        var years2 = oneWeekAgo.getFullYear();
        var date2 = months2 + "/" + days2 + "/" + years2;
        return date2;
    }
    vm.firesPickerTo = function() {
        var newDate = jQuery('#firesDateTo').datepicker({
            minDate: (new Date(2013, 1 - 1, 1)),
            maxDate: "+0M +0D",
            onSelect: function(selectedDate) {
                vm.firesObservTo(selectedDate);
                $("#firesDateFrom").datepicker("option", "maxDate", selectedDate);
                return selectedDate;
            }
        });
        var today = new Date();
        var days = today.getDate();
        var months = today.getMonth() + 1;
        var years = today.getFullYear();
        var date = months + "/" + days + "/" + years;
        return date;
    }
    vm.windPicker = function() {
        var newDate = jQuery('#windDate').datepicker({
            minDate: (new Date(2014, 10 - 1, 19)),
            maxDate: "+0M +0D",
            beforeShowDay: function(date) {
                var string = jQuery.datepicker.formatDate('yy-mm-dd', date);
                var blackedOutDates = ["2015-03-31", "2015-04-01", "2015-04-02", "2015-04-03", "2015-04-04", "2015-04-05", "2015-04-06", "2015-04-07", "2015-04-08", "2015-04-09", "2015-04-10", "2015-04-11", "2015-04-12", "2015-04-13", "2015-04-14", "2015-04-15", "2015-04-16", "2015-05-06", "2015-05-07"];

                if (blackedOutDates.indexOf(string) > -1) {
                    return false;
                }

                return [vm.windDisabledDates.indexOf(string) == -1]
            },
            onSelect: function(selectedDate) {
                $("#wind06 > label").css("color", "black");
                $("#wind12 > label").css("color", "black");
                $("#wind18 > label").css("color", "black");
                var selectedDate2 = Date.parse(selectedDate);

                var today = new Date();
                today.setHours(0, 0, 0, 0);
                if (today.getTime() > selectedDate2) {
                    vm.wind00Enable(true);
                    vm.wind06Enable(true);
                    vm.wind12Enable(true);
                    vm.wind18Enable(true);
                } else {
                    vm.timeOfDay("00");
                    vm.wind06Disable();
                    vm.wind12Disable();
                    vm.wind18Disable();
                }

                if (selectedDate == "01/14/2015") {
                    vm.timeOfDay("00");
                    vm.wind18Enable(false);
                }
                if (selectedDate == "01/16/2015") {
                    vm.timeOfDay("18");
                    vm.wind00Enable(false);
                    vm.wind06Enable(false);
                    vm.wind12Enable(false);
                }
                if (selectedDate == "03/30/2015") {
                    vm.timeOfDay("00");
                    vm.wind12Enable(false);
                    vm.wind18Enable(false);
                }
                if (selectedDate == "04/17/2015") {
                    vm.timeOfDay("00");
                    vm.wind12Enable(false);
                    vm.wind18Enable(false);
                }
                if (selectedDate == "05/05/2015") {
                    vm.timeOfDay("00");
                    vm.wind06Enable(false);
                    vm.wind12Enable(false);
                    vm.wind18Enable(false);
                }

                if (selectedDate == "05/08/2015") {
                    vm.timeOfDay("12");
                    vm.wind00Enable(false);
                    vm.wind06Enable(false);
                }
                vm.windObserv(selectedDate);
                return selectedDate;
            }
        });
        var today = new Date();
        var days = today.getDate();
        var months = today.getMonth() + 1;
        var years = today.getFullYear();
        var date = months + "/" + days + "/" + years;
        return date;
    }
    vm.airPicker = function() {
        var newDate = jQuery('#airDate').datepicker({
            minDate: (new Date(2015, 9 - 1, 25)),
            maxDate: "+0M +0D",
            // beforeShowDay: function(date) {
            //     var string = jQuery.datepicker.formatDate('yy-mm-dd', date);
            //     var blackedOutDates = ["2015-04-13", "2015-04-14", "2015-04-15", "2015-04-16", "2015-04-17", "2015-04-18", "2015-04-19", "2015-04-20", "2015-04-21", "2015-04-22", "2015-04-23", "2015-04-24", "2015-04-25", "2015-04-26", "2015-04-27", "2015-04-28", "2015-04-29", "2015-04-30", "2015-05-01", "2015-05-02", "2015-05-03", "2015-05-04", "2015-05-05", "2015-05-06", "2015-05-07", "2015-05-08", "2015-05-09", "2015-05-10", "2015-05-11", "2015-05-12", "2015-05-13", "2015-05-14", "2015-05-15", "2015-05-16", "2015-05-17", "2015-05-18", "2015-05-19", "2015-05-20", "2015-05-21", "2015-05-22", "2015-05-23", "2015-05-24", "2015-05-25", "2015-05-26", "2015-05-27", "2015-05-28", "2015-05-29", "2015-05-30", "2015-05-31", "2015-06-01", "2015-06-02", "2015-06-03"];
            //
            //     return [blackedOutDates.indexOf(string) == -1]
            // },
            onSelect: function(selectedDate) {
                vm.airObserv(selectedDate);
                return selectedDate;
            }
        });
        var today = new Date();
        var days = today.getDate();
        var months = today.getMonth() + 1;
        var years = today.getFullYear();
        var date = months + "/" + days + "/" + years;
        return date;
    }
    vm.noaaPickerFrom = function() {
        var newDate = jQuery('#noaaDateFrom').datepicker({
            date: (new Date(2014, 10 - 1, 22)),
            minDate: (new Date(2014, 10 - 1, 22)),
            maxDate: "+0M +0D",
            onSelect: function(selectedDate) {
                vm.noaaObservFrom(selectedDate);
                $("#noaaDateTo").datepicker("option", "minDate", selectedDate);
                return selectedDate;
            }
        });
    }
    vm.noaaPickerTo = function() {
        var newDate = jQuery('#noaaDateTo').datepicker({
            minDate: (new Date(2014, 10 - 1, 22)),
            maxDate: "+0M +0D",
            onSelect: function(selectedDate) {
                vm.noaaObservTo(selectedDate);
                $("#noaaDateFrom").datepicker("option", "maxDate", selectedDate);
                return selectedDate;
            }
        });
        var today = new Date();
        var days = today.getDate();
        var months = today.getMonth() + 1;
        var years = today.getFullYear();
        var date = months + "/" + days + "/" + years;
        return date;
    }
    vm.indoPickerFrom = function() {
        var newDate = jQuery('#indoDateFrom').datepicker({
            minDate: (new Date(2013, 1 - 1, 1)),
            maxDate: "+0M -7D",
            onSelect: function(selectedDate) {
                vm.indoObservFrom(selectedDate);
                $("#indoDateTo").datepicker("option", "minDate", selectedDate);
                return selectedDate;
            }
        });

    }
    vm.indoPickerTo = function() {
        var newDate = jQuery('#indoDateTo').datepicker({
            minDate: (new Date(2013, 1 - 1, 1)),
            maxDate: "+0M -7D",
            onSelect: function(selectedDate) {
                vm.indoObservTo(selectedDate);
                $("#indoDateFrom").datepicker("option", "maxDate", selectedDate);
                return selectedDate;
            }
        });
        var today = new Date(new Date().setDate(new Date().getDate() - 7));
        var days = today.getDate();
        var months = today.getMonth() + 1;
        var years = today.getFullYear();
        var date = months + "/" + days + "/" + years;
        return date;
    }

    vm.smartOptions = ko.observableArray([
        'Choose one',
        'Heat map',
        'Proportional symbols',
        'Hex bin',
    ]);

    vm.firesObservFrom = ko.observable(date2);
    vm.firesObservTo = ko.observable(date);
    vm.windObserv = ko.observable(date);
    vm.airObserv = ko.observable(date);
    vm.noaaObservFrom = ko.observable("10/12/2014");
    vm.noaaObservTo = ko.observable(date);
    vm.indoObservFrom = ko.observable("1/1/2013");
    vm.indoObservTo = ko.observable(date2);

    vm.islands = ko.observableArray([]);
    vm.provinces = ko.observableArray([]);
    vm.uploadInstructions = ko.observableArray(MapConfig.uploadOptions.instructions);
    vm.drawInstructions = ko.observableArray(MapConfig.text.drawInstructions);

    vm.showBasemapGallery = ko.observable(false);
    vm.showShareContainer = ko.observable(false);
    vm.showReportOptions = ko.observable(false);
    vm.showAlertContainer = ko.observable(false);
    vm.showReportOptionsNOAA = ko.observable(false);
    vm.showActiveFiresButtons = ko.observable(false);
    vm.showReportOptionsINDO = ko.observable(false);
    vm.showReportOptionsWIND = ko.observable(false);
    vm.showReportOptionsAIR = ko.observable(false);
    vm.showUploadTools = ko.observable(false);
    vm.showDrawTools = ko.observable(false);
    vm.showReportOptionsDigitalGlobe = ko.observable(false);

    vm.showReportOptionsDigitalGlobeFootprints = ko.observable(true);

    vm.digitalGlobeInView = ko.observableArray();
    vm.sortedImageryArray = [];

    vm.showLocatorWidgets = ko.observable(false);

    vm.toggleMapPane = ko.observable(true);


    vm.showPrimaryForestOptions = ko.observable(false);
    vm.showWindLayerOptions = ko.observable(true);

    vm.showWindLegend = ko.observable(false);
    vm.showLatLongInputs = ko.observable(false);
    vm.showDMSInputs = ko.observable(true);
    vm.showClearPinsOption = ko.observable(false);
    vm.currentLatitude = ko.observable(0);
    vm.currentLongitude = ko.observable(0);
    vm.DigitalGlobeExtents = ko.observable([]);
    vm.dgMoments = ko.observable([]);
    vm.valuenodes = ko.observable();
    vm.selectedImageryID = ko.observable();

    vm.closeReportOptions = function() {
        vm.showReportOptions(false);
        require(["views/map/MapController"], function(MapController) {
            MapController.removeAnalysisFromHash();
        });
    };

    vm.closeAlertsOptions = function() {

        vm.showAlertContainer(false);

    };



    vm.closeReportOptionsNOAA = function() {
        vm.showReportOptionsNOAA(false);
    };

    vm.closeReportOptionsINDO = function() {
        vm.showReportOptionsINDO(false);
    };

    vm.closeReportOptionsWIND = function() {
        vm.showReportOptionsWIND(false);
    };

    vm.closeReportOptionsAIR = function() {
        vm.showReportOptionsAIR(false);
    };

    vm.closeReportOptionsDigitalGlobe = function() {
        vm.showReportOptionsDigitalGlobe(false);
    };

    vm.closeOptionsNASA = function() {
        vm.showActiveFiresButtons(false);
    };

    vm.imageryMouseOver = function(data, event) {
        require(["views/map/MapController"], function(MapController) {
            MapController.handleImageryOver(data, event);
        });
    };

    vm.imageryMouseOut = function(data, event) {

        $("#smartHiddenMenu").addClass("hidden");
        require(["views/map/MapController"], function(MapController) {
            MapController.handleImageryOut(data, event);
        });
    };


    vm.chooseSmartDropdown = function(data, event) {

        // if (vm.smartRendererName() == "Choose one") {

        //     //here I need to also turn off data!!

        //     return;
        // }
        var smartCheckbox = $("#activate-smart-checkbox");
        if (smartCheckbox[0].checked == false) {
            return;
        }

        require(["views/map/MapController"], function(MapController) {
            MapController.setSmartRenderer(vm.smartRendererName());
        });

    };

    vm.imageryZoomTo = function(data, event) {
        require(["views/map/MapController"], function(MapController) {
            MapController.imageryZoom(data, event);
        });
    };

    vm.digitalGlobeToggle = function(data, event) {
        console.log("CLICK");

        require(["views/map/MapController"], function(MapController) {
            MapController.showDigitalGlobe(data, event);
        });
    }

    vm.slidePanel = function(data) {

        var data2 = vm.toggleMapPane();

        require(["views/map/MapController"], function(MapController) {
            MapController.resizeMapPanel(data2);
        });

    };

    vm.selectImageryMinimize = function() {
        if ($("#imageryWindow > table").css("display") == "table") {
            $("#imageryWindow > table").css("display", "none");
            $("#report-optionsDigitalGlobe").css("border-bottom", "none");
        } else {
            $("#imageryWindow > table").css("display", "table");
            $("#report-optionsDigitalGlobe").css("border-bottom", "2px solid black");
        }
    };

    o.applyBindings = function(domId) {
        ko.applyBindings(vm, dom.byId(domId));
    };

    o.get = function(item) {
        return item === 'model' ? o.vm : o.vm[item]();
    };

    o.set = function(key, value) {
        o.vm[key](value);
    };

    return o;

});
