define(['exports', 'react'], function (exports, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = DraggableModalWrapper;

  var _react2 = _interopRequireDefault(_react);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var closeSvg = '<use xlink:href="#shape-close" />';

  /**
  * Should be wrapped in a component with relative or absolute position
  */
  function DraggableModalWrapper(props) {
    // const contentClass = `${props.theme ? props.theme : ''}`;
    return _react2.default.createElement(
      'article',
      { id: 'draggableModal', className: 'modal draggable', style: { position: 'absolute', top: '75px', zIndex: '1000', left: '375px', backgroundColor: 'white' } },
      ' ',
      _react2.default.createElement(
        'div',
        { title: 'close', className: 'close-icon pointer', onClick: props.onClose },
        _react2.default.createElement('svg', { dangerouslySetInnerHTML: { __html: closeSvg } })
      ),
      _react2.default.createElement(
        'div',
        null,
        props.children
      )
    );
  }

  //  DraggableModalWrapper.propTypes = {
  //   onClose: PropTypes.func.isRequired,
  //   theme: PropTypes.string
  // };
});