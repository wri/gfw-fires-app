/* global define */
define([
    "knockout", 
    "main/Config", 
    "dojo/dom"
], function(ko, Config, dom) {

        var o = {};

        o.vm = {};

        var vm = o.vm;

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