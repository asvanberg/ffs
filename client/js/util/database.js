module.exports = (function() {
  const m = require('mithril')

  const REQUESTS_PER_SECOND = 20;
  const QUEUE_PROCESS_TIMER = 100;
  const ITEMS_TO_PROCESS = REQUESTS_PER_SECOND / (1000 / QUEUE_PROCESS_TIMER);

  const db = {};

  const queue = [];

  function keyify(shipTypeID) {
    return `ship-${shipTypeID}`;
  }

  function fetchAndStore(shipTypeID) {
    if (!queue.includes(shipTypeID)) {
      queue.push(shipTypeID);
    }
  }

  function processQueue() {
    const toProcess = queue.splice(0, ITEMS_TO_PROCESS);
    toProcess.forEach(shipTypeID => {
      m.request({
        method: 'GET',
        url: `https://crest-tq.eveonline.com/inventory/types/${shipTypeID}/`,
        background: true
      })
        .then(result => {
          delete result.dogma;
          delete result.description;
          delete result.graphicID;
          delete result.portionSize_str;
          delete result.id_str;
          return result;
        })
        .then(result => {
          localStorage.setItem(keyify(shipTypeID), JSON.stringify(result));
          return result;
        })
        .then(m.redraw)
    })
  }
  const worker = setInterval(processQueue, QUEUE_PROCESS_TIMER);

  function unknownShip(shipTypeID) {
    return {
      capacity: 0,
      portionSize: 0,
      volume: 0,
      radius: 0,
      published: false,
      mass: 0,
      id: shipTypeID,
      name: 'Unknown'
    };
  }

  db.ship = function(shipTypeID) {
    const key = keyify(shipTypeID);
    const current = localStorage.getItem(key);
    if (current === null) {
      fetchAndStore(shipTypeID);
      return unknownShip(shipTypeID);
    }
    else {
      return JSON.parse(current);
    }
  }

  return db;
})();
