define(["dojo/dom", "dijit/registry", "modules/HashController", "modules/EventsController", "views/about/AboutModel", "dojo/_base/array"],
    function(dom, registry, HashController, EventsController, AboutModel, arrayUtil) {

        var o = {};
        var initialized = false;
        var viewName = "aboutView";
        var viewObj = {
            viewName: viewName
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

                dom.byId(viewName).innerHTML = html;


                EventsController.switchToView(viewObj);
                AboutModel.applyBindings(viewName);
            })
        }

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
            })

            aboutmodel.leftLinks(leftLinks);

            require(["dojo/text!views/about/templates/" + htmlToFetch + ".htm"], function(content) {
                aboutmodel.htmlContent(content);
            });

        }



        //listen to key

        //trigger event 



        return o;


    });