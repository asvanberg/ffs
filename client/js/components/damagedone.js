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
        return attacker.characterID === character.id;
      }));
      return attacks.reduce((acc, attack) => {
        const pilotID = `${character.id}-${attack.shipTypeID}`;
        const soFar = acc[pilotID] || zero(character, {id: attack.corporationID, name: attack.corporationName}, attack.shipTypeID);
        soFar.damageDone += attack.damageDone;
        acc[pilotID] = soFar;
        return acc;
      }, {});
    }
    return {
      calculateDamageDoneByPilots(characters, kms) {
        const pilots = characters.flatMap(character => Object.values(damageDoneByPilot(character, kms)));
        const maxDamage = pilots.reduce((max, pilot) => Math.max(max, pilot.damageDone), 0);
        return [pilots, maxDamage];
      }
    }
  }

  damagedone.view = (ctrl, args) => {
    const [damageDoneByPilots, maxDamage] = ctrl.calculateDamageDoneByPilots(args.characters(), args.kms());
    damageDoneByPilots.sort((p1, p2) => p1.damageDone > p2.damageDone ? -1 : 1);

    return m('div', damageDoneByPilots.map(({character, corporation, shipTypeID, damageDone}) => {
      return m('.replay-controls', [
        m('img.img-rounded', {
          src: `https://imageserver.eveonline.com/Character/${character.id}_32.jpg`,
          width: 32,
          height: 32,
          alt: character.name
        }),
        m('img.img-rounded', {
          src: `https://imageserver.eveonline.com/Corporation/${corporation.id}_32.png`,
          width: 32,
          height: 32,
          alt: corporation.name
        }),
        m('img.img-rounded', {
          src: `https://imageserver.eveonline.com/Type/${shipTypeID}_32.png`,
          width: 32,
          height: 32,
          alt: db.ship(shipTypeID).name
        }),
        m('.progress', {style: {width: '100%'}},
          m('.progress-bar', {style: {width: `${damageDone / maxDamage * 100}%`}, height: '32px'}, damageDone)
        )
      ])
    }));
  }

  return damagedone;
})();
