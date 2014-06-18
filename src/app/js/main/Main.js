/* global define, alert */
define([
	"on",
	"dom",
	"topic",
	"dom-class",
	"dojo/query",
	"dojo/_base/array",
	// Call Necessary Layout Widgets Here
	"dojox/mobile/parser",
	"dijit/layout/StackContainer",	
	"dijit/layout/ContentPane"
], function (on, dom, topic, domClass, dojoQuery, arrayUtils, parser) {

	var map;

	return {

		init: function () {
			parser.parse();
		}

	};

});