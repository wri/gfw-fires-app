define(["knockout", "main/Config", "dojo/dom", "modules/HashController", "modules/EventsController"],
    function(ko, Config, dom, HashController, EventsController) {

        var o = {};

        o.vm = {};

        var vm = o.vm;

        //vm.homeTitle = ko.observable(Config.homeTitle);
        vm.footerModeOptions = ko.observableArray(Config.footerModeOptions);

        vm.appState = ko.observable({});

        vm.footerSelect = function(obj) {
            EventsController.footerSelect(obj);
        }

        o.applyBindings = function(domId) {
            ko.applyBindings(vm, dom.byId(domId));
        }


        return o;

    })