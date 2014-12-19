/* global define */
define([
    "dojo/dom",
    "dojo/dom-construct"
], function(dom, domConstruct) {

    return {

        showLoader: function(parentContainer, loaderId) {
            if (dom.byId(loaderId)) {
                domConstruct.destroy(loaderId);
            }
            if (dom.byId(parentContainer)) {
                var container = domConstruct.create("div", {
                    'id': loaderId,
                    'class': 'loadingWheelContainer'
                }, parentContainer, 'first');
                var loader = domConstruct.create("img", {
                    "class": "loadingWheel",
                    "src": "app/images/loader.gif"
                }, container, "first");
                return true;
            } else {
                return false;
            }
        },

        hideLoader: function(loaderId) {
            if (dom.byId(loaderId)) {
                domConstruct.destroy(loaderId);
                return true;
            } else {
                return false;
            }
        }

    };

});