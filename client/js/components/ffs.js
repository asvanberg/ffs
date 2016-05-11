module.exports = (function() {
  var z = require('./zkillboard'),
      m = require('mithril'),
      summary = require('./summary'),
      shiplist = require('./shiplist');

  var ffs = {};

  ffs.controller = function(args) {
    function allianceColor(allianceID) {
      return args.allianceColor()[allianceID] || 'r';
    }

    return {
      characters(color) {
        return args.characters().filter(character => allianceColor(character.alliance.id) === color);
      },
      alliances(color) {
        return args.alliances().filter(alliance => allianceColor(alliance.id) === color);
      },
      kms(color) {
        return args.kms().filter(km => allianceColor(km.victim.allianceID) === color);
      },
      moveRight(color, allianceID) {
        if (color === 'r') { args.allianceColor()[allianceID] = 'g'; }
        else if (color === 'g') { args.allianceColor()[allianceID] = 'b'; }
        else { delete args.allianceColor()[allianceID]; }
      },
      moveLeft(color, allianceID) {
        if (color === 'g') { delete args.allianceColor()[allianceID]; }
        else if (color === 'b') { args.allianceColor()[allianceID] = 'g'; }
        else { args.allianceColor()[allianceID] = 'b'; }
      }
    };
  }

  ffs.view = function(ctrl, args) {
    return m('div', [
      m('.row',
        ['r', 'g', 'b'].map(color =>
          m('.col-md-4', [
            m.component(summary, {
              characters: ctrl.characters.bind(this, color),
              alliances: ctrl.alliances.bind(this, color),
              kms: ctrl.kms.bind(this, color),
              moveRight: ctrl.moveRight.bind(this, color),
              moveLeft: ctrl.moveLeft.bind(this, color)
            })
          ])
        )
      ),
      m('.row',
        ['r', 'g', 'b'].map(color =>
          m('.col-md-4', [
            m.component(shiplist, {
              kms: ctrl.kms.bind(this, color)
            })
          ])
        )
      )
    ]);
  }

  return ffs;
})();
