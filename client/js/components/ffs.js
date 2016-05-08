module.exports = (function() {
  var z = require('./zkillboard'),
      m = require('mithril'),
      summary = require('./summary'),
      shiplist = require('./shiplist');

  var ffs = {};

  var _allianceColor = {};

  ffs.controller = function(args) {
    _allianceColor = args.allianceColor();
  }

  ffs.view = function(ctrl, args) {
    return m('div', [
      m('.row',
        ['red', 'green', 'blue'].map(function(color) {
          return m('.col-md-4', [
            m.component(summary, {
              kms: function() { return args.kms().filter(function(km) {
                return allianceColor(km.victim.allianceID) === color;
              })},
              moveRight: function(alliance) {
                if (color === 'red') {
                  _allianceColor[alliance] = 'green';
                }
                else if (color === 'green') {
                  _allianceColor[alliance] = 'blue';
                }
                else {
                  delete _allianceColor[alliance];
                }
              },
              moveLeft: function(alliance) {
                if (color === 'green') {
                  delete _allianceColor[alliance];
                }
                else if (color === 'blue') {
                  _allianceColor[alliance] = 'green';
                }
                else {
                  _allianceColor[alliance] = 'blue';
                }
              }
            })
          ])
        })
      ),
      m('.row',
        ['red', 'green', 'blue'].map(function(color) {
          return m('.col-md-4', [
            m.component(shiplist, {
              kms: function() {
                return args.kms().filter(function(km) {
                  return allianceColor(km.victim.allianceID) === color;
                })
              }
            })
          ])
        })
      )
    ]);
  }

  function allianceColor(allianceName) {
    return _allianceColor[allianceName] || 'red';
  }

  return ffs;
})();
