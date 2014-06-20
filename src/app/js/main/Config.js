define([],
    function() {

        var o = {

            defaultState: {
                v: "home"
            },

            validViews: ["home", "blog", "map", "about"],



            //knockout stuff

            tabOptions: ["Home", "Map", "Fires Blog", "About"],

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