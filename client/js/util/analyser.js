module.exports = (function() {
  require('./polyfill');
  const analyser = {}

  const NUM_CHARACTERS_RELEVANT_CUTOFF = 10;
  // Unknown, Capsule, Golden capsule, Mobile depot
  const IRRELEVANT_SHIPS = [0, 670, 33328, 33475];

  analyser.analyse = (kms) => {
    const [characters, alliances] = kms.reduce(([characters, alliances], km) => {
      const victimAlliance = {id: km.victim.allianceID, name: km.victim.allianceName};
      const corporation = {id: km.victim.corporationID, name: km.victim.corporationName};
      const ship = {id: km.victim.shipTypeID};
      const victim = {id: km.victim.characterID, name: km.victim.characterName, alliance: victimAlliance, corporation, ship};

      const [ac, aa] = km.attackers.reduce(([attackingCharacters, attackingAlliances], attacker) => {
        const alliance = {id: attacker.allianceID, name: attacker.allianceName};
        const corporation = {id: attacker.corporationID, name: attacker.corporationName};
        const ship = {id: attacker.shipTypeID};
        const attackingCharacter = {id: attacker.characterID, name: attacker.characterName, alliance, corporation, ship};
        return [attackingCharacters.concat(attackingCharacter), attackingAlliances.concat(alliance)];
      }, [[],[]]);

      return [characters.concat(victim, ac), alliances.concat(victimAlliance, aa)];
    }, [[], []]);
    return [characters.nubBy(c => `${c.id}-${c.ship.id}`), alliances.nubBy(a => a.id)];
  }

  analyser.relevant = (kms, unfilteredCharacters, alliances) => {
    const characters = unfilteredCharacters.filter(character => !IRRELEVANT_SHIPS.includes(character.ship.id));
    function numCharacters(alliance) {
      return characters.filter(character => character.alliance.id === alliance.id).length;
    }
    const relevantAlliances = alliances.filter(alliance => alliance.id && numCharacters(alliance) >= NUM_CHARACTERS_RELEVANT_CUTOFF);
    const relevantCharacters = characters.filter(character => relevantAlliances.some(alliance => alliance.id === character.alliance.id));
    const relevantKMs = kms.filter(km => relevantAlliances.some(alliance => alliance.id === km.victim.allianceID));
    return [relevantKMs, relevantCharacters, relevantAlliances];
  }

  return analyser;
})();
