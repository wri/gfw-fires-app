/*! Global-Forest-Watch-Fires Fri Dec 12 2014 13:07:19 */
!function(a,b){"use strict";function c(){a.dojoConfig=i,j(f);for(var b=g[d],c=0,e=b.length;e>c;c++)k(b[c].src,b[c].cdn);l("app/images/favicon.ico")}var d="dev",e="0.1.8",f="http://js.arcgis.com/3.10/",g={dev:[{src:"http://js.arcgis.com/3.10/js/esri/css/esri.css",cdn:!0},{src:"app/css/app.css",cdn:!1},{src:"app/css/contentPages.css",cdn:!1},{src:"app/css/responsive.css",cdn:!1},{src:"app/css/intlTelInput.css",cdn:!1},{src:"app/css/map.css",cdn:!1},{src:"http://js.arcgis.com/3.8/js/dojo/dijit/themes/tundra/tundra.css",cdn:!0}],pro:[{src:"http://js.arcgis.com/3.10/js/esri/css/esri.css",cdn:!0},{src:"app/css/app.css",cdn:!1},{src:"app/css/contentPages.css",cdn:!1},{src:"app/css/responsive.css",cdn:!1},{src:"app/css/intlTelInput.css",cdn:!1},{src:"app/css/map.css",cdn:!1},{src:"http://js.arcgis.com/3.8/js/dojo/dijit/themes/tundra/tundra.css",cdn:!0}]},h=location.pathname.replace(/\/[^/]+$/,"")+"/app",i={parseOnLoad:!1,isDebug:!1,textPluginHeaders:{"X-Requested-With":null},async:!0,cacheBust:"v="+e,packages:[{name:"libs",location:h+"/libs"},{name:"main",location:h+"/js/main"},{name:"modules",location:h+"/js/modules"},{name:"views",location:h+"/js/views"},{name:"utils",location:h+"/js/utils"}],aliases:[["knockout","libs/knockout-3.1.0"],["dom-style","dojo/dom-style"],["dom-class","dojo/dom-class"],["topic","dojo/topic"],["dom","dojo/dom"],["on","dojo/on"]],deps:["main/Main","dojo/domReady!"],callback:function(a){a.init()}},j=function(a,c){var d=b.createElement("script"),e=b.getElementsByTagName("head")[0];d.setAttribute("src",a);for(var f in c)c.hasOwnProperty(f)&&d.setAttribute(f,c[f]);e.appendChild(d)},k=function(a,c){var d=b.createElement("link"),f=c?a:a+"?v="+e,g=b.getElementsByTagName("head")[0];d.setAttribute("rel","stylesheet"),d.setAttribute("type","text/css"),d.setAttribute("href",f),d.media="only x",g.appendChild(d),setTimeout(function(){d.media="all"})},l=function(a){var c=b.createElement("link"),d=b.getElementsByTagName("head")[0];c.setAttribute("rel","shortcut icon"),c.setAttribute("type","image/png"),c.setAttribute("href",a),d.appendChild(c),setTimeout(function(){c.media="all"})};a.requestAnimationFrame=function(){return a.requestAnimationFrame||a.webkitRequestAnimationFrame||a.mozRequestAnimationFrame||a.oRequestAnimationFrame||a.msRequestAnimationFrame}(),a.requestAnimationFrame?a.requestAnimationFrame(c):"loaded"===b.readyState?c():a.onload=c}(window,document);