define(["dojo/dom", "dijit/registry", "modules/HashController", "modules/EventsController", "views/footer/FooterModel", "dojo/_base/array"],
    function(dom, registry, HashController, EventsController, FooterModel, arrayUtil) {

        var o = {};
        var initialized = false;
        var viewName = "app-footer";

        o.init = function() {
            var that = this;
            if (initialized) {
                //switch to this view
                //HashController.switchToView(viewName);

                return;
            }

            initialized = true;
            //otherwise load the view
            require(["dojo/text!views/footer/footer.html", "views/footer/FooterModel"], function(html, FooterModel) {

                dom.byId(viewName).innerHTML = html;

                FooterModel.applyBindings(viewName);



            });
        };

        o.footerSelect = function(data) {

            console.log(data);
            var selectedItem = data;

            console.log(EventsController);
            EventsController[selectedItem.eventName]();

            //alert(selectedItem.event);

        }


        return o;


    });