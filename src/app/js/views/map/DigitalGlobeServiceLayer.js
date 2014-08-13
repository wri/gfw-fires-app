define([
  "dojo/_base/declare",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/geometry/webMercatorUtils",
  "esri/SpatialReference",
  "dojo/io-query"
], function(declare, ArcGISDynamicMapServiceLayer, webMercatorUtils, SpatialReference, ioQuery){
  return declare("DigitalGlobeServiceLayer",ArcGISDynamicMapServiceLayer, {
    constructor: function (url) {      
      this.spatialReference = new SpatialReference({wkid: 4326});
      this.loaded = true;
      this.featureId = "ab489b7b9b49b8974a762ad05c0616fa";
      this.url = url;
      //this.onLoad(this);
    },
    getImageUrl: function(extent,width,height,callback) {

      // Normalize the extent to avoid issues with wrapAround180
      var geom = webMercatorUtils.webMercatorToGeographic(extent._normalize());

      if (geom === undefined) {
        var map = this._map,
          xmax = esri.geometry.Extent.prototype._normalizeX(map.extent.xmax, map.spatialReference._getInfo()).x,
          xmin = esri.geometry.Extent.prototype._normalizeX(map.extent.xmin, map.spatialReference._getInfo()).x;
        geom = webMercatorUtils.webMercatorToGeographic(new esri.geometry.Extent(xmin, map.extent.ymin, xmax, map.extent.ymax, map.spatialReference));
      }

      var params = {
        SERVICE: "WMS",
        REQUEST: "GetMap",
        VERSION: "1.1.1",
        LAYERS: "DigitalGlobe:Imagery",  //DigitalGlobe:CrisisEvent
        STYLES: "default",
        format: "image/png",
        TRANSPARENT: true,
        HEIGHT: height,
        WIDTH: width,
        BGCOLOR: "0xFFFFFF",
        
        FEATURECOLLECTION: this.featureId,
        BBOX: geom.xmin + "," + geom.ymin + "," + geom.xmax + "," + geom.ymax,
        SRS: "EPSG:" + this.spatialReference.wkid
      };

      callback(decodeURIComponent(this.url + "?" + ioQuery.objectToQuery(params)));

    },

    setFeatureId: function (id) {
      this.featureId = id;
    }
  
  });

});