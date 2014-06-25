define(["dojo/dom-construct", "dojo/dom-class", "dojo/_base/window"],
    function(domConstruct, domClass, win) {

        var o = {};
        var defaultMsg = "There was an error. Please try later";
        var errorDivProps = {
            innerHTML: defaultMsg,
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

        o.show = function(seconds, msg) {
            var that = this;
            //inject html in page
            domClass.remove(errDiv, "dijitHidden");
            showingError = true;
            var time = seconds * 1000;

            if (msg && msg.length > 0) {
                errDiv.innerHTML = msg;
            } else {
                errDiv.innerHTML = defaultMsg;
            }

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