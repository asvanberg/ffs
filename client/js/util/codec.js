module.exports = (function() {
  var codec = {};

  var EVE_EPOCH = Date.UTC(2003, 4, 6); // May 6th 2003

  function toMinutes(ms) {
    return Math.floor(ms / 1000 / 60);
  }

  function fromMinutes(m) {
    return m * 1000 * 60;
  }

  codec.encode = function(filter) {
    var solarSystems = filter.solarSystems
      .map(solarSystem => solarSystem.id)
      .join(',');
    var start = toMinutes(filter.from.getTime() - EVE_EPOCH);
    var duration = toMinutes(filter.to.getTime() - filter.from.getTime());
    var allianceColors = Object.keys(filter.allianceColors)
      .map(allianceID => filter.allianceColors[allianceID] + allianceID)
      .join(',');

      return `${solarSystems}-${start}+${duration}-${allianceColors}`;
  };

  codec.decode = function(str) {
    var sections = str.split('-');

    // Must have at least 2 sections (systems and time)
    if (sections.length < 2) {
      return null;
    }
    var systems = sections[0].split(',');
    if (systems.some(isNaN)) {
      return null;
    }
    var time = sections[1].split('+');
    if (time.length !== 2 || time.some(isNaN)) {
      return null;
    }

    // For some reason .map(parseInt) does not work
    var solarSystems = systems.map(n => parseInt(n));
    var from = new Date(EVE_EPOCH + fromMinutes(time[0]));
    var to = new Date(from.getTime() + fromMinutes(time[1]));
    var allianceColors = {};
    if (sections[2]) {
      sections[2].split(',').reduce((acc, e) => {
        var color = e.charAt(0);
        var allianceID = e.substring(1);
        acc[allianceID] = color;
        return acc;
      }, allianceColors);
    }
    return {
      from,
      to,
      solarSystems,
      allianceColors
    };
  };

  return codec;
})();
