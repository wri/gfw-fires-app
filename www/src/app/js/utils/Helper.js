/* global define */
define([
    "dojo/dom",
    "dojo/dom-construct",
    "views/map/MapConfig"
], function(dom, domConstruct, MapConfig) {

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
        },

        createBlocker: function(blockedId, blockerId) {
            if (dom.byId(blockerId)) {
                domConstruct.destroy(blockerId);
            }
            if (dom.byId(blockedId)) {
                var container = domConstruct.create("div", {
                    'id': blockerId,
                    'class': 'blockingWheelContainer'
                }, blockedId, 'first');
                var loader = domConstruct.create("img", {
                    "class": "blockingWheel",
                    "src": "app/images/red_X_transparent.png"
                }, container, "first");
                return true;
            } else {
                return false;
            }
        },

        /**
         * @param {object} graphicsLayer - Esri Graphics Layer to search
         * @param {object} fieldName - Field Name to use to find the next available id
         * @return {number} Next Available Unique Id for the graphics in the graphics layer
         * Field Name Based on Config File, Helper for Uploader.js and DrawTool.js
         */
        nextAvailableGraphicId: function(graphicsLayer, fieldName) {
            var graphics = graphicsLayer.graphics,
                length = graphics.length,
                index = 0,
                id = 0,
                temp;

            for (index; index < length; index += 1) {
                if (graphics[index].geometry.type !== "point") {
                    if (graphics[index].attributes) {
                        temp = parseInt(graphics[index].attributes[fieldName]);
                        if (!isNaN(temp)) {
                            id = (temp > id) ? temp : id;
                        }
                    }

                }
            }
            return id + 1;
        }

    };

});