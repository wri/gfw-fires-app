define(["knockout", "main/Config", "dojo/dom", "dojo/_base/array", "dojo/topic"],
    function(ko, Config, dom, arrayUtil, topic) {

        var o = {};

        o.vm = {};

        var vm = o.vm;

        vm.headerTitle = ko.observable(Config.headerTitle);
        vm.newStoryTitle = ko.observable(Config.newStory.title);

        //vm.htmlContent = ko.observable("Loading....");
        vm.leftLinks = ko.observableArray(Config.storyLinks);
        vm.addButtonLabel = "Add Point";
        vm.removeButtonLabel = "Remove Point";
        vm.submissionInputs = ko.observableArray([]);

        vm.linkClick = function(obj, evt) {
            topic.publish("toggleStoryNavList", obj)
        }

        vm.datePicker = function() {
            var newDate = jQuery('#storyDateInput').datepicker({
                minDate: (new Date(2013, 1 - 1, 1)),
                maxDate: "+0M +0D",
                onSelect: function(selectedDate) {
                    vm.dateObserv(selectedDate);
                    return selectedDate;
                }
            });
            // var today = new Date();
            // var days = today.getDate();
            // var months = today.getMonth() + 1;
            // var years = today.getFullYear();
            // var date = months + "/" + days + "/" + years;
            // return date;
        }

        var htmlToFetch;
        // arrayUtil.some(vm.leftLinks(), function(linkItem) {
        //     if (linkItem.selected) {
        //         htmlToFetch = linkItem.htmlContent;
        //         require(["dojo/text!views/story/templates/" + htmlToFetch + ".htm"], function(content) {
        //             vm.htmlContent(content);
        //         });
        //     }
        //     return linkItem.selected;
        // });


        vm.dateObserv = ko.observable();





        function cancel(e) {
            if (e.preventDefault) e.preventDefault(); // required by FF + Safari
            e.dataTransfer.dropEffect = 'copy'; // tells the browser what drop effect is allowed here
            return false; // required by IE
        }

        function entities(s) {
            var e = {
                '"': '"',
                '&': '&',
                '<': '<',
                '>': '>'
            };
            return s.replace(/["&<>]/g, function(m) {
                return e[m];
            });
        }


        var drop = document.querySelector('#storyMediaInput');

        // Tells the browser that we *can* drop on this target
        document.addEventListener(drop, 'dragover', cancel);
        document.addEventListener(drop, 'dragenter', cancel);

        document.addEventListener(drop, 'drop', function(e) {
            if (e.preventDefault) e.preventDefault(); // stops the browser from redirecting off to the text.

            // just rendering the text in to the list

            // clear out the original text
            drop.innerHTML = '<ul></ul>';

            var li = document.createElement('li');

            /** THIS IS THE MAGIC: we read from getData based on the content type - so it grabs the item matching that format **/
            if (e.dataTransfer.types) {
                li.innerHTML = '<ul>';
                [].forEach.call(e.dataTransfer.types, function(type) {
                    li.innerHTML += '<li>' + entities(e.dataTransfer.getData(type) + ' (content-type: ' + type + ')') + '</li>';
                });
                li.innerHTML += '</ul>';

            } else {
                // ... however, if we're IE, we don't have the .types property, so we'll just get the Text value
                li.innerHTML = e.dataTransfer.getData('Text');
            }

            var ul = drop.querySelector('ul');

            if (ul.firstChild) {
                ul.insertBefore(li, ul.firstChild);
            } else {
                ul.appendChild(li);
            }

            return false;
        });




        o.getVM = function() {
            return vm;
        }


        o.applyBindings = function(domId) {
            ko.applyBindings(vm, dom.byId(domId));
        }


        return o;

    })