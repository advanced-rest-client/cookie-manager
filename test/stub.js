const CookieStub = {};
CookieStub.listHandler = undefined;
CookieStub.mockBridge = function(cookies) {
  CookieStub.listHandler = function(e) {
    e.preventDefault();
    e.detail.result = Promise.resolve(cookies);
  };
  window.addEventListener('session-cookie-list-all', CookieStub.listHandler);
};
CookieStub.unmockBridge = function() {
  window.removeEventListener('session-cookie-list-all', CookieStub.listHandler);
};
