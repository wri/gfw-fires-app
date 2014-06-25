define(["dojo/dom-construct", "dojo/dom-class", "dojo/_base/window"],
    function(domConstruct, domClass, win) {

        var o = {};

        var errorDiv = {
            innerHTML: "There was an error. Please try later",
            "class": "errorMsg dijitHidden"
        };

        var errDiv;

        o.init = function() {
            //inject html in page

            // Take a string and turn it into a DOM node
            errDiv = domConstruct.create("div", errorDiv, win.body());

            console.log(errDiv);



        };

        o.show = function() {
            //inject html in page
            domClass.remove(errDiv, "dijitHidden");
        };


        o.hide = function() {
            //inject html in page
            domClass.add(errDiv, "dijitHidden");

        };


        //listen to key

        //trigger event 



        return o;


    });