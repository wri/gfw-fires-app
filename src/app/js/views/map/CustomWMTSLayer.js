define([
  "dojo/_base/declare",
  "esri/layers/WMTSLayer",
  "esri/geometry/webMercatorUtils",
  "esri/SpatialReference",
  "dojo/io-query",
  "esri/request"
], function(declare, WMTSLayer, webMercatorUtils, SpatialReference, ioQuery, esriRequest){
  return declare("CustomWMTSLayer",WMTSLayer, {
    constructor: function() {
      this.spatialReference = new SpatialReference({wkid: 4326});
      this.loaded = true;
      this.onLoad(this);
    },
    _getCapabilities: function () {
      var self = this;
      // esriRequest.setRequestPreCallback(function (ioArgs) {
      //   if (ioArgs.url.search('WMTSCapabilities.xml') > -1) {
      //     ioArgs.url = 'https://services.digitalglobe.com/earthservice/wmtsaccess/1.0.0/WMTSCapabilities.xml?connectid=dec7c992-899b-4d85-99b9-8a60a0e6047f&REQUEST=GetCapabilities';
      //   }
      //   return ioArgs;
      // });
      esriRequest({
          url: 'https://services.digitalglobe.com/earthservice/wmtsaccess/1.0.0/WMTSCapabilities.xml?connectid=dec7c992-899b-4d85-99b9-8a60a0e6047f&REQUEST=GetCapabilities',
          handleAs: "text",
          load: function () {
            console.dir(arguments);
            self._parseCapabilities(arguments);
          },
          error: self._getCapabilitiesError
      }, {useProxy: false});
    },

    getImageUrl: function(extent,width,height,callback){

      // Normalize the extent to avoid issues with wrapAround180
      // var geom = webMercatorUtils.webMercatorToGeographic(extent._normalize());

      // if (geom === undefined) {
      //   var xmax = esri.geometry.Extent.prototype._normalizeX(extent.xmax, this.spatialReference._getInfo()).x,
      //       xmin = esri.geometry.Extent.prototype._normalizeX(extent.xmin, this.spatialReference._getInfo()).x;
      //   geom = webMercatorUtils.webMercatorToGeographic(new esri.geometry.Extent(xmin, this.extent.ymin, xmax, this.extent.ymax, this.spatialReference));
      // }

      // var params = {
      //   CONNECTID: '4c854a5e-6806-462f-b41b-3e5b00d43d98',
      //   SUPEROVERLAY: true,
      //   FORMAT_OPTIONS: 'OPACITY:0.75;GENERALIZE:true',
      //   env: 'color:ff6600',
      //   FRESHNESS: '1w',
      //   SERVICE: "WMS",
      //   REQUEST: "GetMap",
      //   TRANSPARENT: true,
      //   format: "image/png",
      //   VERSION: "1.1.1",
      //   LAYERS: "DigitalGlobe:ImageryFootprint",
      //   STYLES: "imagery_footprint",
      //   // BGCOLOR: '0xFFFFFF',
      //   BBOX: geom.xmin + "," + geom.ymin + "," + geom.xmax + "," + geom.ymax,
      //   SRS: "EPSG:" + this.spatialReference.wkid,
      //   WIDTH: width,
      //   HEIGHT: height
      // };

      callback(decodeURIComponent(this.url + "?" + ioQuery.objectToQuery(params)));

    }
  });

});