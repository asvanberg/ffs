module.exports = (function() {
  var m = require('mithril');

  const ZKILLBOARD_API_TIMEOUT = 10 * 1000;

  function zeroPad(num) {
    return num < 10 ? `0${num}` : num;
  }

  var zKillboard = {};

  zKillboard.fetchKillmails = function(solarSystems, from, to, page) {
    function formatDate(date) {
      return `${date.getUTCFullYear()}${zeroPad(date.getUTCMonth() + 1)}${zeroPad(date.getUTCDate())}`
        + `${zeroPad(date.getUTCHours())}00`;
    }
    var solarSystemID = solarSystems.map(solarSystem => solarSystem.id).sort().join(',');
    var startTime = formatDate(from);
    var to_ = new Date(to.getTime());
    if (to_.getUTCMinutes() > 0) {
      // ZKillboard doesn't do minutes any more so if you want 19:30 the hour
      // is set to 20
      to_.setUTCHours(to_.getUTCHours() + 1);
    }
    var endTime = formatDate(to_);
    return m.request({
      method: 'GET',
      url: `https://zkillboard.com/api/kills/solarSystemID/${solarSystemID}/startTime/${startTime}/endTime/${endTime}/page/${page}/no-items/`,
      background: true,
      config: xhr => {
        xhr.timeout = ZKILLBOARD_API_TIMEOUT;
      }
    });
  };

  zKillboard.fetchAll = function(solarSystemID, from, to) {
    var deferred = m.deferred(),
        kms = [];

    function go(page) {
      zKillboard.fetchKillmails(solarSystemID, from, to, page)
        .then(data => {
          kms = kms.concat(data);

          if (data.length === 200) {
            go(page + 1);
          }
          else {
            deferred.resolve(kms);
          }
        }, deferred.reject);
    }
    go(1);

    return deferred.promise;
  }

  return zKillboard;
})();
