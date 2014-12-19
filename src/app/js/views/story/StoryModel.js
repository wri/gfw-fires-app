define(["knockout", "main/Config", "dojo/dom", "dojo/_base/array", "dojo/topic"],
    function(ko, Config, dom, arrayUtil, topic) {

        var o = {};

        o.vm = {};

        var vm = o.vm;

        vm.headerTitle = ko.observable(Config.headerTitle);
        vm.newStoryTitle = ko.observable(Config.newStory.title);

        vm.storiesURL = "http://gis-potico.wri.org/arcgis/rest/services/Fires/fire_stories/FeatureServer/0";
        vm.localToken = "?token=zUZRyzIlgOwnnBIAdoE5CrgOjZZqr8N3kBjMlJ6ifDM7Qm1qXHmiJ6axkFWndUs2";
        vm.stagingToken = "?token=VxQtCpXFzeqeopOOLVgG5dfpUHE7pEkcrJTO6nCCtrG5IL3houSHy4WQiFaY4c8L";
        vm.productionToken = "?token=BvwcoIq9AJ04z_pusnxTw-awCMGU93bMurQ44KpDNwc0w0vyjsE9Gk8WZAtqkagp";

        vm.addButtonLabel = "Add Point";
        vm.removeButtonLabel = "Remove Point";

        vm.storyTitleData = ko.observable();
        vm.pointGeom = ko.observable();
        vm.storyLocationData = ko.observable();
        vm.dateObserv = ko.observable();
        vm.storyDetailsData = ko.observable();
        vm.storyVideoData = ko.observable();
        vm.storyMediaData = ko.observable();
        vm.storyNameData = ko.observable();
        vm.storyEmailData = ko.observable();
        vm.showBasemapGallery = ko.observable(false);

        vm.stopSubmissionText = "Wait! Both a Title and a valid email are required to submit your story.";
        vm.formInvalidText = "The email and/or the video url you provided is invalid.";
        vm.noMapPoint = "Please place a point on the map to represent your story!";
        vm.submitSuccess = "Your story was successfully submitted!";
        vm.submitFailure = "An error occured during the submission.";
        vm.attachSuccess = "The attachment you added was successfully added to the Story!";
        vm.attachFailure = "The attachment you attempted to add could not be added to the Story";

        vm.errorMessages = ko.observableArray();
        vm.showErrorMessages = ko.observable();


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
            var today = new Date();
            var days = today.getDate();
            var months = today.getMonth() + 1;
            var years = today.getFullYear();
            var date = months + "/" + days + "/" + years;
            return date;
        }

        vm.uploadStory = function(obj, evt) {
            require(["views/story/StoryController"], function(StoryController) {
                StoryController.handleUpload(obj, evt);
            });
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


        // function cancel(e) {
        //     if (e.preventDefault) e.preventDefault(); // required by FF + Safari
        //     e.dataTransfer.dropEffect = 'copy'; // tells the browser what drop effect is allowed here
        //     return false; // required by IE
        // }

        // function entities(s) {
        //     var e = {
        //         '"': '"',
        //         '&': '&',
        //         '<': '<',
        //         '>': '>'
        //     };
        //     return s.replace(/["&<>]/g, function(m) {
        //         return e[m];
        //     });
        // }


        // var drop = document.querySelector('#storyMediaInput');

        // // Tells the browser that we *can* drop on this target
        // document.addEventListener(drop, 'dragover', cancel);
        // document.addEventListener(drop, 'dragenter', cancel);
        // function handleFileUpload(files, obj) {
        //     debugger;
        //     for (var i = 0; i < files.length; i++) {
        //         var fd = new FormData();
        //         fd.append('file', files[i]);

        //         var status = new createStatusbar(obj); //Using this we can set progress.
        //         status.setFileNameSize(files[i].name, files[i].size);
        //         //sendFileToServer(fd, status);

        //     }
        // }

        handleFiles = function(files) {
            $("#storyMediaInput").on('dragenter', function(e) {
                var par = $(this).parent();
                $(this).css('background-color', 'gray');
            });
            $("#storyMediaInput").on('dragleave', function(e) {
                var par = $(this).parent();
                $(this).css('background-color', 'transparent');
            });
            $("#storyMediaInput").on('mouseleave', function(e) {
                var par = $(this).parent();
                $(this).css('background-color', 'transparent');
            });

            //handleFileUpload
        };
        // document.addEventListener(drop, 'drop', function(e) {
        //     if (e.preventDefault) e.preventDefault(); // stops the browser from redirecting off to the text.

        //     // just rendering the text in to the list

        //     // clear out the original text
        //     drop.innerHTML = '<ul></ul>';

        //     var li = document.createElement('li');

        //     /** THIS IS THE MAGIC: we read from getData based on the content type - so it grabs the item matching that format **/
        //     if (e.dataTransfer.types) {
        //         li.innerHTML = '<ul>';
        //         [].forEach.call(e.dataTransfer.types, function(type) {
        //             li.innerHTML += '<li>' + entities(e.dataTransfer.getData(type) + ' (content-type: ' + type + ')') + '</li>';
        //         });
        //         li.innerHTML += '</ul>';

        //     } else {
        //         // ... however, if we're IE, we don't have the .types property, so we'll just get the Text value
        //         li.innerHTML = e.dataTransfer.getData('Text');
        //     }

        //     var ul = drop.querySelector('ul');

        //     if (ul.firstChild) {
        //         ul.insertBefore(li, ul.firstChild);
        //     } else {
        //         ul.appendChild(li);
        //     }

        //     return false;
        // });


        o.get = function(item) {
            return item === 'model' ? o.vm : o.vm[item]();
        };

        o.set = function(key, value) {
            o.vm[key](value);
        };

        o.getVM = function() {
            return vm;
        }


        o.applyBindings = function(domId) {
            ko.applyBindings(vm, dom.byId(domId));
        }


        return o;

    })