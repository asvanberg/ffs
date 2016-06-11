module.exports = (function() {
  require('../util/polyfill');
  const m = require('mithril')
      , db = require('../util/database')

  var shiplist = {};

  shiplist.controller = function(args) {
    return {
      findKM(characterID, shipTypeID) {
        return args.kms().find(km => km.victim.characterID === characterID && km.victim.shipTypeID === shipTypeID);
      }
    }
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

  shiplist.view = function(ctrl, args) {
    var a = args.characters().groupBy(character => character.ship.id);
    var b = Object.keys(a)
      .sortBy(shipTypeID => db.ship(shipTypeID).volume, true);
    return m('div', b.map(shipTypeID =>
      a[shipTypeID].sortBy(character => character.name.toUpperCase()).map(character => {
        const km = ctrl.findKM(character.id, character.ship.id);
        return m('.media', {key: `${character.id}-${shipTypeID}`, class: km ? 'bg-danger' : ''}, [
          m('.media-left',
            (img => km
              ? m('a', {href: `https://zkillboard.com/kill/${km.killID}/`}, img)
              : img
            )(m('img.img-rounded', {src: `https://imageserver.eveonline.com/Type/${shipTypeID}_64.png`, alt: db.ship(character.ship.id).name, 'width': 64, 'height': 64}))
          ),
          m('.media-body', [
            m('h4.media-heading',
              m('a', {href: `https://zkillboard.com/character/${character.id}/`},
                character.name)),
            character.corporation.name,
            (character.alliance.name ? [' (', character.alliance.name, ')'] : null),
            m('br'),
            db.ship(shipTypeID).name,
            km ? [' worth ', prettyNumber(km.zkb.totalValue), ' ISK'] : null
          ])
        ])
      })
    ));
  }

  return shiplist;
})();
