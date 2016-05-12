(function() {
  var m = require('mithril'),
      z = require('./components/zkillboard'),
      form = require('./components/form'),
      ffs = require('./components/ffs'),
      codec = require('./util/codec');

  if (!Array.prototype.nubBy) {
    Array.prototype.nubBy = function(f) {
      return this.filter((value, index, self) => self.findIndex(duplicate => f(duplicate) === f(value)) === index);
    }
  }

  m.route.mode = 'pathname';

  function parseAlliances(alliances, kms) {
    var as = kms
      .reduce((acc, km) => {
        var attackingAlliances = km.attackers
          .map(attacker => { return {id: attacker.allianceID, name: attacker.allianceName}; });
        return acc.concat(attackingAlliances, {id: km.victim.allianceID, name: km.victim.allianceName});
      }, [])
      .nubBy(alliance => alliance.id);
    alliances(as);
    return kms;
  }

  function parseCharacters(characters, kms) {
    var cs = kms
      .reduce((acc, km) => {
        var attackingCharacters = km.attackers
          .map(attacker => {
            return {
              id: attacker.characterID,
              name: attacker.characterName,
              alliance: {
                id: attacker.allianceID,
                name: attacker.allianceName
              }
            };
          });
        return acc.concat(attackingCharacters, {
          id: km.victim.characterID,
          name: km.victim.characterName,
          alliance: {
            id: km.victim.allianceID,
            name: km.victim.allianceName
          }
        });
      }, [])
      .nubBy(character => character.id);
    characters(cs);
    return kms;
  }

  m.mount(document.getElementById('app'), {
    controller() {
      var filter = codec.decode(document.location.hash.substring(1)) || {};

      this.loading = m.prop(false);
      this.solarSystems = m.prop([]);
      this.from = m.prop(filter.from || new Date(Date.now() - 1000 * 60 * 60)); // One hour ago
      this.to = m.prop(filter.to || new Date());
      this.allianceColor = m.prop(filter.allianceColors || {});
      this.kms = m.prop([]);
      this.alliances = m.prop([]);
      this.characters = m.prop([]);
      this.fetch = (function() {
        if (!(this.solarSystems().length && this.from() && this.to())) {
          return;
        }
        this.loading(true);
        this.kms([]);

        var hash = codec.encode({
          from: this.from(),
          to: this.to(),
          solarSystems: this.solarSystems(),
          allianceColors: this.allianceColor()
        });
        document.location.hash = hash;
        document.title = `Fight in ${this.solarSystems().map(s => s.name).join(', ')} on ${this.from().toDateString()}`;

        z.fetchAll(this.solarSystems(), this.from(), this.to())
          .then(this.kms)
          .then(parseAlliances.bind(this, this.alliances))
          .then(parseCharacters.bind(this, this.characters))
          .then(this.loading.bind(this, false))
          .then(m.redraw);
      }).bind(this);

      m.request({url: 'https://crest-tq.eveonline.com/solarsystems/'})
        .then(data => data.items)
        .then(solarSystems => solarSystems.filter(solarSystem => (filter.solarSystems || []).includes(solarSystem.id)))
        .then(this.solarSystems)
        .then(this.fetch);
    },
    view(ctrl) {
      return [
        m.component(form, {
          loading: ctrl.loading,
          solarSystems: ctrl.solarSystems,
          from: ctrl.from,
          to: ctrl.to,
          submit: ctrl.fetch
        }),
        (ctrl.loading()
          ? m('.text-center', [m('img[src=ajax-loader.gif]'), m('p', 'Fetching killmails')])
          : (ctrl.kms().length
            ? m.component(ffs, {
              kms: ctrl.kms,
              allianceColor: ctrl.allianceColor,
              alliances: ctrl.alliances,
              characters: ctrl.characters
            })
            : m('p', 'No killmails found')))
      ];
    }
  })
})();
