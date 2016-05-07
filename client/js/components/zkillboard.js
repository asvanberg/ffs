module.exports = (function() {
  var m = require('mithril')

  function zeroPad(num) {
    return num < 10 ? `0${num}` : num;
  }

  var zKillboard = {}

  zKillboard.fetchKillmails = function(solarSystems, from, to, page) {
    var solarSystemID = solarSystems.reduce(function(acc, e) { return acc + ',' + e.id; }, '').substring(1);
    var startTime = `${from.getFullYear()}${zeroPad(from.getMonth() + 1)}${zeroPad(from.getDate())}${zeroPad(from.getHours())}${zeroPad(from.getMinutes())}`;
    var endTime = `${to.getFullYear()}${zeroPad(to.getMonth() + 1)}${zeroPad(to.getDate())}${zeroPad(to.getHours())}${zeroPad(to.getMinutes())}`;
    return m.request({
      method: 'GET',
      url: `https://zkillboard.com/api/solarSystemID/${solarSystemID}/startTime/${startTime}/endTime/${endTime}/page/${page}/`,
      background: true
    })
  };

  zKillboard.fetchAll = function(solarSystemID, from, to) {
    var deferred = m.deferred(),
        kms = [];

    function go(page) {
      zKillboard.fetchKillmails(solarSystemID, from, to, page)
        .then(data => {
          kms = kms.concat(data)

          if (data.length == 200) {
            go(page + 1)
          }
          else {
            deferred.resolve(kms)
          }
        })
    }
    go(1);

    return deferred.promise;
  }

  return zKillboard;
})();
