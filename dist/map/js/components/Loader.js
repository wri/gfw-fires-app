define(['exports', 'react'], function (exports, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;

  var _react2 = _interopRequireDefault(_react);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var Loader = function Loader(props) {
    return _react2.default.createElement(
      'div',
      { className: '' + (props.active ? 'app-loader__active' : 'app-loader') },
      _react2.default.createElement(
        'div',
        { className: 'app-loader__spinner' },
        _react2.default.createElement('svg', { width: '50', height: '50', dangerouslySetInnerHTML: {
            __html: '<g transform="translate(25,25) rotate(-90)"><path d="M0,25A25,25 0 1,1 0,-25A25,25 0 1,1 0,25M0,20A20,20 0 1,0 0,-20A20,20 0 1,0 0,20Z" style="fill: rgb(255, 255, 255); stroke: rgb(204, 204, 204);"></path><path class="foreground" d="M1.5308084989341915e-15,-25A25,25 0 0,1 25,0L20,0A20,20 0 0,0 1.2246467991473533e-15,-20Z" style="fill: rgb(85, 85, 85);" transform="rotate(709.287459262793)"></path></g>'
          } })
      )
    );
  };

  exports.default = Loader;
});