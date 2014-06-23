/* global define, alert */
define([
    "on",
    "dom",
    "topic",
    "dom-class",
    "dojo/query",
    "dojo/_base/array",
    // Call Necessary Layout Widgets Here
    "dojox/mobile/parser",
    "dijit/layout/StackContainer",
    "dijit/layout/ContentPane"
], function(on, dom, topic, domClass, dojoQuery, arrayUtil, parser) {

    var map;

    var o = {}


    o.init = function() {

        parser.parse();

        //enable cors servers
        esri.config.defaults.io.corsEnabledServers.push("http://www.wri.org/");
        //esri.config.defaults.io.corsEnabledServers.push("servername");

        //setup proxy url


        require(["modules/HashController"], function(HashController) {
            HashController.init();
        })


    }



    return o;

});