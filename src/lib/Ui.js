var fs = require('fs');

module.exports = Ui;

/**
 * @constructor
 */
function Ui(router) {
  var el = this.el = this.createDom();
  this.router = router;
  this.tabResults = [];

  el.form.addEventListener('submit', this.onSubmit.bind(this));
  el.input.addEventListener('keyup', this.onInputKeyUp.bind(this));
  router.on('toggle-search-panel', this.onToggleSearchPanel.bind(this));
  router.on('query-results', this.onQueryResults.bind(this));

  this.resetResultList();
}

/**
 * @property tabResults tab objects from query
 */
Ui.prototype.tabResults = null;

/**
 * @property resultsRendered Are results rendered?
 */
Ui.prototype.resultsRendered = null;

/**
 * Handle keyboard event on input box
 * @param {Event} e
 */
Ui.prototype.onInputKeyUp = function (e) {
  if (e.keyCode === 27) { // ESCAPE
    this.hideSearchPanel();
  }
};

/**
 * Create the <style> element
 */
Ui.prototype.createStyleElement = function () {
  var styleSrc    = fs.readFileSync(__dirname + '/../styles/contentScript.css', 'utf8');
  var style       = document.createElement('style');
  style.innerHTML = styleSrc;
  return style;
};

/**
 * Create the DOM elements
 * @returns {HTMLElement} container element
 */
Ui.prototype.createDom = function () {
  var container  = document.createElement('div');
  var shadowRoot = container.createShadowRoot();
  var form       = document.createElement('form');
  var input      = document.createElement('input');
  var ul         = document.createElement('ul');

  shadowRoot.appendChild(this.createStyleElement());
  shadowRoot.appendChild(form);

  form.id = 'z-search-panel';
  form.appendChild(input);
  form.appendChild(ul);

  return {
    form: form,
    input: input,
    ul: ul,
    container: container
  };
};

/**
 * Render tab result list
 * @param {Array} tabs Tab objects
 * @see https://developer.chrome.com/extensions/tabs#type-Tab
 */
Ui.prototype.renderResults = function (tabs) {
  this.resetResultList();
  this.tabResults = tabs;

  // If there are none
  if (tabs.length === 0) {
    this.el.input.placeholder = 'no matches, try again';
    return;
  }

  // If there is only one
  if (tabs.length === 1) {
    this.selectResult(1);
    return;
  }

  tabs.forEach(function (tab, idx) {
    this.el.ul.appendChild(this.renderTabResult(tab, idx + 1));
  }, this);

  this.el.input.placeholder = 'which tab?';
  this.resultsRendered = true;
};

/**
 * Render a tab result <li> element
 * @param {chrome.Tab} tab object
 * @param {number} idx Tab index
 */
Ui.prototype.renderTabResult = function (tab, idx) {
  var defaultFavIcon  = 'https://www.google.com/images/icons/product/chrome-32.png';
  var numberContainer = document.createElement('span');
  var number          = document.createElement('span');
  var iconContainer   = document.createElement('span');
  var icon            = document.createElement('img');
  var li              = document.createElement('li');
  var text            = document.createElement('span');

  numberContainer.className = 'number-container';
  number.className = 'number';

  if (!tab.favIconUrl || tab.favIconUrl.indexOf('chrome://') === 0) {
    icon.src = defaultFavIcon;
  } else {
    icon.src = tab.favIconUrl;
  }

  number.innerHTML        = idx;
  iconContainer.className = 'icon-container';
  text.innerHTML          = tab.title + ' (' + tab.url + ')';
  text.className          = 'text';

  numberContainer.appendChild(number);
  iconContainer.appendChild(icon);
  li.appendChild(numberContainer);
  li.appendChild(iconContainer);
  li.appendChild(text);

  return li;
};

/**
 * Receive new tab result set from background page
 * @param {object} event Object
 */
Ui.prototype.onQueryResults = function (e) {
  var tabs = e.request.tabs;
  this.renderResults(tabs);
};

/**
 * Receive request to toggle search panel ui
 * @param {object} event Object
 */
Ui.prototype.onToggleSearchPanel = function (e) {
  if (this.el.form.classList.contains('active')) {
    this.hideSearchPanel();
  } else {
    this.showSearchPanel();
  }
};

/**
 * Hide the search panel
 */
Ui.prototype.hideSearchPanel = function () {
  window.postMessage('z-allow-events', '*');
  this.el.form.classList.remove('active');
  this.resetResultList();
};

/**
 * Show the search panel
 */
Ui.prototype.showSearchPanel = function () {
  window.postMessage('z-halt-events', '*');
  this.el.form.classList.add('active');
  this.el.input.focus();
};

/**
 * Handle search form submit -- query for matching tabs
 * @param {Event} e
 */
Ui.prototype.onSubmit = function (e) {
  var query = this.el.input.value;
  e.preventDefault();
  this.el.input.value = '';

  var dash = query.match(/-+/);

  if (dash) {
    this.resetResultList();
    this.hideSearchPanel();
    this.router.send('select-last-tab', { count: dash[0].length });
    return;
  }

  if (query.match(/\d+/) && this.resultsRendered) {
    this.selectResult(parseInt(query, 10));
  } else {
    this.router.send('tab-list-query', { query: query });
  }
};

/**
 * Clear result list
 */
Ui.prototype.resetResultList = function () {
  this.resultsRendered = false;
  this.el.ul.innerHTML = '';
  this.tabResults = [];
  this.el.input.placeholder = 'search for a tab';
};

/**
 * Select a tab from result set
 */
Ui.prototype.selectResult = function (idx) {
  idx = idx - 1;
  console.log('select tab', idx);
  console.log(this.tabResults);
  if (idx < 0 || idx >= this.tabResults.length) {
    this.el.input.value = '';
    return;
  }

  var tab = this.tabResults[idx];
  this.resetResultList();
  this.hideSearchPanel();
  this.router.send('select-tab', { tabId: tab.id, windowId: tab.windowId });
};
