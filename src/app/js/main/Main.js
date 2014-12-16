/* global define, alert */
define([
    "dojo/on",
    "dojo/dom",
    "dojo/topic",
    "dom-class",
    "dojo/query",
    "dojo/_base/array",
    "esri/config",
    "main/Config",
    // Call Necessary Layout Widgets Here
    "dojox/mobile/parser",
    "dojox/mobile",
    "dojox/mobile/compat",
    "dijit/layout/StackContainer",
    "dijit/layout/ContentPane"
], function(on, dom, topic, domClass, dojoQuery, arrayUtil, esriConfig, MainConfig, parser) {

    var map;

    var o = {};


    o.init = function() {

        parser.parse();

        //enable cors servers
        esriConfig.defaults.io.corsEnabledServers.push("www.wri.org");
        esriConfig.defaults.io.corsEnabledServers.push(MainConfig.emailSubscribeUrl);

        // esriConfig.defaults.io.proxyUrl = "http://www.wri.org/";

        // esri.config.defaults.io.corsEnabledServers.push("servername");

        // setup proxy url


        require(["modules/ErrorController", "modules/HashController"],

            function(ErrorController, HashController) {

                HashController.init();

                ErrorController.init();

                //ErrorController.show(5); /*time in seconds*/
                //BlockController.show("aboutView");
                //BlockController.hide("aboutView");

            });


    };



    return o;

});