define(["knockout", "main/Config", "dojo/dom", "modules/HashController", "modules/EventsController"],
    function(ko, Config, dom, HashController, EventsController) {

        var o = {};

        o.vm = {};

        var vm = o.vm;

        //vm.homeTitle = ko.observable(Config.homeTitle);
        vm.footerModeOptions = ko.observableArray(Config.footerModeOptions);
        vm.districtsAvailableForAlerts = ko.observableArray([]);
        vm.subDistrictsAvailableForAlerts = ko.observableArray([]);

        vm.appState = ko.observable({});

        vm.footerSelect = function(obj) {
            EventsController.footerSelect(obj);
        };

        o.applyBindings = function(domId) {
            ko.applyBindings(vm, dom.byId(domId));
        };

        o.get = function (item) {
            return item === 'model' ? o.vm : o.vm[item]();
        };


        return o;

    });