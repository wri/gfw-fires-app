define(["knockout", "main/Config", "dojo/dom", "modules/HashController", "modules/EventsController"],
    function(ko, Config, dom, HashController, EventsController) {

        var o = {};

        o.vm = {};

        var vm = o.vm;
        vm.appState = ko.observable({});

        //vm.homeTitle = ko.observable(Config.homeTitle);
        vm.homeModeOptions = ko.observableArray(Config.homeModeOptions);

        vm.modeSelect = function(obj) {
            EventsController.modeSelect(obj);
        };

        vm.dotSelect = function(obj, evt) {
            require(["views/home/HomeController"], function(HomeController) {
                HomeController.handleDotClick(obj);
            });
        }

        o.applyBindings = function(domId) {
            ko.applyBindings(vm, dom.byId(domId));
        };

        

        return o;

    });