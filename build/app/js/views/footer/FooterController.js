define(["dojo/dom","dojo/Deferred","dijit/registry","modules/HashController","modules/EventsController","views/footer/FooterModel","views/map/MapConfig","main/Config","dojo/_base/array","esri/tasks/query","esri/tasks/QueryTask","esri/request"],function(dom,Deferred,registry,HashController,EventsController,FooterModel,MapConfig,MainConfig,arrayUtil,Query,QueryTask,esriRequest){var o={},initialized=!1,viewId="app-footer";return o.init=function(){var e=this;initialized||(initialized=!0,require(["dojo/text!views/footer/footer.html","views/footer/FooterModel"],function(r,t){dom.byId(viewId).innerHTML=r,t.applyBindings(viewId),e.initShareButton()}))},o.initShareButton=function(){!function(e,r,t){var o,i=e.getElementsByTagName(r)[0];e.getElementById(t)||(o=e.createElement(r),o.id=t,o.src="https://platform.twitter.com/widgets.js",i.parentNode.insertBefore(o,i))}(document,"script","twitter-wjs"),function(e,r,t){var o,i=e.getElementsByTagName(r)[0];e.getElementById(t)||(o=e.createElement(r),o.id=t,o.src="//connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.0",i.parentNode.insertBefore(o,i))}(document,"script","facebook-jssdk"),function(){var e=document.createElement("script");e.type="text/javascript",e.async=!1,e.src="https://apis.google.com/js/plusone.js";var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(e,r)}()},o.footerSelect=function(data){var selectedItem=data;eval("EventsController."+selectedItem.eventName+"()")},o.subscribeToAlerts=function(){var e=this;require(["dojo/on","dijit/Dialog","dojo/dom-style","dojo/dom-construct","dijit/form/Select","dojox/validate/web","dojo/text!views/footer/emailAlertForm.html"],function(r,t,o,i,s,n,a){function l(){i.destroy(dom.byId("signUpAlertsForm")),c.intlTelInput("destroy"),d.remove(),b.remove(),u.remove(),f.remove()}var u,c,d,b,f,m=new t({title:"Sign up to receive fire alerts!",style:"width: 550px;height: auto;"}),v=a;m.setContent(v),m.show(),FooterModel.applyBindings("signUpAlertsForm"),c=$("#phoneNumberForAlerts"),c.intlTelInput({validationScript:"./app/libs/isValidNumber.js"}),e.getProvinceValues().then(function(t){FooterModel.get("model").provincesAvailableForAlerts(t),e.getDistrictValues().then(function(t){var i=FooterModel.get("model");i.districtsAvailableForAlerts([]),i.subDistrictsAvailableForAlerts([]);var s=FooterModel.get("provincesAvailableForAlerts"),a=new Array;arrayUtil.forEach(s,function(e){a[e.value]=new Array}),arrayUtil.forEach(t,function(e){e.province&&a[e.province].push(e)}),d=r(dom.byId("aoiProvincePicker"),"change",function(e){var r=e.target?e.target.value:e.srcElement.value;i.districtsAvailableForAlerts(a[r]),i.subDistrictsAvailableForAlerts([])}),b=r(dom.byId("aoiDistrictPicker"),"change",function(r){var t;t=r.target?r.target.selectedOptions?r.target.selectedOptions:r.target.value:r.srcElement.value,"NONE"!==t&&e.getSubDistricts(t).then(function(e){i.subDistrictsAvailableForAlerts(e)})}),f=r(dom.byId("aoiSubDistrictPicker"),"change",function(e){var r=!1;e.target.selectedOptions&&(r=e.target.selectedOptions.length>10?!0:!1),"ALL"==e.target.value&&(r=!0),r?i.showSubDistrictWarning(!0):i.showSubDistrictWarning(!1)}),u=r(dom.byId("alerts-submit-button"),"click",function(){var r=dom.byId("emailForAlerts").value,t=dom.byId("phoneNumberForAlerts").value,s=!0,a=[];i.errorMessages([]),i.showErrorMessages(!1),"ALL"===dom.byId("aoiSubDistrictPicker").value?arrayUtil.forEach(dom.byId("aoiSubDistrictPicker").options,function(e){"Select All"!==e.innerHTML&&a.push({aoi_id:parseInt(e.value),aoi_name:e.innerHTML})}):arrayUtil.forEach(dom.byId("aoiSubDistrictPicker").options,function(e){e.selected&&a.push({aoi_id:parseInt(e.value),aoi_name:e.innerHTML})}),0===a.length?(o.set("aoiSubDistrictPicker","border","1px solid red"),i.errorMessages.push("You need to select at least one subdistrict."),s=!1):o.set("aoiSubDistrictPicker","border",""),n.isEmailAddress(r)||c.intlTelInput("isValidNumber")?(o.set("phoneNumberForAlerts","border",""),o.set("emailForAlerts","border","")):(s=!1,o.set("emailForAlerts","border","1px solid red"),o.set("phoneNumberForAlerts","border","1px solid red"),i.errorMessages.push("You must at least provide a phone number and/or an email.")),s?(""!==t&&(t=t.replace(/[^\d]/g,""),e.postSubscribeRequest(a,t,"sms").then(function(e){e&&(m.destroy(),l())})),n.isEmailAddress(r)&&e.postSubscribeRequest(a,r,"email").then(function(e){e&&(m.destroy(),l())})):i.showErrorMessages(!0)}),m.on("cancel",l)})})})},o.postSubscribeRequest=function(e,r,t){var o,i=MainConfig.emailSubscribeUrl,s={areas:JSON.stringify(e),msg_addr:r,msg_type:t},n=dom.byId("verifyEmailForAlerts").value,a=new Deferred;return""===n?(dom.byId("alerts-submit-button").innerHTML="Submitting...",o=esriRequest({url:i,content:s,handleAs:"json"},{usePost:!0}),o.then(function(){dom.byId("alerts-submit-button").innerHTML="Submit",alert("You have successfully subscribed, you should start receiving alerts as they come in for your area(s) of interest."),a.resolve(!0)},function(e){dom.byId("alerts-submit-button").innerHTML="Submit",alert("There was an error subcribing at this time. "+e.message),a.resolve(!1)})):a.resolve(!0),a.promise},o.getProvinceValues=function(){var e,r,t=new Deferred,o=new QueryTask(MapConfig.layerForProvinceQuery.url),i=new Query,s=[],n=[];return i.returnGeometry=!1,i.outFields=MapConfig.layerForProvinceQuery.outFields,i.where="1 = 1",o.execute(i,function(o){arrayUtil.forEach(o.features,function(t){r=t.attributes,e=r[MapConfig.layerForProvinceQuery.outFields[0]],-1===arrayUtil.indexOf(n,e)&&(n.push(e),s.push({label:e,value:e}))}),s.sort(function(e,r){return e.label<r.label?-1:e.label>r.label?1:0}),s.unshift({label:"Choose one",value:"NONE",selected:!0}),t.resolve(s)},function(){t.resolve(!1)}),t.promise},o.getDistrictValues=function(){var e,r,t,o=new Deferred,i=new QueryTask(MapConfig.layerForDistrictQuery.url),s=new Query,n=[],a=[];return FooterModel.get("districtsAvailableForAlerts").length>0?o.resolve(!1):(s.returnGeometry=!1,s.outFields=MapConfig.layerForDistrictQuery.outFields,s.where="1 = 1",i.execute(s,function(i){arrayUtil.forEach(i.features,function(o){t=o.attributes,e=t[MapConfig.layerForDistrictQuery.outFields[0]],r=t[MapConfig.layerForDistrictQuery.outFields[1].toUpperCase()],-1===arrayUtil.indexOf(a,e)&&(a.push(e),n.push({label:e,value:e,province:r}))}),n.sort(function(e,r){return e.label<r.label?-1:e.label>r.label?1:0}),n.unshift({label:"Choose one",value:"NONE",selected:!0}),o.resolve(n)},function(){o.resolve(!1)})),o.promise},o.getSubDistricts=function(e){var r,t,o=new Deferred,i=new QueryTask(MapConfig.layerForSubDistrictQuery.url),s=new Query,n=[],a=[];s.returnGeometry=!1,s.outFields=MapConfig.layerForSubDistrictQuery.outFields;var l;if("ALL"===e[0].value)console.log("ALL"),l="1 = 1";else for(var l="DISTRICT = '",u=0;u<e.length;u++)l+=e[u].value,l+=u==e.length-1?"'":"' OR DISTRICT = '";return s.where=l,i.execute(s,function(e){arrayUtil.forEach(e.features,function(e){r=e.attributes,t=r[MapConfig.layerForSubDistrictQuery.outFields[1]],-1===arrayUtil.indexOf(a,t)&&(a.push(t),n.push({label:r[MapConfig.layerForSubDistrictQuery.outFields[0]],value:t}))}),n.sort(function(e,r){return e.label<r.label?-1:e.label>r.label?1:0}),o.resolve(n)},function(){o.resolve(!1)}),o.promise},o});