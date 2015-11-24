// NOTE: umd wrapper taken from https://www.npmjs.com/package/fid-umd
(function (name, root, factory) { function isObject(x) { return typeof x === "object"; } if (isObject(root.module) && isObject(root.module.exports)) { root.module.exports = factory(); } else if (isObject(root.exports)) { root.exports[name] = factory(); } else if (isObject(root.define) && root.define.amd) { root.define(name, [], factory); } else if (isObject(root.modulejs)) { root.modulejs.define(name, factory); } else if (isObject(root.YUI)) { root.YUI.add(name, function (Y) { Y[name] = factory(); }); } else { root[name] = factory(); } }("locals", this, function () {
  return {
    language: 'id',
    global: {
      pages: [
        {name: 'home', label: 'GFW FIRES', href: '/id/home'},
        {name: 'map', label: 'MAP', href: '/id/map'},
        {name: 'data', label: 'DATA', href: '/id/data'},
        {name: 'about', label: 'LEARN MORE', href: '/id/about'},
        {name: 'story', label: 'STORY', href: '/id/story'}
      ]
    },
    home: {
      meta: {
        title: 'Indonesian Global Forest Watch Fires',
      },
      alerts: {
        title: 'Menerima Api Alerts (google translate)',
        description: 'Mendaftar untuk menerima email pemberitahuan atau SMS api di bidang yang Anda minati. (google translate)',
        button: 'DAFTAR SEKARANG (google translate)'
      },
      analyze: {
        title: 'Analyze Forest Fires',
        description: 'View the latest data on fire locaions and air quality and do your own analysis.',
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
    },
    about: {
    },
    story: {
      title: 'Share information on fires'
    }
  }
}));
