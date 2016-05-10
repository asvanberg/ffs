module.exports = (function() {
  var m = require('mithril');

  var summary = {};

  function prettyNumber(num) {
    if (num === 0) { return 0; }
    else if (num > 1e9) { return `${(num / 1e9).toFixed(2)}B`; }
    else if (num > 1e6) { return `${(num / 1e6).toFixed(2)}M`; }
    else { return `${(num / 1e3).toFixed(2)}K`; }
  }

  if (!Array.prototype.nubBy) {
    Array.prototype.nubBy = function(f) {
      return this.filter((value, index, self) => self.findIndex(duplicate => f(duplicate) === f(value)) === index);
    }
  }

  summary.controller = function(args) {
    var kms = args.kms;
    this.isk = function() {
      return kms().reduce((sum, km) => sum + km.zkb.totalValue, 0);
    }
    this.ships = function() {
      return kms().length;
    }
    this.alliances = function() {
      return kms()
        .map(km => { return {name: km.victim.allianceName, id: km.victim.allianceID}; })
        .nubBy(alliance => alliance.id);
    }
    this.numCharacters = function(allianceID) {
      function affiliatedAttackers(attackers) {
        return attackers
          .filter(attacker => attacker.allianceID === allianceID)
          .map(attacker => attacker.characterID);
      }
      return args.allKms()
        .reduce(
          (characters, km) => {
            var x = characters.concat(affiliatedAttackers(km.attackers));
            if (km.victim.allianceID === allianceID) {
              x.push(km.victim.characterID);
            }
            return x;
          },
          [])
        .nubBy(x => x)
        .length;
    }
  }

  summary.view = function(ctrl, args) {
    return m('div.panel.panel-default.text-center', [
      m('.panel-heading', ['Lost ', m('strong', [prettyNumber(ctrl.isk()), ' ISK']), ' over ', m('strong', [ctrl.ships(), ' ships.'])]),
      m('.list-group', [
        ctrl.alliances().map(alliance =>
          m('a.list-group-item', [
            m('button.pull-left.btn.btn-xs', {onclick: args.moveLeft.bind(this, alliance.id)}, m.trust('&larr;')),
            alliance.name || m('i', 'Unaffiliated'),
            ' (', ctrl.numCharacters(alliance.id), ')',
            m('button.pull-right.btn.btn-xs', {onclick: args.moveRight.bind(this, alliance.id)}, m.trust('&rarr;'))
          ])
        )
      ])
    ]);
  }

  return summary;
})();
