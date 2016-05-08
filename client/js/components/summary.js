module.exports = (function() {
  var m = require('mithril');

  var summary = {};

  function prettyNumber(num) {
    if (num === 0) { return 0; }
    else if (num > 1e9) { return (num / 1e9).toFixed(2) + 'B'; }
    else if (num > 1e6) { return (num / 1e6).toFixed(2) + 'M'; }
    else { return (num / 1e3) + 'K'; }
  }

  if (!Array.prototype.nubBy) {
    Array.prototype.nubBy = function(f) {
      return this.filter(function(value, index, self) { return self.findIndex(function(duplicate) { return f(duplicate) === f(value); }) === index; });
    }
  }

  summary.controller = function(args) {
    var kms = args.kms;
    this.isk = function() {
      return kms().reduce(
        function(sum, km) { return sum + km.zkb.totalValue; },
        0
      );
    }
    this.ships = function() {
      return kms().length;
    }
    this.alliances = function() {
      return kms().map(function(km) {
        return {name: km.victim.allianceName, id: km.victim.allianceID};
      }).nubBy(function(alliance) { return alliance.id; });
    }
    this.numCharacters = function(allianceID) {
      function affiliatedAttackers(attackers) {
        return attackers
          .filter(function(attacker) { return attacker.allianceID === allianceID; })
          .map(function(attacker) { return attacker.characterID; })
      }
      return args.allKms()
        .reduce(function(characters, km) {
          var x = characters.concat(affiliatedAttackers(km.attackers));
          if (km.victim.allianceID === allianceID) {
            x.push(km.victim.characterID);
          }
          return x;
        }, [])
        .nubBy(function(x) { return x; })
        .length;
    }
  }

  summary.view = function(ctrl, args) {
    return m('div.panel.panel-default.text-center', [
      m('.panel-heading', ['Lost ', m('strong', [prettyNumber(ctrl.isk()), ' ISK']), ' over ', m('strong', [ctrl.ships(), ' ships.'])]),
      m('.list-group', [
        ctrl.alliances().map(function(alliance) {
          return m('a.list-group-item', [
            m('button.pull-left.btn.btn-xs', {onclick: args.moveLeft.bind(this, alliance.id)}, m.trust('&larr;')),
            alliance.name || m('i', 'Unaffiliated'),
            ' (', ctrl.numCharacters(alliance.id), ')',
            m('button.pull-right.btn.btn-xs', {onclick: args.moveRight.bind(this, alliance.id)}, m.trust('&rarr;'))
          ]);
        })
      ])
    ]);
  }

  return summary;
})();
