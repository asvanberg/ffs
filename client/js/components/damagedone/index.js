module.exports = (function() {
  const m = require('mithril')
      , team = require('./team')
      , individual = require('./individual')
  const damagedone = {};

  damagedone.controller = function() {
    this.selectedCharacter = m.prop(null);
  }

  damagedone.view = function(ctrl, args) {
    return ctrl.selectedCharacter()
      ? m(individual, {character: ctrl.selectedCharacter, kms: args.kms})
      : m('.row', args.colors.map(color =>
          m('.col-md-3', {key: color}, m(team, {
            kms: args.kms,
            characters: args.characters.bind(this, color),
            select: ctrl.selectedCharacter
          }))
        ))
  }

  return damagedone;
})();
