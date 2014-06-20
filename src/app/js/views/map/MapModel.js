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

        vm.showBasemapGallery = ko.observable(false);
        vm.showLocatorWidgets = ko.observable(false);

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