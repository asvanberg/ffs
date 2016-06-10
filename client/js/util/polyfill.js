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

  if (!Array.prototype.flatMap) {
    Array.prototype.flatMap = function(lambda) {
      return Array.prototype.concat.apply([], this.map(lambda));
    }
  }

  if (!Object.values) {
    let reduce = Function.bind.call(Function.call, Array.prototype.reduce);
    let isEnumerable = Function.bind.call(Function.call, Object.prototype.propertyIsEnumerable);
    let concat = Function.bind.call(Function.call, Array.prototype.concat);
    let keys = Reflect.ownKeys;

  	Object.values = function values(O) {
  		return reduce(keys(O), (v, k) => concat(v, typeof k === 'string' && isEnumerable(O, k) ? [O[k]] : []), []);
  	};
  }
})();
