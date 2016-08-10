define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var DateHelper = function () {
    function DateHelper() {
      _classCallCheck(this, DateHelper);
    }

    _createClass(DateHelper, [{
      key: 'getDate',
      value: function getDate(date) {
        var whatDay = this.getDayOfWeek(date);
        var whatMonth = this.getMonth(date);
        var fullDate = whatDay + ', ' + date.date() + ' ' + whatMonth + ' ' + date.year();
        return fullDate;
      }
    }, {
      key: 'getDayOfWeek',
      value: function getDayOfWeek(date) {
        var dayOfWeek = void 0;
        switch (date.day()) {
          case 0:
            dayOfWeek = 'Sunday';
            break;
          case 1:
            dayOfWeek = 'Monday';
            break;
          case 2:
            dayOfWeek = 'Tuesday';
            break;
          case 3:
            dayOfWeek = 'Wednesday';
            break;
          case 4:
            dayOfWeek = 'Thursday';
            break;
          case 5:
            dayOfWeek = 'Friday';
            break;
          case 6:
            dayOfWeek = 'Saturday';
            break;
        }
        return dayOfWeek;
      }
    }, {
      key: 'getMonth',
      value: function getMonth(date) {
        var month = void 0;
        switch (date.month()) {
          case 0:
            month = 'January';
            break;
          case 1:
            month = 'February';
            break;
          case 2:
            month = 'March';
            break;
          case 3:
            month = 'April';
            break;
          case 4:
            month = 'May';
            break;
          case 5:
            month = 'June';
            break;
          case 6:
            month = 'July';
            break;
          case 7:
            month = 'August';
            break;
          case 8:
            month = 'September';
            break;
          case 9:
            month = 'October';
            break;
          case 10:
            month = 'November';
            break;
          case 11:
            month = 'December';
            break;
        }
        return month;
      }
    }]);

    return DateHelper;
  }();

  exports.default = new DateHelper();
});