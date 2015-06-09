module.exports = TabFinder;

/**
 * @constructor
 */
function TabFinder() {}

/**
 * Find matching tabs
 * @param {string} query Input string
 * @param {array} tabs Set of all tabs to search
 * @returns {array} matching tabs
 */
TabFinder.prototype.query = function (query, tabs) {
  var regex = this.createRegexFromQuery(query);

  matches = tabs.filter(function (tab) {
    tab.score = this.scoreTab(query, tab);
    return tab.score > 0;
  }, this);

  return matches.sort(function (a, b) {
    return a.score < b.score;
  });
};

/**
 * Score a tab against a query string
 * @param {string} query
 * @param {chrome.tabs.Tab}
 */
TabFinder.prototype.scoreTab = function (query, tab) {
  var matchers = this.createRegexFromQuery(query);
  var score = 0;
  var content = tab.url + ' ' + tab.title;

  for (var i = 0; i < matchers.length; i++) {
    var matcher = matchers[i];
    var result = content.match(matcher.re);

    if (!result) {
      if (i !== 0) {
        score = 0;
        break;
      } else {
        continue;
      }
    }

    score = score + (result.length * matcher.weight);
  }

  return score;
};

/**
 * Create set of regular expressions on query input
 * @param {string} query
 * @returns {array} array of regular expressions to use for scoring
 */
TabFinder.prototype.createRegexFromQuery = function (query) {
  var regex = [];

  regex.push({
    re: new RegExp(query, 'ig'),
    weight: 100
  });

  query.split(' ').forEach(function (queryPart, idx) {
    regex.push({
      re: new RegExp(queryPart, 'ig'),
      weight: Math.max((50 - (idx * 5)), 1)
    });
  });

  return regex;
};
