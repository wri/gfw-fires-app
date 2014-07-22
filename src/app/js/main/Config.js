define([],
    function() {

        var o = {

            defaultState: {
                v: "home",
                x: 115,
                y: 0,
                l: 5,
                lyrs: 'Active_Fires'
            },

            validViews: ["home", "blog", "map", "about", "data"],



            //knockout stuff

            navigationLinks: [{
                "html": "Home",
                "viewName": "home",
                "domId": "homeView",
                "selected": true
            }, {
                "html": "Map",
                "viewName": "map",
                "domId": "mapView",
                "selected": false
            }, {
                "html": "Fires Blog",
                "viewName": "blog",
                "domId": "blogView",
                "selected": false
            }, {
                "html": "Data",
                "viewName": "data",
                "domId": "dataView",
                "selected": false
            }, {
                "html": "About",
                "viewName": "about",
                "domId": "aboutView",
                "selected": false
            }, {
                "html": "GFW",
                "url": "http://www.globalforestwatch.org",
                "viewName": "link",
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
                    "html": "<span>View the Latest Analysis</span>",
                    "eventName": "goToAnalysis",
                    "display": true
                }, {
                    "html": "<span>View the Latest Imagery</span>",
                    "eventName": "goToMap",
                    "display": false
                }, {
                    "html": "<span>Explore the Map</span>",
                    "eventName": "goToMap",
                    "display": false

                },
                {
                    "html": "<span class='more-text'>Coming soon:<br>Sign up for SMS and Email fire alerts</span>",
                    "eventName": "",
                    "display": false

                }
            ],

            footerModeOptions: [

                {
                    "title": "Receive Fire Alerts",
                    "desc": "Sign up to receive email or SMS fire alerts in your area of interest.",
                    "action": "Coming Soon",
                    "eventName": "subscribeToAlerts",
                    "css": "receiveAlerts",
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
                    "name": "FIRES",
                    "htmlContent": "dataFires",
                    "selected": true
                }, {
                    "name": "FOREST USE",
                    "htmlContent": "dataForestUse",
                    "selected": false
                }, {
                    "name": "CONSERVATION",
                    "htmlContent": "dataConservation",
                    "selected": false
                }, {
                    "name": "LAND COVER",
                    "htmlContent": "dataLandCover",
                    "selected": false
                }, {
                    "name": "Air Quality",
                    "htmlContent": "dataAirQuality",
                    "selected": false
                }, {
                    "name": "Imagery",
                    "htmlContent": "dataImagery",
                    "selected": false
                }

            ],

            dataHeaderDescription: "Data sources Global Forest Watch hosts a wealth of data relating to forests. Some data have been developed by WRI or by GFW partner organizations. Other data are in the public domain and have been developed by governments, NGOs, and companies. The data vary in accuracy, resolution, frequency of update, and geographic coverage. The summaries below include links to further information such as methods and technical documents. Full download of the data sets is available for most sources.",

            aboutLinks: [

                {
                    "name": "ABOUT GFW-COMMODITIES",
                    "htmlContent": "aboutGFW",
                    "selected": true
                }, {
                    "name": "PARTNERS",
                    "htmlContent": "aboutPartners",
                    "selected": false
                }

            ]


        };



        return o;

    })