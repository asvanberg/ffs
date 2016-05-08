module.exports = (function() {
  var m = require('mithril');

  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  var solarSystem = {};

  solarSystem.controller = function(args) {
    this.solarSystems = m.request({url: 'https://crest-tq.eveonline.com/solarsystems/'}).then(function(data) { return data.items; });

    this.matches = m.prop([]);

    this.search = debounce(function(str) {
      if (str.length < 2) {
        this.matches([]);
      }
      else {
        this.matches(this.solarSystems()
          .filter(function(solarSystem) {
            return !args.selected().includes(solarSystem) && solarSystem.name.toLowerCase().startsWith(str.toLowerCase())
          })
          .slice(0, 10))
      }
      m.redraw();
    }.bind(this), 250);

    this.select = function(solarSystem) {
      args.selected().push(solarSystem);
      this.matches([]);
    }.bind(this);

    this.selectedIndex = m.prop(0);

    this.onkeydown = function(event) {
      var idx = this.selectedIndex();
      switch (event.keyCode) {
        case 38: // arrow up
          this.selectedIndex(Math.max(idx - 1, 0))
          break;
        case 40: // arrow down
          this.selectedIndex(Math.min(idx + 1, this.matches().length - 1))
          break;
        case 8: // backspace
          if (event.target.value.length === 0) {
            args.selected().pop();
          }
          break;
        case 13: // enter
          this.select(this.matches()[idx])
          event.target.value = '';
          this.selectedIndex(0);
          break;
      }
      if (event.keyCode === 38 || event.keyCode === 40) {
        event.preventDefault();
      }
    }.bind(this);
  };

  solarSystem.view = function(ctrl, args) {
    return m('div.form-control', {style: {position: 'relative', 'padding-top': '4px'}}, [
      args.selected().map(function(solarSystem) {
        return m('span.label.label-default', {key: solarSystem.id, style: {'margin-right':'3px'}}, solarSystem.name);
      }),
      m('input', {key: 'input', onkeydown: ctrl.onkeydown, onkeyup: m.withAttr('value', ctrl.search), style: {border: 'none'}}),
      m('.list-group', {style: {position: 'absolute', 'margin-top': '4px', right: '-1px', left: '-1px', 'z-index': 10000}}, [
        ctrl.matches().map(function(solarSystem, index) {
          return m('a.list-group-item', {key: solarSystem.id, onclick: ctrl.select.bind(this, solarSystem), class: (index === ctrl.selectedIndex() ? 'active': '')}, solarSystem.name)
        }),
      ])
    ])
  }

  return solarSystem;
})();
