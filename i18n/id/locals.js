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
      title: 'Indonesian Global Forest Watch Fires'
    }
  }
}));
