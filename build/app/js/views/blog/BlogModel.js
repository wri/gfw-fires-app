/*! Global-Forest-Watch-Fires Fri Dec 12 2014 12:17:24 */
define(["knockout","main/Config","dojo/dom"],function(a,b,c){var d={};d.vm={};var e=d.vm;return e.blogPost=a.observableArray([]),e.homeTitle=a.observable(b.homeTitle),d.applyBindings=function(b){a.applyBindings(e,c.byId(b))},e.getAllPost=function(){return d.vm.blogPost()[0].articles},d});