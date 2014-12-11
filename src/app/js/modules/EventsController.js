define(["dojo/topic"],
    function(topic) {

        var o = {};

        o.events = {

            //home events
            "startModeAnim": "startModeAnim",
            "stopModeAnim": "stopModeAnim",
            "modeSelect": "modeSelect",
            "getPeats": "getPeats",





            //map events
            "createUI": "createUI",
            "centerChange": "centerChange",


            //blog events


            //data events
            "toggleDataNavList": "toggleDataNavList",

            //about events
            "toggleAboutNavList": "toggleAboutNavList",

            //story events
            "toggleStoryNavList": "toggleStoryNavList",

            //header events
            "clickNavLink": "clickNavLink",
            "switchToView": "switchToView",


            //footer events
            "footerSelect": "footerSelect",
            "goToBlog": "goToBlog",
            "subscribeToAlerts": "subscribeToAlerts",
            "goToMap": "goToMap",
            "goToAnalysis": "goToAnalysis",
            "goToTomnod": "goToTomnod",
            "goToStory": "goToStory",

            "goToTweet": "goToTweet",
            "initShareButton": "initShareButton"



        };

        var publisher = function(evtName) {
            return function(dataObj) {
                topic.publish(evtName, dataObj);
            };
        };


        //handle publishing
        for (var eventName in o.events) {
            o[eventName] = publisher(eventName);
        }

        //register subscribtion
        topic.subscribe("centerChange", function(dataObj) {
            require(["views/map/MapController"], function(MapController) {
                MapController.centerChange(dataObj);
            });
        });

        topic.subscribe("time-extent-changed", function(dataObj) {
            //if (dijit.byId("digital-globe-footprints-checkbox").getValue() == 'true') {
            //console.log("time changed from events");
            //console.log('');
            require(["views/map/MapController"], function(MapController) {
                MapController.updateImageryList(dataObj);
            });
            //}
        });

        topic.subscribe("clickNavLink", function(dataObj) {
            require(["views/header/HeaderController"], function(HeaderController) {
                HeaderController.clickNavLink(dataObj);
            });
        });

        topic.subscribe("switchToView", function(dataObj) {
            require(["views/header/HeaderController"], function(HeaderController) {
                HeaderController.switchToView(dataObj);
            });
        });

        topic.subscribe("startModeAnim", function(dataObj) {
            require(["views/home/HomeController"], function(HomeController) {
                HomeController.startModeAnim();
            });
        });

        topic.subscribe("stopModeAnim", function(dataObj) {
            require(["views/home/HomeController"], function(HomeController) {
                HomeController.stopModeAnim();
            });
        });


        topic.subscribe("modeSelect", function(dataObj) {
            require(["views/home/HomeController"], function(HomeController) {
                HomeController.modeSelect(dataObj);
            });
        });

        topic.subscribe("getPeats", function(dataObj) {
            require(["views/home/HomeController"], function(HomeController) {
                HomeController.getPeats();
            });
        });

        topic.subscribe("footerSelect", function(dataObj) {
            require(["views/footer/FooterController"], function(FooterController) {
                FooterController.footerSelect(dataObj);
            });
        });

        topic.subscribe("goToBlog", function(dataObj) {
            require(["views/header/HeaderController"], function(HeaderController) {
                HeaderController.clickNavLink({
                    viewName: "blog"
                });
            });
        });

        topic.subscribe("subscribeToAlerts", function(dataObj) {
            require(["views/footer/FooterController"], function(FooterController) {
                FooterController.subscribeToAlerts();
            });
        });

        topic.subscribe("goToTweet", function(dataObj) {
            require(["views/footer/FooterController"], function(FooterController) {
                FooterController.goToTweet(dataObj);
            });
        });

        topic.subscribe("initShareButton", function() {
            require(["views/footer/FooterController"], function(FooterController) {
                FooterController.initShareButton();
            });
        });


        topic.subscribe("toggleDataNavList", function(obj) {
            require(["views/data/DataController"], function(DataController) {
                DataController.toggleDataNavList(obj);
            });
        });

        topic.subscribe("toggleStoryNavList", function(obj) {
            require(["views/story/StoryController"], function(StoryController) {
                StoryController.toggleStoryNavList(obj);
            });
        });

        topic.subscribe("toggleAboutNavList", function(obj) {
            require(["views/about/AboutController"], function(AboutController) {
                AboutController.toggleAboutNavList(obj);
            });
        });

        topic.subscribe("goToMap", function(dataObj) {
            require(["views/header/HeaderController"], function(HeaderController) {
                HeaderController.clickNavLink({
                    viewName: "map"
                });
            });
        });

        topic.subscribe("goToAnalysis", function(dataObj) {
            require(["views/header/HeaderController"], function(HeaderController) {
                HeaderController.clickNavLink({
                    viewName: "link",
                    url: "app/js/views/report/report.html"
                });
            });
        });

        topic.subscribe("goToTomnod", function(dataObj) {
            require(["views/header/HeaderController"], function(HeaderController) {
                HeaderController.clickNavLink({
                    viewName: "link",
                    url: "http://www.tomnod.com/campaign/indonesiafires012014"
                });
            });
        });

        topic.subscribe("goToStory", function(dataObj) {
            require(["views/header/HeaderController"], function(HeaderController) {
                // HeaderController.clickNavLink({
                //     viewName: "map"
                // });
                HeaderController.clickNavLink({
                    viewName: "story"
                    //url: "app/js/views/story/story.html"
                });
            });
        });

        return o;


    });