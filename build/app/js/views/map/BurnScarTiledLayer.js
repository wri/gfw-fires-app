/*! Global-Forest-Watch-Fires Fri Dec 12 2014 12:17:24 */
define(["dojo/_base/declare"],function(a){return a("TiledServiceLayer",esri.layers.TiledMapServiceLayer,{constructor:function(a,b){this.url=a,this.id=b,this.visible=!1,this.spatialReference=new esri.SpatialReference({wkid:102100}),this.initialExtent=this.fullExtent={spatialReference:{latestWkid:3857,wkid:102100},xmax:15744261.282091608,xmin:9859221.600360883,ymax:1293926.0148111186,ymin:-1293926.0148111205},this.tileInfo=new esri.layers.TileInfo({rows:256,cols:256,dpi:96,format:"image/jpeg",compressionQuality:0,lods:[{level:0,resolution:156543.03392800014,scale:591657527.591555},{level:1,resolution:78271.51696399994,scale:295828763.795777},{level:2,resolution:39135.75848200009,scale:147914381.897889},{level:3,resolution:19567.87924099992,scale:73957190.948944},{level:4,resolution:9783.93962049996,scale:36978595.474472},{level:5,resolution:4891.96981024998,scale:18489297.737236},{level:6,resolution:2445.98490512499,scale:9244648.868618},{level:7,resolution:1222.992452562495,scale:4622324.434309},{level:8,resolution:611.4962262813797,scale:2311162.217155},{level:9,resolution:305.74811314055756,scale:1155581.108577},{level:10,resolution:152.87405657041106,scale:577790.554289},{level:11,resolution:76.43702828507324,scale:288895.277144},{level:12,resolution:38.21851414253662,scale:144447.638572},{level:13,resolution:19.10925707126831,scale:72223.819286},{level:14,resolution:9.554628535634155,scale:36111.909643},{level:15,resolution:4.77731426794937,scale:18055.954822},{level:16,resolution:2.388657133974685,scale:9027.977411},{level:17,resolution:1.1943285668550503,scale:4513.988705},{level:18,resolution:.5971642835598172,scale:2256.994353},{level:19,resolution:.29858214164761665,scale:1128.497176}],origin:{x:-20037508.342787,y:20037508.342787},spatialReference:{latestwkid:"3857",wkid:102100}}),this.loaded=!0,this.onLoad(this)},getTileUrl:function(a,b,c){return this.url+"&x="+c+"&y="+b+"&z="+a+"&v=2&s="}})});