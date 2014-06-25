define(["dojo/dom-construct", "dojo/dom-class", "dojo/_base/window", "dojo/dom"],
    function(domConstruct, domClass, win, dom) {

        var o = {};

        var blockDivProps = {

            "class": "blocker"
        };

        var blockDiv;
        var showingError = false;

        o.show = function(seconds) {
            var that = this;
            //inject html in page
            blockDiv = domConstruct.create("div", blockDivProps, dom.byI);

        };


        o.hide = function() {
            //inject html in page
            domConstruct.destroy(blockDiv)


        };


        //listen to key

        //trigger event 



        return o;


    });