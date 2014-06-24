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

            ]


        }



        return o;

    })