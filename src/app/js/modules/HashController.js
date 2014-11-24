define(["dojo/hash", "dojo/topic", "dojo/_base/lang", "dojo/io-query", "main/Config", "dojo/_base/array", "modules/EventsController"],
    function(hash, topic, lang, ioQuery, Config, arrayUtil, EventsController) {

        var url = window.location.href;
        var o = {};
        var currentState = {};
        o.newState = {};

        var emptyState = lang.clone(Config.defaultState); //take copy from defaultState and empty it
        console.log(emptyState);
        for (k in emptyState) {
            emptyState[k] = "";
        }

        currentState = emptyState; //initially current state should be empty

        o.init = function() {
            var that = this;

            var _initialState;

            var hasHash = (url.split("#").length == 2 && url.split("#")[1].length > 1);

            if (hasHash) {
                _initialState = ioQuery.queryToObject(url.split("#")[1]);
            } else {
                _initialState = Config.defaultState;
                //state with
            }

            //is _initialState valid?
            if (hasHash) {
                var isValidState = (_initialState.v && (arrayUtil.indexOf(Config.validViews, _initialState.v) > -1));
                if (!isValidState) {
                    _initialState = Config.defaultState;
                } else {
                    //if valid then make it dirty so that it pushes a change
                    !_initialState.dirty ? _initialState.dirty = "true" : delete _initialState.dirty;
                }
            }



            topic.subscribe("/dojo/hashchange", function(changedHash) {
                // Handle the hash change
                //alert(changedHash);

                var newAppState = ioQuery.queryToObject(changedHash);
                var oldAppState = currentState;

                that.handleHashChange(newAppState, oldAppState);


            });

            //push the app state initially
            that.updateHash(_initialState);

            require(["views/footer/FooterController", "views/header/HeaderController"], function(FooterController, HeaderController) {
                FooterController.init();
                HeaderController.init();
            });



        };

        o.handleHashChange = function(newState, oldState) {
            var that = this;

            o.newState = newState;

            var changedView = oldState.v != newState.v;
            var mapView = newState.v == "map";
            var centerChange = ((oldState.x != newState.x) || (oldState.y != newState.y) || (oldState.y != newState.y));


            //handle different scenarios here
            if (changedView) {
                that.changeView(newState.v, oldState.v);
            }

            if (mapView && centerChange) {
                EventsController.centerChange(newState);
            }

            currentState = newState; //important

        };


        o.updateHash = function(updateState) {

            var that = this;

            //convert to object
            //var updateState = ioQuery.queryToObject(newHash);

            //merge with current hash (newState)
            var _currentState = lang.clone(currentState);

            lang.mixin(_currentState, updateState);
            //debugger;
            require(["views/header/HeaderModel", "views/footer/FooterModel"], function(HeaderModel, FooterModel) {

                HeaderModel.vm.appState(_currentState);
                FooterModel.vm.appState(_currentState);

            });

            var newHashStr = ioQuery.objectToQuery(_currentState);


            console.log(newHashStr);
            hash(newHashStr);
            /*var


            hash()*/

        };


        o.changeView = function(newView, oldView) {
            var viewObj = {
                v: newView
            };
            console.log(newView);
            switch (newView) {
                case "home":
                    require(["views/home/HomeController"], function(HomeController) {
                        HomeController.init(viewObj);
                    });
                    break;

                case "map":
                    require(["views/map/MapController"], function(MapController) {
                        MapController.init(viewObj);
                    });
                    break;
                case "blog":
                    require(["views/blog/BlogController"], function(BlogController) {
                        BlogController.init(viewObj);
                    });
                    break;
                case "about":
                    require(["views/about/AboutController"], function(AboutController) {
                        AboutController.init(viewObj);
                    });
                    break;
                case "data":
                    require(["views/data/DataController"], function(DataController) {
                        DataController.init(viewObj);
                    });
                    break;
                case "story":
                    require(["views/story/StoryController"], function(StoryController) {
                        StoryController.init(viewObj);
                    });
                    break;
            }

        };

        o.getHash = function() {
            return ioQuery.queryToObject(hash());
        };

        //listen to hash change

        //change the view if needed



        return o;


    });