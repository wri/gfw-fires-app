define(["dojo/dom-construct", "dojo/dom-class", "dojo/dom"],
    function(domConstruct, domClass, dom) {

        var o = {};

        var blockDivProps = {

            "class": "blocker"
        };

        var blockDiv = {};
        var showingError = false;

        o.show = function(nodeId) {
            var that = this;
            //inject html in page
            blockDiv[nodeId] = domConstruct.create("div", blockDivProps, dom.byId(nodeId));
        };


        o.hide = function(nodeId) {
            //inject html in page
            domConstruct.destroy(blockDiv[nodeId])


        };


        //listen to key

        //trigger event 



        return o;


    });