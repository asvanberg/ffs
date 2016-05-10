module.exports = (function() {
  var m = require('mithril');

  var shiplist = {};

  shiplist.controller = function(args) {
    this.kms = args.kms;
  }

  function byValue(a, b) {
    return b.zkb.totalValue - a.zkb.totalValue;
  }

  function prettyNumber(num) {
    if (num === 0) { return 0; }
    else if (num > 1e9) { return `${(num / 1e9).toFixed(2)}B`; }
    else if (num > 1e6) { return `${(num / 1e6).toFixed(2)}M`; }
    else { return `${(num / 1e3).toFixed(2)}K`; }
  }

  if (!Array.prototype.groupBy) {
    Array.prototype.groupBy = function(f) {
      return this.reduce((map, v) => {
        (map[f(v)] = map[f(v)] || []).push(v);
        return map;
      }, {});
    }
  }

  shiplist.view = function(ctrl) {
    var a = ctrl.kms().groupBy(km => km.victim.shipTypeID);
    var b = Object.keys(a)
      .sort((s1, s2) => {
        var totalValue = (sum, km) => sum + km.zkb.totalValue;
        var _s1 = a[s1].reduce(totalValue, 0);
        var _s2 = a[s2].reduce(totalValue, 0);
        return (_s2 / a[s2].length) - (_s1 / a[s1].length);
      });
    return m('div', b.map(shipTypeID =>
      a[shipTypeID].map(km =>
        m('.media', {key: km.killID}, [
          m('.media-left',
            m('a', {href: `https://zkillboard.com/kill/${km.killID}/`},
              m('img.img-rounded', {src: `https://imageserver.eveonline.com/Type/${km.victim.shipTypeID}_64.png`}))),
          m('.media-body', [
            m('h4.media-heading',
              m('a', {href: `https://zkillboard.com/character/${km.victim.characterID}/`},
                km.victim.characterName)),
            km.victim.corporationName,
            (km.victim.allianceName ? [' (', km.victim.allianceName, ')'] : null),
            m('br'),
            prettyNumber(km.zkb.totalValue), ' ISK'
          ])
        ])
      )
    ));
  }

  return shiplist;
})();
