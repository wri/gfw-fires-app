define(["knockout", "main/Config", "dojo/dom", "dojo/_base/array", "dojo/topic"],
    function(ko, Config, dom, arrayUtil, topic) {

        var o = {};

        o.vm = {};

        var vm = o.vm;

        vm.headerTitle = ko.observable(Config.headerTitle);
        vm.htmlContent = ko.observable("Loading....");
        vm.leftLinks = ko.observableArray(Config.dataLinks);
        vm.dataHeaderDescription = ko.observable(Config.dataHeaderDescription);

        vm.linkClick = function(obj, evt) {
            topic.publish("toggleDataNavList", obj);
        };
        var htmlToFetch;
        arrayUtil.some(vm.leftLinks(), function(linkItem) {
            if (linkItem.selected) {
                htmlToFetch = linkItem.htmlContent;
                require(["dojo/text!views/data/templates/" + htmlToFetch + ".htm"], function(content) {
                    vm.htmlContent(content);
                });
            }
            return linkItem.selected;
        });

        o.applyBindings = function(domId) {
            ko.applyBindings(vm, dom.byId(domId));
        };

        o.getVM = function() {
            return vm;
        };


        return o;

    });