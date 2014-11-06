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

    vm.reportText = ko.observable(MapConfig.text.reportOptions);
    vm.months = [0,31,28,31,30,31,30,31,31,30,31,30,31];
    vm.reportAOIs = ko.observableArray([]);
    vm.selectedAOIs = ko.observableArray([]);
    vm.fromYear = ko.observableArray([]);
    vm.fromMonth = ko.observableArray([]);
    vm.dateVals = ko.observable({
        fYear:ko.observable(''),
        fMonth:ko.observable(1),
        fDay:ko.observable(''),
        tYear:ko.observable(''),
        tMonth:ko.observable(2),
        tDay:ko.observable('')
    })
    vm.fromDay = ko.computed(function(){
            var month = vm.dateVals().fMonth();
            var year = vm.dateVals().fYear();
            var isLeap = new Date(year, 1, 29).getMonth() == 1
            var days = [];
            for (var i = 1;i <= vm.months[month];i++){

                days.push(i);
            }
            if (month==2 && isLeap){
                days.push(29);
            }
            return days;
        });
    vm.toDay = ko.computed(function(){
            var month = vm.dateVals().tMonth();
            var year = vm.dateVals().tYear();
            var isLeap = new Date(year, 1, 29).getMonth() == 1
            var days = [];
            var startDay = 1;
            if(vm.dateVals().fYear() == vm.dateVals().tYear() && vm.dateVals().tMonth() == vm.dateVals().fMonth()){
                startDay = vm.dateVals().fDay();
            }
            for (var i = startDay;i <= vm.months[month];i++){
                days.push(i);
            }
            if (month==2 && isLeap){
                days.push(29);
            }

            return days;
        });

    
    vm.toYear = ko.observableArray([]);
    vm.toMonth = ko.computed(function(){
        var fMonth = vm.dateVals().fMonth();
        var months = [];
        if (vm.dateVals().tYear() == vm.dateVals().fYear()){
            for (var i = fMonth;i <= 12;i++){
                months.push(i);
            }
        } else {
            for (var i = 1;i <= 12;i++){
                months.push(i);
            }
        }
        return months;
    });

    vm.islands = ko.observableArray([]);
    vm.provinces = ko.observableArray([]);

    vm.showBasemapGallery = ko.observable(false);
    vm.showShareContainer = ko.observable(false);
    vm.showReportOptions = ko.observable(false);
    vm.showLocatorWidgets = ko.observable(false);
    vm.showPrimaryForestOptions = ko.observable(false);
    vm.showWindLegend = ko.observable(false);
    vm.showLatLongInputs = ko.observable(false);
    vm.showDMSInputs = ko.observable(true);
    vm.showClearPinsOption = ko.observable(false);
    vm.currentLatitude = ko.observable(0);
    vm.currentLongitude = ko.observable(0);
    vm.DigitalGlobeExtents = ko.observable([]);
    vm.dgMoments = ko.observable([]);
    vm.valuenodes = ko.observable();

    vm.closeReportOptions = function () {
        vm.showReportOptions(false);
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