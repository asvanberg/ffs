(function() {
  require('./util/polyfill');
  var m = require('mithril'),
      z = require('./components/zkillboard'),
      form = require('./components/form'),
      ffs = require('./components/ffs'),
      codec = require('./util/codec'),
      analyser = require('./util/analyser');

  m.route.mode = 'pathname';

  function updateHistory(settings, kms) {
    const state = {
      from: settings.from(),
      to: settings.to(),
      solarSystems: settings.solarSystems(),
      allianceColors: settings.allianceColor(),
      kms: kms
    };
    const hash = `#${codec.encode(state)}`;
    const title = `Fight in ${settings.solarSystems().map(s => s.name).join(', ')} on ${settings.from().toDateString()}`;
    document.title = title;
    if (hash !== document.location.hash) {
      window.history.pushState(state, title, hash);
    }
    else if (kms) {
      window.history.replaceState(state, title, hash);
    }
  }

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
      this.error = m.prop(false);
      this.solarSystems = m.prop([]);
      this.from = m.prop(filter.from || new Date(Date.now() - 1000 * 60 * 60)); // One hour ago
      this.to = m.prop(filter.to || new Date());
      this.allianceColor = m.prop(filter.allianceColors || {});
      this.kms = m.prop([]);
      this.alliances = m.prop([]);
      this.characters = m.prop([]);
      this.dropped = (color, alliance) => {
        if (color === 'r') {
          delete this.allianceColor()[alliance.id];
        }
        else {
          this.allianceColor()[alliance.id] = color;
        }
        updateHistory(this);
        m.redraw();
      };
      this.moveRight = (color, allianceID) => {
        if (color === 'r') { this.allianceColor()[allianceID] = 'g'; }
        else if (color === 'g') { this.allianceColor()[allianceID] = 'b'; }
        else if (color === 'b') { this.allianceColor()[allianceID] = 'y'; }
        else { delete this.allianceColor()[allianceID]; }
        updateHistory(this);
      };
      this.moveLeft = (color, allianceID) => {
        if (color === 'r') { this.allianceColor()[allianceID] = 'y'; }
        else if (color === 'g') { delete this.allianceColor()[allianceID]; }
        else if (color === 'b') { this.allianceColor()[allianceID] = 'g'; }
        else { this.allianceColor()[allianceID] = 'b'; }
        updateHistory(this);
      };
      this.fetch = () => {
        if (!(this.solarSystems().length && this.from() && this.to())) {
          return;
        }
        this.error(false);
        this.loading(true);
        this.kms([]);

        updateHistory(this);

        z.fetchAll(this.solarSystems(), this.from(), this.to())
          .then(kms => {
            try { updateHistory(this, kms) }
            catch (ignored) {
              // Firefox throws exception if the state is too large.
              // Simply ignore it and Firefox will have to refetch the
              // killmails when going back/forward while browsers that can
              // store the killmails in the state won't have to
            }
            return kms;
          })
          .then(updateKMs)
          .then(null, this.error.bind(this, true))
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
        (() => {
          if (ctrl.loading()) {
            return m('.text-center', [m('img[src=ajax-loader.gif]'), m('p', 'Fetching killmails')])
          }
          else if (ctrl.error()) {
            return m('.text-center', [
              m('span.glyphicon.glyphicon-remove-sign.text-danger', {style: {'font-size': '32px'}}),
              m('p', ['zKillboard appears to be down, ', m('a', {onclick: ctrl.fetch}, 'retry'), '.'])
            ])
          }
          else if (ctrl.kms().length) {
            return m.component(ffs, {
              from: ctrl.from,
              to: ctrl.to,
              kms: ctrl.kms,
              allianceColor: ctrl.allianceColor,
              alliances: ctrl.alliances,
              characters: ctrl.characters,
              dropped: ctrl.dropped,
              moveRight: ctrl.moveRight,
              moveLeft: ctrl.moveLeft
            })
          }
          else {
            return m('p', 'No killmails found')
          }
        })()
      ];
    }
  })
})();
