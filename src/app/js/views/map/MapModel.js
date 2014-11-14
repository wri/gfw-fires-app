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
    vm.indonesiaFiresCheckbox = ko.observable(MapConfig.text.indonesiaFiresCheckbox);
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
    vm.villagesCheckbox = ko.observable(MapConfig.text.villagesCheckbox);
    vm.pf2000Radio = ko.observable(MapConfig.text.pf2000Radio);
    vm.pf2005Radio = ko.observable(MapConfig.text.pf2005Radio);
    vm.pf2010Radio = ko.observable(MapConfig.text.pf2010Radio);
    vm.pf2012Radio = ko.observable(MapConfig.text.pf2012Radio);
    vm.wind00Radio = ko.observable("00");
    vm.wind06Radio = ko.observable("06");
    vm.wind12Radio = ko.observable("12");
    vm.wind18Radio = ko.observable("18");

    vm.months = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    vm.reportAOIs = ko.observableArray([]);
    vm.selectedAOIs = ko.observableArray([]);
    vm.reportText = ko.observable(MapConfig.text.reportOptions);

    vm.dateControl = function() {
        var dateValueObject = ko.observable({
            fYear: ko.observable(''),
            fMonth: ko.observable(1),
            fDay: ko.observable(''),
            tYear: ko.observable(''),
            tMonth: ko.observable(2),
            tDay: ko.observable('')

        })

        var monthComputed = function(compareYear, startMonth) {
            return ko.computed(function() {

                var curDate = new Date();
                var lastMonth = (compareYear() === curDate.getFullYear()) ? curDate.getMonth() + 1 : 12;
                var firstMonth = startMonth ? startMonth() : 1;
                var months = [];
                if (dateValueObject().tYear() == dateValueObject().fYear()) {
                    for (var i = firstMonth; i <= lastMonth; i++) {
                        months.push(i);
                    }
                } else {
                    for (var i = 1; i <= lastMonth; i++) {
                        months.push(i);
                    }
                }

                return months;
            });
        };

        var dayComputed = function(compareYear, compareMonth, startYear, startMonth, startDay) {
            return ko.computed(function() {
                var firstDay;
                var today = new Date();
                var isLeap = new Date(compareYear(), 1, 29).getMonth() == 1
                var days = [];
                var lastDay = ((compareYear() === today.getFullYear()) && compareMonth() === (today.getMonth() + 1)) ? today.getUTCDate() : vm.months[compareMonth()];
                if (startDay) {
                    if (startYear() == compareYear() && startMonth() == compareMonth()) {
                        firstDay = startDay();
                    } else {
                        firstDay = 1;
                    }
                } else {
                    firstDay = 1;
                }

                for (var i = firstDay; i <= lastDay; i++) {
                    days.push(i);
                }
                if (compareMonth == 2 && isLeap) {
                    days.push(29);
                }

                return days;
            });
        };
        return {
            toDay: dayComputed(dateValueObject().tYear, dateValueObject().tMonth, dateValueObject().fYear, dateValueObject().fMonth, dateValueObject().fDay),
            fromDay: dayComputed(dateValueObject().fYear, dateValueObject().fMonth),
            fromMonth: monthComputed(dateValueObject().fYear),
            toMonth: monthComputed(dateValueObject().tYear, dateValueObject().fMonth),

            fromYear: ko.observableArray([]),
            toYear: ko.computed(function() {
                var fYear = dateValueObject().fYear(),
                    curYear = new Date().getFullYear();
                var years = [];
                for (var i = fYear; i <= curYear; i += 1) {
                    years.push(i);
                }
                return years;
            }),

            dateVals: dateValueObject,
            yearLabel: 'YYYY',
            monthLabel: 'MM',
            dayLabel: 'DD',
            toLabel: 'To:',
            fromLabel: 'From:'
        }
    }

    vm.reportDateControl = vm.dateControl();
    //vm.noaaDateControl = vm.dateControl(10, 12);
    //vm.indoDateControl = vm.dateControl();


    vm.windPicker = function() {
        var newDate = jQuery('#windDate').datepicker({
            minDate: (new Date(2014, 11 - 1, 14)),
            maxDate: "+0M +0D",
            //defaultDate: "11/10/14",
            onSelect: function(selectedDate) {
                //console.log(datepicker.currentText);
                //update windObserv
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
            date: (new Date(2014, 10 - 1, 12)),
            minDate: (new Date(2014, 10 - 1, 12)),
            maxDate: "+0M +0D",
            //defaultDate: "11/10/14",
            onSelect: function(selectedDate) {
                //console.log(datepicker.currentText);
                //update windObserv
                vm.noaaObservFrom(selectedDate);
                return selectedDate;
            }
        });

    }
    vm.noaaPickerTo = function() {
        var newDate = jQuery('#noaaDateTo').datepicker({
            minDate: (new Date(2014, 10 - 1, 12)),
            maxDate: "+0M +0D",
            //defaultDate: "11/10/14",
            onSelect: function(selectedDate) {
                //console.log(datepicker.currentText);
                //update windObserv
                vm.noaaObservTo(selectedDate);
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
            //date: (new Date(2014, 10 - 1, 12)),
            minDate: (new Date(2013, 1 - 1, 1)),
            maxDate: "+0M +0D",
            //defaultDate: "11/10/14",
            onSelect: function(selectedDate) {
                //console.log(datepicker.currentText);
                //update windObserv
                vm.indoObservFrom(selectedDate);
                return selectedDate;
            }
        });

    }
    vm.indoPickerTo = function() {
        var newDate = jQuery('#indoDateTo').datepicker({
            minDate: (new Date(2013, 1 - 1, 1)),
            maxDate: "+0M -7D",
            //defaultDate: "11/10/14",
            onSelect: function(selectedDate) {
                //console.log(datepicker.currentText);
                //update windObserv
                vm.indoObservTo(selectedDate);
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



    var today = new Date();
    var days = today.getDate();
    var months = today.getMonth() + 1;
    var years = today.getFullYear();
    var date = months + "/" + days + "/" + years;

    vm.windObserv = ko.observable(date);
    vm.noaaObservFrom = ko.observable("10/12/2014");
    vm.noaaObservTo = ko.observable(date);
    vm.indoObservFrom = ko.observable("1/1/2013");
    vm.indoObservTo = ko.observable();



    vm.islands = ko.observableArray([]);
    vm.provinces = ko.observableArray([]);

    vm.showBasemapGallery = ko.observable(false);
    vm.showShareContainer = ko.observable(false);
    vm.showReportOptions = ko.observable(false);
    vm.showReportOptionsNOAA = ko.observable(false);
    vm.showReportOptionsINDO = ko.observable(false);
    vm.showReportOptionsWIND = ko.observable(false);
    vm.showLocatorWidgets = ko.observable(false);

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