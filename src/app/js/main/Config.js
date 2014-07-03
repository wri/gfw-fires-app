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
            }, {
                "html": "GFW",
                "url": "http://www.globalforestwatch.org",
                "viewId": "link",
                "domId": "link",
                "selected": false
            }],

            headerTitle: "A partnership convened by the World Resources Institute",

            headerDesc: "Forest Fires and Haze Watch for the ASEAN Region",


            homeModeOptions: [{
                    "html": "Fires Occuring in Peatland <br> in the last 7 days",
                    "eventName": "goToMap",
                    "display": false
                },

                {
                    "html": "View the Latest Analysis",
                    "eventName": "goToAnalysis",
                    "display": true
                }, {
                    "html": "View the Latest Imagery",
                    "eventName": "goToMap",
                    "display": false
                }, {
                    "html": "Explore the Map",
                    "eventName": "goToMap",
                    "display": false

                }
            ],

            footerModeOptions: [

                {
                    "title": "Read The Latest",
                    "desc": "Read our latest blog analysis on what's happening with fires in the region",
                    "action": "Read Recent Blog Posts",
                    "eventName": "goToBlog",
                    "css": "blogPosts",
                    "url": false
                }, {
                    "title": "Analyze Forest Fires",
                    "desc": "View the latest data on fire locations and air quality and do you own analysis",
                    "action": "Start Analyzing",
                    "eventName": "goToMap",
                    "css": "analysisAlerts",
                    "url": false

                }, {
                    "title": "Join The Conversation",
                    "desc": "Tweet, tweet, tweet!",
                    "action": "Tweet Now",
                    "eventName": "goToTweet",
                    "css": "submitStory",
                    "url": "https://twitter.com/search?q=MelawanAsap%20OR%20Indonesiafires&src=typd",
                    "target": "_blank"

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

            ],

            aboutLinks: [

                {
                    "name": "ABOUT GFW-COMMODITIES",
                    "htmlContent": "aboutGFW",
                    "selected": true
                }, {
                    "name": "HISTORY",
                    "htmlContent": "aboutHistory",
                    "selected": false
                }, {
                    "name": "PARTNERS",
                    "htmlContent": "aboutPartners",
                    "selected": false
                }, {
                    "name": "USERS",
                    "htmlContent": "aboutUsers",
                    "selected": false
                }, {
                    "name": "VIDEOS",
                    "htmlContent": "aboutVideos",
                    "selected": false
                }

            ]


        }



        return o;

    })