define(["knockout", "main/Config", "dojo/dom", "modules/EventsController"],
    function(ko, Config, dom, EventsController) {

        var o = {};

        o.vm = {};

        var vm = o.vm;

        vm.headerTitle = ko.observable(Config.headerTitle);
        vm.headerDesc = ko.observable(Config.headerDesc);

        vm.navigationLinks = ko.observableArray(Config.navigationLinks);

        vm.appState = ko.observable({});

        //vm.showFullHeader = ko.observable(false);


        vm.clickNavLink = function(obj, evt) {
            //console.log(obj);
            EventsController.clickNavLink(obj);
        };


        o.applyBindings = function(domId) {
            ko.applyBindings(vm, dom.byId(domId));
        };


        return o;

    });