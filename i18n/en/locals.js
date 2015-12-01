// NOTE: umd wrapper taken from https://www.npmjs.com/package/fid-umd
(function (name, root, factory) { function isObject(x) { return typeof x === "object"; } if (isObject(root.module) && isObject(root.module.exports)) { root.module.exports = factory(); } else if (isObject(root.exports)) { root.exports[name] = factory(); } else if (isObject(root.define) && root.define.amd) { root.define(name, [], factory); } else if (isObject(root.modulejs)) { root.modulejs.define(name, factory); } else if (isObject(root.YUI)) { root.YUI.add(name, function (Y) { Y[name] = factory(); }); } else { root[name] = factory(); } }("locals", this, function () {
  return {
    language: 'en',
    meta: {
      version: 2.0,
      // TODO: make version dynamic off npm package version
      esriVersion: 3.14
    },
    global: {
      pages: [
        {name: 'home', label: 'GFW FIRES', href: '/en/home'},
        {name: 'map', label: 'MAP', href: '/en/map'},
        {name: 'data', label: 'DATA', href: '/en/data'},
        {name: 'about', label: 'LEARN MORE', href: '/en/about'},
        {name: 'story', label: 'STORY', href: '/en/story'}
      ]
    },
    home: {
      meta: {
        title: 'Global Forest Watch Fires',
      },
      alerts: {
        title: 'Receive Fire Alerts',
        description: 'Sign up to receive email or SMS fire alerts in your area of interest.',
        button: 'SIGN UP NOW',
        modal: {
          title: 'Sign up to receive fire alerts!',
          content: [
            'To sign up for clearance or fire alerts, go to the',
            'Map',
            'and select an area to analyze. You can sign up for alerts on that area through the Subscribe button on the analysis report.'
          ]
        }
      },
      analyze: {
        title: 'Analyze Forest Fires',
        description: 'View the latest data on fire locations and air quality and do your own analysis.',
        button: 'START ANALYZING'
      },
      social: {
        title: 'Join the Conversation',
        description: 'Tweet, tweet, tweet!',
        button: 'TWEET NOW'
      }
    },
    map: {
    },
    data: {
      meta: {
        title: 'Data | Global Forest Watch Fires'
      },
      title: 'Data Sources',
      description: 'Global Forest Watch hosts a wealth of data relating to forests. Some data have been developed by WRI or by GFW partner organizations. Other data are in the public domain and have been developed by governments, NGOs, and companies. The data vary in accuracy, resolution, frequency of update, and geographic coverage. The summaries below include links to further information such as methods and technical documents. Full download of the data sets is available for most sources.'
    },
    about: {
      meta: {
        title: 'Learn More | Global Forest Watch Fires'
      },
      title: 'Learn More',
      description: 'Global Forest Watch Fires (GFW Fires) is an online platform for monitoring and responding to forest and land fires in the ASEAN region using near real-time information. GFW Fires can empower people to better combat harmful fires before they burn out of control and hold accountable those who may have burned forests illegally.',
      content: {
        about: [
          'About GFW Fires',
          'Global Forest Watch Fires (GFW Fires) is an online platform for monitoring and responding to forest and land fires in the ASEAN region using near real-time information. GFW Fires can empower people to better combat harmful fires before they burn out of control and hold accountable those who may have burned forests illegally.',
          'GFW Fires combines real-time satellite data from NASA’s Active Fires system, high resolution satellite imagery, detailed maps of land cover and concessions for key commodities such as palm oil and wood pulp, weather conditions and air quality data to track fire activity and related impacts in the South East Asia region. GFW Fires also offers on-the-fly analysis to show where fires occur, and help understand who might be responsible.',
          'By working with national and local governments, NGOs, corporations, and individuals, GFW Fires is working to quicken fire response time, ramp up enforcement against illegal fires, help ensure those who are illegally burning are held accountable, and coordinate relationships between government agencies.',
          'GFW Fires builds on the groundbreaking platform, Global Forest Watch, but with a specific focus on mitigating harmful fire activity in the ASEAN region. GFW Fires is free to use and follows an open data approach in putting decision-relevant information in the hands of all who want to minimize the impacts of fires on forests and human health and livelihoods.',
          'GFW Fires is supported by a diverse partnership of organizations that contribute data, technical capabilities, funding, and expertise. The partnership is convened by the World Resources Institute. See a full list of partners below.'
        ],
        fires: [
          'Forest fires and their impact',
          'Fires are a long-standing problem. The causes of these fires are complex, and are often attributed to companies clearing land for oil palm or other plantations, small farmers clearing land for cultivation, or communities using fire to clear forest, often in areas of conflict with large companies.',
          'In low-lying primary forests such as those in Indonesia, the peat soils can make fires much worse. Peat fires are much harder to put out and release far greater amounts of smoke and greenhouse gases into the atmosphere than fires in non-peat areas and are associated with an',
          'increased risk',
          'of respiratory illness and heart attacks. This noxious haze can cross oceans and borders, carrying serious pollution and health concerns across the region causing international tensions.',
          'Help combat forest fires by participating with the GFW Fires system, signing up to receive Fire Alerts in Indonesia, or sharing your story on our blog.',
          'INDONESIAN FOREST FIRES: FROM CAUSE TO EFFECT'
        ],
        partnership: [
          'The GFW Partnership'
        ]
      }
    },
    story: {
      meta: {
        title: 'Submit a Story | Global Forest Watch'
      },
      title: 'Share information on fires'
    }
  }
}));
