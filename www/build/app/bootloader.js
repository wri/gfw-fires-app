!function(s,e){"use strict";function t(){s.dojoConfig=d,p(o);for(var e=r[a],t=0,c=e.length;c>t;t++)u(e[t].src,e[t].cdn);l("app/images/favicon.ico")}var c,n=c||document.location.pathname.replace(/\/[^\/]+$/,"");"/"!==n.slice(-1)&&(n+="/");var a="dev",i="0.7.38",o="http://js.arcgis.com/3.13/init.js",r={dev:[{src:"http://js.arcgis.com/3.13/esri/css/esri.css",cdn:!0},{src:"app/css/app.css",cdn:!1},{src:"app/css/contentPages.css",cdn:!1},{src:"app/css/responsive.css",cdn:!1},{src:"app/css/intlTelInput.css",cdn:!1},{src:"app/css/map.css",cdn:!1},{src:"http://js.arcgis.com/3.13/dijit/themes/tundra/tundra.css",cdn:!0}],pro:[{src:"http://js.arcgis.com/3.13/esri/css/esri.css",cdn:!0},{src:"app/css/app.css",cdn:!1},{src:"app/css/contentPages.css",cdn:!1},{src:"app/css/responsive.css",cdn:!1},{src:"app/css/intlTelInput.css",cdn:!1},{src:"app/css/map.css",cdn:!1},{src:"http://js.arcgis.com/3.13/dijit/themes/tundra/tundra.css",cdn:!0}]},m=n+"app",d={parseOnLoad:!1,isDebug:!1,async:!0,cacheBust:"v="+i,packages:[{name:"libs",location:m+"/libs"},{name:"main",location:m+"/js/main"},{name:"modules",location:m+"/js/modules"},{name:"views",location:m+"/js/views"},{name:"utils",location:m+"/js/utils"}],aliases:[["knockout","libs/knockout-3.2.0"],["dom-style","dojo/dom-style"],["dom-class","dojo/dom-class"],["topic","dojo/topic"],["dom","dojo/dom"],["on","dojo/on"],["jquery","http://code.jquery.com/jquery-2.1.1.min.js"]],deps:["main/Main","dojo/domReady!"],callback:function(s){s.init()}},p=function(s,t){var c=e.createElement("script"),n=e.getElementsByTagName("head")[0];c.setAttribute("src",s);for(var a in t)t.hasOwnProperty(a)&&c.setAttribute(a,t[a]);n.appendChild(c)},u=function(s,t){var c=e.createElement("link"),n=t?s:s+"?v="+i,a=e.getElementsByTagName("head")[0];c.setAttribute("rel","stylesheet"),c.setAttribute("type","text/css"),c.setAttribute("href",n),c.media="only x",a.appendChild(c),setTimeout(function(){c.media="all"})},l=function(s){var t=e.createElement("link"),c=e.getElementsByTagName("head")[0];t.setAttribute("rel","shortcut icon"),t.setAttribute("type","image/png"),t.setAttribute("href",s),c.appendChild(t),setTimeout(function(){t.media="all"})};s.requestAnimationFrame=function(){return s.requestAnimationFrame||s.webkitRequestAnimationFrame||s.mozRequestAnimationFrame||s.oRequestAnimationFrame||s.msRequestAnimationFrame}(),s.requestAnimationFrame?s.requestAnimationFrame(t):"loaded"===e.readyState?t():s.onload=t}(window,document);