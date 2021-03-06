module.exports = (function() {
  var m = require('mithril'),
      solarSystem = require('./solarsystem');

  function zeroPad(num) {
    return num < 10 ? `0${num}` : num;
  }

  var form = {};

  form.controller = function(args) {
    this.setDate = function(date, value) {
      var year = value.substring(0, 4);
      var month = value.substring(4, 6);
      var day = value.substring(6, 8);
      date().setUTCFullYear(year);
      date().setUTCMonth(month - 1);
      date().setUTCDate(day);
    };

    this.setTime = function(date, value) {
      var hour = value.substring(0, 2);
      var minute = value.substring(2, 4);
      date().setUTCHours(hour);
      date().setUTCMinutes(minute);
    };

    this.getDate = function(date) {
      var year = date.getUTCFullYear();
      var month = zeroPad(date.getUTCMonth() + 1);
      var day = zeroPad(date.getUTCDate());
      return `${year}${month}${day}`;
    };

    this.getTime = function(date) {
      var hour = zeroPad(date.getUTCHours());
      var minute = zeroPad(date.getUTCMinutes());
      return `${hour}${minute}`;
    };
  }

  form.view = function(ctrl, args) {
    return m('form.form-inline.well.well-sm', {onsubmit: e => { e.preventDefault(); !args.loading() && args.submit() }}, [
      m('.form-group', [
        m('label', {for: 'solarSystem'}, 'Solar system'), ' ',
        m.component(solarSystem, {id: 'solarSystem', selected: args.solarSystems})
      ]), ' ',
      m('.form-group', [
        m('label', {for: 'fromDate'}, 'From date'), ' ',
        m('input.form-control', {id: 'fromDate', onchange: m.withAttr('value', ctrl.setDate.bind(this, args.from)), value: ctrl.getDate(args.from())})
      ]), ' ',
      m('.form-group', [
        m('label', {for: 'fromTime'}, 'From time'), ' ',
        m('input.form-control', {id: 'fromTime', onchange: m.withAttr('value', ctrl.setTime.bind(this, args.from)), value: ctrl.getTime(args.from())})
      ]), ' ',
      m('.form-group', [
        m('label', {for: 'toDate'}, 'To date'), ' ',
        m('input.form-control', {id: 'toDate', onchange: m.withAttr('value', ctrl.setDate.bind(this, args.to)), value: ctrl.getDate(args.to())})
      ]), ' ',
      m('.form-group', [
        m('label', {for: 'toTime'}, 'To time'), ' ',
        m('input.form-control', {id: 'toTime', onchange: m.withAttr('value', ctrl.setTime.bind(this, args.to)), value: ctrl.getTime(args.to())})
      ]), ' ',
      m('button.btn.btn-primary', {type: 'submit', disabled: args.loading()}, 'Analyse')
    ]);
  }

  return form;
})();
