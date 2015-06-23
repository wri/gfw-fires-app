define([
    "esri/Color",
    "dojo/sniff",
    "esri/graphic",
    "esri/request",
    "utils/Helper",
    "dijit/registry",
    "dojo/dom-class",
    "dojo/_base/array",
    "dojo/store/Memory",
    "dojo/dom-construct",
    "dijit/form/ComboBox",
    "views/map/MapConfig",
    "views/map/MapModel",
    "esri/geometry/Polygon",
    "esri/geometry/scaleUtils",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol"
], function(Color, sniff, Graphic, esriRequest, Helper, registry, domClass, arrayUtils, Memory, domConstruct, ComboBox, MapConfig, MapModel, Polygon, scaleUtils, SimpleFillSymbol, SimpleLineSymbol) {

    var _map;

    var Uploader = {

        setMap: function(map) {
            _map = map;
            return this;
        },

        beginUpload: function(evt) {
            var target = evt.target ? evt.target : evt.srcElement;
            // If Form as reset or has no value, exit
            if (target.value === "") {
                return;
            }

            // If the file is larger then 1MB, exit
            if (target.files && target.files[0].size > 1048576) {
                alert('Currently we only support files under 1MB in size. Please try a smaller shapefile.');
                document.uploadForm.reset();
                return;
            }

            var filename = target.value.toLowerCase(),
                self = this,
                params,
                extent;

            // Filename is full path, extract the filename
            if (sniff("ie")) {
                var temp = filename.split('\\');
                filename = temp[temp.length - 1];
            }

            if (filename.indexOf('.zip') < 0) {
                alert('Currently only files with a .zip extension are supported.');
                return;
            }

            // Split based on .
            filename = filename.split(".");

            //Chrome and IE add c:\fakepath to the value - we need to remove it
            //See this link for more info: http://davidwalsh.name/fakepath
            filename = filename[0].replace("c:\\fakepath\\", "");

            params = {
                'name': filename,
                'generalize': true,
                'targetSR': _map.spatialReference,
                'maxRecordCount': 1000,
                'reducePrecision': true,
                'numberOfDigitsAfterDecimal': 0,
                'enforceInputFileSizeLimit': true,
                'enforceOutputJsonSizeLimit': true
            };

            // Generalize Features, based on https://developers.arcgis.com/javascript/jssamples/portal_addshapefile.html
            extent = scaleUtils.getExtentForScale(_map, 40000);
            params.maxAllowableOffset = extent.getWidth() / _map.width;

            esriRequest({
                url: MapConfig.uploadOptions.url,
                content: {
                    'filetype': 'shapefile',
                    'publishParameters': JSON.stringify(params),
                    'f': 'json',
                    'callback.html': 'textarea'
                },
                form: document.uploadForm,
                handleAs: 'json',
                error: this.uploadError,
                load: this.uploadSuccess.bind(this)
            });

        },

        uploadError: function(err) {
            alert(["Error:", err.message].join(' '));
        },

        uploadSuccess: function(res) {
            var container = document.getElementById('uploadNameSelectContainer'),
                featureCollection = res.featureCollection,
                uploadedFeatureStore = [],
                self = this,
                store;

            // Create a store of data for Dropdown
            arrayUtils.forEach(featureCollection.layers[0].layerDefinition.fields, function(field) {
                uploadedFeatureStore.push({
                    name: field.name,
                    id: field.alias
                });
            });

            function resetView() {
                if (registry.byId("uploadComboNameWidget")) {
                    registry.byId("uploadComboNameWidget").destroy();
                }
                if (document.getElementById("dropdownContainerName")) {
                    domConstruct.destroy("dropdownContainerName");
                }
                document.uploadForm.file.value = "";
            }

            domConstruct.create("div", {
                'id': "dropdownContainerName",
                'innerHTML': "<div id='uploadComboNameWidget'></div>"
            }, container, "first");

            store = new Memory({
                data: uploadedFeatureStore
            });

            new ComboBox({
                id: "uploadComboNameWidget",
                value: "-- Choose name field --",
                store: store,
                searchAttr: "name",
                onChange: function(name) {
                    if (name) {
                        self.addFeaturesToMap(name, featureCollection.layers[0].featureSet);
                        resetView();
                    }
                }
            }, "uploadComboNameWidget");

        },

        nextId: function() {
            var graphics = _map.graphics.graphics,
                length = graphics.length,
                index = 0,
                id = 0,
                temp;

            for (index; index < length; index += 1) {
                if (graphics[index].geometry.type !== "point") {
                    temp = parseInt(graphics[index].attributes.GRAPHIC_ID);
                    if (!isNaN(temp)) {
                        id = (temp > id) ? temp : id;
                    }
                }
            }
            return id + 1;
        },

        addFeaturesToMap: function(nameField, featureSet) {

            var uniqueIdField = MapConfig.defaultGraphicsLayerUniqueId,
                labelField = MapConfig.defaultGraphicsLayerLabel,
                graphicsLayer = _map.graphics,
                customFeatureSymbol,
                graphic,
                polygon,
                extent;

            customFeatureSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2),
                new Color([103, 200, 255, 0.0]));

            arrayUtils.forEach(featureSet.features, function(feature) {
                feature.attributes[labelField] = feature.attributes[nameField];
                feature.attributes[uniqueIdField] = Helper.nextAvailableGraphicId(graphicsLayer, uniqueIdField);
                polygon = new Polygon(feature.geometry);
                graphic = new Graphic(polygon, customFeatureSymbol, feature.attributes);
                extent = extent ? extent.union(polygon.getExtent()) : polygon.getExtent();
                graphicsLayer.add(graphic);
                MapModel.vm.customFeaturesArray().push(graphic);
            });
            MapModel.vm.customFeaturesPresence(true);

            _map.setExtent(extent, true);

        }

    };

    return Uploader;

});