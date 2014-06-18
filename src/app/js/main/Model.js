/* global define */
define([
  "dojo/_base/declare",
  "knockout",
  "main/Config",
  "dom"
],
function (declare, ko, Config, dom) {

  var Model = declare(null, {

    constructor: function (el) {
      Model.vm = {};
      Model.root = el;

      // Create Model Properties
      // Model.vm.titleAccentOne = ko.observable(Config.Title.accent1);

      // Apply Bindings upon initialization
      ko.applyBindings(Model.vm,dom.byId(el));
    }

  });

  Model.get = function (item) {
    return item === 'model' ? Model.vm : Model.vm[item]();
  };

  Model.set = function (item, value) {
    Model.vm[item](value);
  };

  Model.applyTo = function(el) {
    ko.applyBindings(Model.vm,dom.byId(el));
  };

  Model.initialize = function (el) {
    if (!Model.instance) {
      Model.instance = new Model(el);
    }
    return Model;
  };

  return Model;

});