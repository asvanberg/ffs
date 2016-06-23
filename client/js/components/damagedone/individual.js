module.exports = (function() {
  const m = require('mithril')
      , db = require('../../util/database')

  const individual = {};

  individual.controller = function(args) {
    return {
      kills(characterID) {
        return args.kms().filter(km => km.attackers.find(attacker => attacker.finalBlow).characterID === characterID)
      },
      losses(characterID) {
        return args.kms().filter(km => km.victim.characterID === characterID)
      },
      attacked(characterID) {
        return args.kms().filter(km => km.attackers.some(attacker => attacker.characterID === characterID))
      },
      isPod(km) {
        return [670, 33328].includes(km.victim.shipTypeID)
      },
      totalDamageDone(kms, characterID) {
        return kms.map(km => km.attackers.find(attacker => attacker.characterID === characterID))
          .reduce((damage, attacker) => damage + attacker.damageDone, 0)
      },
      damageDone(characterID, km) {
        return km.attackers.find(attacker => attacker.characterID === characterID).damageDone
      }
    }
  }

  individual.view = function(ctrl, args) {
    const kills = ctrl.kills(args.character().id);
    const losses = ctrl.losses(args.character().id);
    const attacked = ctrl.attacked(args.character().id);
    const maxDamage = ctrl.attacked(args.character().id)
      .map(ctrl.damageDone.bind(this, args.character().id))
      .reduce((acc, e) => Math.max(acc, e), 0);

    return m('.row', [
      m('.col-sm-5', [
        m('p', m('a', {onclick: args.character.bind(this, null)}, [m.trust('&larr;'), 'Back'])),
        m('.replay-controls', [
          m('img.img-rounded', {
            src: `https://imageserver.eveonline.com/Character/${args.character().id}_64.jpg`,
            width: 64,
            height: 64,
            alt: args.character().name
          }),
          m('img.img-rounded', {
            src: `https://imageserver.eveonline.com/Corporation/${args.character().corporation.id}_64.png`,
            width: 64,
            height: 64,
            alt: args.character().corporation.name
          }),
          m('img.img-rounded', {
            src: `https://imageserver.eveonline.com/Alliance/${args.character().alliance.id}_64.png`,
            width: 64,
            height: 64,
            alt: args.character().alliance.name
          }),
          m('span', [
            m('h4.media-heading', args.character().name),
            args.character().corporation.name, ' (', args.character().alliance.name, ')'
          ])
        ]),
        m('h4', 'Statistics'),
        m('p', `Killing blows: ${kills.length}`),
        m('p', `Ships lost: ${losses.length}`),
        m('p', `Pods killed: ${attacked.filter(ctrl.isPod).length}`),
        m('p', `Damage done: ${ctrl.totalDamageDone(attacked, args.character().id).toLocaleString()}`),
      ]),
      m('.col-sm-7', [
        m('h4', 'Dealt damage to'),
        attacked.sortBy(ctrl.damageDone.bind(this, args.character().id), true).map(km => {
          const damageDone = ctrl.damageDone(args.character().id, km);

          return m('.replay-controls', [
            m('span', {'data-tooltip': km.victim.characterName}, m('img.img-rounded', {
              src: `https://imageserver.eveonline.com/Character/${km.victim.characterID}_32.jpg`,
              width: 32,
              height: 32,
              alt: km.victim.characterName
            })),
            m('span', {'data-tooltip': km.victim.corporationName}, m('img.img-rounded', {
              src: `https://imageserver.eveonline.com/Corporation/${km.victim.corporationID}_32.png`,
              width: 32,
              height: 32,
              alt: km.victim.corporationName
            })),
            m('span', {'data-tooltip': db.ship(km.victim.shipTypeID).name}, m('img.img-rounded', {
              src: `https://imageserver.eveonline.com/Type/${km.victim.shipTypeID}_32.png`,
              width: 32,
              height: 32,
              alt: db.ship(km.victim.shipTypeID).name
            })),
            m('.progress', {style: {width: '100%'}},
              m('.progress-bar', {style: {width: `${damageDone / maxDamage * 100}%`}, height: '32px'}, damageDone)
            )
          ])
        })
      ])
    ])
  }

  return individual;
})();
