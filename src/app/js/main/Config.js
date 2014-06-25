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
                "domId": "homeView",
                "selected": true
            }, {
                "html": "Map",
                "viewId": "map",
                "domId": "mapView",
                "selected": false
            }, {
                "html": "Fires Blog",
                "viewId": "blog",
                "domId": "blogView",
                "selected": false
            }, {
                "html": "Data",
                "viewId": "data",
                "domId": "dataView",
                "selected": false
            }, {
                "html": "About",
                "viewId": "about",
                "domId": "aboutView",
                "selected": false
            }],

            headerTitle: "A partnership convened by the World Resources Institute",

            headerDesc: "Forest Fires and Haze Watch for the ASEAN Region",


            homeModeOptions: [

                {
                    "html": "Latest Analysis",
                    "event": "goToAnalysis",
                    "display": true
                }, {
                    "html": "Latest Imagery",
                    "event": "goToImagery",
                    "display": false
                }, {
                    "html": "View Map",
                    "event": "goToMap",
                    "display": false

                }, {
                    "html": "Highlight Interesting Stats",
                    "event": "goToStats",
                    "display": false

                }

            ],

            footerModeOptions: [

                {
                    "title": "Read The Latest",
                    "desc": "Read our latest blog analysis on what's happening with fires in the region",
                    "eventName": "goToBlog",
                    "css": "blogPosts"
                }, {
                    "title": "Analyze Forest Fires",
                    "desc": "View the latest data on fire locations and air quality and do you own analysis",
                    "eventName": "goToMap",
                    "css": "analysisAlerts"

                }, {
                    "title": "Join The Conversation",
                    "desc": "Tweet, tweet, tweet!",
                    "eventName": "goToTweet",
                    "css": "submitStory"

                }

            ],

            dataLinks: [

                {
                    "name": "FOREST CHANGE",
                    "htmlContent": "dataForestChange",
                    "selected": true
                }, {
                    "name": "FOREST AND LAND COVER",
                    "htmlContent": "dataForestAndLandCover",
                    "selected": false
                }, {
                    "name": "LAND USE",
                    "htmlContent": "dataLandUse",
                    "selected": false
                }, {
                    "name": "CONSERVATION",
                    "htmlContent": "dataConservation",
                    "selected": false
                }, {
                    "name": "SUITABILITY",
                    "htmlContent": "dataSuitability",
                    "selected": false
                }, {
                    "name": "DATA POLICY",
                    "htmlContent": "dataPolicy",
                    "selected": false
                }

            ]


        }



        return o;

    })