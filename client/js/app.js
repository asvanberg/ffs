(function() {
  var m = require('mithril'),
      z = require('./components/zkillboard'),
      form = require('./components/form'),
      ffs = require('./components/ffs');

  m.route.mode = 'pathname';

  m.mount(document.body, {
    controller: function() {
      var hash = {};
      try { hash = JSON.parse(atob(document.location.hash.substring(1))); }
      catch (e) {}

      this.loading = m.prop(false);
      this.solarSystems = m.prop([]);
      this.from = m.prop(hash.from && new Date(hash.from) || new Date());
      this.to = m.prop(hash.to && new Date(hash.to) || new Date());
      this.allianceColor = m.prop(hash.allianceColor || {});
      this.kms = m.prop([]);
      this.fetch = (function() {
        if (!(this.solarSystems().length && this.from() && this.to())) {
          return;
        }
        this.loading(true);
        this.kms([]);
        var filter = {
          from: this.from().getTime(),
          to: this.to().getTime(),
          solarSystems: this.solarSystems().map(solarSystem => solarSystem.id),
          allianceColor: this.allianceColor()
        };
        var hash = btoa(JSON.stringify(filter));

        z.fetchAll(this.solarSystems(), this.from(), this.to())
          .then(this.kms)
          .then(this.loading.bind(this, false))
          .then(function() {
            document.location.hash = hash;
          })
          .then(m.redraw);
      }).bind(this);

      m.request({url: 'https://crest-tq.eveonline.com/solarsystems/'})
        .then(function(data) { return data.items; })
        .then(function(x) {
          return x.filter(function(solarSystem) { return (hash.solarSystems || []).includes(solarSystem.id); })
        })
        .then(this.solarSystems)
        .then(this.fetch);
    },
    view: function(ctrl) {
      return m('.container-fluid', [
        m.component(form, {
          loading: ctrl.loading,
          solarSystems: ctrl.solarSystems,
          from: ctrl.from,
          to: ctrl.to,
          submit: ctrl.fetch
        }),
        (ctrl.loading() ? m('p', 'Fetching killmails') : undefined),
        (ctrl.kms().length ? m.component(ffs, {kms: ctrl.kms, allianceColor: ctrl.allianceColor}) : undefined)
      ]);
    }
  })
})();
