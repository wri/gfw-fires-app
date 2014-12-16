/* global define */
define([
    "knockout",
    "main/Config",
    "views/map/MapConfig",
    "dojo/dom"
], function(ko, Config, MapConfig, dom) {

    var o = {};

    o.vm = {};

    var vm = o.vm;

    vm.appState = ko.observable({});

    // Simple Text Labels
    vm.locatorContainerHeader = ko.observable(MapConfig.text.locatorContainerHeader);
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
    vm.burnedScarsCheckbox = ko.observable(MapConfig.text.burnedScarsCheckbox);
    vm.tomnodCheckbox = ko.observable(MapConfig.text.tomnodCheckbox);

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
    vm.airQuality = ko.observable(MapConfig.text.airQuality);
    vm.digitalGlobeCheckbox = ko.observable(MapConfig.text.digitalGlobeCheckbox);
    vm.digitalGlobeFootprintsCheckbox = ko.observable(MapConfig.text.digitalGlobeFootprintsCheckbox);
    vm.landsatImageCheckbox = ko.observable(MapConfig.text.landsatImageCheckbox);
    vm.landsatImageSubLabel = ko.observable(MapConfig.text.landsatImageSubLabel);
    vm.twitterConversationsCheckbox = ko.observable(MapConfig.text.twitterConversationsCheckbox);
    vm.transparencySliderLabel = ko.observable(MapConfig.text.transparencySliderLabel);
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

    vm.wind06Enable = ko.observable();
    vm.wind12Enable = ko.observable();
    vm.wind18Enable = ko.observable();


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
            onSelect: function(selectedDate) {
                $("#wind06 > label").css("color", "black");
                $("#wind12 > label").css("color", "black");
                $("#wind18 > label").css("color", "black");
                var selectedDate2 = Date.parse(selectedDate);
                var today = new Date();
                today.setHours(0, 0, 0, 0);
                if (today.getTime() > selectedDate2) {
                    vm.wind06Enable(true);
                    vm.wind12Enable(true);
                    vm.wind18Enable(true);
                } else {
                    vm.timeOfDay("00");
                    vm.wind06Disable();
                    vm.wind12Disable();
                    vm.wind18Disable();
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

    vm.firesObservFrom = ko.observable(date2);
    vm.firesObservTo = ko.observable(date);
    vm.windObserv = ko.observable(date);
    vm.noaaObservFrom = ko.observable("10/12/2014");
    vm.noaaObservTo = ko.observable(date);
    vm.indoObservFrom = ko.observable("1/1/2013");
    vm.indoObservTo = ko.observable(date2);

    vm.islands = ko.observableArray([]);
    vm.provinces = ko.observableArray([]);

    vm.showBasemapGallery = ko.observable(false);
    vm.showShareContainer = ko.observable(false);
    vm.showReportOptions = ko.observable(false);
    vm.showReportOptionsNOAA = ko.observable(false);
    vm.showActiveFiresButtons = ko.observable(false);
    vm.showReportOptionsINDO = ko.observable(false);
    vm.showReportOptionsWIND = ko.observable(false);
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

    vm.closeReportOptions = function() {
        vm.showReportOptions(false);
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
        require(["views/map/MapController"], function(MapController) {
            MapController.handleImageryOut(data, event);
        });
    };



    vm.slidePanel = function(data) {
        // if (vm.toggleMapPane() == true) {
        //     //$("#map_root").css("width", "+=320px");
        //     $("#control-panel").css("width", "0px");
        //     $(".map-container").css("left", "0px");
        //     vm.toggleMapPane(false);
        // } else {
        //     //$("#map_root").css("width", "-=320px");
        //     $("#control-panel").css("width", "320px");
        //     $(".map-container").css("left", "320px");
        //     vm.toggleMapPane(true);
        // }
        var data2 = vm.toggleMapPane();

        require(["views/map/MapController"], function(MapController) {
            MapController.resizeMapPanel(data2);
        });

    };

    /*ko.bindingHandlers.preventBubble = {
        init: function(element, valueAccessor) {
            var eventName = ko.utils.unwrapObservable(valueAccessor());
            ko.utils.registerEventHandler(element, eventName, function(event) {
                event.cancelBubble = true;
                if (event.stopPropagation) {
                    event.stopPropagation();
                }
            });
        }
    };*/


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