define(["dojo/dom", "dijit/registry", "modules/HashController", "modules/EventsController", "views/footer/FooterModel", "dojo/_base/array"],
    function(dom, registry, HashController, EventsController, FooterModel, arrayUtil) {

        var o = {};
        var initialized = false;
        var viewId = "app-footer";

        o.init = function() {
            var that = this;
            if (initialized) {
                //switch to this view
                //HashController.switchToView(viewName);

                return;
            }

            initialized = true;
            //otherwise load the view
            require(["dojo/text!views/footer/footer.html", "views/footer/FooterModel"], function(html, FooterModel) {

                dom.byId(viewId).innerHTML = html;

                //EventsController.initShareButton();

                FooterModel.applyBindings(viewId);

                that.initShareButton();

            });
        };

        o.initShareButton = function() {
            // twitter
            ! function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (!d.getElementById(id)) {
                    js = d.createElement(s);
                    js.id = id;
                    js.src = "https://platform.twitter.com/widgets.js";
                    fjs.parentNode.insertBefore(js, fjs);
                }
            }(document, "script", "twitter-wjs");

            // facebook
            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s);
                js.id = id;
                js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.0";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));

            //google
            (function() {
                var po = document.createElement('script');
                po.type = 'text/javascript';
                po.async = true;
                po.src = 'https://apis.google.com/js/plusone.js';
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(po, s);
            })();




        };


        o.footerSelect = function(data) {
            var selectedItem = data;
            eval("EventsController." + selectedItem.eventName + "()");
            //alert(selectedItem.event);
        };


        return o;


    });