module.exports = (function() {
  var z = require('./zkillboard'),
      m = require('mithril'),
      summary = require('./summary'),
      tabs = require('../util/tabs'),
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
        else if (color === 'b') { args.allianceColor()[allianceID] = 'y'; }
        else { delete args.allianceColor()[allianceID]; }
      },
      moveLeft(color, allianceID) {
        if (color === 'r') { args.allianceColor()[allianceID] = 'y'; }
        else if (color === 'g') { delete args.allianceColor()[allianceID]; }
        else if (color === 'b') { args.allianceColor()[allianceID] = 'g'; }
        else { args.allianceColor()[allianceID] = 'b'; }
      }
    };
  }

  ffs.view = function(ctrl, args) {
    function makeTeamComponent(individualComponent) {
      return {view() {
        return m('.row', ['r', 'g', 'b', 'y'].map(color =>
          m('.col-md-3', {key: color}, individualComponent(color))
        ))
      }};
    }

    return m('div', [
      m(makeTeamComponent(color =>
        m.component(summary, {
          characters: ctrl.characters.bind(this, color),
          alliances: ctrl.alliances.bind(this, color),
          kms: ctrl.kms.bind(this, color),
          moveRight: ctrl.moveRight.bind(this, color),
          moveLeft: ctrl.moveLeft.bind(this, color),
          dropped: alliance => { args.allianceColor()[alliance.id] = color; m.redraw(); }
        })
      )),
      m(tabs, {tabs: () => [
        {
          title: m.prop('Detailed losses'),
          component: makeTeamComponent(color => m.component(shiplist, {kms: ctrl.kms.bind(this, color)}))
        }
      ]})
    ]);
  }

  return ffs;
})();
