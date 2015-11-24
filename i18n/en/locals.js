// NOTE: umd wrapper taken from https://www.npmjs.com/package/fid-umd
(function (name, root, factory) { function isObject(x) { return typeof x === "object"; } if (isObject(root.module) && isObject(root.module.exports)) { root.module.exports = factory(); } else if (isObject(root.exports)) { root.exports[name] = factory(); } else if (isObject(root.define) && root.define.amd) { root.define(name, [], factory); } else if (isObject(root.modulejs)) { root.modulejs.define(name, factory); } else if (isObject(root.YUI)) { root.YUI.add(name, function (Y) { Y[name] = factory(); }); } else { root[name] = factory(); } }("locals", this, function () {
  return {
    language: 'en',
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
      title: 'GFW Fires'
    }
  }
}));
