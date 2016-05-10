module.exports = (function() {
  var m = require('mithril')

  function zeroPad(num) {
    return num < 10 ? `0${num}` : num;
  }

  var zKillboard = {}

  zKillboard.fetchKillmails = function(solarSystems, from, to, page) {
    function formatDate(date) {
      return `${date.getFullYear()}${zeroPad(date.getMonth() + 1)}${zeroPad(date.getDate())}`
           + `${zeroPad(date.getHours())}${zeroPad(date.getMinutes())}`;
    }
    var solarSystemID = solarSystems.map(solarSystem => solarSystem.id).join(',');
    var startTime = formatDate(from);
    var endTime = formatDate(to.getTime() > Date.now() ? new Date() : to);
    return m.request({
      method: 'GET',
      url: `https://zkillboard.com/api/solarSystemID/${solarSystemID}/startTime/${startTime}/endTime/${endTime}/page/${page}/no-items/`,
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

          if (data.length === 200) {
            go(page + 1)
          }
          else {
            deferred.resolve(kms)
          }
        });
    }
    go(1);

    return deferred.promise;
  }

  return zKillboard;
})();
