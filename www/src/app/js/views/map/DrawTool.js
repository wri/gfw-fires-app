define([
    "dojo/on",
    "esri/Color",
    "esri/graphic",
    "utils/Helper",
    "dojo/_base/array",
    "esri/toolbars/draw",
    "views/map/MapConfig",
    "views/map/MapModel",
    "esri/geometry/Polygon",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "dojo/i18n!esri/nls/jsapi"
], function(on, Color, Graphic, Helper, arrayUtils, Draw, MapConfig, MapModel, Polygon, SimpleFillSymbol, SimpleLineSymbol, bundle) {
    'use strict';

    var _map,
        drawToolbar,
        isActive = false,
        customFeatureSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2),
            new Color([103, 200, 255, 0.0]));
    bundle.toolbars.draw.freehand = "1. Click and hold to draw a shape. Release to finish. 2. Click in the shape to name it and subscribe.";

    var DrawToolbox = {

        init: function(map) {
            var self = this;
            // Set the map for use with the draw tools
            _map = map;

            // Connect the Event to Start the Draw Toolbar
            drawToolbar = new Draw(map);

            drawToolbar.on('draw-end', this.drawComplete.bind(this));

            on(document.getElementById('drawFeatures'), 'click', function() {
                if (isActive) {
                    self.deactivateToolbar();
                } else {
                    self.activateToolbar();
                }
            });

        },

        drawComplete: function(evt) {
            this.deactivateToolbar();
            MapModel.set('showDrawTools', false);
            // Add Feature to Map
            if (!evt.geometry) {
                return;
            }
            _map.infoWindow.hide();

            var uniqueIdField = MapConfig.defaultGraphicsLayerUniqueId,
                labelField = MapConfig.defaultGraphicsLayerLabel,
                graphicsLayer = _map.graphics,
                id = Helper.nextAvailableGraphicId(graphicsLayer, uniqueIdField),
                attributes = {},
                graphic,
                polygon;

            attributes[uniqueIdField] = id;
            attributes[labelField] = ["Custom Drawn Feature -", id].join(' ');
            polygon = new Polygon(evt.geometry);
            graphic = new Graphic(polygon, customFeatureSymbol, attributes);
            graphicsLayer.add(graphic);
            MapModel.vm.customFeaturesArray().push(graphic);
            MapModel.vm.customFeaturesPresence(true);

        },

        activateToolbar: function() {
            drawToolbar.activate(Draw.FREEHAND_POLYGON);
            isActive = true;
            $("#drawFeatures").css("background-color", "#e7002f");
        },

        deactivateToolbar: function() {
            drawToolbar.deactivate();
            isActive = false;
            $("#drawFeatures").css("background-color", "#444");
        },

        isActive: function() {
            return isActive;
        }

    };

    return DrawToolbox;

});