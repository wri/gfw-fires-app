define(['exports', 'react'], function (exports, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.CalendarSvg = exports.BasemapSvg = exports.TimelineSvg = exports.ImagerySvg = exports.DrawSvg = exports.AnalysisSvg = exports.AlertsSvg = undefined;
  exports.createSvgById = createSvgById;

  var _react2 = _interopRequireDefault(_react);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function createSvgById(svgId) {
    var __html = '<use xlink:href=\'#' + svgId + '\' />';
    return _react2.default.createElement('svg', { dangerouslySetInnerHTML: { __html: __html } });
  }

  var AlertsSvg = exports.AlertsSvg = function AlertsSvg() {
    return createSvgById('icon-alerts');
  };
  var AnalysisSvg = exports.AnalysisSvg = function AnalysisSvg() {
    return createSvgById('icon-analysis');
  };
  var DrawSvg = exports.DrawSvg = function DrawSvg() {
    return createSvgById('icon-analysis-draw');
  };
  var ImagerySvg = exports.ImagerySvg = function ImagerySvg() {
    return createSvgById('icon-tab-highresolution');
  };
  var TimelineSvg = exports.TimelineSvg = function TimelineSvg() {
    return createSvgById('icon-timeline');
  };
  var BasemapSvg = exports.BasemapSvg = function BasemapSvg() {
    return createSvgById('icon-basemap');
  };
  var CalendarSvg = exports.CalendarSvg = function CalendarSvg() {
    return createSvgById('icon-calendar');
  };
});