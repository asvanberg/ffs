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
    this.moveRight = args.moveRight;
    this.moveLeft = args.moveLeft;
  }

  summary.view = function(ctrl) {
    return m('div.panel.panel-default.text-center', [
      m('.panel-heading', ['Lost ', m('strong', [prettyNumber(ctrl.isk()), ' ISK']), ' over ', m('strong', [ctrl.ships(), ' ships.'])]),
      m('.list-group', [
        ctrl.alliances().map(function(alliance) {
          return m('a.list-group-item', [
            m('button.pull-left.btn.btn-xs', {onclick: ctrl.moveLeft.bind(this, alliance.id)}, m.trust('&larr;')),
            alliance.name || m('i', 'Unaffiliated'),
            m('button.pull-right.btn.btn-xs', {onclick: ctrl.moveRight.bind(this, alliance.id)}, m.trust('&rarr;'))
          ]);
        })
      ])
    ]);
  }

  return summary;
})();
