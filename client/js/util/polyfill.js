module.exports = (function() {
  if (!Array.prototype.nubBy) {
    Array.prototype.nubBy = function(f) {
      return this.filter((value, index, self) => self.findIndex(duplicate => f(duplicate) === f(value)) === index);
    }
  }

  if (!Array.prototype.groupBy) {
    Array.prototype.groupBy = function(f) {
      return this.reduce((map, v) => {
        (map[f(v)] = map[f(v)] || []).push(v);
        return map;
      }, {});
    }
  }

  if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement) {
      return this.some(e => e === searchElement);
    }
  }
})();
