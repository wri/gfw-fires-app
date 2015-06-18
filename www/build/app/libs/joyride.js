!function(t,e,i){"use strict";var o={version:"2.1",tipLocation:"bottom",nubPosition:"auto",scroll:!0,scrollSpeed:300,timer:0,autoStart:!1,startTimerOnClick:!0,startOffset:0,nextButton:!0,tipAnimation:"fade",pauseAfter:[],tipAnimationFadeSpeed:300,cookieMonster:!1,cookieName:"joyride",cookieDomain:!1,cookiePath:!1,localStorage:!1,localStorageKey:"joyride",tipContainer:"body",modal:!1,expose:!1,postExposeCallback:t.noop,preRideCallback:t.noop,postRideCallback:t.noop,preStepCallback:t.noop,postStepCallback:t.noop,template:{link:'<a href="#close" class="joyride-close-tip">X</a>',timer:'<div class="joyride-timer-indicator-wrap"><span class="joyride-timer-indicator"></span></div>',tip:'<div class="joyride-tip-guide"><span class="joyride-nub"></span></div>',wrapper:'<div class="joyride-content-wrapper" role="dialog"></div>',button:'<a href="#" class="joyride-next-tip"></a>',modal:'<div class="joyride-modal-bg"></div>',expose:'<div class="joyride-expose-wrapper"></div>',exposeCover:'<div class="joyride-expose-cover"></div>'}},n=n||!1,s={},r={init:function(i){return this.each(function(){t.isEmptyObject(s)?(s=t.extend(!0,o,i),s.document=e.document,s.$document=t(s.document),s.$window=t(e),s.$content_el=t(this),s.$body=t(s.tipContainer),s.body_offset=t(s.tipContainer).position(),s.$tip_content=t("> li",s.$content_el),s.paused=!1,s.attempts=0,s.tipLocationPatterns={top:["bottom"],bottom:[],left:["right","top","bottom"],right:["left","top","bottom"]},r.jquery_check(),t.isFunction(t.cookie)||(s.cookieMonster=!1),s.cookieMonster&&t.cookie(s.cookieName)||s.localStorage&&r.support_localstorage()&&localStorage.getItem(s.localStorageKey)||(s.$tip_content.each(function(e){r.create({$li:t(this),index:e})}),s.autoStart&&(!s.startTimerOnClick&&s.timer>0?(r.show("init"),r.startTimer()):r.show("init"))),s.$document.on("click.joyride",".joyride-next-tip, .joyride-modal-bg",function(t){t.preventDefault(),s.$li.next().length<1?r.end():s.timer>0?(clearTimeout(s.automate),r.hide(),r.show(),r.startTimer()):(r.hide(),r.show())}),s.$document.on("click.joyride",".joyride-close-tip",function(t){t.preventDefault(),r.end(!0)}),s.$window.bind("resize.joyride",function(){if(s.$li){if(s.exposed&&s.exposed.length>0){var e=t(s.exposed);e.each(function(){var e=t(this);r.un_expose(e),r.expose(e)})}r.is_phone()?r.pos_phone():r.pos_default()}})):r.restart()})},resume:function(){r.set_li(),r.show()},nextTip:function(){s.$li.next().length<1?r.end():s.timer>0?(clearTimeout(s.automate),r.hide(),r.show(),r.startTimer()):(r.hide(),r.show())},tip_template:function(e){var i,o,n;return e.tip_class=e.tip_class||"",i=t(s.template.tip).addClass(e.tip_class),o=t.trim(t(e.li).html())+r.button_text(e.button_text)+s.template.link+r.timer_instance(e.index),n=t(s.template.wrapper),e.li.attr("data-aria-labelledby")&&n.attr("aria-labelledby",e.li.attr("data-aria-labelledby")),e.li.attr("data-aria-describedby")&&n.attr("aria-describedby",e.li.attr("data-aria-describedby")),i.append(n),i.first().attr("data-index",e.index),t(".joyride-content-wrapper",i).append(o),i[0]},timer_instance:function(e){var i;return i=0===e&&s.startTimerOnClick&&s.timer>0||0===s.timer?"":r.outerHTML(t(s.template.timer)[0])},button_text:function(e){return s.nextButton?(e=t.trim(e)||"Next",e=r.outerHTML(t(s.template.button).append(e)[0])):e="",e},create:function(e){var i=e.$li.attr("data-button")||e.$li.attr("data-text"),o=e.$li.attr("class"),n=t(r.tip_template({tip_class:o,index:e.index,button_text:i,li:e.$li}));t(s.tipContainer).append(n)},show:function(e){var o,n,a={},p=[],l=0,d=null;if(s.$li===i||-1===t.inArray(s.$li.index(),s.pauseAfter))if(s.paused?s.paused=!1:r.set_li(e),s.attempts=0,s.$li.length&&s.$target.length>0){for(e&&(s.preRideCallback(s.$li.index(),s.$next_tip),s.modal&&r.show_modal()),s.preStepCallback(s.$li.index(),s.$next_tip),p=(s.$li.data("options")||":").split(";"),l=p.length,o=l-1;o>=0;o--)n=p[o].split(":"),2===n.length&&(a[t.trim(n[0])]=t.trim(n[1]));s.tipSettings=t.extend({},s,a),s.tipSettings.tipLocationPattern=s.tipLocationPatterns[s.tipSettings.tipLocation],s.modal&&s.expose&&r.expose(),!/body/i.test(s.$target.selector)&&s.scroll&&r.scroll_to(),r.is_phone()?r.pos_phone(!0):r.pos_default(!0),d=t(".joyride-timer-indicator",s.$next_tip),/pop/i.test(s.tipAnimation)?(d.outerWidth(0),s.timer>0?(s.$next_tip.show(),d.animate({width:t(".joyride-timer-indicator-wrap",s.$next_tip).outerWidth()},s.timer)):s.$next_tip.show()):/fade/i.test(s.tipAnimation)&&(d.outerWidth(0),s.timer>0?(s.$next_tip.fadeIn(s.tipAnimationFadeSpeed),s.$next_tip.show(),d.animate({width:t(".joyride-timer-indicator-wrap",s.$next_tip).outerWidth()},s.timer)):s.$next_tip.fadeIn(s.tipAnimationFadeSpeed)),s.$current_tip=s.$next_tip,t(".joyride-next-tip",s.$current_tip).focus(),r.tabbable(s.$current_tip)}else s.$li&&s.$target.length<1?r.show():r.end();else s.paused=!0},is_phone:function(){return n?n.mq("only screen and (max-width: 767px)"):s.$window.width()<767?!0:!1},support_localstorage:function(){return n?n.localstorage:!!e.localStorage},hide:function(){s.modal&&s.expose&&r.un_expose(),s.modal||t(".joyride-modal-bg").hide(),s.$current_tip.hide(),s.postStepCallback(s.$li.index(),s.$current_tip)},set_li:function(t){t?(s.$li=s.$tip_content.eq(s.startOffset),r.set_next_tip(),s.$current_tip=s.$next_tip):(s.$li=s.$li.next(),r.set_next_tip()),r.set_target()},set_next_tip:function(){s.$next_tip=t(".joyride-tip-guide[data-index="+s.$li.index()+"]")},set_target:function(){var e=s.$li.attr("data-class"),i=s.$li.attr("data-id"),o=function(){return i?t(s.document.getElementById(i)):e?t("."+e).filter(":visible").first():t("body")};s.$target=o()},scroll_to:function(){var e,i;e=s.$window.height()/2,i=Math.ceil(s.$target.offset().top-e+s.$next_tip.outerHeight()),t("html, body").stop().animate({scrollTop:i},s.scrollSpeed)},paused:function(){return-1===t.inArray(s.$li.index()+1,s.pauseAfter)?!0:!1},destroy:function(){t.isEmptyObject(s)||s.$document.off(".joyride"),t(e).off(".joyride"),t(".joyride-close-tip, .joyride-next-tip, .joyride-modal-bg").off(".joyride"),t(".joyride-tip-guide, .joyride-modal-bg").remove(),clearTimeout(s.automate),s={}},restart:function(){s.autoStart?(r.hide(),s.$li=i,r.show("init")):(!s.startTimerOnClick&&s.timer>0?(r.show("init"),r.startTimer()):r.show("init"),s.autoStart=!0)},pos_default:function(e){var i=(Math.ceil(s.$window.height()/2),s.$next_tip.offset(),t(".joyride-nub",s.$next_tip)),o=Math.ceil(i.outerWidth()/2),n=Math.ceil(i.outerHeight()/2),a=e||!1;if(a&&(s.$next_tip.css("visibility","hidden"),s.$next_tip.show()),/body/i.test(s.$target.selector))s.$li.length&&r.pos_modal(i);else{var p=s.tipSettings.tipAdjustmentY?parseInt(s.tipSettings.tipAdjustmentY):0,l=s.tipSettings.tipAdjustmentX?parseInt(s.tipSettings.tipAdjustmentX):0;r.bottom()?(s.$next_tip.css({top:s.$target.offset().top+n+s.$target.outerHeight()+p,left:s.$target.offset().left+l}),/right/i.test(s.tipSettings.nubPosition)&&s.$next_tip.css("left",s.$target.offset().left-s.$next_tip.outerWidth()+s.$target.outerWidth()),r.nub_position(i,s.tipSettings.nubPosition,"top")):r.top()?(s.$next_tip.css({top:s.$target.offset().top-s.$next_tip.outerHeight()-n+p,left:s.$target.offset().left+l}),r.nub_position(i,s.tipSettings.nubPosition,"bottom")):r.right()?(s.$next_tip.css({top:s.$target.offset().top+p,left:s.$target.outerWidth()+s.$target.offset().left+o+l}),r.nub_position(i,s.tipSettings.nubPosition,"left")):r.left()&&(s.$next_tip.css({top:s.$target.offset().top+p,left:s.$target.offset().left-s.$next_tip.outerWidth()-o+l}),r.nub_position(i,s.tipSettings.nubPosition,"right")),!r.visible(r.corners(s.$next_tip))&&s.attempts<s.tipSettings.tipLocationPattern.length&&(i.removeClass("bottom").removeClass("top").removeClass("right").removeClass("left"),s.tipSettings.tipLocation=s.tipSettings.tipLocationPattern[s.attempts],s.attempts++,r.pos_default(!0))}a&&(s.$next_tip.hide(),s.$next_tip.css("visibility","visible"))},pos_phone:function(e){var i=s.$next_tip.outerHeight(),o=(s.$next_tip.offset(),s.$target.outerHeight()),n=t(".joyride-nub",s.$next_tip),a=Math.ceil(n.outerHeight()/2),p=e||!1;n.removeClass("bottom").removeClass("top").removeClass("right").removeClass("left"),p&&(s.$next_tip.css("visibility","hidden"),s.$next_tip.show()),/body/i.test(s.$target.selector)?s.$li.length&&r.pos_modal(n):r.top()?(s.$next_tip.offset({top:s.$target.offset().top-i-a}),n.addClass("bottom")):(s.$next_tip.offset({top:s.$target.offset().top+o+a}),n.addClass("top")),p&&(s.$next_tip.hide(),s.$next_tip.css("visibility","visible"))},pos_modal:function(t){r.center(),t.hide(),r.show_modal()},show_modal:function(){t(".joyride-modal-bg").length<1&&t("body").append(s.template.modal).show(),/pop/i.test(s.tipAnimation)?t(".joyride-modal-bg").show():t(".joyride-modal-bg").fadeIn(s.tipAnimationFadeSpeed)},expose:function(){var i,o,n,a,p="expose-"+Math.floor(1e4*Math.random());if(arguments.length>0&&arguments[0]instanceof t)n=arguments[0];else{if(!s.$target||/body/i.test(s.$target.selector))return!1;n=s.$target}return n.length<1?(e.console&&console.error("element not valid",n),!1):(i=t(s.template.expose),s.$body.append(i),i.css({top:n.offset().top,left:n.offset().left,width:n.outerWidth(!0),height:n.outerHeight(!0)}),o=t(s.template.exposeCover),a={zIndex:n.css("z-index"),position:n.css("position")},n.css("z-index",1*i.css("z-index")+1),"static"==a.position&&n.css("position","relative"),n.data("expose-css",a),o.css({top:n.offset().top,left:n.offset().left,width:n.outerWidth(!0),height:n.outerHeight(!0)}),s.$body.append(o),i.addClass(p),o.addClass(p),s.tipSettings.exposeClass&&(i.addClass(s.tipSettings.exposeClass),o.addClass(s.tipSettings.exposeClass)),n.data("expose",p),s.postExposeCallback(s.$li.index(),s.$next_tip,n),r.add_exposed(n),void 0)},un_expose:function(){var i,o,n,a,p=!1;if(arguments.length>0&&arguments[0]instanceof t)o=arguments[0];else{if(!s.$target||/body/i.test(s.$target.selector))return!1;o=s.$target}return o.length<1?(e.console&&console.error("element not valid",o),!1):(i=o.data("expose"),n=t("."+i),arguments.length>1&&(p=arguments[1]),p===!0?t(".joyride-expose-wrapper,.joyride-expose-cover").remove():n.remove(),a=o.data("expose-css"),"auto"==a.zIndex?o.css("z-index",""):o.css("z-index",a.zIndex),a.position!=o.css("position")&&("static"==a.position?o.css("position",""):o.css("position",a.position)),o.removeData("expose"),o.removeData("expose-z-index"),r.remove_exposed(o),void 0)},add_exposed:function(e){s.exposed=s.exposed||[],e instanceof t?s.exposed.push(e[0]):"string"==typeof e&&s.exposed.push(e)},remove_exposed:function(e){var i;e instanceof t?i=e[0]:"string"==typeof e&&(i=e),s.exposed=s.exposed||[];for(var o=0;o<s.exposed.length;o++)if(s.exposed[o]==i)return s.exposed.splice(o,1),void 0},center:function(){var t=s.$window;return s.$next_tip.css({top:(t.height()-s.$next_tip.outerHeight())/2+t.scrollTop(),left:(t.width()-s.$next_tip.outerWidth())/2+t.scrollLeft()}),!0},bottom:function(){return/bottom/i.test(s.tipSettings.tipLocation)},top:function(){return/top/i.test(s.tipSettings.tipLocation)},right:function(){return/right/i.test(s.tipSettings.tipLocation)},left:function(){return/left/i.test(s.tipSettings.tipLocation)},corners:function(t){var e=s.$window,i=e.height()/2,o=Math.ceil(s.$target.offset().top-i+s.$next_tip.outerHeight()),n=e.width()+e.scrollLeft(),r=e.height()+o,a=e.height()+e.scrollTop(),p=e.scrollTop();return p>o&&(p=0>o?0:o),r>a&&(a=r),[t.offset().top<p,n<t.offset().left+t.outerWidth(),a<t.offset().top+t.outerHeight(),e.scrollLeft()>t.offset().left]},visible:function(t){for(var e=t.length;e--;)if(t[e])return!1;return!0},nub_position:function(t,e,i){"auto"===e?t.addClass(i):t.addClass(e)},startTimer:function(){s.$li.length?s.automate=setTimeout(function(){r.hide(),r.show(),r.startTimer()},s.timer):clearTimeout(s.automate)},end:function(e){e=e||!1,e&&s.$window.unbind("resize.joyride"),s.cookieMonster&&t.cookie(s.cookieName,"ridden",{expires:365,domain:s.cookieDomain,path:s.cookiePath}),s.localStorage&&localStorage.setItem(s.localStorageKey,!0),s.timer>0&&clearTimeout(s.automate),s.modal&&s.expose&&r.un_expose(),s.$current_tip&&s.$current_tip.hide(),s.$li&&(s.postStepCallback(s.$li.index(),s.$current_tip,e),s.postRideCallback(s.$li.index(),s.$current_tip,e)),t(".joyride-modal-bg").hide()},jquery_check:function(){return t.isFunction(t.fn.on)?!0:(t.fn.on=function(t,e,i){return this.delegate(e,t,i)},t.fn.off=function(t,e,i){return this.undelegate(e,t,i)},!1)},outerHTML:function(t){return t.outerHTML||(new XMLSerializer).serializeToString(t)},version:function(){return s.version},tabbable:function(e){t(e).on("keydown",function(i){if(!i.isDefaultPrevented()&&i.keyCode&&27===i.keyCode)return i.preventDefault(),r.end(!0),void 0;if(9===i.keyCode){var o=t(e).find(":tabbable"),n=o.filter(":first"),s=o.filter(":last");i.target!==s[0]||i.shiftKey?i.target===n[0]&&i.shiftKey&&(s.focus(1),i.preventDefault()):(n.focus(1),i.preventDefault())}})}};t.fn.joyride=function(e){return r[e]?r[e].apply(this,Array.prototype.slice.call(arguments,1)):"object"!=typeof e&&e?(t.error("Method "+e+" does not exist on jQuery.joyride"),void 0):r.init.apply(this,arguments)}}(jQuery,this);