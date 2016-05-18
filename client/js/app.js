(function() {
  var m = require('mithril'),
      z = require('./components/zkillboard'),
      form = require('./components/form'),
      ffs = require('./components/ffs'),
      codec = require('./util/codec');

  const NUM_CHARACTERS_RELEVANT_CUTOFF = 10;

  if (!Array.prototype.nubBy) {
    Array.prototype.nubBy = function(f) {
      return this.filter((value, index, self) => self.findIndex(duplicate => f(duplicate) === f(value)) === index);
    }
  }

  m.route.mode = 'pathname';

  function analyze(kms) {
    const [characters, alliances] = kms.reduce(([characters, alliances], km) => {
      const victimAlliance = {id: km.victim.allianceID, name: km.victim.allianceName};
      const victim = {id: km.victim.characterID, name: km.victim.characterName, alliance: victimAlliance};

      const [ac, aa] = km.attackers.reduce(([attackingCharacters, attackingAlliances], attacker) => {
        const attackingAlliance = {id: attacker.allianceID, name: attacker.allianceName};
        const attackingCharacter = {id: attacker.characterID, name: attacker.characterName, alliance: attackingAlliance};
        return [attackingCharacters.concat(attackingCharacter), attackingAlliances.concat(attackingAlliance)];
      }, [[],[]]);

      return [characters.concat(victim, ac), alliances.concat(victimAlliance, aa)];
    }, [[], []]);
    return [characters.nubBy(c => c.id), alliances.nubBy(a => a.id)];
  }

  function relevant(kms, characters, alliances) {
    function numCharacters(alliance) {
      return characters.filter(character => character.alliance.id === alliance.id).length;
    }
    const relevantAlliances = alliances.filter(alliance => alliance.id && numCharacters(alliance) >= NUM_CHARACTERS_RELEVANT_CUTOFF);
    const relevantCharacters = characters.filter(character => relevantAlliances.some(alliance => alliance.id === character.alliance.id));
    const relevantKMs = kms.filter(km => relevantAlliances.some(alliance => alliance.id === km.victim.allianceID));
    return [relevantKMs, relevantCharacters, relevantAlliances];
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

        z.fetchAll(this.solarSystems(), this.from(), this.to())
          .then(kms => {
            const [characters, alliances] = analyze(kms);
            const [relevantKMs, relevantCharacters, relevantAlliances] = relevant(kms, characters, alliances);
            this.kms(relevantKMs);
            this.characters(relevantCharacters);
            this.alliances(relevantAlliances);
          })
          .then(this.loading.bind(this, false))
          .then(m.redraw)
          .then(() => {
            const state = {
              from: this.from(),
              to: this.to(),
              solarSystems: this.solarSystems(),
              allianceColors: this.allianceColor(),
              kms: this.kms()
            };
            const hash = codec.encode(state);
            if (hash !== document.location.hash) {
              const title = `Fight in ${this.solarSystems().map(s => s.name).join(', ')} on ${this.from().toDateString()}`;
              window.history.pushState(state, title, `#${hash}`);
              document.title = title;
            }
          });
      }).bind(this);

      window.addEventListener('popstate', e => {
        const filter = e.state;
        if (filter) {
          this.solarSystems(filter.solarSystems);
          this.from(filter.from);
          this.to(filter.to);
          this.allianceColor(filter.allianceColors);
          this.kms(filter.kms);
          const [characters, alliances] = analyze(filter.kms);
          this.characters(characters);
          this.alliances(alliances);
        }
        else {
          this.solarSystems([]);
          this.kms([]);
        }
        m.redraw();
      });

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
