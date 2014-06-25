define(["dojo/dom-construct", "dojo/dom-class", "dojo/_base/window"],
    function(domConstruct, domClass, win) {

        var o = {};

        var errorDivProps = {
            innerHTML: "There was an error. Please try later",
            "class": "errorMsg dijitHidden"
        };

        var errDiv;
        var showingError = false;

        o.init = function() {
            //inject html in page

            // Take a string and turn it into a DOM node
            errDiv = domConstruct.create("div", errorDivProps, win.body());

            console.log(errDiv);



        };

        o.show = function(seconds) {
            var that = this;
            //inject html in page
            domClass.remove(errDiv, "dijitHidden");
            showingError = true;
            var time = seconds * 1000;

            if (seconds !== 0) {
                setTimeout(function() {
                    that.hide();
                }, time);
            }


        };


        o.hide = function() {
            //inject html in page
            domClass.add(errDiv, "dijitHidden");

        };


        //listen to key

        //trigger event 



        return o;


    });