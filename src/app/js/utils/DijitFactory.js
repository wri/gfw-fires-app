/* global define, debug */
define([
  "dojo/dom",
  "dojo/_base/array",
  "dijit/registry",
  "dojo/Deferred",
  "dijit/layout/AccordionContainer",
  "dijit/layout/ContentPane"
],
  function(dom, arrayUtils, registry, Deferred, Accordion, ContentPane){

    var item;

    return {

      buildFromJSON: function (dijit) {

        var panel;
        switch (dijit.type) {
          case "accordion":
            item = new Accordion(dijit.props, dijit.id);
            break;
          case "contentpane":
            if (dijit.hasOwnProperty("parent")) {
              panel = new ContentPane(dijit.props, dijit.id);
              item.addChild(panel);
            } else {
              item = new ContentPane(dijit.props, dijit.id);
            }
            break;
        }
      },

      buildDijits: function (dijits) {
        var self = this;
        arrayUtils.forEach(dijits, function (dijitJSON) {
          self.buildFromJSON(dijitJSON);
        });  
        item.startup();
        item.resize();
      }

    };
});