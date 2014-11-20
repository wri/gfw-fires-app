define(["dojo/dom", "dijit/registry", "modules/HashController", "modules/EventsController", "views/story/StoryModel", "dojo/_base/array"],
    function(dom, registry, HashController, EventsController, StoryModel, arrayUtil) {

        var o = {};
        var initialized = false;
        var viewId = "storyView";
        var viewObj = {
            viewId: viewId,
            viewName: "story"
        }
        o.init = function() {
            var that = this;
            if (initialized) {
                //switch to this view
                EventsController.switchToView(viewObj);

                return;
            }

            initialized = true;
            //otherwise load the view
            require(["dojo/text!views/story/story.html"], function(html) {

                dom.byId(viewId).innerHTML = html;


                EventsController.switchToView(viewObj);
                StoryModel.applyBindings(viewId);
            })
        };

        o.toggleStoryNavList = function(obj) {
            var htmlToFetch = obj.htmlContent;
            var storymodel = StoryModel.getVM();
            // var vm = Model.getVM();
            var currentLanguage = "en";
            var leftLinks = aboutmodel.leftLinks();
            storymodel.leftLinks([]);
            arrayUtil.forEach(leftLinks, function(ds) {
                if (ds == obj) {
                    ds.selected = true;
                } else {
                    ds.selected = false;
                }
            });

            storymodel.leftLinks(leftLinks);
            //datamodel.leftLinks(leftLinks);
            this.reportAnalyticsHelper('view', 'content', 'The user viewed the ' + this.toTitleCase(obj.name) + ' content on the Data page.');

            require(["dojo/text!views/story/templates/" + htmlToFetch + ".htm"], function(content) {
                storymodel.htmlContent(content);
            });

        };

        o.toTitleCase = function(str) {
            return str.replace(/\w*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        };

        o.reportAnalyticsHelper = function(eventType, action, label) {
            ga('A.send', 'event', eventType, action, label);
            ga('B.send', 'event', eventType, action, label);
        };


        //listen to key

        //trigger event 



        return o;


    });