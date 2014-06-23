define(["dojo/topic"],
    function(topic) {

        var o = {};

        o.init = function() {

        }

        o.events = {

            //home events
            "dataLoaded": "dataLoaded",





            //map events
            "createUI": "createUI",


            //blog events
            "queryTree": "queryTree",
            "clearAll": "clearAll",
            "getHtml":"getHtml",


            //data events
            "selectLayer111": "selectLayer111",


            //about events
            "selectLayer": "selectLayer",
            "initModel": "initModel"

        };


        //handle publishing
        for (var eventName in o.events) {
            o[eventName] = (function(e) {
                return function(dataObj) {
                    topic.publish(e, dataObj);
                }
            })(eventName)
        }

        //register subscribtion
        topic.subscribe("dataLoaded", function(dataObj) {
            require(["views/header/HeaderController"], function(HeaderController) {
                HeaderController.dataLoaded(dataObj)
            })
        });

         topic.subscribe("getHtml", function(dataObj) {
            require(["views/blog/BlogController"], function(BlogController) {
                BlogController.getHtml(dataObj)
            })
        })

        //listen to key

        //trigger event 


        return o;


    });