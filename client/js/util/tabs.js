module.exports = (function() {
  const m = require('mithril');

  const tabs = {};

  tabs.controller = function(args) {
    this.activeTab = m.prop(args.active || args.tabs()[0]);
    this.isActive = (tab) => tab.title() === this.activeTab().title();
  }

  tabs.view = (ctrl, args) => {
    return m('div', [
      m('ul', {class: 'nav nav-tabs'}, args.tabs().map(tab =>
        m('li', {class: ctrl.isActive(tab) ? 'active' : ''},
          m('a', {onclick: ctrl.activeTab.bind(this, tab)}, tab.title())
        )
      )),
      m('div', {class: 'tab-content'},
        m('div', {class: 'tab-pane active'},
          m(ctrl.activeTab().component)
        )
      )
    ]);
  }

  return tabs;
})();
