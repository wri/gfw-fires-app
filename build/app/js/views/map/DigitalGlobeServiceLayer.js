define(["dojo/_base/declare","esri/layers/ArcGISDynamicMapServiceLayer","esri/geometry/webMercatorUtils","esri/SpatialReference","dojo/io-query"],function(e,t,a,r,i){return e("DigitalGlobeServiceLayer",t,{constructor:function(e){this.spatialReference=new r({wkid:4326}),this.loaded=!0,this.featureId="ab489b7b9b49b8974a762ad05c0616fa",this.url=e},getImageUrl:function(e,t,r,o){var n=a.webMercatorToGeographic(e._normalize());if(void 0===n){var c=this._map,s=esri.geometry.Extent.prototype._normalizeX(c.extent.xmax,c.spatialReference._getInfo()).x,m=esri.geometry.Extent.prototype._normalizeX(c.extent.xmin,c.spatialReference._getInfo()).x;n=a.webMercatorToGeographic(new esri.geometry.Extent(m,c.extent.ymin,s,c.extent.ymax,c.spatialReference))}var f={SERVICE:"WMS",REQUEST:"GetMap",VERSION:"1.1.1",LAYERS:"DigitalGlobe:Imagery",STYLES:"default",format:"image/png",TRANSPARENT:!0,HEIGHT:r,WIDTH:t,BGCOLOR:"0xFFFFFF",CONNECTID:"dec7c992-899b-4d85-99b9-8a60a0e6047f",FEATURECOLLECTION:this.featureId,BBOX:n.xmin+","+n.ymin+","+n.xmax+","+n.ymax,SRS:"EPSG:"+this.spatialReference.wkid};o(decodeURIComponent(this.url+"?"+i.objectToQuery(f)))},setFeatureId:function(e){this.featureId=e}})});