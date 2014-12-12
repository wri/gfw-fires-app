/*! Global-Forest-Watch-Fires Fri Dec 12 2014 09:48:52 */
define(["dojo/dom","dijit/registry","dojo/query","modules/HashController","modules/EventsController","views/home/HomeModel","dojo/_base/array","views/map/LayerController","views/map/MapConfig"],function(dom,domQuery,registry,HashController,EventsController,HomeModel,arrayUtil,LayerController,MapConfig){var o={},initialized=!1,viewName="homeView",viewObj={viewId:"homeView",viewName:"home"},stopAnimation=!1;return o.init=function(){return initialized?(EventsController.switchToView(viewObj),void EventsController.startModeAnim()):void require(["dojo/text!views/home/home.html"],function(a){initialized=!0,dom.byId(viewName).innerHTML=a,EventsController.switchToView(viewObj),HomeModel.applyBindings(viewName),EventsController.getPeats()})},o.startModeAnim=function(){console.log("start mode animation"),stopAnimation=!1;var a=1,b=function(a){var b=HomeModel.vm.homeModeOptions(),c=arrayUtil.map(b,function(b,c){return b.display=c===a?!0:!1,b});HomeModel.vm.homeModeOptions([]),HomeModel.vm.homeModeOptions(c)};b(a),require(["dojo/fx","dojo/_base/fx","dojo/query"],function(c,d,e){var f=function(g){var h=e(".modeGroup"),i=h.length,j=c.chain([d.animateProperty({node:h[g],properties:{marginLeft:{start:0,end:-350},opacity:{start:1,end:0}},onEnd:function(){var c;i-1>a?(c=a+1,a++):(c=0,a=0),setTimeout(function(){b(c),stopAnimation||setTimeout(function(){f(c)},4e3)},500)},units:"px",duration:500})]);j.play()};f(a)})},o.getPeats=function(){require(["modules/Loader","modules/ErrorController","dojo/promise/all"],function(a,b,c){var d=new Date,e=new Date;e.setDate(d.getDate()-8);var f=e.getFullYear(),g="00"+(e.getMonth()+1).toString();g=g.substr(g.length-2);var h="00"+e.getDate().toString();h=h.substr(h.length-2);var i=f.toString()+"-"+g+"-"+h,j={layer:"http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer/0",where:"peat = 1 AND ACQ_DATE > date '"+i+" 12:00:00'",type:"executeForCount"},k=a.query(j),l={layer:"http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer/0",where:"ACQ_DATE > date '"+i+" 12:00:00'",type:"executeForCount"},m=a.query(l);c([k,m]).then(function(a){var b=a[0],c=a[1],d=Math.round(b/c*100),e=HomeModel.vm.homeModeOptions(),f=0,g="";arrayUtil.some(e,function(a,b){var c=a.html.indexOf("Fires occuring in peatland")>-1;return c&&(f=b,g=a.html.replace("Fires occuring in peatland","<p>"+d.toString()+" %</p> Fires occuring in peatland")),c}),e[f].html=g,HomeModel.vm.homeModeOptions(e),EventsController.startModeAnim()})})},o.stopModeAnim=function(){stopAnimation=!0,console.log("stop mode animation ")},o.getAnimStatus=function(){return stopAnimation},o.modeSelect=function(data){var selectedMode=data;eval("EventsController."+selectedMode.eventName+"()"),data.html&&data.html.search("latest imagery")>-1&&setTimeout(function(){LayerController.updateLayersInHash("add",MapConfig.digitalGlobe.id,MapConfig.digitalGlobe.id),registry.byId("digital-globe-checkbox")&&registry.byId("digital-globe-checkbox").set("checked",!0)},0)},o.isInitialized=function(){return initialized},o});