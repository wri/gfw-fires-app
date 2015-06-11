define(["esri/Color","dojo/sniff","esri/graphic","esri/request","utils/Helper","dijit/registry","dojo/dom-class","dojo/_base/array","dojo/store/Memory","dojo/dom-construct","dijit/form/ComboBox","views/map/MapConfig","views/map/MapModel","esri/geometry/Polygon","esri/geometry/scaleUtils","esri/symbols/SimpleFillSymbol","esri/symbols/SimpleLineSymbol"],function(e,t,a,o,r,i,n,s,l,d,u,m,p,c,f,g,h){var y,b={setMap:function(e){return y=e,this},beginUpload:function(e){var a=e.target?e.target:e.srcElement;if(""!==a.value){var r,i,n=a.value.toLowerCase();if(t("ie")){var s=n.split("\\");n=s[s.length-1]}if(n.indexOf(".zip")<0)return void alert("Currently only files with a .zip extension are supported.");n=n.split("."),n=n[0].replace("c:\\fakepath\\",""),r={name:n,generalize:!0,targetSR:y.spatialReference,maxRecordCount:1e3,reducePrecision:!0,numberOfDigitsAfterDecimal:0,enforceInputFileSizeLimit:!0,enforceOutputJsonSizeLimit:!0},i=f.getExtentForScale(y,4e4),r.maxAllowableOffset=i.getWidth()/y.width,o({url:m.uploadOptions.url,content:{filetype:"shapefile",publishParameters:JSON.stringify(r),f:"json","callback.html":"textarea"},form:document.uploadForm,handleAs:"json",error:this.uploadError,load:this.uploadSuccess.bind(this)})}},uploadError:function(e){alert(["Error:",e.message].join(" "))},uploadSuccess:function(e){function t(){i.byId("uploadComboNameWidget")&&i.byId("uploadComboNameWidget").destroy(),document.getElementById("dropdownContainerName")&&d.destroy("dropdownContainerName"),document.uploadForm.file.value=""}var a,o=document.getElementById("uploadNameSelectContainer"),r=e.featureCollection,n=[],m=this;s.forEach(r.layers[0].layerDefinition.fields,function(e){n.push({name:e.name,id:e.alias})}),d.create("div",{id:"dropdownContainerName",innerHTML:"<div id='uploadComboNameWidget'></div>"},o,"first"),a=new l({data:n}),new u({id:"uploadComboNameWidget",value:"-- Choose name field --",store:a,searchAttr:"name",onChange:function(e){e&&(m.addFeaturesToMap(e,r.layers[0].featureSet),t())}},"uploadComboNameWidget")},nextId:function(){var e,t=y.graphics.graphics,a=t.length,o=0,r=0;for(o;a>o;o+=1)"point"!==t[o].geometry.type&&(e=parseInt(t[o].attributes.GRAPHIC_ID),isNaN(e)||(r=e>r?e:r));return r+1},addFeaturesToMap:function(t,o){var i,n,l,d,u=m.defaultGraphicsLayerUniqueId,f=m.defaultGraphicsLayerLabel,b=y.graphics;i=new g(g.STYLE_SOLID,new h(h.STYLE_SOLID,new e([255,0,0]),2),new e([103,200,255,0])),s.forEach(o.features,function(e){e.attributes[f]=e.attributes[t],e.attributes[u]=r.nextAvailableGraphicId(b,u),l=new c(e.geometry),n=new a(l,i,e.attributes),d=d?d.union(l.getExtent()):l.getExtent(),b.add(n),p.vm.customFeaturesArray().push(n)}),p.vm.customFeaturesPresence(!0),y.setExtent(d,!0)}};return b});