define(["dojo/dom", "dijit/registry", "modules/HashController"],
    function(dom, registry, HashController) {

        var o = {};
        var initialized = false;
        var viewName = "homeView";
        o.init = function() {
            var that = this;
            if (initialized) {
                //switch to this view
                HashController.switchToView(viewName);

                return;
            }

            initialized = true;
            //otherwise load the view
            require(["dojo/text!views/home/home.html"], function(html) {

                dom.byId(viewName).innerHTML = html;


                HashController.switchToView(viewName);
            })
        }



        //listen to key

        //trigger event 



        return o;


    });