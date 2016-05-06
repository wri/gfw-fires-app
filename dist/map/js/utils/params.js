define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.toObject = toObject;
  exports.toQuery = toQuery;
  exports.getUrlParams = getUrlParams;
  /**
  * Convert a paramterized string to an object
  * @param {string} querystring - Query string to be expanded into an object
  */
  function toObject(querystring) {
    if (!querystring) {
      return {};
    }
    var result = {};
    var pairs = querystring.split('&').map(function (item) {
      return item.split('=').map(function (str) {
        return decodeURIComponent(str);
      });
    });
    // Should have an array of arrays now, ex: [['a','b'], ['foo','bar']]
    pairs.forEach(function (pair) {
      if (!pair[0] || !pair[1]) {
        console.warn('You provided an invalid key-value pair, ' + pair[0] + ' is being omitted.');
        return;
      }
      result[pair[0]] = pair[1];
    });
    return result;
  }

  /**
  * Convert an object to a string, not the same as JSON.stringify, converts to POST format, ex: key=value&foo=bar
  * @param {object} json - A json object to be flattened into a string
  */
  function toQuery(json, noEncode) {
    var errorMsg = 'You should not be converting nested objects as they wont encode properly. Try making it a string first.';
    var result = [];
    for (var key in json) {
      if (Object.prototype.toString.call(json[key]) === '[object Object]') {
        throw new Error(errorMsg);
      }
      if (noEncode) {
        result.push(key + '=' + json[key]);
      } else {
        result.push(encodeURIComponent(key) + '=' + encodeURIComponent(json[key]));
      }
    }
    return result.join('&');
  }

  /**
  * Return the query parameters from the provided string
  * @param {string} path - Path to pull querystring from, should be location.href
  * @return {object} - Dictionary containiner the url parameters
  */
  function getUrlParams(path) {
    if (!path) {
      return {};
    }
    var bits = path.split('#');
    var querystring = bits.length > 1 ? bits[1] : '';
    return toObject(querystring);
  }
});