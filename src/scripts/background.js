'use strict';

var MessageRouter  = require('../lib/MessageRouter');
var router         = new MessageRouter();
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
  selectTab(tabHistory[count]);
});

// Select a specific tab, by tab id
router.on('select-tab', function (e) {
  selectTab(e.request.tabId);
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


function queryTabs(query) {
  return new Promise(function (resolve, reject) {
    chrome.tabs.query({}, function (tabs) {
      resolve(tabs.filter(function (tab) {
        return tab.url.match(query) || tab.title.match(query);
      }));
    });
  });
};

function pushTabHistory(tabId, windowId) {
  tabHistory.unshift(tabId);
  tabHistory = tabHistory.slice(0, 5);
}

function selectTab(tabId) {
  // chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    // lastTabId = tabs[0].id;
    chrome.tabs.update(tabId, { active: true, highlighted: true }, function () {
      console.log('Selected tab %s', tabId);
    });
  // });
};
