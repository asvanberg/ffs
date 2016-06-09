(function() {
  require('./util/polyfill');
  var m = require('mithril'),
      z = require('./components/zkillboard'),
      form = require('./components/form'),
      ffs = require('./components/ffs'),
      codec = require('./util/codec'),
      analyser = require('./util/analyser');

  m.route.mode = 'pathname';

  m.mount(document.getElementById('app'), {
    controller() {
      const updateKMs = (kms) => {
        const [characters, alliances] = analyser.analyse(kms);
        const [relevantKMs, relevantCharacters, relevantAlliances] = analyser.relevant(kms, characters, alliances);
        this.kms(relevantKMs);
        this.characters(relevantCharacters);
        this.alliances(relevantAlliances);
      }

      var filter = codec.decode(document.location.hash.substring(1)) || {};

      this.loading = m.prop(false);
      this.solarSystems = m.prop([]);
      this.from = m.prop(filter.from || new Date(Date.now() - 1000 * 60 * 60)); // One hour ago
      this.to = m.prop(filter.to || new Date());
      this.allianceColor = m.prop(filter.allianceColors || {});
      this.kms = m.prop([]);
      this.alliances = m.prop([]);
      this.characters = m.prop([]);
      this.fetch = () => {
        if (!(this.solarSystems().length && this.from() && this.to())) {
          return;
        }
        this.loading(true);
        this.kms([]);

        const state = {
          from: this.from(),
          to: this.to(),
          solarSystems: this.solarSystems(),
          allianceColors: this.allianceColor()
        };
        const hash = `#${codec.encode(state)}`;
        const title = `Fight in ${this.solarSystems().map(s => s.name).join(', ')} on ${this.from().toDateString()}`;
        if (hash !== document.location.hash) {
          window.history.pushState(state, title, hash);
        }

        z.fetchAll(this.solarSystems(), this.from(), this.to())
          .then(kms => {
            state.kms = kms;
            window.history.replaceState(state, title, hash);
            return kms;
          })
          .then(updateKMs)
          .then(this.loading.bind(this, false))
          .then(m.redraw)
      };

      window.addEventListener('popstate', e => {
        const filter = e.state;
        if (filter) {
          this.solarSystems(filter.solarSystems);
          this.from(filter.from);
          this.to(filter.to);
          this.allianceColor(filter.allianceColors);
          if (filter.kms) {
            updateKMs(filter.kms);
          }
          else {
            this.fetch();
          }
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
              from: ctrl.from,
              to: ctrl.to,
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
