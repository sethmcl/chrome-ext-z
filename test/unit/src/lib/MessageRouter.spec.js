/**
 * @venus-library mocha
 * @venus-include #node_modules/chrome-mock/browser.js
 * @venus-code #lib/MessageRouter.js
 */
describe('MessageRouter.js', function () {
  var router;

  describe('constructor', function () {
    beforeEach(function () {
      router = new window.MessageRouter();
    });

    it('should register for runtime messages', function () {
      expect(window.chrome.runtime.onMessage.addListener.args[0].length).to.be(1);
    });
  });

  describe('send', function () {
    var args, respondFn, data;

    beforeEach(function () {
      router    = new window.MessageRouter();
      data      = { name: 'seth' };
      respondFn = function () {};

      window.chrome.resetMock();
    });

    it('handles three arguments', function () {
      router.send('FOO', data, respondFn);
      args = window.chrome.runtime.sendMessage.args[0];

      expect(args[0]).to.eql({
        name: 'seth',
        type: 'FOO'
      });

      expect(args[1]).to.eql(respondFn);
    });

    it('handles type and respond', function () {
      router.send('BAR', respondFn);
      args = window.chrome.runtime.sendMessage.args[0];

      expect(args[0]).to.eql({
        type: 'BAR'
      });

      expect(args[1]).to.eql(respondFn);
    });

    it('handles type and data', function () {
      router.send('BIZ', data);
      args = window.chrome.runtime.sendMessage.args[0];

      expect(args[0]).to.eql({
        name: 'seth',
        type: 'BIZ'
      });

      expect(args[1]).to.eql(undefined);
    });

    it('handles type only', function () {
      router.send('BAZ');
      args = window.chrome.runtime.sendMessage.args[0];

      expect(args[0]).to.eql({
        type: 'BAZ'
      });

      expect(args[1]).to.eql(undefined);

    });
  });
});
