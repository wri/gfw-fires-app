define(["knockout", "main/Config", "dojo/dom", "dojo/_base/array", "dojo/topic"],
    function(ko, Config, dom, arrayUtil, topic) {

        var o = {};

        o.vm = {};

        var vm = o.vm;

        vm.headerTitle = ko.observable(Config.headerTitle);

        vm.htmlContent = ko.observable("Loading....");
        vm.leftLinks = ko.observableArray(Config.storyLinks);

        vm.linkClick = function(obj, evt) {
            topic.publish("toggleStoryNavList", obj)
        }

        var htmlToFetch;
        arrayUtil.some(vm.leftLinks(), function(linkItem) {
            if (linkItem.selected) {
                htmlToFetch = linkItem.htmlContent;
                require(["dojo/text!views/story/templates/" + htmlToFetch + ".htm"], function(content) {
                    vm.htmlContent(content);
                });
            }
            return linkItem.selected;
        });

        o.getVM = function() {
            return vm;
        }


        o.applyBindings = function(domId) {
            ko.applyBindings(vm, dom.byId(domId));
        }


        return o;

    })