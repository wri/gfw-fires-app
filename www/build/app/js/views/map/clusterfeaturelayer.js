define(["dojo/_base/declare","dojo/_base/array","dojo/_base/lang","dojo/_base/Color","dojo/_base/connect","dojo/on","dojo/promise/all","esri/SpatialReference","esri/geometry/Point","esri/geometry/Multipoint","esri/geometry/Extent","esri/graphic","esri/config","esri/geometry/normalizeUtils","esri/symbols/SimpleMarkerSymbol","esri/symbols/SimpleLineSymbol","esri/symbols/SimpleFillSymbol","esri/symbols/TextSymbol","esri/symbols/Font","esri/renderers/ClassBreaksRenderer","esri/request","esri/symbols/jsonUtils","esri/renderers/jsonUtils","esri/dijit/PopupTemplate","esri/layers/GraphicsLayer","esri/tasks/query","esri/tasks/QueryTask"],function(t,e,s,i,r,n,l,u,h,a,o,_,d,f,g,m,b,p,y,C,w,S,v,x,I,E,L){function T(t,e){return t.concat(e)}function D(t){for(var e=t.length,s=[];e--;){var i=t[e];i.constructor===Array?s=T(s,i):s.push(i)}return s}function O(t,e,s){var i=t.length,r=[];if(!e){for(r=t;i--;){var n=t[i];s[n]||(s[n]=n)}return r}for(;i--;){var l=t[i];s[l]||(s[l]=l,r.push(l))}return r}function j(t){for(var e=t.length,s=[];e--;){var i=t[e];s.push(new _(i.geometry.getCentroid(),i.symbol,i.attributes,i.infoTemplate))}return s}return function(){window.console||(window.console={});for(var t=["log","info","warn","error","debug","trace","dir","group","groupCollapsed","groupEnd","time","timeEnd","profile","profileEnd","dirxml","assert","count","markTimeline","timeStamp","clear"],e=0;e<t.length;e++)window.console[t[e]]||(window.console[t[e]]=function(){})}(),t([I],{constructor:function(t){if(this._clusterTolerance=t.distance||50,this._clusterData=[],this._clusters=[],this._clusterLabelColor=t.labelColor||"#000",this._clusterLabelOffset=t.hasOwnProperty("labelOffset")?t.labelOffset:-5,this._singles=[],this._showSingles=t.hasOwnProperty("showSingles")?t.showSingles:!0,this._zoomOnClick=t.hasOwnProperty("zoomOnClick")?t.zoomOnClick:!0,this._singleSym=t.singleSymbol||new g("circle",16,new m(m.STYLE_SOLID,new i([85,125,140,1]),3),new i([255,255,255,1])),this._singleTemplate=t.singleTemplate||new x({title:"",description:"{*}"}),this._maxSingles=t.maxSingles||1e4,this._font=t.font||new y("10pt").setFamily("Arial"),this._sr=t.spatialReference||new u({wkid:102100}),this._zoomEnd=null,this.url=t.url||null,this._outFields=t.outFields||["*"],this.queryTask=new L(this.url),this._where=t.where||null,this._useDefaultSymbol=t.hasOwnProperty("useDefaultSymbol")?t.useDefaultSymbol:!1,this._returnLimit=t.returnLimit||1e3,this._singleRenderer=t.singleRenderer,this._objectIdField=t.objectIdField||"OBJECTID",!this.url)throw new Error("url is a required parameter");this._clusterCache={},this._objectIdCache=[],this._objectIdHash={},this._currentClusterGraphic=null,this._currentClusterLabel=null,this._visitedExtent=null,this.detailsLoaded=!1,this._query=new E,this.MODE_SNAPSHOT=t.hasOwnProperty("MODE_SNAPSHOT")?t.MODE_SNAPSHOT:!0,this._getServiceDetails(),d.defaults.geometryService="http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer"},_getServiceDetails:function(){w({url:this.url,content:{f:"json"},handleAs:"json"}).then(s.hitch(this,function(t){this._defaultRenderer=this._singleRenderer||v.fromJson(t.drawingInfo.renderer),"esriGeometryPolygon"===t.geometryType&&(this._useDefaultSymbol=!1,console.info("polygon geometry will be converted to points")),this.emit("details-loaded",t)}))},_getDefaultSymbol:function(t){var e=this._defaultRenderer;return this._useDefaultSymbol&&e?e.getSymbol(t):this._singleSym},_getRenderedSymbol:function(t){var e=t.attributes;if(1===e.clusterCount){if(!this._useDefaultSymbol)return this._singleSym;var s=this._defaultRenderer;return s?s.getSymbol(t):null}return null},_reCluster:function(){this._clusterResolution=this._map.extent.getWidth()/this._map.width,this._visitedExtent?this._visitedExtent.contains(this._map.extent)?this._clusterGraphics():this._getObjectIds(this._map.extent):this._getObjectIds(this._map.extent),this._visitedExtent=this._visitedExtent?this._visitedExtent.union(this._map.extent):this._map.extent},_setClickedClusterGraphics:function(t){return null===t?(this._currentClusterGraphic=null,this._currentClusterLabel=null,void 0):(null===t.symbol?(this._currentClusterLabel=this._getCurrentLabelGraphic(t),this._currentClusterGraphic=t):"esri.symbol.TextSymbol"===t.symbol.declaredClass&&(this._currentClusterLabel=t,this._currentClusterGraphic=this._getCurrentClusterGraphic(t)),void 0)},_getCurrentClusterGraphic:function(t){var s=e.filter(this.graphics,function(e){return e.attributes.clusterId===t.attributes.clusterId});return s[0]},_getCurrentLabelGraphic:function(t){var s=e.filter(this.graphics,function(e){return e.symbol&&"esri.symbol.TextSymbol"===e.symbol.declaredClass&&e.attributes.clusterId===t.attributes.clusterId});return s[0]},_popupVisibilityChange:function(){var t=this._map.infoWindow.isShowing;this._showClickedCluster(!t),t||this.clearSingles()},_showClickedCluster:function(t){this._currentClusterGraphic&&this._currentClusterLabel&&(t?(this._currentClusterGraphic.show(),this._currentClusterLabel.show()):(this._currentClusterGraphic.hide(),this._currentClusterLabel.hide()))},_setMap:function(t){this._query.outSpatialReference=t.spatialReference,this._query.returnGeometry=!0,this._query.outFields=this._outFields,this._extentChange=n(t,"extent-change",s.hitch(this,"_reCluster")),t.infoWindow.on("hide",s.hitch(this,"_popupVisibilityChange")),t.infoWindow.on("show",s.hitch(this,"_popupVisibilityChange"));var e=n(t,"layer-add",s.hitch(this,function(t){t.layer===this&&(e.remove(),this.detailsLoaded||n.once(this,"details-loaded",s.hitch(this,function(){if(!this.renderer){this._singleSym=this._singleSym||new g("circle",16,new m(m.STYLE_SOLID,new i([85,125,140,1]),3),new i([255,255,255,.5]));var t=new C(this._singleSym,"clusterCount");small=new g("circle",25,new m(m.STYLE_SOLID,new i([140,177,210,.35]),15),new i([140,177,210,.75])),medium=new g("circle",50,new m(m.STYLE_SOLID,new i([97,147,179,.35]),15),new i([97,147,179,.75])),large=new g("circle",80,new m(m.STYLE_SOLID,new i([59,110,128,.35]),15),new i([59,110,128,.75])),xlarge=new g("circle",110,new m(m.STYLE_SOLID,new i([20,72,77,.35]),15),new i([20,72,77,.75])),t.addBreak(2,10,small),t.addBreak(10,25,medium),t.addBreak(25,100,large),t.addBreak(100,1/0,xlarge),this.setRenderer(t)}this._reCluster()})))})),r=this.inherited(arguments);return r},_unsetMap:function(){this.inherited(arguments),this._extentChange.remove()},_onClusterClick:function(t){var s=t.graphic.attributes;if(s&&s.clusterCount){var i=e.filter(this._clusterData,function(t){return s.clusterId===t.attributes.clusterId},this);this.emit("cluster-click",i)}},_getObjectIds:function(t){if(this.url){var e=t||this._map.extent;this._query.objectIds=null,this._where&&(this._query.where=this._where),this.MODE_SNAPSHOT||(this._query.geometry=e),this._query.geometry||this._query.where||(this._query.where="1=1"),this.queryTask.executeForIds(this._query).then(s.hitch(this,"_onIdsReturned"),this._onError)}},_onError:function(t){console.warn("ReturnIds Error",t)},_onIdsReturned:function(t){var i=O(t,this._objectIdCache.length,this._objectIdHash);if(this._objectIdCache=T(this._objectIdCache,i),i&&i.length){this._query.where=null,this._query.geometry=null;var r=[];if(i.length>this._returnLimit){for(;i.length;)this._query.objectIds=i.splice(0,this._returnLimit-1),r.push(this.queryTask.execute(this._query));l(r).then(s.hitch(this,function(t){var s=e.map(t,function(t){return t.features});this._onFeaturesReturned({features:D(s)})}))}else this._query.objectIds=i.splice(0,this._returnLimit-1),this.queryTask.execute(this._query).then(s.hitch(this,"_onFeaturesReturned"),this._onError)}else this._objectIdCache.length?this._onFeaturesReturned({features:[]}):this.clear()},_inExtent:function(){for(var t=this._map.extent,e=this._objectIdCache.length,s=[];e--;){var i=this._objectIdCache[e],r=this._clusterCache[i];r&&t.contains(r.geometry)&&s.push(r)}return s},_onFeaturesReturned:function(t){var s,i=this._inExtent();s="esriGeometryPolygon"===this.native_geometryType?j(t.features):t.features;var r=s.length;r&&(this._clusterData.length=0,this.clear(),e.forEach(s,function(t){this._clusterCache[t.attributes[this._objectIdField]]=t},this),this._clusterData=T(s,i)),this._clusterGraphics()},updateClusters:function(){this.clearCache(),this._reCluster()},clearCache:function(){e.forEach(this._objectIdCache,function(t){delete this._objectIdCache[t]},this),this._objectIdCache.length=0,this._clusterCache={},this._objectIdHash={}},add:function(t){if(t.declaredClass)return this.inherited(arguments),void 0;this._clusterData.push(t);for(var e=!1,s=0;s<this._clusters.length;s++){var i=this._clusters[s];if(this._clusterTest(t,i)){this._clusterAddPoint(t,i),this._updateClusterGeometry(i),this._updateLabel(i),e=!0;break}}e||(this._clusterCreate(t),t.attributes.clusterCount=1,this._showCluster(t))},clear:function(){this.inherited(arguments),this._clusters.length=0},clearSingles:function(t){var s=t||this._singles;e.forEach(s,function(t){this.remove(t)},this),this._singles.length=0},onClick:function(t){if(t.stopPropagation(),1===t.graphic.attributes.clusterCount){this._showClickedCluster(!0),this._setClickedClusterGraphics(null),this.clearSingles(this._singles);var s=this._getClusterSingles(t.graphic.attributes.clusterId);e.forEach(s,function(t){t.setSymbol(this._getDefaultSymbol(t)),t.setInfoTemplate(this._singleTemplate)},this),this._addSingleGraphics(s),this._map.infoWindow.setFeatures(s),this._map.infoWindow.show(t.graphic.geometry),this._map.infoWindow.show(t.graphic.geometry)}else if(this._zoomOnClick&&t.graphic.attributes.clusterCount>1&&this._map.getZoom()!==this._map.getMaxZoom()){var i=this._getClusterExtent(t.graphic);i.getWidth()?this._map.setExtent(i.expand(1.5),!0):this._map.centerAndZoom(t.graphic.geometry,this._map.getMaxZoom())}else{this.clearSingles(this._singles);var s=this._getClusterSingles(t.graphic.attributes.clusterId);if(s.length>this._maxSingles)return alert("Sorry, that cluster contains more than "+this._maxSingles+" points. Zoom in for more detail."),void 0;this._showClickedCluster(!0),this._setClickedClusterGraphics(t.graphic),this._showClickedCluster(!1),this._addSingleGraphics(s),this._map.infoWindow.setFeatures(this._singles),this._map.infoWindow.show(t.graphic.geometry),this._map.infoWindow.show(t.graphic.geometry)}},_clusterGraphics:function(){this.clear();for(var t=0,e=this._clusterData.length;e>t;t++){var s=this._clusterData[t].geometry||this._clusterData[t];if(this._map.extent.contains(s)){for(var i=this._clusterData[t],r=!1,n=0;n<this._clusters.length;n++){var l=this._clusters[n];if(this._clusterTest(s,l)){this._clusterAddPoint(i,s,l),r=!0;break}}r||this._clusterCreate(i,s)}else this._clusterData[t].attributes.clusterId=-1}this._showAllClusters()},_clusterTest:function(t,e){var s=Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))/this._clusterResolution;return s<=this._clusterTolerance},_clusterAddPoint:function(t,e,s){var i,r,n;i=s.attributes.clusterCount,r=(e.x+s.x*i)/(i+1),n=(e.y+s.y*i)/(i+1),s.x=r,s.y=n,e.x<s.attributes.extent[0]?s.attributes.extent[0]=e.x:e.x>s.attributes.extent[2]&&(s.attributes.extent[2]=e.x),e.y<s.attributes.extent[1]?s.attributes.extent[1]=e.y:e.y>s.attributes.extent[3]&&(s.attributes.extent[3]=e.y),s.attributes.clusterCount++,e.hasOwnProperty("attributes")||(e.attributes={}),t.attributes.clusterId=e.attributes.clusterId=s.attributes.clusterId},_clusterCreate:function(t,e){var s=this._clusters.length+1;e.attributes||(e.attributes={}),t.attributes.clusterId=e.attributes.clusterId=s;var i={x:e.x,y:e.y,attributes:{clusterCount:1,clusterId:s,extent:[e.x,e.y,e.x,e.y]}};this._clusters.push(i)},_showAllClusters:function(){for(var t=0,e=this._clusters.length;e>t;t++)this._showCluster(this._clusters[t]);this.emit("clusters-shown",this._clusters)},_showCluster:function(t){var e=new h(t.x,t.y,this._sr),s=new _(e,null,t.attributes);if(s.setSymbol(this._getRenderedSymbol(s)),this.add(s),!(t.attributes.clusterCount<2)){var r=new p(t.attributes.clusterCount).setColor(new i(this._clusterLabelColor)).setOffset(0,this._clusterLabelOffset).setFont(this._font);this.add(new _(e,r,t.attributes))}},_findCluster:function(){e.filter(this.graphics,function(t){return!t.symbol&&t.attributes.clusterId===c.attributes.clusterId})},_getClusterExtent:function(t){var e;return e=t.attributes.extent,new o(e[0],e[1],e[2],e[3],this._map.spatialReference)},_getClusteredExtent:function(){for(var t,e,s=0;s<this._clusters.length;s++)t=this._getClusteredExtent(this._clusters[s]),e=e?e.union(t):t;return e},_getClusterSingles:function(t){for(var e=[],s=0,i=this._clusterData.length;i>s;s++)t===this._clusterData[s].attributes.clusterId&&e.push(this._clusterData[s]);return e},_addSingleGraphics:function(t){e.forEach(t,function(t){t.setSymbol(this._getDefaultSymbol(t)),t.setInfoTemplate(this._singleTemplate),this._singles.push(t),this._showSingles&&this.add(t)},this)},_updateClusterGeometry:function(t){var s=e.filter(this.graphics,function(e){return!e.symbol&&e.attributes.clusterId===t.attributes.clusterId});1===s.length?s[0].geometry.update(t.x,t.y):console.log("didn not find exactly one cluster geometry to update: ",s)},_updateLabel:function(t){var s=e.filter(this.graphics,function(e){return e.symbol&&"esri.symbol.TextSymbol"===e.symbol.declaredClass&&e.attributes.clusterId===t.attributes.clusterId});if(1===s.length){this.remove(s[0]);var r=new p(t.attributes.clusterCount).setColor(new i(this._clusterLabelColor)).setOffset(0,this._clusterLabelOffset).setFont(this._font);this.add(new _(new h(t.x,t.y,this._sr),r,t.attributes))}else console.log("didn not find exactly one label: ",s)},_clusterMeta:function(){console.log("Total:    ",this._clusterData.length);var t=0;e.forEach(this._clusters,function(e){t+=e.attributes.clusterCount}),console.log("In clusters:    ",t)}})});