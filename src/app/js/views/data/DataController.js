define(["dojo/dom", "dijit/registry", "modules/HashController", "modules/EventsController", "views/data/DataModel", "dojo/_base/array"],
    function(dom, registry, HashController, EventsController, DataModel, arrayUtil) {

        var o = {};
        var initialized = false;
        var viewId = "dataView";
        var viewObj = {
            viewId: viewId,
            viewName: "data"
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
            require(["dojo/text!views/data/data.html"], function(html) {

                dom.byId(viewId).innerHTML = html;


                EventsController.switchToView(viewObj);


                DataModel.applyBindings(viewId);
            })
        },

        o.toggleDataNavList = function(obj) {
            var htmlToFetch = obj.htmlContent;
            var datamodel = DataModel.getVM();
            // var vm = Model.getVM();
            var currentLanguage = "en";
            var leftLinks = datamodel.leftLinks();
            datamodel.leftLinks([]);
            arrayUtil.forEach(leftLinks, function(ds) {
                if (ds == obj) {
                    ds.selected = true;
                } else {
                    ds.selected = false;
                }
            })

            datamodel.leftLinks(leftLinks);

            require(["dojo/text!views/data/templates/" + htmlToFetch + ".htm"], function(content) {
                datamodel.htmlContent(content);
            });

        }



        //listen to key

        //trigger event 



        return o;


    });