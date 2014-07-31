define(["dojo/dom", "dijit/registry", "modules/HashController", "modules/EventsController", "views/about/AboutModel", "dojo/_base/array"],
    function(dom, registry, HashController, EventsController, AboutModel, arrayUtil) {

        var o = {};
        var initialized = false;
        var viewId = "aboutView";
        var viewObj = {
            viewId: viewId,
            viewName: "about"
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
            require(["dojo/text!views/about/about.html"], function(html) {

                dom.byId(viewId).innerHTML = html;


                EventsController.switchToView(viewObj);
                AboutModel.applyBindings(viewId);
            })
        };

        o.toggleAboutNavList = function(obj) {
            var htmlToFetch = obj.htmlContent;
            var aboutmodel = AboutModel.getVM();
            // var vm = Model.getVM();
            var currentLanguage = "en";
            var leftLinks = aboutmodel.leftLinks();
            aboutmodel.leftLinks([]);
            arrayUtil.forEach(leftLinks, function(ds) {
                if (ds == obj) {
                    ds.selected = true;
                } else {
                    ds.selected = false;
                }
            });

            aboutmodel.leftLinks(leftLinks);
            datamodel.leftLinks(leftLinks);
            this.reportAnalyticsHelper('view', 'content', 'The user viewed the ' + this.toTitleCase(obj.name) + ' content on the Data page.');

            require(["dojo/text!views/about/templates/" + htmlToFetch + ".htm"], function(content) {
                aboutmodel.htmlContent(content);
            });

        };

        o.toTitleCase = function (str) {
            return str.replace(/\w*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        };

        o.reportAnalyticsHelper = function (eventType, action, label) {
            ga('A.send', 'event', eventType, action, label);
            ga('B.send', 'event', eventType, action, label);
        };


        //listen to key

        //trigger event 



        return o;


    });