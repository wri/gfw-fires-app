define(["dojo/topic"],
    function(topic) {

        var o = {};

        o.events = {

            //home events
            "startModeAnim": "startModeAnim",
            "stopModeAnmin": "stopModeAnmin",
            "modeSelect": "modeSelect",







            //map events
            "createUI": "createUI",


            //blog events


            //data events
            "toggleDataNavList": "toggleDataNavList",

            //about events
            "toggleAboutNavList": "toggleAboutNavList",

            //header events
            "clickNavLink": "clickNavLink",
            "switchToView": "switchToView",


            //footer events
            "footerSelect": "footerSelect",
            "goToBlog": "goToBlog",
            "goToMap": "goToMap",
            "goToTweet": "goToTweet"



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


        topic.subscribe("modeSelect", function(dataObj) {
            require(["views/home/HomeController"], function(HomeController) {
                HomeController.modeSelect(dataObj)
            })
        });

        topic.subscribe("footerSelect", function(dataObj) {
            require(["views/footer/FooterController"], function(FooterController) {
                FooterController.footerSelect(dataObj)
            })
        });

        topic.subscribe("goToBlog", function(dataObj) {
            require(["views/header/HeaderController"], function(HeaderController) {
                HeaderController.switchToView({
                    viewName: "blogView"
                });
                HeaderController.clickNavLink({
                    viewId: "blog"
                });
            })
        });

        topic.subscribe("goToMap", function(dataObj) {
            require(["views/header/HeaderController"], function(HeaderController) {
                HeaderController.switchToView({
                    viewName: "mapView"
                });
                HeaderController.clickNavLink({
                    viewId: "map"
                });
            })
        });

        topic.subscribe("goToTweet", function(dataObj) {
            require(["views/footer/FooterController"], function(FooterController) {
                FooterController.goToTweet(dataObj)
            })
        });

        topic.subscribe("toggleDataNavList", function(obj) {
            require(["views/data/DataController"], function(DataController) {
                DataController.toggleDataNavList(obj);
            });
        });

        topic.subscribe("toggleAboutNavList", function(obj) {
            require(["views/about/AboutController"], function(AboutController) {
                AboutController.toggleAboutNavList(obj);
            });
        });

        return o;


    });