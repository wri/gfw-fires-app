/* global define, alert */
define([

    "esri/config",
    "main/Config"
    // Call Necessary Layout Widgets Here

], function(esriConfig, MainConfig) {

    var map;

    var o = {};


    o.init = function() {




        //enable cors servers
        esriConfig.defaults.io.corsEnabledServers.push("www.wri.org");
        esriConfig.defaults.io.corsEnabledServers.push(MainConfig.emailSubscribeUrl);

        // esriConfig.defaults.io.proxyUrl = "http://www.wri.org/";

        // esri.config.defaults.io.corsEnabledServers.push("servername");

        // setup proxy url


        require(["modules/ErrorController", "modules/HashController", "dojo/parser",
                "dijit/layout/StackContainer",
                "dijit/layout/ContentPane"
            ],

            function(ErrorController, HashController, parser) {

                if (parser.parse) {
                    parser.parse().then(function() {

                        HashController.init();

                        ErrorController.init();

                    });
                }



                //ErrorController.show(5); /*time in seconds*/
                //BlockController.show("aboutView");
                //BlockController.hide("aboutView");

            });


    };



    return o;

});