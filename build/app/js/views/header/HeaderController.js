/*! Global-Forest-Watch-Fires Thu Dec 11 2014 14:55:24 */
define(["dojo/dom","dijit/registry","modules/HashController","dojo/_base/array","dojo/dom-construct","dojo/dom-class","dojo/aspect","dojo/on","dojo/query"],function(a,b,c,d,e,f,g,h,i){var j={},k=!1,l="app-header";return j.init=function(){var b=this;k||(k=!0,require(["dojo/text!views/header/header.html","views/header/HeaderModel"],function(c,d){a.byId(l).innerHTML=c,d.applyBindings(l),h(a.byId("logo"),"click",function(){var a={domId:"homeView",html:"Home",selected:!0,viewId:"homeView",viewName:"home"};b.clickNavLink(a)}),function(a,b){var c=a.createElement(b),d=a.getElementsByTagName(b)[0];c.type="text/javascript",c.async=!0,c.src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit",d.parentNode.insertBefore(c,d)}(document,"script")}))},j.dataLoaded=function(){},j.clickNavLink=function(a){var b=a;if(this.reportAnalyticsHelper("link","navigate","The user navigated to the "+b.html+" page."),b.url)return void window.open(b.url,"_blank");var d={v:b.viewName};c.updateHash(d)},j.switchToView=function(a){require(["dijit/registry","views/header/HeaderModel","views/home/HomeController","modules/EventsController"],function(b,c){var g=c.vm.navigationLinks();c.vm.navigationLinks([]);var h=d.map(g,function(b){return b.selected=a.viewId.toLowerCase()===b.domId.toLowerCase()?!0:!1,b});c.vm.navigationLinks(h);var j="mapView homeView blogView dataView aboutView storyView";switch(f.remove("app-body",j),f.add("app-body",a.viewId),f.remove("app-header",j),f.add("app-header",a.viewId),a.viewId){case"homeView":setTimeout(function(){e.place("footerMovableWrapper","footerShareContainer")},1e3);break;default:e.place("footerMovableWrapper",a.viewId)}i(".dijitHidden.initialHide").forEach(function(a){f.remove(a,"dijitHidden")}),b.byId("stackContainer").selectChild(a.viewId),b.byId("stackContainer").resize()})},j.reportAnalyticsHelper=function(a,b,c){ga("A.send","event",a,b,c),ga("B.send","event",a,b,c)},j});