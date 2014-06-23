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

        vm.showBasemapGallery = ko.observable(false);
        vm.showLocatorWidgets = ko.observable(false);
        vm.showLatLongInputs = ko.observable(false);
        vm.showDMSInputs = ko.observable(true);
        vm.showClearPinsOption = ko.observable(false);

        o.applyBindings = function(domId) {
            ko.applyBindings(vm, dom.byId(domId));
        };

        o.get = function (item) {
            return item === 'model' ? o.vm : o.vm[item]();
        };

        o.set = function (key, value) {
            o.vm[key](value);
        };

        return o;

});