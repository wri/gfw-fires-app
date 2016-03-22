define(["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var utils = {
    /**
    * Generate a date query for active fires layers
    * @param {number} filterValue - Numeric value representing the number of days to show in the output query
    * @return {string} Query String to use for Fires Filter
    */
    generateFiresQuery: function generateFiresQuery(filterValue) {
      // The service only has data for the last week, so if filter is 7 days, just set to 1 = 1
      if (filterValue >= 7) {
        return '1 = 1';
      }

      var date = new Date();
      // Set the date to filterValue amount of days before today
      date.setDate(date.getDate() - filterValue);
      var dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      return "ACQ_DATE > date '" + dateString + "'";
    },

    generateImageryQuery: function generateImageryQuery(queryStringArray) {
      // The service only has data for the last week, so if filter is 7 days, just set to 1 = 1
      console.log(queryStringArray);
      // debugger
      var startDate = queryStringArray[0];
      var endDate = queryStringArray[1];

      return "AcquisitionDate > '" + startDate + "' AND AcquisitionDate <= '" + endDate + "'";

      // let dateString = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      // return `AcquisitionDate > date '${dateString}'`;
    },

    /**
    * Retrieve the object from a given array based on id and value
    * @param {array} - items - Array to search
    * @param {string} - field - Property of unique identifier in object
    * @param {string} - value - value of the unique id
    * @return {Any} - Return whatever object is matched or undefined for no match
    */
    getObject: function getObject(items, field, value) {
      var obj = void 0;
      items.some(function (item) {
        if (item[field] === value) {
          obj = item;
          return true;
        }
      });
      return obj;
    },

    /**
    * Checks to make sure lat and lng are within global bounds
    * @param {number} lat - Latitude
    * @param {number} lon - Longitude
    * @return {boolean}
    */
    validLatLng: function validLatLng(lat, lon) {
      return lat > -90 && lat < 90 && lon > -180 && lon < 180;
    },

    /**
    * Return true if the document.execCommand exists
    * @return {boolean}
    */
    supportsExecCommand: function supportsExecCommand() {
      return typeof document !== 'undefined' && !!document.execCommand;
    },

    /**
    * Return true if we can succesfully copy item to clipboard, this will query element
    * and try to put the focus on it so we can copy it correctly
    * @param {HTML element} el - Input element
    * @return {boolean}
    */
    copySelectionFrom: function copySelectionFrom(el) {
      var status = false;
      if (!utils.supportsExecCommand()) {
        return status;
      }
      // Highlight the input
      el.select();
      // This may not work in all scenarios, wrap in a try catch to prevent any errors
      // and handle accordingly
      try {
        status = document.execCommand('copy');
      } catch (err) {
        console.error(err);
      }
      return status;
    },

    clone: function clone(sourceObject) {
      return JSON.parse(JSON.stringify(sourceObject));
    }

  };

  exports.default = utils;
});