module.exports = (function() {
  var z = require('./zkillboard'),
      m = require('mithril'),
      summary = require('./summary'),
      shiplist = require('./shiplist');

  var ffs = {};

  var _allianceColor = {};

  function allianceColor(allianceName) {
    return _allianceColor[allianceName] || 'r';
  }

  ffs.controller = function(args) {
    _allianceColor = args.allianceColor();
  }

  ffs.view = function(ctrl, args) {
    return m('div', [
      m('.row',
        ['r', 'g', 'b'].map(color =>
          m('.col-md-4', [
            m.component(summary, {
              allKms: args.kms,
              kms: () => args.kms().filter(km =>
                allianceColor(km.victim.allianceID) === color
              ),
              moveRight(alliance) {
                if (color === 'r') {
                  _allianceColor[alliance] = 'g';
                }
                else if (color === 'g') {
                  _allianceColor[alliance] = 'b';
                }
                else {
                  delete _allianceColor[alliance];
                }
              },
              moveLeft(alliance) {
                if (color === 'g') {
                  delete _allianceColor[alliance];
                }
                else if (color === 'b') {
                  _allianceColor[alliance] = 'g';
                }
                else {
                  _allianceColor[alliance] = 'b';
                }
              }
            })
          ])
        )
      ),
      m('.row',
        ['r', 'g', 'b'].map(color =>
          m('.col-md-4', [
            m.component(shiplist, {
              kms: () =>
                args.kms().filter(km =>
                  allianceColor(km.victim.allianceID) === color
                )
            })
          ])
        )
      )
    ]);
  }

  return ffs;
})();
