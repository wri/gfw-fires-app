/*! Global-Forest-Watch-Fires Fri Dec 12 2014 12:17:24 */
define(["dojo/_base/declare","knockout","main/Config","dom"],function(a,b,c,d){var e=a(null,{constructor:function(a){e.vm={},e.root=a,b.applyBindings(e.vm,d.byId(a))}});return e.get=function(a){return"model"===a?e.vm:e.vm[a]()},e.set=function(a,b){e.vm[a](b)},e.applyTo=function(a){b.applyBindings(e.vm,d.byId(a))},e.initialize=function(a){return e.instance||(e.instance=new e(a)),e},e});