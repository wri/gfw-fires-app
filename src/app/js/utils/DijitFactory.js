/* global define, debug */
define([
  "dojo/dom",
  "dojo/_base/array",
  "dijit/registry",
  "dojo/Deferred",
  "dijit/layout/AccordionContainer",
  "dijit/layout/ContentPane",
  "dijit/form/HorizontalSlider"
],
  function(dom, arrayUtils, registry, Deferred, Accordion, ContentPane, HorizontalSlider){

    return {

      buildFromJSON: function (dijit) {

        var item, panel;
        switch (dijit.type) {
          case "accordion":
            item = new Accordion(dijit.props, dijit.id);
            if (dijit.hasOwnProperty('children')) {              
              arrayUtils.forEach(dijit.children, function (child) {
                item.addChild(new ContentPane(child.props, child.id));
              });
            }
            item.startup();
            item.resize();
            break;
          case "contentpane":
            item = new ContentPane(dijit.props, dijit.id);
            break;
          case "horizontal-slider":
            item = new HorizontalSlider(dijit.props, dijit.id);
            break;
        }
      },

      buildDijits: function (dijits) {
        var self = this;
        arrayUtils.forEach(dijits, function (dijitJSON) {
          self.buildFromJSON(dijitJSON);
        });
      }

    };
});