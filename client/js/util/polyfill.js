module.exports = (function() {
  if (!Array.prototype.nubBy) {
    Array.prototype.nubBy = function(f) {
      // Credits to georg (http://stackoverflow.com/a/9229821)
      const seen = {};
      return this.filter(item => {
        var key = f(item);
        return seen.hasOwnProperty(key) ? false : (seen[key] = true);
      });
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

  if (!Array.prototype.sortBy) {
    Array.prototype.sortBy = function(f, reverse = false) {
      return this.sort((e1, e2) => {
        function cmp(a, b) {
          if (a < b) { return -1; }
          else if (a > b) { return 1; }
          else { return 0; }
        }

        const s1 = f(e1), s2 = f(e2);
        return reverse ? cmp(s2, s1) : cmp(s1, s2);
      });
    }
  }

  if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement) {
      return this.some(e => e === searchElement);
    }
  }

  if (!Array.prototype.flatMap) {
    Array.prototype.flatMap = function(lambda) {
      return Array.prototype.concat.apply([], this.map(lambda));
    }
  }
})();
