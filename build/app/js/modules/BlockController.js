/*! Global-Forest-Watch-Fires Fri Dec 12 2014 09:48:52 */
define(["dojo/dom-construct","dojo/dom-class","dojo/dom"],function(a,b,c){var d={},e={"class":"blocker"},f={};return d.show=function(b){f[b]=a.create("div",e,c.byId(b))},d.hide=function(b){a.destroy(f[b])},d});