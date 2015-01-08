define(["knockout","main/Config","views/map/MapConfig","dojo/dom"],function(e,t,o,a){var r={};r.vm={};var b=r.vm;b.appState=e.observable({}),b.locatorContainerHeader=e.observable(o.text.locatorContainerHeader),b.locatorSearchLabel=e.observable(o.text.locatorSearchLabel),b.dmsSearch=e.observable(o.text.dmsSearch),b.latLongSearch=e.observable(o.text.latLongSearch),b.degreesLabel=e.observable(o.text.degreesLabel),b.minutesLabel=e.observable(o.text.minutesLabel),b.secondsLabel=e.observable(o.text.secondsLabel),b.latitudeLabel=e.observable(o.text.latitudeLabel),b.longitudeLabel=e.observable(o.text.longitudeLabel),b.searchOptionGoButton=e.observable(o.text.searchOptionGoButton),b.clearSearchPins=e.observable(o.text.clearSearchPins),b.legend=e.observable(o.text.legend),b.firesCheckbox=e.observable(o.text.firesCheckbox),b.noaaFiresCheckbox=e.observable(o.text.noaaFiresCheckbox),b.noaaSubLabel=e.observable(o.text.noaaSubLabel),b.indonesiaFiresCheckbox=e.observable(o.text.indonesiaFiresCheckbox),b.indonesiaSubLabel=e.observable(o.text.indonesiaSubLabel),b.firesSubLabel=e.observable(o.text.firesSubLabel),b.confidenceFiresCheckbox=e.observable(o.text.confidenceFiresCheckbox),b.firesWeek=e.observable(o.text.firesWeek),b.fires72=e.observable(o.text.fires72),b.fires48=e.observable(o.text.fires48),b.fires24=e.observable(o.text.fires24),b.none=e.observable(o.text.none),b.oilPalmCheckbox=e.observable(o.text.oilPalmCheckbox),b.rspoOilPalmCheckbox=e.observable(o.text.rspoOilPalmCheckbox),b.woodFiberCheckbox=e.observable(o.text.woodFiberCheckbox),b.loggingCheckbox=e.observable(o.text.loggingCheckbox),b.protectedAreasCheckbox=e.observable(o.text.protectedAreasCheckbox),b.burnedScarsCheckbox=e.observable(o.text.burnedScarsCheckbox),b.tomnodCheckbox=e.observable(o.text.tomnodCheckbox),b.peatLandsRadio=e.observable(o.text.peatLandsRadio),b.treeCoverDensityRadio=e.observable(o.text.treeCoverDensityRadio),b.primaryForestsRadio=e.observable(o.text.primaryForestsRadio),b.southeastLandCoverRadio=e.observable(o.text.southeastLandCoverRadio),b.peatLandsSubLabel=e.observable(o.text.peatLandsSubLabel),b.treeCoverDensitySubLabel=e.observable(o.text.treeCoverDensitySubLabel),b.southeastLandCoverSubLabel=e.observable(o.text.southeastLandCoverSubLabel),b.forestUseCheckboxSubLabelSelect=e.observable(o.text.forestUseCheckboxSubLabelSelect),b.rspoOilPalmCheckboxSubLabel=e.observable(o.text.rspoOilPalmCheckboxSubLabel),b.primaryForestsSubLabel=e.observable(o.text.primaryForestsSubLabel),b.conservationCheckboxSubLabelGlobal=e.observable(o.text.conservationCheckboxSubLabelGlobal),b.airQuality=e.observable(o.text.airQuality),b.digitalGlobeCheckbox=e.observable(o.text.digitalGlobeCheckbox),b.digitalGlobeFootprintsCheckbox=e.observable(o.text.digitalGlobeFootprintsCheckbox),b.landsatImageCheckbox=e.observable(o.text.landsatImageCheckbox),b.landsatImageSubLabel=e.observable(o.text.landsatImageSubLabel),b.twitterConversationsCheckbox=e.observable(o.text.twitterConversationsCheckbox),b.fireStoriesCheckbox=e.observable(o.text.fireStoriesCheckbox),b.transparencySliderLabel=e.observable(o.text.transparencySliderLabel),b.getReportLink=e.observable(o.text.getReportLink),b.getDates=e.observable(o.text.getDates),b.windyLayerCheckbox=e.observable(o.text.windyLayerCheckbox),b.windySubLabelAdvice=e.observable(o.text.windySubLabelAdvice),b.windySubLabel=e.observable(o.text.windySubLabel),b.provincesCheckbox=e.observable(o.text.provincesCheckbox),b.districtsCheckbox=e.observable(o.text.districtsCheckbox),b.subDistrictsCheckbox=e.observable(o.text.subDistrictsCheckbox),b.digitalGlobeSubLabel=e.observable(o.text.digitalGlobeSubLabel),b.digitalGlobeFootprintsSubLabel=e.observable(o.text.digitalGlobeFootprintsSubLabel),b.villagesCheckbox=e.observable(o.text.villagesCheckbox),b.pf2000Radio=e.observable(o.text.pf2000Radio),b.pf2005Radio=e.observable(o.text.pf2005Radio),b.pf2010Radio=e.observable(o.text.pf2010Radio),b.pf2012Radio=e.observable(o.text.pf2012Radio),b.imageIconPath=e.observable(o.text.imageSourcePath),b.timeOfDay=e.observable("00"),b.wind00Radio=e.observable("00"),b.wind06Radio=e.observable("06"),b.wind12Radio=e.observable("12"),b.wind18Radio=e.observable("18"),b.wind06Enable=e.observable(),b.wind12Enable=e.observable(),b.wind18Enable=e.observable(),b.wind06Disable=function(){var e=new Date,t=(new Date,e.getHours(),moment(e));if(e=t.tz("Atlantic/Cape_Verde").format("ha z"),-1!=e.indexOf("am")){var o=e.split("am");o=o[0]}else{var o=e.split("pm");o=o[0],o=parseInt(o)+12}return 6>o?(b.wind06Enable(!1),$("#wind06 > label").css("color","grey"),!0):(b.wind06Enable(!0),!1)},b.wind12Disable=function(){var e=new Date,t=moment(e);if(e=t.tz("Atlantic/Cape_Verde").format("ha z"),-1!=e.indexOf("am")){var o=e.split("am");o=o[0]}else{var o=e.split("pm");o=o[0],o=parseInt(o)+12}return 12>o?(b.wind12Enable(!1),$("#wind12 > label").css("color","grey"),!0):(b.wind12Enable(!0),!1)},b.wind18Disable=function(){var e=new Date,t=moment(e);if(e=t.tz("Atlantic/Cape_Verde").format("ha z"),-1!=e.indexOf("am")){var o=e.split("am");o=o[0]}else{var o=e.split("pm");o=o[0],o=parseInt(o)+12}return 18>o?(b.wind18Enable(!1),$("#wind18 > label").css("color","grey"),!0):(b.wind18Enable(!0),!1)},b.months=[0,31,28,31,30,31,30,31,31,30,31,30,31],b.reportAOIs=e.observableArray([]),b.selectedAOIs=e.observableArray([]),b.reportText=e.observable(o.text.reportOptions),b.reportTextImagery=e.observable(o.text.digitalGlobeWindowText);var n=new Date,i=n.getDate(),s=n.getMonth()+1,l=n.getFullYear(),c=s+"/"+i+"/"+l,v=new Date((new Date).setDate((new Date).getDate()-7)),d=v.getDate(),p=v.getMonth()+1,u=v.getFullYear(),x=p+"/"+d+"/"+u;return b.firesPickerFrom=function(){var e=(jQuery("#firesDateFrom").datepicker({minDate:new Date(2013,0,1),maxDate:"+0M +0D",onSelect:function(e){return console.log(e),b.firesObservFrom(e),$("#firesDateTo").datepicker("option","minDate",e),e}}),new Date((new Date).setDate((new Date).getDate()-7))),t=e.getDate(),o=e.getMonth()+1,a=e.getFullYear(),r=o+"/"+t+"/"+a;return r},b.firesPickerTo=function(){var e=(jQuery("#firesDateTo").datepicker({minDate:new Date(2013,0,1),maxDate:"+0M +0D",onSelect:function(e){return b.firesObservTo(e),$("#firesDateFrom").datepicker("option","maxDate",e),e}}),new Date),t=e.getDate(),o=e.getMonth()+1,a=e.getFullYear(),r=o+"/"+t+"/"+a;return r},b.windPicker=function(){var e=(jQuery("#windDate").datepicker({minDate:new Date(2014,9,19),maxDate:"+0M +0D",onSelect:function(e){$("#wind06 > label").css("color","black"),$("#wind12 > label").css("color","black"),$("#wind18 > label").css("color","black");var t=Date.parse(e),o=new Date;return o.setHours(0,0,0,0),o.getTime()>t?(b.wind06Enable(!0),b.wind12Enable(!0),b.wind18Enable(!0)):(b.timeOfDay("00"),b.wind06Disable(),b.wind12Disable(),b.wind18Disable()),b.windObserv(e),e}}),new Date),t=e.getDate(),o=e.getMonth()+1,a=e.getFullYear(),r=o+"/"+t+"/"+a;return r},b.noaaPickerFrom=function(){jQuery("#noaaDateFrom").datepicker({date:new Date(2014,9,22),minDate:new Date(2014,9,22),maxDate:"+0M +0D",onSelect:function(e){return b.noaaObservFrom(e),$("#noaaDateTo").datepicker("option","minDate",e),e}})},b.noaaPickerTo=function(){var e=(jQuery("#noaaDateTo").datepicker({minDate:new Date(2014,9,22),maxDate:"+0M +0D",onSelect:function(e){return b.noaaObservTo(e),$("#noaaDateFrom").datepicker("option","maxDate",e),e}}),new Date),t=e.getDate(),o=e.getMonth()+1,a=e.getFullYear(),r=o+"/"+t+"/"+a;return r},b.indoPickerFrom=function(){jQuery("#indoDateFrom").datepicker({minDate:new Date(2013,0,1),maxDate:"+0M -7D",onSelect:function(e){return b.indoObservFrom(e),$("#indoDateTo").datepicker("option","minDate",e),e}})},b.indoPickerTo=function(){var e=(jQuery("#indoDateTo").datepicker({minDate:new Date(2013,0,1),maxDate:"+0M -7D",onSelect:function(e){return b.indoObservTo(e),$("#indoDateFrom").datepicker("option","maxDate",e),e}}),new Date((new Date).setDate((new Date).getDate()-7))),t=e.getDate(),o=e.getMonth()+1,a=e.getFullYear(),r=o+"/"+t+"/"+a;return r},b.firesObservFrom=e.observable(x),b.firesObservTo=e.observable(c),b.windObserv=e.observable(c),b.noaaObservFrom=e.observable("10/12/2014"),b.noaaObservTo=e.observable(c),b.indoObservFrom=e.observable("1/1/2013"),b.indoObservTo=e.observable(x),b.islands=e.observableArray([]),b.provinces=e.observableArray([]),b.showBasemapGallery=e.observable(!1),b.showShareContainer=e.observable(!1),b.showReportOptions=e.observable(!1),b.showReportOptionsNOAA=e.observable(!1),b.showActiveFiresButtons=e.observable(!1),b.showReportOptionsINDO=e.observable(!1),b.showReportOptionsWIND=e.observable(!1),b.showReportOptionsDigitalGlobe=e.observable(!1),b.showReportOptionsDigitalGlobeFootprints=e.observable(!0),b.digitalGlobeInView=e.observableArray(),b.sortedImageryArray=[],b.showLocatorWidgets=e.observable(!1),b.toggleMapPane=e.observable(!0),b.showPrimaryForestOptions=e.observable(!1),b.showWindLayerOptions=e.observable(!0),b.showWindLegend=e.observable(!1),b.showLatLongInputs=e.observable(!1),b.showDMSInputs=e.observable(!0),b.showClearPinsOption=e.observable(!1),b.currentLatitude=e.observable(0),b.currentLongitude=e.observable(0),b.DigitalGlobeExtents=e.observable([]),b.dgMoments=e.observable([]),b.valuenodes=e.observable(),b.selectedImageryID=e.observable(),b.closeReportOptions=function(){b.showReportOptions(!1)},b.closeReportOptionsNOAA=function(){b.showReportOptionsNOAA(!1)},b.closeReportOptionsINDO=function(){b.showReportOptionsINDO(!1)},b.closeReportOptionsWIND=function(){b.showReportOptionsWIND(!1)},b.closeReportOptionsDigitalGlobe=function(){b.showReportOptionsDigitalGlobe(!1)},b.closeOptionsNASA=function(){b.showActiveFiresButtons(!1)},b.imageryMouseOver=function(e,t){console.log("MOUSE OVER"),require(["views/map/MapController"],function(o){o.handleImageryOver(e,t)})},b.imageryMouseOut=function(e,t){console.log("MOUSE OUT"),require(["views/map/MapController"],function(o){o.handleImageryOut(e,t)})},b.imageryZoomTo=function(e,t){require(["views/map/MapController"],function(o){o.imageryZoom(e,t)})},b.digitalGlobeToggle=function(e,t){console.log("CLICK"),require(["views/map/MapController"],function(o){o.showDigitalGlobe(e,t)})},b.slidePanel=function(){var e=b.toggleMapPane();require(["views/map/MapController"],function(t){t.resizeMapPanel(e)})},b.selectImageryMinimize=function(){"table"==$("#imageryWindow > table").css("display")?($("#imageryWindow > table").css("display","none"),$("#report-optionsDigitalGlobe").css("border-bottom","none")):($("#imageryWindow > table").css("display","table"),$("#report-optionsDigitalGlobe").css("border-bottom","2px solid black"))},r.applyBindings=function(t){e.applyBindings(b,a.byId(t))},r.get=function(e){return"model"===e?r.vm:r.vm[e]()},r.set=function(e,t){r.vm[e](t)},r});