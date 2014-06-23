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
                    "click": "goToBlog",
                    "display": true
                }, {
                    "html": "Link to TomNod or Latest Imagery",
                    "click": "lastestImagery",
                    "display": false
                }, {
                    "html": "View Map",
                    "click": "goToMap",
                    "display": false

                }, {
                    "html": "Latest Analysis",
                    "click": "highlightStats",
                    "display": false

                }

            ]


        }



        return o;

    })