'use strict';

var fs            = require('fs');
var MessageRouter = require('../lib/MessageRouter');
var Ui            = require('../lib/Ui');

// build ui
var ui = new Ui(new MessageRouter());

window.addEventListener('load', function () {
  document.body.appendChild(ui.el.container);
});

// hijack event listeners
var script = document.createElement('script');
script.innerHTML = fs.readFileSync(__dirname + '/inPageCtx.js', 'utf8');
script.id = 'chrome-ext-z-override';
document.childNodes[1].appendChild(script);





