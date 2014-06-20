define(["knockout", "main/Config", "dojo/dom"],
    function(ko, Config, dom) {

        var o = {};

        o.vm = {};

        var vm = o.vm;

        vm.headerTitle = ko.observable(Config.headerTitle);
        vm.navigationLinks = ko.observableArray(Config.navigationLinks)

        o.applyBindings = function(domId) {
            ko.applyBindings(vm, dom.byId(domId));
        }


        return o;

    })