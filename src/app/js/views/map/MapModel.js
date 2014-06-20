define(["knockout", "main/Config", "dojo/dom"],
    function(ko, Config, dom) {

        var o = {};

        o.vm = {};

        var vm = o.vm;

        vm.headerTitle = ko.observable(Config.headerTitle);

        o.applyBindings = function(domId) {
            ko.applyBindings(vm, dom.byId(domId));
        };


        return o;

    })