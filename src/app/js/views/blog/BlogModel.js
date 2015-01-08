define(["knockout", "main/Config", "dojo/dom"],
    function(ko, Config, dom) {

        var o = {};

        o.vm = {};


        var vm = o.vm;

        vm.blogPost = ko.observableArray([]);

        vm.homeTitle = ko.observable(Config.homeTitle);

        o.applyBindings = function(domId) {
            ko.applyBindings(vm, dom.byId(domId));
        }

        vm.getAllPost = function () {
            return o.vm.blogPost()[0]['articles'];
        }

        return o;

    })