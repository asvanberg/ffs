(function() {
  var m = require('mithril'),
      z = require('./components/zkillboard'),
      form = require('./components/form'),
      ffs = require('./components/ffs'),
      codec = require('./util/codec');

  m.route.mode = 'pathname';

  m.mount(document.getElementById('app'), {
    controller() {
      var filter = codec.decode(document.location.hash.substring(1)) || {};

      this.loading = m.prop(false);
      this.solarSystems = m.prop([]);
      this.from = m.prop(filter.from || new Date());
      this.to = m.prop(filter.to || new Date());
      this.allianceColor = m.prop(filter.allianceColors || {});
      this.kms = m.prop([]);
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
          ? m('p', 'Fetching killmails')
          : (ctrl.kms().length
            ? m.component(ffs, {kms: ctrl.kms, allianceColor: ctrl.allianceColor})
            : m('p', 'No killmails found')))
      ];
    }
  })
})();
