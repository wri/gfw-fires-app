!function(t){"object"==typeof exports?module.exports=t():"function"==typeof define&&define.amd?define(t):geostats=t()}(function(){var t=function(t){return"number"==typeof t&&parseFloat(t)==parseInt(t,10)&&!isNaN(t)};return Array.prototype.indexOf||(Array.prototype.indexOf=function(t,s){if(void 0===this||null===this)throw new TypeError('"this" is null or not defined');var i=this.length>>>0;for(s=+s||0,1/0===Math.abs(s)&&(s=0),0>s&&(s+=i,0>s&&(s=0));i>s;s++)if(this[s]===t)return s;return-1}),function(s){this.objectId="",this.legendSeparator=this.separator=" - ",this.method="",this.precision=0,this.precisionflag="auto",this.roundlength=2,this.debug=this.is_uniqueValues=!1,this.bounds=[],this.ranges=[],this.inner_ranges=null,this.colors=[],this.counter=[],this.stat_cov=this.stat_stddev=this.stat_variance=this.stat_pop=this.stat_min=this.stat_max=this.stat_sum=this.stat_median=this.stat_mean=this.stat_sorted=null,this.log=function(t){1==this.debug&&console.log(this.objectID+"(object id) :: "+t)},this.setBounds=function(t){this.log("Setting bounds ("+t.length+") : "+t.join()),this.bounds=[],this.bounds=t},this.setSerie=function(t){this.log("Setting serie ("+t.length+") : "+t.join()),this.serie=[],this.serie=t,this.setPrecision()},this.setColors=function(t){this.log("Setting color ramp ("+t.length+") : "+t.join()),this.colors=t},this.doCount=function(){if(!this._nodata()){var t=this.sorted();for(this.counter=[],i=0;i<this.bounds.length-1;i++)this.counter[i]=0;for(j=0;j<t.length;j++){var s=this.getClass(t[j]);this.counter[s]++}}},this.setPrecision=function(t){if("undefined"!=typeof t&&(this.precisionflag="manual",this.precision=t),"auto"==this.precisionflag)for(t=0;t<this.serie.length;t++){var s=isNaN(this.serie[t]+"")||-1==(this.serie[t]+"").toString().indexOf(".")?0:(this.serie[t]+"").split(".")[1].length;s>this.precision&&(this.precision=s)}this.log("Calling setPrecision(). Mode : "+this.precisionflag+" - Decimals : "+this.precision),this.serie=this.decimalFormat(this.serie)},this.decimalFormat=function(t){for(var s=[],i=0;i<t.length;i++){var e=t[i];s[i]=!isNaN(parseFloat(e))&&isFinite(e)?parseFloat(t[i].toFixed(this.precision)):t[i]}return s},this.setRanges=function(){for(this.ranges=[],i=0;i<this.bounds.length-1;i++)this.ranges[i]=this.bounds[i]+this.separator+this.bounds[i+1]},this.min=function(){return this._nodata()?void 0:this.stat_min=Math.min.apply(null,this.serie)},this.max=function(){return this.stat_max=Math.max.apply(null,this.serie)},this.sum=function(){if(!this._nodata()){if(null==this.stat_sum)for(i=this.stat_sum=0;i<this.pop();i++)this.stat_sum+=parseFloat(this.serie[i]);return this.stat_sum}},this.pop=function(){return this._nodata()?void 0:(null==this.stat_pop&&(this.stat_pop=this.serie.length),this.stat_pop)},this.mean=function(){return this._nodata()?void 0:(null==this.stat_mean&&(this.stat_mean=parseFloat(this.sum()/this.pop())),this.stat_mean)},this.median=function(){if(!this._nodata()){if(null==this.stat_median){this.stat_median=0;var t=this.sorted();this.stat_median=t.length%2?parseFloat(t[Math.ceil(t.length/2)-1]):(parseFloat(t[t.length/2-1])+parseFloat(t[t.length/2]))/2}return this.stat_median}},this.variance=function(){if(round="undefined"==typeof round?!0:!1,!this._nodata()){if(null==this.stat_variance){for(var t=0,s=0;s<this.pop();s++)t+=Math.pow(this.serie[s]-this.mean(),2);this.stat_variance=t/this.pop(),1==round&&(this.stat_variance=Math.round(this.stat_variance*Math.pow(10,this.roundlength))/Math.pow(10,this.roundlength))}return this.stat_variance}},this.stddev=function(t){return t="undefined"==typeof t?!0:!1,this._nodata()?void 0:(null==this.stat_stddev&&(this.stat_stddev=Math.sqrt(this.variance()),1==t&&(this.stat_stddev=Math.round(this.stat_stddev*Math.pow(10,this.roundlength))/Math.pow(10,this.roundlength))),this.stat_stddev)},this.cov=function(t){return t="undefined"==typeof t?!0:!1,this._nodata()?void 0:(null==this.stat_cov&&(this.stat_cov=this.stddev()/this.mean(),1==t&&(this.stat_cov=Math.round(this.stat_cov*Math.pow(10,this.roundlength))/Math.pow(10,this.roundlength))),this.stat_cov)},this._nodata=function(){return 0==this.serie.length?(alert("Error. You should first enter a serie!"),1):0},this._hasNegativeValue=function(){for(i=0;i<this.serie.length;i++)if(0>this.serie[i])return!0;return!1},this._hasZeroValue=function(){for(i=0;i<this.serie.length;i++)if(0===parseFloat(this.serie[i]))return!0;return!1},this.sorted=function(){return null==this.stat_sorted&&(this.stat_sorted=0==this.is_uniqueValues?this.serie.sort(function(t,s){return t-s}):this.serie.sort(function(t,s){var i=t.toString().toLowerCase(),e=s.toString().toLowerCase();return e>i?-1:i>e?1:0})),this.stat_sorted},this.info=function(){if(!this._nodata()){var t;return t=""+("Population : "+this.pop()+" - [Min : "+this.min()+" | Max : "+this.max()+"]\n"),t+="Mean : "+this.mean()+" - Median : "+this.median()+"\n",t+="Variance : "+this.variance()+" - Standard deviation : "+this.stddev()+" - Coefficient of variation : "+this.cov()+"\n"}},this.setClassManually=function(t){if(!this._nodata()){if(t[0]===this.min()&&t[t.length-1]===this.max())return this.setBounds(t),this.setRanges(),this.method="manual classification ("+(t.length-1)+" classes)",this.bounds;t=alert;var s="Given bounds may not be correct! please check your input.\nMin value : "+this.min()+" / Max value : "+this.max();t(s)}},this.getClassEqInterval=function(t){if(!this._nodata()){var s=this.max(),e=[],n=this.min(),a=(s-this.min())/t;for(i=0;t>=i;i++)e[i]=n,n+=a;return e[t]=s,this.setBounds(e),this.setRanges(),this.method="eq. intervals ("+t+" classes)",this.bounds}},this.getQuantiles=function(t){for(var s=this.sorted(),i=[],e=this.pop()/t,n=1;t>n;n++){var a=Math.round(n*e+.49);i.push(s[a-1])}return i},this.getClassQuantile=function(t){if(!this._nodata()){var s=this.sorted(),i=this.getQuantiles(t);return i.unshift(s[0]),i[s.length-1]!==s[s.length-1]&&i.push(s[s.length-1]),this.setBounds(i),this.setRanges(),this.method="quantile ("+t+" classes)",this.bounds}},this.getClassStdDeviation=function(t){if(!this._nodata()){this.max(),this.min();var s=[];if(1==t%2){var e=Math.floor(t/2),n=e+1;s[e]=this.mean()-this.stddev()/2,s[n]=this.mean()+this.stddev()/2,i=e-1}else n=t/2,s[n]=this.mean(),i=n-1;for(;i>0;i--)e=s[i+1]-this.stddev(),s[i]=e;for(i=n+1;t>i;i++)e=s[i-1]+this.stddev(),s[i]=e;return s[0]=this.min(),s[t]=this.max(),this.setBounds(s),this.setRanges(),this.method="std deviation ("+t+" classes)",this.bounds}},this.getClassGeometricProgression=function(t){if(!this._nodata()){if(!this._hasNegativeValue()&&!this._hasZeroValue()){var s=[],e=this.min(),n=this.max(),n=Math.log(n)/Math.LN10,e=Math.log(e)/Math.LN10,n=(n-e)/t;for(i=0;t>i;i++)s[i]=0==i?e:s[i-1]+n;return s=s.map(function(t){return Math.pow(10,t)}),s.push(this.max()),this.setBounds(s),this.setRanges(),this.method="geometric progression ("+t+" classes)",this.bounds}alert("geometric progression can't be applied with a serie containing negative or zero values.")}},this.getClassArithmeticProgression=function(t){if(!this._nodata()){var s=0;for(i=1;t>=i;i++)s+=i;var e=[],n=this.min(),s=(this.max()-n)/s;for(i=0;t>=i;i++)e[i]=0==i?n:e[i-1]+i*s;return this.setBounds(e),this.setRanges(),this.method="arithmetic progression ("+t+" classes)",this.bounds}},this.getClassJenks=function(t){if(!this._nodata()){dataList=this.sorted();for(var s=[],i=0,e=dataList.length+1;e>i;i++){for(var n=[],a=0,o=t+1;o>a;a++)n.push(0);s.push(n)}for(i=[],e=0,n=dataList.length+1;n>e;e++){for(var a=[],o=0,h=t+1;h>o;o++)a.push(0);i.push(a)}for(e=1,n=t+1;n>e;e++){s[0][e]=1,i[0][e]=0;for(var r=1,a=dataList.length+1;a>r;r++)i[r][e]=1/0;r=0}for(e=2,n=dataList.length+1;n>e;e++){for(var h=o=a=0,u=1,l=e+1;l>u;u++){var d=e-u+1,r=parseFloat(dataList[d-1]),o=o+r*r,a=a+r,h=h+1,r=o-a*a/h,g=d-1;if(0!=g)for(var c=2,f=t+1;f>c;c++)i[e][c]>=r+i[g][c-1]&&(s[e][c]=d,i[e][c]=r+i[g][c-1])}s[e][1]=1,i[e][1]=r}for(r=dataList.length,i=[],e=0,n=t+1;n>e;e++)i.push(0);for(i[t]=parseFloat(dataList[dataList.length-1]),i[0]=parseFloat(dataList[0]),e=t;e>=2;)n=parseInt(s[r][e]-2),i[e-1]=dataList[n],r=parseInt(s[r][e]-1),e-=1;return i[0]==i[1]&&(i[0]=0),this.setBounds(i),this.setRanges(),this.method="Jenks ("+t+" classes)",this.bounds}},this.getClassUniqueValues=function(){if(!this._nodata()){this.is_uniqueValues=!0;var t=this.sorted(),s=[];for(i=0;i<this.pop();i++)-1===s.indexOf(t[i])&&s.push(t[i]);return this.bounds=s,this.method="unique values",s}},this.getClass=function(t){for(i=0;i<this.bounds.length;i++)if(1==this.is_uniqueValues){if(t==this.bounds[i])return i}else if(parseFloat(t)<=this.bounds[i+1])return i;return"Unable to get value's class."},this.getRanges=function(){return this.ranges},this.getRangeNum=function(t){var s,i;for(i=0;i<this.ranges.length;i++)if(s=this.ranges[i].split(/ - /),t<=parseFloat(s[1]))return i},this.getInnerRanges=function(){if(null!=this.inner_ranges)return this.inner_ranges;var t=[],s=this.sorted(),e=1;for(i=0;i<s.length;i++){if(0==i)var n=s[i];if(parseFloat(s[i])>parseFloat(this.bounds[e])&&(t[e-1]=""+n+this.separator+s[i-1],n=s[i],e++),e==this.bounds.length-1)return t[e-1]=""+n+this.separator+s[s.length-1],this.inner_ranges=t}},this.getSortedlist=function(){return this.sorted().join(", ")},this.getHtmlLegend=function(s,e,n,a,o){var h="";if(this.doCount(),ccolors=null!=s?s:this.colors,lg=null!=e?e:"Legend",getcounter=null!=n?!0:!1,fn=null!=a?a:function(t){return t},null==o&&(o="default"),"discontinuous"==o&&(this.getInnerRanges(),-1!==this.counter.indexOf(0)))return alert("Geostats cannot apply 'discontinuous' mode to the getHtmlLegend() method because some classes are not populated.\nPlease switch to 'default' or 'distinct' modes. Exit!"),void 0;if(!(ccolors.length<this.ranges.length)){if(s='<div class="geostats-legend"><div class="geostats-legend-title">'+lg+"</div>",0==this.is_uniqueValues)for(i=0;i<this.ranges.length;i++)!0===getcounter&&(h=' <span class="geostats-legend-counter">('+this.counter[i]+")</span>"),n=this.ranges[i].split(this.separator),e=parseFloat(n[0]).toFixed(this.precision),n=parseFloat(n[1]).toFixed(this.precision),"distinct"==o&&0!=i&&(t(e)?e=parseInt(e)+1:(e=parseFloat(e)+1/Math.pow(10,this.precision),e=parseFloat(e).toFixed(this.precision))),"discontinuous"==o&&(n=this.inner_ranges[i].split(this.separator),e=parseFloat(n[0]).toFixed(this.precision),n=parseFloat(n[1]).toFixed(this.precision)),e=fn(e)+this.legendSeparator+fn(n),s+='<div><div class="geostats-legend-block" style="background-color:'+ccolors[i]+'"></div> '+e+h+"</div>";else for(i=0;i<this.bounds.length;i++)!0===getcounter&&(h=' <span class="geostats-legend-counter">('+this.counter[i]+")</span>"),e=fn(this.bounds[i]),s+='<div><div class="geostats-legend-block" style="background-color:'+ccolors[i]+'"></div> '+e+h+"</div>";return s+"</div>"}alert("The number of colors should fit the number of ranges. Exit!")},this.objectID=(new Date).getUTCMilliseconds(),this.log("Creating new geostats object"),"undefined"!=typeof s&&0<s.length?(this.serie=s,this.setPrecision(),this.log("Setting serie ("+s.length+") : "+s.join())):this.serie=[],this.getJenks=this.getClassJenks,this.getGeometricProgression=this.getClassGeometricProgression,this.getEqInterval=this.getClassEqInterval,this.getQuantile=this.getClassQuantile,this.getStdDeviation=this.getClassStdDeviation,this.getUniqueValues=this.getClassUniqueValues,this.getArithmeticProgression=this.getClassArithmeticProgression}});