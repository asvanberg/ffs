module.exports = (function() {
  var codec = {};

  const EVE_EPOCH = Date.UTC(2003, 4, 6); // May 6th 2003
  const ALLIANCE_ID_PADDING = 99000000;
  const SOLARSYSTEM_ID_PADDING = 30000000;
  const RADIX = 36;

  function toMinutes(ms) {
    return Math.floor(ms / 1000 / 60);
  }

  function fromMinutes(m) {
    return m * 1000 * 60;
  }

  codec.encode = function(filter) {
    var solarSystems = filter.solarSystems
      .map(solarSystem => (solarSystem.id - SOLARSYSTEM_ID_PADDING).toString(RADIX))
      .join(',');
    var start = toMinutes(filter.from.getTime() - EVE_EPOCH);
    var duration = toMinutes(filter.to.getTime() - filter.from.getTime());
    var allianceColors = Object.keys(filter.allianceColors)
      .map(allianceID => filter.allianceColors[allianceID] + (allianceID - ALLIANCE_ID_PADDING).toString(RADIX))
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
    if (systems.map(s => parseInt(s, RADIX)).some(isNaN)) {
      return null;
    }
    var time = sections[1].split('+');
    if (time.length !== 2 || time.some(isNaN)) {
      return null;
    }

    // For some reason .map(parseInt) does not work
    var solarSystems = systems.map(n => parseInt(n, RADIX) + SOLARSYSTEM_ID_PADDING);
    var from = new Date(EVE_EPOCH + fromMinutes(time[0]));
    var to = new Date(from.getTime() + fromMinutes(time[1]));
    var allianceColors = {};
    if (sections[2]) {
      // Joining index 2+ in case thare are negative numbers
      sections.slice(2).join('-').split(',').reduce((acc, e) => {
        var color = e.charAt(0);
        var allianceID = parseInt(e.substring(1), RADIX) + ALLIANCE_ID_PADDING;
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
