module.exports = (function() {
  var z = require('./zkillboard'),
      m = require('mithril'),
      summary = require('./summary'),
      tabs = require('../util/tabs'),
      replay = require('./replay'),
      damagedone = require('./damagedone'),
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
          moveRight: args.moveRight.bind(this, color),
          moveLeft: args.moveLeft.bind(this, color),
          dropped: args.dropped.bind(this, color)
        })
      )),
      m(tabs, {tabs: () => [
        {
          title: m.prop('Involved'),
          component: makeTeamComponent(color => m.component(shiplist, {kms: ctrl.kms.bind(this, color), characters: ctrl.characters.bind(this, color)}))
        },
        {
          title: m.prop('Replay'),
          component: makeTeamComponent(color => m.component(replay, {kms: ctrl.kms.bind(this, color), from: args.from, to: args.to}))
        },
        {
          title: m.prop('Damage done'),
          component: m(damagedone, {kms: args.kms, colors: ['r', 'g', 'b', 'y'], characters: ctrl.characters})
        }
      ]})
    ]);
  }

  return ffs;
})();
