define(["dojo/on","dojo/dom","dojo/query","dijit/registry","views/map/MapConfig"],function(e,t,i,r,a){var s;return{setMap:function(e){s=e},refreshLegend:function(){r.byId("legend").refresh()},setTransparency:function(e,t){var i=Math.floor(t)/100,r=s.getLayer(e);r&&r.setOpacity(i),"Land_Cover"===e&&(r=s.getLayer(a.treeCoverLayer.id),r&&r.setOpacity(i))},toggleLayerVisibility:function(e,t){var i=s.getLayer(e);i&&i.visible!==t&&i.setVisibility(t),this.refreshLegend()},updateFiresLayer:function(e){var r,n,o=i(".selected-fire-option")[0],d=new Date,g=t.byId("confidence-fires-checkbox").checked,y=[],c="",f="";switch(o.id){case"fires72":c=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+(d.getDate()-3)+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds(),f+="ACQ_DATE > date '"+c+"'";break;case"fires48":c=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+(d.getDate()-2)+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds(),f+="ACQ_DATE > date '"+c+"'";break;case"fires24":c=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+(d.getDate()-1)+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds(),f+="ACQ_DATE > date '"+c+"'";break;default:f="1 = 1"}for(var u=0,L=a.firesLayer.defaultLayers.length;L>u;u++)y[u]=f;n=s.getLayer(a.firesLayer.id),n&&(n.setLayerDefinitions(y),e||this.refreshLegend()),e&&(r=g?[0,1]:[0,1,2,3],n&&n.setVisibleLayers(r),this.refreshLegend())},updateAdditionalVisibleLayers:function(e,t){var r,n=s.getLayer(t.id),o=s.getLayer(a.treeCoverLayer.id),d=!1,g=[];i("."+e).forEach(function(e){e.checked&&(r=t[e.value],r&&g.push(r)),"tree-cover-density-radio"===e.id&&(d=e.checked)}),0===g.length&&g.push(-1),n&&(n.setVisibleLayers(g),n.visible||this.toggleLayerVisibility(t.id,!0)),d!==o.visible&&this.updateTreeCoverLayer(d),this.refreshLegend()},updateTreeCoverLayer:function(e){this.toggleLayerVisibility(a.treeCoverLayer.id,e)},updateLegend:function(){}}});