define([], function() {
    'use strict';

    return {

        /**
         * Send an event to Google Analytics
         * @param {string} category - Category of an event, all should be 'Event'
         * @param {string} action - Type of action performed
         * @param {string} label - label describing the action
         * @param {string | number} value - value associated with the action, usually 1
         */
        sendEvent: function(category, action, label, value) {

            var payload = {
                'hitType': 'event',
                'eventCategory': category,
                'eventAction': action,
                'eventLabel': label,
                'eventValue': value
            };

            if (ga) {
                ga('A.send', payload);
                ga('B.send', payload);
                ga('C.send', payload);
            }

        },

        /**
         * Send a pageview to Google Analytics
         * @param {string} - [overrideUrl] - Override the page url and send in a different url
         * @param {string} - [overrideTitle] - Override the page title and send in a different title
         */
        sendPageview: function(overrideUrl, overrideTitle) {
            var payload = {
                'hitType': 'pageview'
            };

            // Add in url if it needs to be overwritten
            if (overrideUrl) {
                payload.page = overrideUrl;
            }

            // Add in title if it needs to be overwritten
            if (overrideTitle) {
                payload.title = overrideTitle;
            }

            if (ga) {
                ga('A.send', payload);
                ga('B.send', payload);
                ga('C.send', payload);
            }

        }

    };

});