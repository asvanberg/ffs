module.exports = (function() {
  const analyser = {}

  const NUM_CHARACTERS_RELEVANT_CUTOFF = 10;

  if (!Array.prototype.nubBy) {
    Array.prototype.nubBy = function(f) {
      return this.filter((value, index, self) => self.findIndex(duplicate => f(duplicate) === f(value)) === index);
    }
  }

  analyser.analyse = (kms) => {
    const [characters, alliances] = kms.reduce(([characters, alliances], km) => {
      const victimAlliance = {id: km.victim.allianceID, name: km.victim.allianceName};
      const victim = {id: km.victim.characterID, name: km.victim.characterName, alliance: victimAlliance};

      const [ac, aa] = km.attackers.reduce(([attackingCharacters, attackingAlliances], attacker) => {
        const attackingAlliance = {id: attacker.allianceID, name: attacker.allianceName};
        const attackingCharacter = {id: attacker.characterID, name: attacker.characterName, alliance: attackingAlliance};
        return [attackingCharacters.concat(attackingCharacter), attackingAlliances.concat(attackingAlliance)];
      }, [[],[]]);

      return [characters.concat(victim, ac), alliances.concat(victimAlliance, aa)];
    }, [[], []]);
    return [characters.nubBy(c => c.id), alliances.nubBy(a => a.id)];
  }

  analyser.relevant = (kms, characters, alliances) => {
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
