var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports = MessageRouter;

/**
 * @constructor
 */
function MessageRouter() {
  chrome.runtime.onMessage.addListener(function (request, sender, respond) {
    this.emit(request.type, {
      request: request,
      sender: sender,
      respond: respond
    });
  }.bind(this));
}

util.inherits(MessageRouter, EventEmitter);

/**
 */
MessageRouter.prototype.send = function (type, data, respond) {

  if (typeof data === 'function') {
    respond = data;
    data = {};
  }

  if (!data) {
    data = {};
  }

  data.type = type;
  chrome.runtime.sendMessage(data, respond);
};
