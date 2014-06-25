define(["knockout", "main/Config", "dojo/dom", "dojo/_base/array", "dojo/topic", "dojo/_base/array"],
    function(ko, Config, dom, arrayUtil, topic, arrayUtil) {

        var o = {};

        o.vm = {};

        var vm = o.vm;

        vm.headerTitle = ko.observable(Config.headerTitle);
        vm.htmlContent = ko.observable("Loading....");
        vm.leftLinks = ko.observableArray(Config.dataLinks);

        vm.linkClick = function(obj, evt) {
            topic.publish("toggleNavList", obj)
        }
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
        }

        o.getVM = function() {
            return vm;
        }


        return o;

    })