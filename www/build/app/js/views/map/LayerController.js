define(["knockout","dojo/on","dojo/mouse","dojo/dom","dojo/dom-attr","dojo/hash","dojo/query","dojo/cookie","dijit/Dialog","dojo/io-query","dojo/Deferred","dojo/_base/array","dojo/promise/all","dojo/dom-construct","dojo/dom-style","dojo/topic","dijit/registry","dijit/form/CheckBox","dijit/TooltipDialog","dijit/Tooltip","views/map/MapModel","views/map/MapConfig","modules/HashController","esri/layers/LayerDrawingOptions","esri/request","esri/tasks/query","esri/tasks/QueryTask","esri/geometry/webMercatorUtils","esri/layers/MosaicRule","esri/TimeExtent","esri/dijit/TimeSlider","esri/Color","esri/graphic","esri/geometry/Point","esri/geometry/Polygon","esri/symbols/SimpleLineSymbol","esri/symbols/SimpleFillSymbol","esri/symbols/PictureMarkerSymbol","esri/SpatialReference","utils/Helper"],function(e,t,i,r,a,s,o,n,l,d,c,g,u,y,b,m,h,p,f,v,L,D,A,w,I,k,S,T,G,x,M,j,E,B,P,R,N,O,Z,J){"use strict";var C,H=!1;return{setMap:function(e){C=e},refreshLegend:function(){var e,t=C.getLayer(D.landCoverLayers.id),i=t.visibleLayers,r=new esri.layers.LayerDrawingOptions,a=[],s=[29];r.transparency=0,C.getLayer(D.treeCoverLayer.id).visible&&(e=29),g.forEach(s,function(e){i.indexOf(e)>-1&&(i.splice(i.indexOf(e),1),t.setVisibleLayers(i))}),C.getLayer(D.treeCoverLayer.id).visible&&(i.push(e),a[e]=r,t.setVisibleLayers(i),t.setLayerDrawingOptions(a)),h.byId("legend").refresh()},setTransparency:function(e,t){var i=Math.floor(t)/100,r=C.getLayer(e);r&&r.setOpacity(i),"Land_Cover"===e&&(r=C.getLayer(D.treeCoverLayer.id),r&&r.setOpacity(i),r=C.getLayer(D.primaryForestsLayer.id),r&&r.setOpacity(i)),this.refreshLegend()},toggleLayerVisibility:function(e,t,i){var r=C.getLayer(e);r&&(r.visible!==t&&r.setVisibility(t),t?this.updateLayersInHash("add",e,i||e):this.updateLayersInHash("remove",e,e)),this.refreshLegend()},toggleMapServiceLayerVisibility:function(e,t,i){var r,a=e.visibleLayers;i?(e.visible||e.setVisibility(i),a.push(t),r=a):r=g.filter(a,function(e){return e!=t}),e.setVisibleLayers(r)},getTimeDefinition:function(e,t,i){var r=e+" >= date'"+t+"'",a=e+" < date'"+i+"'",s=[r,a].join(" AND ");return console.log(s),s},updateDynamicMapServiceLayerDefinition:function(e,t,i){e.layerDefinitions||(e.layerDefinitions=[]);var r=e.layerDefinitions;r[t]=i,e.setLayerDefinitions(r),"Air_Quality"===e.id&&(e.setVisibleLayers([1]),this.refreshLegend())},updateOtherFiresLayers:function(){var e,t=o(".selected-fire-option")[0],i=(o("#activate-smart-checkbox").attr("aria-checked")[0],r.byId("confidence-fires-checkbox").checked),a="fullData",s="",n=new Date,l=new Date;switch(t.id){case"fires72":l.setDate(n.getDate()-4),n.setDate(n.getDate()-3),a="past72";break;case"fires48":l.setDate(n.getDate()-3),n.setDate(n.getDate()-2),a="past48";break;case"fires24":l.setDate(n.getDate()-2),n.setDate(n.getDate()-1),a="past24";break;default:s="1 = 1"}switch(L.vm.smartRendererName()){case"Choose one":e=null;break;case"Heat map":e="newFires";break;case"Proportional symbols":e="firesClusters";break;case"Hex bin":e="hexFires"}if(g.indexOf(["fires72","fires48","fires24"],t.id)>-1){var d=l.getFullYear(),c="00"+(l.getMonth()+1).toString();c=c.substr(c.length-2);var u="00"+l.getDate().toString();u=u.substr(u.length-2);var y="00"+n.getDate().toString();y=y.substring(y.length-2);{var b=l.getHours(),m=l.getMinutes(),h=l.getSeconds(),p=d.toString()+"-"+c+"-"+u+" "+b+":"+m+":"+h;d.toString()+"-"+c+"-"+y+" "+b+":"+m+":"+h}s+="ACQ_DATE > date '"+p+"'"}i&&("1 = 1"===s?s="BRIGHTNESS >= 330 AND CONFIDENCE >= 30":s+=" AND BRIGHTNESS >= 330 AND CONFIDENCE >= 30",a="fullData"!=a?"highConfidence"+a:"highConfidence");var f=map.getLayer(e);if("firesClusters"!=e){if(console.log(s),f)f.setDefinitionExpression(s);else{var v=C.getLayer("newFires");v.setDefinitionExpression(s)}if("hexFires"==e)return!0}else{console.log(a);var D=map.clusterData[a];console.log(D.length),f._clusterData=D,f._clusterGraphics()}},updateFiresLayer:function(e){var t,i,a=o(".selected-fire-option")[0],s=r.byId("confidence-fires-checkbox").checked,n="fullData",l=[],d="",c=new Date,u=new Date;switch(a.id){case"fires72":u.setDate(c.getDate()-4),c.setDate(c.getDate()-3),n="past72";break;case"fires48":u.setDate(c.getDate()-3),c.setDate(c.getDate()-2),n="past48";break;case"fires24":u.setDate(c.getDate()-2),c.setDate(c.getDate()-1),n="past24";break;default:d="1 = 1"}if(g.indexOf(["fires72","fires48","fires24"],a.id)>-1){var y=u.getFullYear(),b="00"+(u.getMonth()+1).toString();b=b.substr(b.length-2);var m="00"+u.getDate().toString();m=m.substr(m.length-2);var h="00"+c.getDate().toString();h=h.substring(h.length-2);{var p=u.getHours(),f=u.getMinutes(),v=u.getSeconds(),L=y.toString()+"-"+b+"-"+m+" "+p+":"+f+":"+v;y.toString()+"-"+b+"-"+h+" "+p+":"+f+":"+v}d+="ACQ_DATE > date '"+L+"'"}for(var A=0,w=D.firesLayer.defaultLayers.length;w>A;A++)l[A]=d;i=C.getLayer(D.firesLayer.id),i&&(i.setLayerDefinitions(l),e||this.refreshLegend()),e&&(t=s?[0,1]:[0,1,2,3],i&&i.setVisibleLayers(t),this.refreshLegend()),s&&("1 = 1"===d?d="BRIGHTNESS >= 330 AND CONFIDENCE >= 30":d+=" AND BRIGHTNESS >= 330 AND CONFIDENCE >= 30",n="fullData"!=n?"highConfidence"+n:"highConfidence");var I=C.getLayer("newFires");I.setDefinitionExpression(d);var k=map.getLayer("firesClusters"),S=map.clusterData[n];console.log(S.length),k._clusterData=S,k._clusterGraphics()},updateAdditionalVisibleLayers:function(e,t){var i,r=C.getLayer(t.id),a=[],s="";o("."+e).forEach(function(e){e.checked&&(i=t[e.value],void 0!==i&&a.push(i))}),0===a.length&&a.push(-1),r&&(r.setVisibleLayers(a),r.visible?-1===a[0]?this.toggleLayerVisibility(t.id,!1):(s="/"+a.join(","),this.updateLayersInHash("add",t.id,t.id+s)):(s="/"+a.join(","),this.toggleLayerVisibility(t.id,!0,t.id+s))),this.refreshLegend()},updateLandCoverLayers:function(e){var t=e.target?e.target:e.srcElement;this.updatePeatLandsLayer(t.id),this.updateTreeCoverLayer("tree-cover-density-radio"===t.id),this.updatePrimaryForestsLayer("primary-forests-radio"===t.id)},toggleDigitalGlobeLayer:function(e,t){var i=this,a=(C.getLayer(D.digitalGlobe.id),e?"block":"none");t&&(a="block"),b.set(r.byId("timeSliderPanel"),"display",a),this.getBoundingBoxesForDigitalGlobe().then(function(){if(e&!t&&i.promptAboutDigitalGlobe(),t&&0==e){var r=C.getLayer(D.digitalGlobe.graphicsLayerId);return r.clear(),void 0}i.toggleDigitalGlobeLayerVisibility(D.digitalGlobe.id,e),i.showHelperLayers(D.digitalGlobe.graphicsLayerId,e),i.generateTimeSlider("timeSliderDG","timeSliderPanel",t)})},toggleDigitalGlobeLayerVisibility:function(e,t){if(t)this.updateLayersInHash("add",e,e);else{this.updateLayersInHash("remove",e,e);{D.digitalGlobe.mosaics.map(function(e){var i=C.getLayer(e);!i.visible&&t&&i.setVisibility(t),t||i.setVisibility(t)})}}},showHelperLayers:function(e,t){var i=C.getLayer(e);i&&i.visible!==t&&i.setVisibility(t)},filter_footprints:function(e,t,i){var r=C.getLayer(D.digitalGlobe.graphicsLayerId),a=L.get("model").DigitalGlobeExtents(),s=a.filter(function(r){return r.attributes[e]>=t&&r.attributes[e]<=i});r.clear(),s.map(function(e){r.add(e)})},getBoundingBoxesForDigitalGlobe:function(){var e=new c,t=L.get("model"),i=D.digitalGlobe,r=C.getLayer(D.digitalGlobe.graphicsLayerId),a={},s="",o=[];if(H)e.resolve();else{var n=D.digitalGlobe.mosaics.map(function(e){J.showLoader("map","map-blocker");var n=new S(i.imagedir+e+"/ImageServer"),l=new c,d=new k,u=[];return d.outFields=["OBJECTID","Name","AcquisitionDate","SensorName"],d.where="Category = 1",d.returnGeometry=!0,n.execute(d,function(e){H=!0,g.forEach(e.features,function(e){e.setSymbol(new N(N.STYLE_SOLID,new R(R.STYLE_SOLID,new j([255,0,0]),2),new j([0,255,0,0]))),e.attributes.Layer="Digital_Globe",s=moment(e.attributes.AcquisitionDate),o.push(s),e.attributes.moment=s,r.add(e),u.push(e),a[e.attributes.Tiles]=T.geographicToWebMercator(e.geometry).getExtent()}),o.length&&t.dgMoments(o.sort(function(e,t){return e-t})),t.DigitalGlobeExtents(t.DigitalGlobeExtents().concat(u)),l.resolve(!0),J.hideLoader("map-blocker")},function(e){console.error(e),J.hideLoader("map-blocker"),l.resolve(!0)}),l.promise});u(n).then(function(){e.resolve(!0)})}return e.promise},showDigitalGlobeImagery:function(e){var t=e.feature,i=t.attributes.SensorName,r=t.attributes.OBJECTID,a=C.getLayer(D.digitalGlobe.sensorTypes[i]),s=new G;s.method=G.METHOD_LOCKRASTER;D.digitalGlobe.mosaics.map(function(e){var t=C.getLayer(e);t&&t.visible&&t.setVisibility(!1)});a&&!a.visible&&(s.lockRasterIds=[r],a.setMosaicRule(s),a.setVisibility(!0))},getSliderTicLabels:function(e){L.get("model");o(".dijitRuleLabel.dijitRuleLabelH").forEach(function(t,i){var r=moment(e.timeStops[i]).format("MMM YYYY");a.set(t,"title",r),t.innerHTML.length<=0&&(b.set(t,"width","10px"),b.set(t,"height","20px"),b.set(t,"top","-20px"))})},generateTimeTooltips:function(e){var r="#timeSliderDG .dijitSliderImageHandle",s=o(r);o(".dijitRuleMark.dijitRuleMarkH").forEach(function(t,i){a.set(t,"title",moment(e.timeStops[i]).format("MMM YY"))}),s.forEach(function(e,r){a.set(e,"thumbIndex",r);var s=y.toDom("<div id = 'thumbIndex_"+r+"class='TimeTT' thumbIndex="+r+" ></div>");y.place(s,e,"before"),t(e,i.enter,function(){b.set(s,"display","block")}),t(e,i.leave,function(){b.set(s,"display","none")})}),this.getSliderTicLabels(e);var n=new v({connectId:"timeSliderDG",selector:".dijitSliderImageHandle",defaultPosition:"above",showDelay:1,getContent:function(t){var i=e._slider.valueNode,r=a.get(i,"value").split(","),s=a.get(t,"thumbIndex"),o=r[s],n=100/e.timeStops.length,l=parseInt(o/n);return moment(e.timeStops[l]).format("MMM YY")}});return n},generateTimeSlider:function(e,t,i){var a,s=this,o=!0,n=L.get("model"),l="";if(y.create("div",{id:e},r.byId(t)),!h.byId("timeSliderDG")){a=new M({style:"width: 100%;",id:"timeSliderDG"},r.byId(e));var d=new x;a.setThumbCount(2),a.setThumbMovingRate(2e3),a.setLoop(!0),y.destroy(h.byId(a.nextBtn.id).domNode.parentNode),h.byId(a.previousBtn.id).domNode.style["vertical-align"]="text-bottom",h.byId(a.playPauseBtn.id).domNode.style["vertical-align"]="text-bottom",l=n.dgMoments(),d.startTime=new Date(l[0].format("MM/DD/YYYY")),d.endTime=new Date(l[l.length-1].format("MM/DD/YYYY")),s.filter_footprints("moment",l[0],l[1]),a.createTimeStopsByTimeInterval(d,1,"esriTimeUnitsMonths");var c=d.startTime.getUTCFullYear(),g=a.timeStops.map(function(e,t){return 0===t?c:e.getUTCFullYear()!=c?c=e.getUTCFullYear():""});a.setLabels(g),a.startup();{s.generateTimeTooltips(a)}C.setTimeSlider(a),n.timeSlider=a}n.timeSlider.on("time-extent-change",function(e){var t;setTimeout(function(){C.infoWindow.hide(),t=o?[0,n.timeSlider.thumbIndexes[0]]:[n.timeSlider.thumbIndexes[0],n.timeSlider.thumbIndexes[1]];n.timeSlider.timeStops;"true"==dijit.byId("digital-globe-footprints-checkbox").getValue()&&s.filter_footprints("moment",moment(e.startTime),moment(e.endTime)),e!=n.timeEvent&&m.publish("time-extent-changed"),n.timeEvent=e},0)}),i?"true"==dijit.byId("digital-globe-footprints-checkbox").getValue()&&s.filter_footprints("moment",moment(n.timeEvent.startTime),moment(n.timeEvent.endTime)):n.timeSlider.setThumbIndexes([0,n.timeSlider.timeStops.length-1])},promptAboutDigitalGlobe:function(){h.byId("digitalGlobeInstructions")&&h.byId("digitalGlobeInstructions").destroy();var e,i,a,s,o,d=new l({title:"Digital Globe - First Look",style:"width: 350px",id:"digitalGlobeInstructions",content:"<p>To display an image, click on the image in the list or click on the footprint on the map and select the image from the pop-up.</p><p>Filter the image list by date via the timeline or by map extent via panning or zooming.</p><div class='dijitDialogPaneActionBar'><button id='closeDGInstructions'>Ok</button></div><div class='dialogCheckbox'><input type='checkbox' id='remembershowInstructions' /><label for='rememberBasemapDecision'>Don't show me this again.</label></div>"});i=function(){r.byId("remembershowInstructions")&&r.byId("remembershowInstructions").checked&&n("digitalGlobeInstructions","dontShow",{expires:7})},s=function(e){i(),o&&o.destroy(),a&&a.remove(),e&&d.destroy()},e=n("digitalGlobeInstructions"),void 0===e||"dontShow"!==e?(d.show(),o=new p({checked:!1},"remembershowInstructions"),a=t(r.byId("closeDGInstructions"),"click",function(){s(!0)}),d.on("cancel",function(){s(!1)})):s(!0)},updatePeatLandsLayer:function(e){var t=D.landCoverLayers,i=C.getLayer(t.id),r=[],a="";"peat-lands-radio"===e?(r.push(t.peatLands),a="/"+r.join(",")):r.push(-1),i.setVisibleLayers(r),""!==a?this.toggleLayerVisibility(t.id,"tree-cover-density-radio"===e||"peat-lands-radio"===e,t.id+a):this.toggleLayerVisibility(t.id,"tree-cover-density-radio"===e||"peat-lands-radio"===e)},updateTreeCoverLayer:function(e){this.toggleLayerVisibility(D.treeCoverLayer.id,e)},updatePrimaryForestsLayer:function(e){var t=D.primaryForestsLayer.id,i=C.getLayer(t),r="",a=[];L.set("showPrimaryForestOptions",e),o("#primary-forests-options input:checked").forEach(function(e){a.push(e.value)}),0===a.length&&a.push(-1),i&&i.setVisibleLayers(a),r="/"+a.join(","),this.toggleLayerVisibility(t,e,t+r)},addTemporaryGraphicForDigitalGlobe:function(){var e,t,i;t=new B(100.45,2.015),i=new O({angle:0,xoffset:0,yoffset:10,type:"esriPMS",imageData:"iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADImlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1MzA4NzI3NkQyN0MxMUUwQUU5NUVFMEYwMTY0NzUwNSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1MzA4NzI3N0QyN0MxMUUwQUU5NUVFMEYwMTY0NzUwNSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjUzMDg3Mjc0RDI3QzExRTBBRTk1RUUwRjAxNjQ3NTA1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjUzMDg3Mjc1RDI3QzExRTBBRTk1RUUwRjAxNjQ3NTA1Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQg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",contentType:"image/png",width:24,height:24}),e=new E(t,i,{id:"temp_graphic"}),C.graphics.add(e)},removeDigitalGlobeTemporaryGraphic:function(){g.forEach(C.graphics.graphics,function(e){e.attributes&&"temp_graphic"===e.attributes.id&&C.graphics.remove(e)})},adjustOverlaysLayer:function(){var e=[],t=C.getLayer(D.overlaysLayer.id),i="";o(".overlays-checkboxes .dijitCheckBoxInput").forEach(function(t){switch(t.id){case"provinces-checkbox":t.checked&&e.push(4);break;case"districts-checkbox":t.checked&&e.push(3);break;case"subdistricts-checkbox":t.checked&&e.push(2);break;case"villages-checkbox":t.checked&&e.push(1)}}),0===e.length?(e.push(-1),this.toggleLayerVisibility(D.overlaysLayer.id,!1)):t&&(t.setVisibleLayers(e),i="/"+e.join(","),this.toggleLayerVisibility(D.overlaysLayer.id,!0,D.overlaysLayer.id+i))},setOverlayLayerOrder:function(e){var t=C.getLayer(D.overlaysLayer.id),i=e.target.createDynamicLayerInfosFromLayerInfos();i=i.slice(1),i.reverse(),t.setDynamicLayerInfos(i)},updateLayersInHash:function(e,t,i){var r,a=d.queryToObject(s()),o=a.lyrs,n=o.split(":"),l=n.length,c=0;if("remove"===e){for(c;l>c;c++)n[c].search(t)>-1&&(r=c);void 0!==r&&n.splice(r,1)}else if("add"===e){for(c;l>c;c++)n[c].search(t)>-1&&(r=c);void 0!==r?n.splice(r,1,i):n.push(i)}n=g.filter(n,function(e){return""!==e}),A.updateHash({lyrs:n.join(":")})},removeGraphicWithId:function(e,t){var i,r=C.graphics.graphics;if(g.some(r,function(r){return r.attributes?r.attributes[t]===e?(i=r,!0):!1:void 0}),i){{L.vm.customFeaturesArray.indexOf(i)}L.vm.customFeaturesArray.remove(i),C.graphics.remove(i)}},updateLegend:function(){}}});