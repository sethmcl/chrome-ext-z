(function (win) {
  var haltEvents = false;
  win.addEventListener('message', onMessage, false);

  HTMLElement.prototype.addEventListener = wrappedAddEventListener(HTMLElement.prototype.addEventListener);
  HTMLDocument.prototype.addEventListener = wrappedAddEventListener(HTMLDocument.prototype.addEventListener);
  Window.prototype.addEventListener = wrappedAddEventListener(Window.prototype.addEventListener);

  function wrappedAddEventListener(ael) {
    return function (eventName, fn, capture) {
      // potential compat issue: if fn was bound with additional arguments, they will be
      // lost when we execute fn
      var wrappedFn = function (e) {
        if (haltEvents) {
          return;
        }
        fn(e);
      };
      ael.call(this, eventName, wrappedFn, capture);
    };
  }

  function onMessage(e) {
    if (e.data === 'z-halt-events') {
      haltEvents = true;
    } else if (e.data === 'z-allow-events') {
      haltEvents = false;
    }
  }
}(window));
