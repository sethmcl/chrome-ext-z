'use strict';

var MessageRouter  = require('../lib/MessageRouter');
var TabFinder      = require('../lib/TabFinder');

var router         = new MessageRouter();
var tabFinder      = new TabFinder();
var tabHistory     = [];

// Search for a tab
router.on('tab-list-query', function (e) {
  queryTabs(e.request.query).then(function (tabs) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
      chrome.tabs.sendMessage(tab[0].id, {type: 'query-results', tabs: tabs});
    });
  });
});

// Select previous tab from tab history
router.on('select-last-tab', function (e) {
  console.log(tabHistory);
  var count = Math.min(e.request.count, tabHistory.length - 1);
  var tab = tabHistory[count];
  selectTab(tab.tabId, tab.windowId);
});

// Select a specific tab, by tab id
router.on('select-tab', function (e) {
  selectTab(e.request.tabId, e.request.windowId);
});

// Listen for keyboard shortcut command
chrome.commands.onCommand.addListener(function (command) {
  if (command === 'toggle-tab-search') {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      console.log(tabs);
      chrome.tabs.sendMessage(tabs[0].id, {type: 'toggle-search-panel'});
    });
  }
});

// Keep track of tab history
chrome.tabs.onActivated.addListener(function (info) {
  pushTabHistory(info.tabId);
});

// Check if we should run post install script
checkPostInstall();

function queryTabs(query) {
  return new Promise(function (resolve, reject) {
    chrome.tabs.query({}, function (tabs) {
      resolve(tabFinder.query(query, tabs));
    });
  });
};

function pushTabHistory(tabId, windowId) {
  tabHistory.unshift({
    tabId: tabId,
    windowId: windowId
  });

  tabHistory = tabHistory.slice(0, 5);
}

function selectTab(tabId, windowId) {
  chrome.tabs.update(tabId, { active: true, highlighted: true }, function () {
    if (windowId) {
      chrome.windows.update(windowId, { focused: true });
    }

    console.log('Selected tab %s', tabId);
  });
};

function postInstall(version) {
  if (!window.localStorage['installedVersion']) {
    alert('Please restart chrome to finish installing the extension.');
  } else {
    alert('Please restart chrome to finish upgrading the extension.');
  }

  window.localStorage['installedVersion'] = version;
}

function checkPostInstall() {
  var version = chrome.runtime.getManifest().version;
  var lsVersion = window.localStorage['installedVersion'];

  if (version !== lsVersion) {
    console.log('Running post install...');
    postInstall(version);
  } else {
    console.log('Skipping post install...');
  }
}
