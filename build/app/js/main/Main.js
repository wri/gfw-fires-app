define(["dojo/on","dojo/dom","dojo/topic","dom-class","dojo/query","dojo/_base/array","esri/config","main/Config","dojox/mobile/parser","dojox/mobile","dojox/mobile/compat","dijit/layout/StackContainer","dijit/layout/ContentPane"],function(o,e,r,i,n,t,a,d,l){var s={};return s.init=function(){l.parse(),a.defaults.io.corsEnabledServers.push("www.wri.org"),a.defaults.io.corsEnabledServers.push(d.emailSubscribeUrl),require(["modules/ErrorController","modules/HashController"],function(o,e){e.init(),o.init()})},s});