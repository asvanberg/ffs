module.exports = (function() {
  const dragndrop = {};

  dragndrop.source = function(data, produces, allowed = 'all') {
    const jsonData = JSON.stringify(data);
    return (element, initialized) => {
      if (initialized) return;

      element.setAttribute('draggable', 'true');
      element.addEventListener('dragstart', e => {
        e.dataTransfer.setData(produces, jsonData);
        e.dataTransfer.effectAllowed = allowed;
      }, false);
    }
  }

  function clearActive(element) {
    element.classList.remove('active-drop-target');
  }

  dragndrop.sink = function(dropped, accepts, operation) {
    function isAccepted(e) {
      const types = e.dataTransfer.types;
      if (types.includes) { return types.includes(accepts); }
      // Firefox is retarded and returns DOMStringList rather than array
      else { return types.contains(accepts); }
    }

    return (element, initialized) => {
      if (initialized) return;

      function dragHandler(e) {
        if (isAccepted(e)) {
          e.preventDefault();
          e.dataTransfer.dropEffect = operation;
          element.classList.add('active-drop-target');
        }
      }

      element.setAttribute('dropzone', `${operation} s:${accepts}`);
      element.addEventListener('dragover', dragHandler, false);
      element.addEventListener('dragenter', dragHandler, false);
      element.addEventListener('dragleave', clearActive.bind(null, element), false);
      element.addEventListener('drop', e => {
        dropped(JSON.parse(e.dataTransfer.getData(accepts)));
        clearActive(element);
      }, false);
    }
  }

  return dragndrop;
})();
