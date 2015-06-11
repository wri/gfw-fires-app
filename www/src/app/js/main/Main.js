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

        //https://developers.arcgis.com/javascript/jssamples/mapconfig_smoothpan.html
        //configure map animation to be faster
        esriConfig.defaults.map.panDuration = 50; // time in milliseconds, default panDuration: 350
        esriConfig.defaults.map.panRate = 10; // default panRate: 25
        esriConfig.defaults.map.zoomDuration = 100; // default zoomDuration: 500
        esriConfig.defaults.map.zoomRate = 10; // default zoomRate: 25

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