module.exports = (function() {
  const m = require('mithril')
      , db = require('../util/database')

  const replay = {};

  replay.controller = (args) => {
    var current = m.prop(0);
    return {
      current,
      isDead(km) {
        return Date.parse(km.killTime + '+0000') <= args.from().getTime() + parseInt(current()) * 1000;
      },
      duration() {
        return (args.to().getTime() - args.from().getTime()) / 1000;
      },
      countDead(shipTypeID) {
        return args.kms().filter(km => km.victim.shipTypeID === shipTypeID).filter(this.isDead).length;
      }
    }
  }

  replay.view = (ctrl, args) => {
    function prettyDuration(duration) {
      function zeroPad(n) { return n <= 9 ? '0' + n : n; }
      return Math.floor(duration / 60) + ':' + zeroPad(duration % 60);
    }

    const shipGroups = args.kms().groupBy(km => km.victim.shipTypeID);
    const shipTypeIDs = Object.keys(shipGroups);
    shipTypeIDs.sortBy(shipTypeID => db.ship(shipTypeID).volume, true);

    return m('div', [
      m('.replay-controls', [
        m('button.btn.btn-xs', {onclick: ctrl.current.bind(this, Math.max(0, ctrl.current() - 1))}, m.trust('&larr;')),
        m('input[type=range]', {
          min: 0,
          step: 1,
          max: ctrl.duration(),
          value: ctrl.current(),
          oninput: m.withAttr('value', ctrl.current)
        }),
        m('button.btn.btn-xs', {onclick: ctrl.current.bind(this, Math.min(ctrl.duration(), parseInt(ctrl.current()) + 1))}, m.trust('&rarr;')),
        m('output', {style: {width: '5em'}}, prettyDuration(ctrl.current()))
      ]),
      shipTypeIDs.map(shipTypeID =>
        m('div', [
          m('h5', [db.ship(shipTypeID).name, ' [', ctrl.countDead(parseInt(shipTypeID)), '/', shipGroups[shipTypeID].length, ']']),
          shipGroups[shipTypeID].map(km =>
            m('a', {href: `https://zkillboard.com/kill/${km.killID}/`, 'data-tooltip': km.victim.characterName},
              m('img.img-rounded', {
                src: `https://imageserver.eveonline.com/Type/${km.victim.shipTypeID}_32.png`,
                class: ctrl.isDead(km) ? 'dead' : 'alive',
                width: 32,
                height: 32,
                alt: db.ship(shipTypeID).name
              })
            )
          )
        ])
      )
    ])
  }

  return replay;
})();
