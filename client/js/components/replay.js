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
    const duration = ctrl.duration(args.from(), args.to());
    shipTypeIDs.sort((a, b) => db.ship(a).mass > db.ship(b).mass ? -1 : 1);

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
          m('h5', db.ship(shipTypeID).name),
          shipGroups[shipTypeID].map(km =>
            m('img.img-rounded', {src: `https://imageserver.eveonline.com/Type/${km.victim.shipTypeID}_32.png`, class: ctrl.isDead(km) ? 'dead' : 'alive'})
          )
        ])
      )
    ])
  }

  return replay;
})();
