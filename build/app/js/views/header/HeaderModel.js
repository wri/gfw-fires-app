define(["knockout","main/Config","dojo/dom","modules/EventsController"],function(e,n,a,i){var o={};o.vm={};var r=o.vm;return r.headerTitle=e.observable(n.headerTitle),r.headerDesc=e.observable(n.headerDesc),r.navigationLinks=e.observableArray(n.navigationLinks),r.appState=e.observable({}),r.showFullHeader=e.observable(!1),r.clickNavLink=function(e){i.clickNavLink(e)},o.applyBindings=function(n){e.applyBindings(r,a.byId(n))},o});