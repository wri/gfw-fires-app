define(["knockout", "main/Config", "dojo/dom"],
    function(ko, Config, dom) {

        var o = {};

        o.vm = {};

        var vm = o.vm;

        vm.homeTitle = ko.observable(Config.homeTitle);

        o.applyBindings = function(domId) {
            ko.applyBindings(vm, dom.byId(domId));
        }


        return o;

    })