/*! Global-Forest-Watch-Fires Fri Dec 12 2014 09:48:52 */
define(["dojo/hash","dojo/topic","dojo/_base/lang","dojo/io-query","main/Config","dojo/_base/array","modules/EventsController"],function(a,b,c,d,e,f,g){var h=window.location.href,i={},j={};i.newState={};var l=c.clone(e.defaultState);console.log(l);for(k in l)l[k]="";return j=l,i.init=function(){var a,c=this,g=2==h.split("#").length&&h.split("#")[1].length>1;if(a=g?d.queryToObject(h.split("#")[1]):e.defaultState,g){var i=a.v&&f.indexOf(e.validViews,a.v)>-1;i?a.dirty?delete a.dirty:a.dirty="true":a=e.defaultState}b.subscribe("/dojo/hashchange",function(a){var b=d.queryToObject(a),e=j;c.handleHashChange(b,e)}),c.updateHash(a),require(["views/footer/FooterController","views/header/HeaderController"],function(a,b){a.init(),b.init()})},i.handleHashChange=function(a,b){var c=this;i.newState=a;var d=b.v!=a.v,e="map"==a.v,f=b.x!=a.x||b.y!=a.y||b.y!=a.y;d&&c.changeView(a.v,b.v),e&&f&&g.centerChange(a),j=a},i.updateHash=function(b){var e=c.clone(j);c.mixin(e,b),require(["views/header/HeaderModel","views/footer/FooterModel"],function(a,b){a.vm.appState(e),b.vm.appState(e)});var f=d.objectToQuery(e);console.log(f),a(f)},i.changeView=function(a){var b={v:a};switch(console.log(a),a){case"home":require(["views/home/HomeController"],function(a){a.init(b)});break;case"map":require(["views/map/MapController"],function(a){a.init(b)});break;case"blog":require(["views/blog/BlogController"],function(a){a.init(b)});break;case"about":require(["views/about/AboutController"],function(a){a.init(b)});break;case"data":require(["views/data/DataController"],function(a){a.init(b)});break;case"story":require(["views/story/StoryController"],function(a){a.init(b)})}},i.getHash=function(){return d.queryToObject(a())},i});