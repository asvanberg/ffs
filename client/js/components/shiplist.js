module.exports = (function() {
  var m = require('mithril');

  var shiplist = {};

  shiplist.controller = function(args) {
    this.kms = args.kms;
  }

  function byValue(a, b) {
    return b.zkb.totalValue - a.zkb.totalValue;
  }

  if (!Array.prototype.groupBy) {
    Array.prototype.groupBy = function(f) {
      return this.reduce(function(map, v) {
        (map[f(v)] = map[f(v)] || []).push(v);
        return map;
      }, {})
    }
  }

  shiplist.view = function(ctrl) {
    var a = ctrl.kms().groupBy(function(km) { return km.victim.shipTypeID; });
    var b = Object.keys(a)
    .sort(function(s1, s2) {
      var _s1 = a[s1].reduce(function(acc, e) { return acc + e.zkb.totalValue; }, 0);
      var _s2 = a[s2].reduce(function(acc, e) { return acc + e.zkb.totalValue; }, 0);
      return (_s2 / a[s2].length) - (_s1 / a[s1].length);
    });
    return m('div', b.map(function(shipTypeID) {
      return a[shipTypeID].map(function(km) {
        return m('.media', {key: km.killID}, [
          m('.media-left', m('img', {src: `http://imageserver.eveonline.com/Type/${km.victim.shipTypeID}_64.png`})),
          m('.media-body', [
            m('h4.media-heading', km.victim.characterName),
            km.victim.corporationName,
            (km.victim.allianceName ? [' (', km.victim.allianceName, ')'] : undefined),
            m('br'),
            km.zkb.totalValue
          ])
        ]);
      });
    }));
  }

  return shiplist;
})();
