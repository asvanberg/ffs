module.exports = (function() {
  var m = require('mithril'),
      dnd = require('../util/dragndrop');

  var summary = {};

  function prettyNumber(num) {
    if (num === 0) { return 0; }
    else if (num > 1e9) { return `${(num / 1e9).toFixed(2)}B`; }
    else if (num > 1e6) { return `${(num / 1e6).toFixed(2)}M`; }
    else { return `${(num / 1e3).toFixed(2)}K`; }
  }

  summary.controller = function(args) {
    this.isk = function(kms) {
      return kms.reduce((sum, km) => sum + km.zkb.totalValue, 0);
    }
    this.numCharacters = function(alliances) {
      return args.characters()
        .filter(character =>
          alliances.some(alliance => alliance.id === character.alliance.id))
        .length;
    }
  }

  summary.view = function(ctrl, args) {
    return m('div.panel.panel-default.text-center', {config: dnd.sink(args.dropped, 'alliance', 'move')}, [
      m('.panel-heading', [
        m('strong', [ctrl.numCharacters(args.alliances()), ' pilots']),
        ' losing ',
        m('strong', [args.kms().length, ' ships']),
        ' totalling ',
        m('strong', [prettyNumber(ctrl.isk(args.kms())), ' ISK'])
      ]),
      m('.list-group', [
        !args.alliances().length ? m('.panel-body.text-muted', 'Drag alliances here') : undefined,
        args.alliances().map(alliance =>
          m('a.list-group-item', {key: alliance.id, config: dnd.source(alliance, 'alliance', 'move')}, [
            m('button.pull-left.btn.btn-xs', {onclick: args.moveLeft.bind(this, alliance.id)}, m.trust('&larr;')),
            alliance.name || m('i', 'Unaffiliated'),
            ' (', ctrl.numCharacters([alliance]), ')',
            m('button.pull-right.btn.btn-xs', {onclick: args.moveRight.bind(this, alliance.id)}, m.trust('&rarr;'))
          ])
        )
      ])
    ]);
  }

  return summary;
})();
