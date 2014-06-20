define([],
    function() {

        var o = {

            defaultState: {
                v: "home"
            },

            validViews: ["home", "blog", "map", "about"],



            //knockout stuff

            navigationLinks: [{
                "html": "Home",
                "viewId": "home",
                "selected": true
            }, {
                "html": "Map",
                "viewId": "map",
                "selected": false
            }, {
                "html": "Fires Blog",
                "viewId": "blog",
                "selected": false
            }, {
                "html": "About",
                "viewId": "about",
                "selected": false
            }],

            headerTitle: "A partnership convened by the World Resources Institute",

            homeTitle: "Forest Fires and Haze Watch for the ASEAN Region",


            homeSplashText: [

                {
                    "html": "Latest Analysis",
                    "click": "goToBlog"
                }, {
                    "html": "Link to TomNod or Latest Imagery",
                    "click": "lastestImagery"
                }, {
                    "html": "View Map",
                    "click": "goToMap"
                }, {
                    "html": "Latest Analysis",
                    "click": "highlightStats"
                }

            ]


        }



        return o;

    })