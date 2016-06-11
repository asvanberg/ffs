module.exports = (function() {
  require('../util/polyfill')
  const m = require('mithril')
      , db = require('../util/database')
  const damagedone = {};

  function zero(character, corporation, shipTypeID) {
    return {character, corporation, shipTypeID, damageDone: 0};
  }

  damagedone.controller = function() {
    function damageDoneByPilot(character, kms) {
      const attacks = kms.flatMap(km => km.attackers.filter(attacker => {
        return attacker.characterID === character.id && attacker.shipTypeID === character.ship.id;
      }));
      return attacks.reduce((acc, attack) => acc + attack.damageDone, 0);
    }
    return {
      calculateDamageDoneByPilots(characters, kms) {
        const pilots = characters.map(character => [character, damageDoneByPilot(character, kms)]);
        const maxDamage = pilots.reduce((max, [pilot, damageDone]) => Math.max(max, damageDone), 0);
        return [pilots, maxDamage];
      }
    }
  }

  damagedone.view = (ctrl, args) => {
    const [damageDoneByPilots, maxDamage] = ctrl.calculateDamageDoneByPilots(args.characters(), args.kms());
    damageDoneByPilots.sortBy(([pilot, damageDone]) => damageDone, true);

    return m('div', damageDoneByPilots.map(([{id, name, corporation, ship}, damageDone]) => {
      return m('.replay-controls', [
        m('span', {'data-tooltip': name}, m('img.img-rounded', {
          src: `https://imageserver.eveonline.com/Character/${id}_32.jpg`,
          width: 32,
          height: 32,
          alt: name
        })),
        m('span', {'data-tooltip': corporation.name}, m('img.img-rounded', {
          src: `https://imageserver.eveonline.com/Corporation/${corporation.id}_32.png`,
          width: 32,
          height: 32,
          alt: corporation.name
        })),
        m('span', {'data-tooltip': db.ship(ship.id).name}, m('img.img-rounded', {
          src: `https://imageserver.eveonline.com/Type/${ship.id}_32.png`,
          width: 32,
          height: 32,
          alt: db.ship(ship.id).name
        })),
        m('.progress', {style: {width: '100%'}},
          m('.progress-bar', {style: {width: `${damageDone / maxDamage * 100}%`}, height: '32px'}, damageDone)
        )
      ])
    }));
  }

  return damagedone;
})();
