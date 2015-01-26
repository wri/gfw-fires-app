define(["knockout", "main/Config", "views/story/StoryConfig", "dojo/dom", "dojo/_base/array", "dojo/topic"],
    function(ko, Config, StoryConfig, dom, arrayUtil, topic) {

        var o = {};

        o.vm = {};

        var vm = o.vm;

        vm.headerTitle = ko.observable(Config.headerTitle);
        vm.newStoryTitle = ko.observable(Config.newStory.title);

        vm.storiesURL = StoryConfig.storiesURL;
        vm.localToken = StoryConfig.localToken;
        vm.stagingToken = StoryConfig.stagingToken;
        vm.productionToken = StoryConfig.productionToken;

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
        vm.submitSuccess = "Your story was successfully submitted! You will now be redirected to the map to view your submission.";
        vm.submitFailure = "An error occured during the submission process.";
        vm.attachSuccess = "The attachment you selected was successfully added to the Story!";
        vm.attachFailure = "The attachment you selected could not be added to the Story";

        vm.inputFilesSelector = ko.observableArray([{
            display: true
        }]);

        vm.mediaListData = function(obj, evt) {
            if (evt) {
                $(evt.target.nextSibling.nextSibling).append(evt.currentTarget.files[0].name);
            }
            return evt;
        }

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

        vm.mediaChange = function(obj, evt) {
            require(["views/story/StoryController"], function(StoryController) {
                StoryController.handleFileChange(obj, evt);
            });
        }

        vm.attachmentRemove = function(obj, evt) {
            require(["views/story/StoryController"], function(StoryController) {
                StoryController.handleAttachmentRemove(obj, evt);
            });
        }

        vm.mouseoverFile = function(obj, evt) {
            $(evt.target).children("img").remove();
            $(evt.target).append('<img id="theImg" src="app/images/redX.png" />');
        }

        vm.mouseoutFile = function(obj, evt) {
            $(evt.target).children("img").remove();
        }


        // vm.previewSubmit = function(obj, evt) {
        //     require(["views/story/StoryController"], function(StoryController) {
        //         StoryController.previewStorySubmission(obj, evt);
        //     });
        // }

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