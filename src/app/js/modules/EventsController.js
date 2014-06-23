define(["dojo/topic"],
    function(topic) {

        var o = {};

        o.events = {

            //home events
            "dataLoaded": "dataLoaded",
            "startModeAnim": "startModeAnim",
            "stopModeAnmin": "stopModeAnmin",







            //map events
            "createUI": "createUI",


            //blog events
            "queryTree": "queryTree",
            "clearAll": "clearAll",


            //data events
            "selectLayer111": "selectLayer111",


            //about events
            "selectLayer": "selectLayer",
            "initModel": "initModel",

            //header events
            "clickNavLink": "clickNavLink",
            "switchToView": "switchToView"

        };


        //handle publishing
        for (var eventName in o.events) {
            o[eventName] = (function(e) {
                return function(dataObj) {
                    topic.publish(e, dataObj);
                };
            })(eventName);
        }

        //register subscribtion
        topic.subscribe("clickNavLink", function(dataObj) {
            console.log(dataObj);
            require(["views/header/HeaderController"], function(HeaderController) {
                HeaderController.clickNavLink(dataObj);
            });
        });

        topic.subscribe("switchToView", function(dataObj) {
            console.log(dataObj);
            require(["views/header/HeaderController"], function(HeaderController) {
                HeaderController.switchToView(dataObj);
            });
        });

        topic.subscribe("startModeAnim", function(dataObj) {
            //console.log(dataObj);
            require(["views/home/HomeController"], function(HomeController) {
                HomeController.startModeAnim();
            });
        });

        topic.subscribe("stopModeAnmin", function(dataObj) {
            //console.log(dataObj);
            require(["views/home/HomeController"], function(HomeController) {
                HomeController.stopModeAnmin();
            });
        });





        return o;


    });