define([],function(){var e={defaultState:{v:"home",x:112,y:0,l:5,lyrs:"Active_Fires:Land_Cover/1"},validViews:["home","blog","map","about","data"],navigationLinks:[{html:"Home",viewName:"home",domId:"homeView",selected:!0},{html:"Map",viewName:"map",domId:"mapView",selected:!1},{html:"Fires Blog",viewName:"blog",domId:"blogView",selected:!1},{html:"Data",viewName:"data",domId:"dataView",selected:!1},{html:"About",viewName:"about",domId:"aboutView",selected:!1},{html:"GFW",url:"http://www.globalforestwatch.org",viewName:"link",domId:"link",selected:!1}],headerTitle:"A partnership convened by the World Resources Institute",headerDesc:"Forest Fires and Haze Watch for the ASEAN Region",homeModeOptions:[{html:"Fires Occuring in Peatland <br> in the last 7 days",eventName:"goToMap",display:!1},{html:"<span>View the Latest Analysis</span>",eventName:"goToAnalysis",display:!0},{html:"<span>View the Latest Imagery</span>",eventName:"goToMap",display:!1},{html:"<span>Explore the Map</span>",eventName:"goToMap",display:!1}],footerModeOptions:[{title:"Read The Latest",desc:"Read our latest blog analysis on what's happening with fires in the region",action:"Read Recent Blog Posts",eventName:"goToBlog",css:"blogPosts",url:!1},{title:"Analyze Forest Fires",desc:"View the latest data on fire locations and air quality and do you own analysis",action:"Start Analyzing",eventName:"goToMap",css:"analysisAlerts",url:!1},{title:"Join The Conversation",desc:"Tweet, tweet, tweet!",action:"Tweet Now",eventName:"goToTweet",css:"submitStory",url:"https://twitter.com/search?q=MelawanAsap%20OR%20Indonesiafires&src=typd",target:"_blank"}],dataLinks:[{name:"FIRES",htmlContent:"dataFires",selected:!0},{name:"FOREST USE",htmlContent:"dataForestUse",selected:!1},{name:"CONSERVATION",htmlContent:"dataConservation",selected:!1},{name:"LAND COVER",htmlContent:"dataLandCover",selected:!1},{name:"Air Quality",htmlContent:"dataAirQuality",selected:!1},{name:"Imagery",htmlContent:"dataImagery",selected:!1}],aboutLinks:[{name:"ABOUT GFW-COMMODITIES",htmlContent:"aboutGFW",selected:!0},{name:"HISTORY",htmlContent:"aboutHistory",selected:!1},{name:"PARTNERS",htmlContent:"aboutPartners",selected:!1},{name:"USERS",htmlContent:"aboutUsers",selected:!1},{name:"VIDEOS",htmlContent:"aboutVideos",selected:!1}]};return e});