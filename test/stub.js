const CookieStub = {};
CookieStub.mockBridge = function(cookies) {
  var clb = function(e) {
    e.preventDefault();
    e.detail.result = Promise.resolve(cookies);
  };
  CookieStub.__bridgeCallback = clb;
  window.addEventListener('session-cookie-list-all', clb);
};
CookieStub.unmockBridge = function() {
  window.removeEventListener('session-cookie-list-all', CookieStub.__bridgeCallback);
};
