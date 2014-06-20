define(["dojo/hash", "dojo/topic", "dojo/_base/lang", "dojo/io-query", "main/Config", "dojo/_base/array"],
    function(hash, topic, lang, ioQuery, Config, arrayUtil) {

        var o = {};

        //app states
        o.oldState = {
            v: ""
        };
        o.newState = {
            v: ""
        };

        o.init = function() {
            var that = this;
            //whats the current hash?
            var url = window.location.href;
            /*var initHash = "";

            //is it a queryString?
            var queryString = ioQuery.queryToObject(url);
            var isQueryString = (url.split("?").length == 2);*/
            var _newState;
            var hasHash = (url.split("#").length == 2 && url.split("#")[1].length > 1);

            if (hasHash) {
                _newState = ioQuery.queryToObject(url.split("#")[1]);
            } else {
                _newState = Config.defaultState;
                //state with
            }

            //is _newState valid?
            if (hasHash) {
                var isValidState = (_newState.v && (arrayUtil.indexOf(Config.validViews, _newState.v) > -1));
                if (!isValidState) {
                    _newState = Config.defaultState;
                } else {
                    //if valid then make it dirty so that it pushes a change
                    !_newState.dirty ? _newState.dirty = "true" : delete _newState.dirty;
                }
            }



            topic.subscribe("/dojo/hashchange", function(changedHash) {
                // Handle the hash change
                //alert(changedHash);

                var newAppState = ioQuery.queryToObject(changedHash);
                var oldAppState = o.oldState;

                that.handleHashChange(newAppState, oldAppState);

            });

            that.updateHash(_newState);

            require(["views/header/HeaderController"], function(HeaderController) {
                HeaderController.init();
            });

        };

        o.handleHashChange = function(newState, oldState) {
            console.log(newState);
            console.log(oldState);
            var that = this;

            var changedView = oldState.v != newState.v;

            if (changedView) {
                that.changeView(newState.v, oldState.v);
            }

        };

        o.updateHash = function(updateState) {

            var that = this;

            //convert to object
            //var updateState = ioQuery.queryToObject(newHash);

            //merge with current hash (newState)
            var currentState = lang.clone(o.newState);

            lang.mixin(currentState, updateState);

            var newHashStr = ioQuery.objectToQuery(currentState);


            console.log(newHashStr);
            hash(newHashStr);
            /*var


            hash()*/

        };


        o.changeView = function(newView, oldView) {

            switch (newView) {
                case "home":
                    require(["views/home/HomeController"], function(HomeController) {
                        HomeController.init();
                    });
                    break;

                case "map":
                    require(["views/map/MapController"], function(MapController) {
                        MapController.init();
                    });

                    break;
                case "blog":
                    require(["views/blog/BlogController"], function(BlogController) {
                        BlogController.init();
                    });
                    break;

                case "about":
                    require(["views/about/AboutController"], function(AboutController) {
                        AboutController.init();
                    });
                    break;


            }




        },

        o.switchToView = function(name) {

            require(["dijit/registry"], function(registry) {

                registry.byId("stackContainer").selectChild(name);
            })

        }
        //listen to hash change

        //change the view if needed



        return o;


    });