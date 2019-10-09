import { fixture, assert, nextFrame, aTimeout, html } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import { CookieStub } from './stub.js';
import '../cookie-manager.js';

describe('<cookie-manager>', function() {
  async function basicFixture() {
    return await fixture(html`<cookie-manager></cookie-manager>`);
  }

  async function exportEncryptFixture() {
    return await fixture(html`<cookie-manager withEncrypt></cookie-manager>`);
  }

  describe('Basics', () => {
    before(function() {
      CookieStub.mockBridge();
    });

    after(function() {
      CookieStub.unmockBridge();
    });

    it('Queries for cookies when attached', function(done) {
      window.addEventListener('session-cookie-list-all', function f() {
        window.removeEventListener('session-cookie-list-all', f);
        done();
      });
      basicFixture();
    });

    it('hasItems is false when no items', async () => {
      const element = await basicFixture();
      assert.isFalse(element.hasItems);
    });

    it('dataUnavailable is true when no items', async () => {
      const element = await basicFixture();
      assert.isTrue(element.dataUnavailable);
    });

    it('Renders add cookie button', async () => {
      const element = await basicFixture();
      const button = element.shadowRoot.querySelector('[data-action="empty-add-cookie"]');
      assert.ok(button);
    });

    it('Add cookie button opens the editor', async () => {
      const element = await basicFixture();
      const button = element.shadowRoot.querySelector('[data-action="empty-add-cookie"]');
      MockInteractions.tap(button);
      await nextFrame();
      assert.isTrue(element._editorContainer.opened);
    });
  });

  describe('#listHidden', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns false when isSearch', () => {
      element.isSearch = true;
      assert.isFalse(element.listHidden);
    });

    it('returns false when has items', () => {
      element.items = DataGenerator.generateCookiesData({
        size: 1
      });
      assert.isFalse(element.listHidden);
    });

    it('returns true when no items', () => {
      element.items = undefined;
      assert.isTrue(element.listHidden);
    });
  });

  describe('#hasItems', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns false when no items', () => {
      assert.isFalse(element.hasItems);
    });

    it('returns true when has items', () => {
      element.items = DataGenerator.generateCookiesData({
        size: 1
      });
      assert.isTrue(element.hasItems);
    });
  });

  describe('#dataUnavailable', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns false when has items', () => {
      element.items = DataGenerator.generateCookiesData({
        size: 1
      });
      element.loading = false;
      element.isSearch = false;
      assert.isFalse(element.dataUnavailable);
    });

    it('returns false when isSearch', () => {
      element.isSearch = true;
      assert.isFalse(element.dataUnavailable);
    });

    it('returns false when loading', () => {
      element.loading = true;
      assert.isFalse(element.dataUnavailable);
    });

    it('returns true when all is false', () => {
      element.loading = false;
      element.isSearch = false;
      assert.isTrue(element.dataUnavailable);
    });
  });

  describe('_resetSearch()', function() {
    before(function() {
      CookieStub.mockBridge();
    });

    after(function() {
      CookieStub.unmockBridge();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await aTimeout();
    });

    it('Sets "items" to "_beforeQueryItems"', () => {
      element._beforeQueryItems = DataGenerator.generateCookiesData({
        size: 50
      });
      element._resetSearch();
      assert.lengthOf(element.items, 50);
    });

    it('Clears "_beforeQueryItems"', () => {
      element._beforeQueryItems = DataGenerator.generateCookiesData({
        size: 50
      });
      element._resetSearch();
      assert.isUndefined(element._beforeQueryItems);
    });

    it('Resets isSearch', () => {
      element.isSearch = true;
      element._resetSearch();
      assert.isFalse(element.isSearch);
    });

    it('Queries for cookies when no _beforeQueryItems', () => {
      const spy = sinon.spy();
      element.addEventListener('session-cookie-list-all', spy);
      element._resetSearch();
      assert.isTrue(spy.called);
    });

    it('Do not query for cookies if _beforeQueryItems', () => {
      element._beforeQueryItems = DataGenerator.generateCookiesData({
        size: 50
      });
      const spy = sinon.spy();
      element.addEventListener('session-cookie-list-all', spy);
      element._resetSearch();
      assert.isFalse(spy.called);
    });
  });

  describe('_delete()', function() {
    before(function() {
      CookieStub.mockBridge();
    });

    after(function() {
      CookieStub.unmockBridge();
    });

    let element;
    let cookies;
    beforeEach(async () => {
      element = await basicFixture();
      cookies = DataGenerator.generateCookiesData({
        size: 1
      });
      await aTimeout();
    });

    it('dispatches GA exception when model not found', () => {
      const spy = sinon.spy();
      element.addEventListener('send-analytics', spy);
      element._delete(cookies);
      assert.isTrue(spy.called);
    });

    it('Dispatches session-cookie-remove', (done) => {
      element.addEventListener('session-cookie-remove', (e) => {
        e.preventDefault();
        assert.deepEqual(e.detail.cookies, cookies, 'Cookie is set');
        assert.isTrue(e.cancelable, 'Event is cancelable');
        assert.isTrue(e.bubbles, 'Event bubbles');
        e.detail.result = Promise.resolve();
        done();
      });
      element._delete(cookies);
    });

    it('Returns a promise from the event', () => {
      element.addEventListener('session-cookie-remove', (e) => {
        e.preventDefault();
        e.detail.result = Promise.resolve();
      });
      const result = element._delete(cookies);
      assert.typeOf(result.then, 'function');
      return result.then;
    });

    it('dispatches GA exception when promise results to error', async () => {
      element.addEventListener('session-cookie-remove', (e) => {
        e.preventDefault();
        e.detail.result = Promise.reject(new Error('test'));
      });
      const spy = sinon.spy();
      element.addEventListener('send-analytics', spy);
      await element._delete(cookies);
      assert.isTrue(spy.called);
    });

    it('_onDelete() calls _delete() with an argument', () => {
      element.addEventListener('session-cookie-remove', (e) => {
        e.preventDefault();
        e.detail.result = Promise.resolve();
      });
      const items = [{ name: 'test' }];
      const spy = sinon.spy(element, '_delete');
      element._onDelete({
        detail: {
          items
        }
      });
      assert.isTrue(spy.called);
      assert.deepEqual(spy.args[0][0], items);
    });
  });

  describe('Export options', function() {
    before(function() {
      CookieStub.mockBridge();
    });

    after(function() {
      CookieStub.unmockBridge();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.items = DataGenerator.generateCookiesData({
        size: 10
      });
      await aTimeout();
    });

    it('_onExport() calls _exportItems with data', () => {
      const dest = 'file';
      element._exportItems = function(items, destination) {
        assert.deepEqual(items, element.items);
        assert.equal(destination, dest);
      };
      element._onExport({
        detail: {
          items: element.items,
          destination: dest
        }
      });
    });

    it('_exportAllFile() calls _doExportItems with data', () => {
      const dest = 'file';
      element._doExportItems = function(items, detail) {
        assert.deepEqual(items, element.items);
        assert.typeOf(detail.options, 'object');
        assert.equal(detail.options.provider, dest);
        assert.equal(detail.options.file, 'arc-session-cookies.json');
      };
      element._exportAllFile();
    });

    it('Dispatches arc-data-export event', (done) => {
      window.addEventListener('arc-data-export', function f(e) {
        window.removeEventListener('arc-data-export', f);
        assert.isTrue(e.cancelable, 'Event is cancelable');
        assert.isTrue(e.bubbles, 'Event bubbles');
        assert.equal(e.detail.options.file, 'test.json');
        assert.equal(e.detail.options.provider, 'file');
        assert.typeOf(e.detail.data, 'object');
        assert.deepEqual(e.detail.data.cookies, element.items);
        done();
      });
      element._doExportItems(element.items, {
        options: {
          provider: 'file',
          file: 'test.json'
        }
      });
    });

    it('dispatches GA exception when event not handled', async () => {
      const spy = sinon.spy();
      element.addEventListener('send-analytics', spy);
      element._doExportItems(element.items, {
        options: {
          provider: 'file',
          file: 'test.json'
        }
      });
      assert.isTrue(spy.called);
    });
  });

  describe('With cookies', function() {
    let cookies;
    before(function() {
      cookies = DataGenerator.generateCookiesData({
        size: 50
      });
      CookieStub.mockBridge(cookies);
    });

    after(function() {
      CookieStub.unmockBridge();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await aTimeout();
    });

    it('hasItems is computed', function() {
      assert.isTrue(element.hasItems);
    });

    it('Computes dataUnavailable property', function() {
      assert.isFalse(element.dataUnavailable);
    });

    it('Computes listHidden property', function() {
      assert.isFalse(element.listHidden);
    });
  });

  describe('_onSearch()', () => {
    let cookies;
    before(function() {
      cookies = DataGenerator.generateCookiesData({
        size: 1
      });
      CookieStub.mockBridge(cookies);
    });

    after(function() {
      CookieStub.unmockBridge();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await aTimeout();
    });

    it('Calls query() with an argument', () => {
      const spy = sinon.spy(element, 'query');
      element._onSearch({
        detail: {
          q: 'test'
        }
      });
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'test');
    });
  });

  describe('query()', function() {
    let cookies;
    before(function() {
      cookies = DataGenerator.generateCookiesData({
        size: 10
      });
      CookieStub.mockBridge(cookies);
    });

    after(function() {
      CookieStub.unmockBridge();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await aTimeout();
    });

    it('Calls _resetSearch() when no argument', () => {
      const spy = sinon.spy(element, '_resetSearch');
      element.query();
      assert.isTrue(spy.called);
    });

    it('Sets isSearch property', () => {
      element.query('test');
      assert.isTrue(element.isSearch);
    });

    it('Sets _beforeQueryItems property', () => {
      element.query('test');
      assert.lengthOf(element._beforeQueryItems, 10);
    });

    it('does not set _beforeQueryItems property when already set', () => {
      const items = [{ name: 'test' }];
      element._beforeQueryItems = items;
      element.query('test');
      assert.isTrue(element._beforeQueryItems === items);
    });

    it('Filters by name', () => {
      const name = 'test-name';
      element.items[0].name = name;
      element.query(name);
      assert.lengthOf(element.items, 1);
      assert.equal(element.items[0].name, name);
    });

    it('Filters by name case insensitive', () => {
      const name = 'Test-Name';
      element.items[0].name = name;
      element.query('tesT-namE');
      assert.lengthOf(element.items, 1);
      assert.equal(element.items[0].name, name);
    });

    it('Filters by domain', () => {
      const domain = 'test-domain';
      element.items[0].domain = domain;
      element.query(domain);
      assert.lengthOf(element.items, 1);
      assert.equal(element.items[0].domain, domain);
    });

    it('Filters by domain case insensitive', () => {
      const domain = 'Test-Domain';
      element.items[0].domain = domain;
      element.query('tesT-domaiN');
      assert.lengthOf(element.items, 1);
      assert.equal(element.items[0].domain, domain);
    });

    it('Filters by value', () => {
      const value = 'test-value';
      element.items[0].value = value;
      element.query(value);
      assert.lengthOf(element.items, 1);
      assert.equal(element.items[0].value, value);
    });

    it('Filters by value case insensitive', () => {
      const value = 'Test-Value';
      element.items[0].value = value;
      element.query('tesT-valuE');
      assert.lengthOf(element.items, 1);
      assert.equal(element.items[0].value, value);
    });

    it('Filters by path', () => {
      const path = 'test-path';
      element.items[0].path = path;
      element.query(path);
      assert.lengthOf(element.items, 1);
      assert.equal(element.items[0].path, path);
    });

    it('Filters by path case insensitive', () => {
      const path = 'Test-Path';
      element.items[0].path = path;
      element.query('tesT-patH');
      assert.lengthOf(element.items, 1);
      assert.equal(element.items[0].path, path);
    });

    it('Resets the items when no argument', () => {
      element.query('test-non-existing');
      assert.lengthOf(element.items, 0);
      element.query('');
      assert.lengthOf(element.items, 10);
    });
  });

  describe('_deleteAllClick()', () => {
    before(function() {
      CookieStub.mockBridge();
    });

    after(function() {
      CookieStub.unmockBridge();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await aTimeout();
    });

    it('Calls _deselectMainMenu()', () => {
      const spy = sinon.spy(element, '_deselectMainMenu');
      element._deleteAllClick();
      assert.isTrue(spy.called);
    });

    it('Opens working dialog', () => {
      element._deleteAllClick();
      const dialog = element.shadowRoot.querySelector('#dataClearDialog');
      assert.isTrue(dialog.opened);
    });
  });

  describe('_onClearDialogResult()', () => {
    before(function() {
      CookieStub.mockBridge();
    });

    after(function() {
      CookieStub.unmockBridge();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await aTimeout();
    });

    it('Ignores not confirmed dialog', () => {
      const spy = sinon.spy(element, '_delete');
      element._onClearDialogResult({
        detail: {
          confirmed: false
        }
      });
      assert.isFalse(spy.called);
    });

    it('Ignores action when no items', () => {
      const spy = sinon.spy(element, '_delete');
      element.items = undefined;
      element._onClearDialogResult({
        detail: {
          confirmed: true
        }
      });
      assert.isFalse(spy.called);
    });

    it('Ignores action when items is empty', () => {
      const spy = sinon.spy(element, '_delete');
      element.items = [];
      element._onClearDialogResult({
        detail: {
          confirmed: true
        }
      });
      assert.isFalse(spy.called);
    });

    it('Calls _delete with an argument', () => {
      const spy = sinon.spy(element, '_delete');
      element.items = [{ name: 'test' }];
      element._onClearDialogResult({
        detail: {
          confirmed: true
        }
      });
      assert.isTrue(spy.called);
      assert.deepEqual(spy.args[0][0], element.items);
    });
  });

  describe('_compareCookies()', () => {
    before(function() {
      CookieStub.mockBridge();
    });

    after(function() {
      CookieStub.unmockBridge();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await aTimeout();
    });

    it('Returns false when domain do not match', () => {
      const a = { domain: 'a' };
      const b = { domain: 'b' };
      const result = element._compareCookies(a, b);
      assert.isFalse(result);
    });

    it('Returns false when path do not match', () => {
      const a = { domain: 'a', path: 'a' };
      const b = { domain: 'a', path: 'b' };
      const result = element._compareCookies(a, b);
      assert.isFalse(result);
    });

    it('Returns false when name do not match', () => {
      const a = { domain: 'a', path: 'a', name: 'a' };
      const b = { domain: 'a', path: 'a', name: 'b' };
      const result = element._compareCookies(a, b);
      assert.isFalse(result);
    });

    it('Returns true otherwise', () => {
      const a = { domain: 'a', path: 'a', name: 'a' };
      const b = { domain: 'a', path: 'a', name: 'a' };
      const result = element._compareCookies(a, b);
      assert.isTrue(result);
    });
  });

  describe('_getCookieIndex()', () => {
    before(function() {
      CookieStub.mockBridge();
    });

    after(function() {
      CookieStub.unmockBridge();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.items = DataGenerator.generateCookiesData({
        size: 3
      });
      await aTimeout();
    });

    it('Returns cookie index', () => {
      const result = element._getCookieIndex(element.items[1]);
      assert.equal(result, 1);
    });

    it('Returns -1 when not found', () => {
      const result = element._getCookieIndex({ name: 'a', path: 'b', domain: 'c' });
      assert.equal(result, -1);
    });

    it('Returns -1 when no items', () => {
      element.items = undefined;
      const result = element._getCookieIndex({ name: 'a', path: 'b', domain: 'c' });
      assert.equal(result, -1);
    });

    it('Returns -1 when items is empty', () => {
      element.items = [];
      const result = element._getCookieIndex({ name: 'a', path: 'b', domain: 'c' });
      assert.equal(result, -1);
    });
  });

  describe('_onCookieRemoved()', () => {
    before(function() {
      CookieStub.mockBridge();
    });

    after(function() {
      CookieStub.unmockBridge();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.items = DataGenerator.generateCookiesData({
        size: 3
      });
      await aTimeout();
    });

    function fire(cookie, cancelable) {
      if (cancelable === undefined) {
        cancelable = false;
      }
      const e = new CustomEvent('session-cookie-removed', {
        bubbles: true,
        cancelable,
        detail: cookie
      });
      document.body.dispatchEvent(e);
    }

    it('Ignores cancelable events', () => {
      fire(element.items[0], true);
      assert.lengthOf(element.items, 3);
    });

    it('Removes a cookie', () => {
      fire(element.items[1]);
      assert.lengthOf(element.items, 2);
    });

    it('Ignores action when cookie not found', () => {
      fire({ name: 'a', domain: 'b', path: 'c' });
      assert.lengthOf(element.items, 3);
    });

    it('Resets _nextInsertAtPosition', () => {
      element._nextInsertAtPosition = true;
      fire(element.items[1]);
      assert.isFalse(element._nextInsertAtPosition);
    });

    it('Sets _nextInsertPosition', () => {
      element._nextInsertAtPosition = true;
      fire(element.items[2]);
      assert.equal(element._nextInsertPosition, 2);
    });
  });

  describe('_onCookieChanged()', () => {
    before(function() {
      CookieStub.mockBridge();
    });

    after(function() {
      CookieStub.unmockBridge();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.items = DataGenerator.generateCookiesData({
        size: 3
      });
      await aTimeout();
    });

    function fire(cookie) {
      const e = new CustomEvent('session-cookie-changed', {
        bubbles: true,
        detail: cookie
      });
      document.body.dispatchEvent(e);
    }

    it('Updates existing cookie', () => {
      const cookie = Object.assign({}, element.items[0]);
      cookie.value = 'test-value';
      fire(cookie);
      assert.equal(element.items[0].value, 'test-value');
    });

    it('Adds new cookie', () => {
      fire({ name: 'a', domain: 'b', path: 'c' });
      assert.lengthOf(element.items, 4);
      assert.equal(element.items[3].name, 'a');
    });

    it('Creates items', () => {
      element.items = undefined;
      fire({ name: 'a', domain: 'b', path: 'c' });
      assert.lengthOf(element.items, 1);
    });

    it('Updates cookie at position', () => {
      element._nextInsertPosition = 1;
      const cookie = { name: 'a', domain: 'b', path: 'c' };
      fire(cookie);
      assert.deepEqual(element.items[1], cookie);
    });
  });

  describe('openExportAll()', () => {
    before(function() {
      CookieStub.mockBridge();
    });

    after(function() {
      CookieStub.unmockBridge();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.items = DataGenerator.generateCookiesData({
        size: 3
      });
      await aTimeout();
    });

    it('Calls _deselectMainMenu()', () => {
      const spy = sinon.spy(element, '_deselectMainMenu');
      element.openExportAll();
      assert.isTrue(spy.called);
    });

    it('sets _exportOptionsOpened', () => {
      element.openExportAll();
      assert.isTrue(element._exportOptionsOpened);
    });

    it('sets _exportItems', () => {
      element.openExportAll();
      assert.deepEqual(element._exportItems, element.items);
    });
  });

  describe('Cookie details', () => {
    before(function() {
      CookieStub.mockBridge();
    });

    after(function() {
      CookieStub.unmockBridge();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.items = DataGenerator.generateCookiesData({
        size: 3
      });
      await aTimeout();
    });

    function fire(element) {
      const e = new CustomEvent('list-item-details', {
        detail: {
          item: element.items[0]
        }
      });
      const node = element.shadowRoot.querySelector('cookies-list-items');
      node.dispatchEvent(e);
    }

    it('sets cookie on a detail panel', () => {
      fire(element);
      assert.deepEqual(element._details.cookie, element.items[0]);
    });

    it('opens cookie detail', () => {
      fire(element);
      assert.isTrue(element._detailsContainer.opened);
    });

    it('deletes a cookie from the detail panel', async () => {
      fire(element);
      await nextFrame();
      const spy = sinon.spy(element, '_delete');
      element._details.dispatchEvent(new CustomEvent('delete'));
      assert.isTrue(spy.called);
      assert.deepEqual(spy.args[0][0], [element.items[0]]);
    });

    it('sets up the editor when requested', async () => {
      fire(element);
      await nextFrame();
      element._details.dispatchEvent(new CustomEvent('edit'));
      assert.deepEqual(element._editor.cookie, element.items[0], 'editor cookie is set');
      assert.isUndefined(element._details.cookie, 'details cookie is cleared');
      assert.isFalse(element._detailsContainer.opened, 'detail is closed');
      assert.isTrue(element._editorContainer.opened, 'editor is open');
    });
  });

  describe('Export encryption', () => {
    it('Enables encryption option', async () => {
      const element = await exportEncryptFixture();
      const node = element.shadowRoot.querySelector('export-options');
      assert.isTrue(node.withEncrypt);
    });
  });
});
