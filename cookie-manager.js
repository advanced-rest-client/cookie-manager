/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import {afterNextRender} from '../../@polymer/polymer/lib/utils/render-status.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
import '../../@polymer/paper-button/paper-button.js';
import '../../@polymer/iron-icon/iron-icon.js';
import '../../@advanced-rest-client/arc-icons/arc-icons.js';
import '../../@polymer/paper-menu-button/paper-menu-button.js';
import '../../@polymer/paper-icon-button/paper-icon-button.js';
import '../../@polymer/paper-listbox/paper-listbox.js';
import '../../@polymer/paper-item/paper-icon-item.js';
import '../../@polymer/paper-progress/paper-progress.js';
import '../../@polymer/paper-toast/paper-toast.js';
import '../../@polymer/paper-dialog/paper-dialog.js';
import '../../@advanced-rest-client/tutorial-toast/tutorial-toast.js';
import '../../@advanced-rest-client/bottom-sheet/bottom-sheet.js';
import '../../@advanced-rest-client/cookies-list-items/cookies-list-items.js';
import '../../@advanced-rest-client/cookie-editor/cookie-editor.js';
import '../../@advanced-rest-client/cookie-details/cookie-details.js';
import '../../@advanced-rest-client/export-options/export-options.js';
import '../../@polymer/paper-fab/paper-fab.js';
/**
 *
 * A manager for session cookies.
 * Renders list of cookies that can be edited.
 *
 * The element queries the application for cookies to display by sending
 * `session-cookie-list-all` custom event. The handler should set a `result` property
 * on the details object and cancel the event.
 * Result is a promise that resolves to cookies array.
 *
 * ### Example
 *
 * ```html
 * <cookie-manager on-session-cookie-list-all></cookie-manager>
 * ```
 *
 * ```javascript
 * window.addEventListener('session-cookie-list-all', (e) => {
 *  e.preventDefault();
 *  e.detail.result = Promise.resolve(cookies);
 * });
 * ```
 *
 * The element listens to `session-cookie-removed` and `session-cookie-changed`
 * events to update, add or delete a cookie from the list.
 * The `detail` object of this events is a cookie.
 *
 * ### Styling
 *
 * `<cookie-manager>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--cookie-manager` | Mixin applied to the element | `{}`
 * `--cookie-manager-loader` | Mixin applied to the `paper-progress` element | `{}`
 * `--warning-primary-color` | Main color of the warning messages | `#FF7043`
 * `--warning-contrast-color` | Contrast color for the warning color | `#fff`
 * `--error-toast` | Mixin applied to the error toast | `{}`
 * `--empty-info` | Mixin applied to the label rendered when no data is available. | `{}`
 * `--cookie-manager-bottom-sheet` | Mixin applied to the bottom sheet tutorial element | `{}`
 * `--context-menu-item-color` | Color of the dropdown menu items | ``
 * `--context-menu-item-background-color` | Background olor of the dropdown menu items | ``
 * `--context-menu-item-color-hover` | Color of the dropdown menu items when hovering | ``
 * `--context-menu-item-background-color-hover` | Background olor of the dropdown menu items when hovering | ``
 * `--bottom-sheet-width` | Width of the `<bottom-sheet>` element | `100%`
 * `--bottom-sheet-max-width` | Max width of the `<bottom-sheet>` element | `700px`
 * `--cookie-manager-bottom-sheet-right` | Right position of the `<bottom-sheet>` element | `40px`
 * `--cookie-manager-bottom-sheet-left` | Left position of the `<bottom-sheet>` element | `auto`
 *
 * @polymer
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 */
class CookieManager extends PolymerElement {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
      position: relative;
      font-size: var(--arc-font-body1-font-size);
      font-weight: var(--arc-font-body1-font-weight);
      line-height: var(--arc-font-body1-line-height);
      display: flex;
      flex-direction: column;
    }

    .header {
      flex-direction: row;
      display: flex;
      align-items: center;
    }

    h2 {
      margin-left: 16px;
      font-size: var(--arc-font-headline-font-size);
      font-weight: var(--arc-font-headline-font-weight);
      letter-spacing: var(--arc-font-headline-letter-spacing);
      line-height: var(--arc-font-headline-line-height);
      flex: 1;
      flex-basis: 0.000000001px;
    }

    h3 {
      margin-left: 16px;
      font-size: var(--arc-font-subhead-font-size);
      font-weight: var(--arc-font-subhead-font-weight);
      line-height: var(--arc-font-subhead-line-height);
    }

    paper-listbox iron-icon {
      color: var(--context-menu-item-color);
    }

    paper-listbox paper-icon-item {
      color: var(--context-menu-item-color);
      background-color: var(--context-menu-item-background-color);
      cursor: pointer;
    }

    paper-listbox paper-icon-item:hover {
      color: var(--context-menu-item-color-hover);
      background-color: var(--context-menu-item-background-color-hover);
    }

    paper-listbox paper-icon-item:hover iron-icon {
      color: var(--context-menu-item-color-hover);
    }

    [hidden] {
      display: none !important;
    }

    paper-progress {
      width: 100%;
    }

    #dataClearDialog {
      background-color: var(--warning-primary-color, #FF7043);
      color: var(--warning-contrast-color, #fff);
    }

    #dataClearDialog paper-button {
      color: var(--warning-dialog-button-color, #fff);
      background-color: var(--warning-dialog-button-background-color, transparent);
    }

    .error-toast {
      background-color: var(--warning-primary-color, #FF7043);
      color: var(--warning-contrast-color, #fff);
    }

    .empty-info {
      margin-left: 16px;
      color: var(--empty-info-color, rgba(0, 0, 0, 0.74));
      font-size: var(--empty-info-font-size, 16px);
    }

    tutorial-toast {
      position: absolute;
    }

    #detailsContainer,
    #editorContainer,
    #exportOptionsContainer {
      width: var(--bottom-sheet-width, 100%);
      max-width: var(--bottom-sheet-max-width, 700px);
      right: var(--cookie-manager-bottom-sheet-right, 40px);
      left: var(--cookie-manager-bottom-sheet-left, auto);
    }

    cookies-list-items {
      flex: 1;
    }

    .add-fab {
      position: fixed;
      bottom: 20px;
      right: 20px;
    }
    </style>
    <div class="header">
      <h2>Session cookies</h2>
      <div class="header-actions">
        <paper-menu-button dynamic-align="" id="mainMenu">
          <paper-icon-button icon="arc:more-vert" slot="dropdown-trigger"></paper-icon-button>
          <paper-listbox slot="dropdown-content" id="mainMenuOptions">
            <paper-icon-item on-click="reset" class="menu-item" data-action="refresh-menu">
              <iron-icon icon="arc:cached" slot="item-icon"></iron-icon>
              Refresh list
            </paper-icon-item>
            <paper-icon-item on-click="addCookie" class="menu-item" data-action="add-item-menu">
              <iron-icon icon="arc:add" slot="item-icon"></iron-icon>
              Add cookie
            </paper-icon-item>
            <paper-icon-item class="menu-item" on-click="openExportAll" data-action="export-all">
              <iron-icon icon="arc:export-variant" slot="item-icon"></iron-icon>
              Export all
            </paper-icon-item>
            <paper-icon-item on-click="_deleteAllClick" class="menu-item" data-action="delete-all">
              <iron-icon icon="arc:delete" slot="item-icon"></iron-icon>
              Delete all
            </paper-icon-item>
          </paper-listbox>
        </paper-menu-button>
      </div>
    </div>

    <template is="dom-if" if="[[loading]]">
      <paper-progress indeterminate=""></paper-progress>
    </template>

    <template is="dom-if" if="[[dataUnavailable]]">
      <p class="empty-info">Cookie list is empty.</p>
      <paper-button
        class="action-button"
        data-action="empty-add-cookie"
        on-click="addCookie">Create a cookie</paper-button>
    </template>

    <template is="dom-if" if="[[!listHidden]]">
      <h3>Cookies ([[items.length]])</h3>
      <cookies-list-items
        items="[[items]]"
        on-list-items-delete="_onDelete"
        on-list-items-export="_onExport"
        on-list-items-search="_onSearch"
        on-list-item-details="_onDetails"></cookies-list-items>
    </template>

    <template is="dom-if" if="[[_tutorialAllowed]]">
      <tutorial-toast opened="[[dataUnavailable]]">
        Use "Web session" menu to login to a web service.
      </tutorial-toast>
    </template>

    <bottom-sheet id="detailsContainer" on-iron-overlay-opened="_resizeSheetContent">
      <cookie-details id="details" on-delete-cookie="_deleteDetails" on-edit-cookie="_editDetails"></cookie-details>
    </bottom-sheet>
    <bottom-sheet id="editorContainer" on-iron-overlay-opened="_resizeEditorSheetContent">
      <cookie-editor id="editor" on-cancel-cookie-edit="_cancelEdit" on-save-cookie="_saveEdit"></cookie-editor>
    </bottom-sheet>
    <bottom-sheet id="exportOptionsContainer"
      opened="{{_exportOptionsOpened}}"
      on-iron-overlay-opened="_resizeExportContent">
      <export-options
        id="exportOptions"
        file="{{_exportOptions.file}}"
        provider="{{_exportOptions.provider}}"
        provider-options="{{_exportOptions.providerOptions}}"
        on-accept="_acceptExportOptions"
        on-cancel="_cancelExportOptions"></export-options>
    </bottom-sheet>

    <paper-toast id="noModel" class="error-toast" text="Model not found. Please, report an issue."></paper-toast>
    <paper-toast id="errorToast" class="error-toast" duration="5000"></paper-toast>
    <paper-toast id="noExport" class="error-toast"
      text="Export module not found. Please, report an issue."></paper-toast>
    <paper-toast id="driveSaved" text="Requests saved on Google Drive."></paper-toast>

    <paper-dialog id="dataClearDialog" on-iron-overlay-closed="_onClearDialogResult">
      <h2>Danger zone</h2>
      <p>This will remove all session cookies. Without option to restore it.</p>
      <p>Maybe you should create a backup first?</p>
      <div class="buttons">
        <paper-button on-click="_exportAllFile">Create file backup</paper-button>
        <paper-button dialog-dismiss="" autofocus="">Cancel</paper-button>
        <paper-button dialog-confirm="" class="action-button">Destroy</paper-button>
      </div>
    </paper-dialog>

    <paper-fab icon="arc:add" class="add-fab" on-click="addCookie"></paper-fab>
`;
  }

  static get is() {
    return 'cookie-manager';
  }
  static get properties() {
    return {
      // List of cookies to display
      items: {type: Array},
      // Computed value, true if `items` is set.
      hasItems: {
        type: Boolean,
        value: false,
        computed: '_computeHasItems(items.length)',
        notify: true
      },
      // True when loading data from the datastore.
      loading: {
        type: Boolean,
        readOnly: true,
        notify: true
      },
      // Current search query.
      isSearch: {
        type: Boolean,
        value: false
      },
      /**
       * Computed value, `true` when the lists is hidden.
       */
      listHidden: {
        type: Boolean,
        value: true,
        computed: '_computeListHidden(hasItems, isSearch)'
      },
      /**
       * Computed value. True when the query has been performed and no items
       * has been returned. It is different from `listHidden` where less
       * conditions has to be checked. It is set to true when it doesn't
       * have items, is not loading and is search.
       */
      searchListEmpty: {
        type: Boolean,
        computed: '_computeSearchListEmpty(hasItems, loading, isSearch)'
      },
      /**
       * A computed flag that determines that the query to the databastore
       * has been performed and empty result was returned.
       * This can be true only if not in search.
       */
      dataUnavailable: {
        type: Boolean,
        computed: '_computeDataUnavailable(hasItems, loading, isSearch)'
      },
      _tutorialAllowed: Boolean,
      /**
       * Indicates that the export options panel is currently rendered.
       */
      _exportOptionsOpened: Boolean,
      _exportOptions: {
        type: Object,
        value: function() {
          return {
            file: this._generateFileName(),
            provider: 'file',
            providerOptions: {
              parents: ['My Drive']
            }
          };
        }
      }
    };
  }

  constructor() {
    super();
    this._onCookieRemoved = this._onCookieRemoved.bind(this);
    this._onCookieChanged = this._onCookieChanged.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('session-cookie-removed', this._onCookieRemoved);
    window.addEventListener('session-cookie-changed', this._onCookieChanged);
    afterNextRender(this, () => {
      if (!this.items) {
        this.reset();
      }
      this._tutorialAllowed = true;
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('session-cookie-removed', this._onCookieRemoved);
    window.removeEventListener('session-cookie-changed', this._onCookieChanged);
  }

  reset() {
    this._clearMenuOptions();
    this._setLoading(false);
    this.set('cookies', undefined);
    this.queryCookies();
  }
  /**
   * Queries application for list of cookies.
   * It dispatches `session-cookie-list-all` cuystom event.
   * @return {Promise} Resolved when cookies are available.
   */
  queryCookies() {
    this._setLoading(true);
    const e = new CustomEvent('session-cookie-list-all', {
      detail: {},
      cancelable: true,
      composed: true,
      bubbles: true
    });
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      this._setLoading(false);
      return Promise.reject(new Error('Cookie bridge not found in the DOM'));
    }
    return e.detail.result
    .then((cookies) => this._processCookies(cookies))
    .then(() => this._setLoading(false));
  }
  /**
   * Processes incomming and sets cookies.
   * @param {?Array<Object>} cookies
   */
  _processCookies(cookies) {
    if (!cookies) {
      cookies = [];
    }
    this.set('items', cookies);
  }
  /**
   * Computes value for `hasItems` property
   * @param {Number} size Size of the `items` array
   * @return {Boolean}
   */
  _computeHasItems(size) {
    return !!size;
  }
  /**
   * Resets the state after finishing search. It restors previous items
   * without changing query options.
   */
  _resetSearch() {
    this.set('items', this._beforeQueryItems);
    this.isSearch = false;
    this._beforeQueryItems = undefined;
    if (!this.items || !this.items.length) {
      this.queryCookies();
    }
  }

  /**
   * Computes value of the `listHidden` property.
   * List is hidden when no items are found and it is not searching.
   *
   * @param {Boolean} hasItems
   * @param {Boolean} isSearch
   * @return {Boolean}
   */
  _computeListHidden(hasItems, isSearch) {
    if (isSearch) {
      return false;
    }
    return !hasItems;
  }

  // Computes value for the `searchListEmpty` property
  _computeSearchListEmpty(hasItems, loading, isSearch) {
    return isSearch && !loading && !hasItems;
  }

  // Computes value for the `dataUnavailable` proeprty
  _computeDataUnavailable(hasItems, loading, isSearch) {
    return !isSearch && !loading && !hasItems;
  }

  // Handles items delete event.
  _onDelete(e) {
    const data = e.detail.items;
    return this._delete(data);
  }
  /**
   * Performs a delete action of cookie items.
   *
   * @param {Array<Object>} deleted List of deleted items.
   * @return {Promise}
   */
  _delete(deleted) {
    const e = new CustomEvent('session-cookie-remove', {
      detail: {
        cookies: deleted
      },
      cancelable: true,
      composed: true,
      bubbles: true
    });
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      this.$.noModel.opened = true;
      return;
    }
    return e.detail.result
    .catch((cause) => {
      const msg = 'Cookie save error ' + cause.message;
      this.$.errorToast.text = msg;
      this.$.errorToast.opened = true;
      throw cause;
    });
  }

  /**
   * Handler for `accept` event dispatched by export options element.
   * @param {CustomEvent} e
   * @return {Promise} Result of calling `_doExportItems()`
   */
  _acceptExportOptions(e) {
    this._exportOptionsOpened = false;
    const detail = e.detail;
    return this._doExportItems(this._exportItems, detail);
  }

  _cancelExportOptions() {
    this._exportOptionsOpened = false;
    this._exportItems = undefined;
  }
  /**
   * Calls `_dispatchExportData()` from requests lists mixin with
   * prepared arguments
   *
   * @param {Array<Object>} cookies List of cookies to export.
   * @param {String} detail Export configuration
   * @return {Promise}
   */
  _doExportItems(cookies, detail) {
    detail.options.kind = 'ARC#SessionCookies';
    const request = this._dispatchExportData(cookies, detail);
    if (!request.detail.result) {
      this.$.noExport.opened = true;
      return Promise.resolve();
    }
    return request.detail.result
    .then(() => {
      if (detail.options.provider === 'drive') {
        // TODO: Render link to the folder
        this.$.driveSaved.opened = true;
      }
      this._exportItems = undefined;
    })
    .catch((cause) => {
      this.$.errorToast.text = cause.message;
      this.$.errorToast.opened = true;
      console.warn(cause);
    });
  }
  /**
   * Dispatches `arc-data-export` event and returns it.
   * @param {Array<Object>} cookies List of cookies to export.
   * @param {Object} opts
   * @return {CustomEvent}
   */
  _dispatchExportData(cookies, opts) {
    const e = new CustomEvent('arc-data-export', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        options: opts.options,
        providerOptions: opts.providerOptions,
        data: {
          cookies
        }
      }
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * Handles export event from the list.
   * @param {CustomEvent} e
   */
  _onExport(e) {
    this._exportOptionsOpened = true;
    this._exportItems = e.detail.items || [];
  }

  /**
   * Menu item handler to export all data to file
   * @return {Promise} Result of calling `_doExportItems()`
   */
  _exportAllFile() {
    const detail = {
      options: {
        file: this._generateFileName(),
        provider: 'file'
      }
    };
    return this._doExportItems(true, detail);
  }

  /**
   * Menu item handler to export all data to file
   */
  openExportAll() {
    this._clearMenuOptions();
    this._exportOptionsOpened = true;
    this._exportItems = true;
  }
  /**
   * Handler for the `list-items-search` event fired by the list view
   * Sets `isSearch` property and calls `query()` function to perform the
   * query.
   *
   * @param {CustomEvent} e
   */
  _onSearch(e) {
    this.query(e.detail.q);
  }
  /**
   * Performs a query on a list.
   *
   * @param {String} query The query to performs. Pass empty string
   * (or nothing) to reset the query.
   */
  query(query) {
    if (!query) {
      this._resetSearch();
      return;
    }
    const items = this._beforeQueryItems || this.items;
    if (!items || !items.length) {
      return;
    }
    this.isSearch = true;
    if (!this._beforeQueryItems) {
      this._beforeQueryItems = this.items;
    }
    this.set('items', undefined);
    query = query.toLowerCase();
    const list = items.filter((item) => {
      if (item.name) {
        if (item.name.toLowerCase().indexOf(query) !== -1) {
          return true;
        }
      }
      if (item.domain) {
        if (item.domain.toLowerCase().indexOf(query) !== -1) {
          return true;
        }
      }
      if (item.value) {
        if (item.value.toLowerCase().indexOf(query) !== -1) {
          return true;
        }
      }
      if (item.path) {
        if (item.path.toLowerCase().indexOf(query) !== -1) {
          return true;
        }
      }
      return false;
    });
    this.set('items', list);
  }

  _clearMenuOptions() {
    this.$.mainMenu.opened = false;
    this.$.mainMenuOptions.selected = -1;
  }

  // Handler for delete all menu option click
  _deleteAllClick() {
    this._clearMenuOptions();
    this.$.dataClearDialog.opened = true;
  }
  // Called when delete datastore dialog is closed.
  _onClearDialogResult(e) {
    if (!e.detail.confirmed) {
      return;
    }
    const items = this.items;
    if (!items || !items.length) {
      return;
    }
    this._delete(items);
  }
  /**
   * Compares two cookies.
   * Cookies are the same if `domain`, `path` and `name` matches.
   *
   * @param {Object} a A cookie to compare
   * @param {[type]} b Other cookie to compare
   * @return {Boolean} True if the two cookies are the same.
   */
  _compareCookies(a, b) {
    if (a.domain !== b.domain) {
      return false;
    }
    if (a.path !== b.path) {
      return false;
    }
    if (a.name !== b.name) {
      return false;
    }
    return true;
  }
  /**
   * Returns cookie index on the `items` list.
   *
   * @param {Object} cookie A cookie object as in Electron API.
   * @return {Number} Cookie index on the list or `-1` if not found.
   */
  _getCookieIndex(cookie) {
    const items = this.items;
    if (!items || !items.length) {
      return -1;
    }
    return items.findIndex((item) => this._compareCookies(item, cookie));
  }
  // Clears a cookie from the list if matching cookie is n the list.
  _onCookieRemoved(e) {
    if (e.cancelable) {
      return;
    }
    const cookie = e.detail;
    const index = this._getCookieIndex(cookie);
    if (index === -1) {
      return;
    }
    if (this._nextInsertAtPosition) {
      this._nextInsertAtPosition = false;
      this._nextInsertPosition = index;
    }
    this.splice('items', index, 1);
  }
  // Updates the cookie on the list or adds new one.
  _onCookieChanged(e) {
    const cookie = e.detail;
    const index = this._getCookieIndex(cookie);
    if (index === -1) {
      if (!this.items) {
        this.set('items', [cookie]);
      } else {
        if (this._nextInsertPosition !== undefined) {
          const items = this.items;
          items.splice(this._nextInsertPosition, 0, cookie);
          this._nextInsertPosition = undefined;
        } else {
          this.push('items', cookie);
        }
      }
    } else {
      this.set(['items', index], cookie);
    }
  }
  /**
   * Opens details panel for the cookie
   * @param {CustomEvent} e
   */
  _onDetails(e) {
    const request = e.detail.item;
    this.$.details.cookie = request;
    this.$.detailsContainer.opened = true;
  }
  /**
   * Deletes a request from the details panel.
   * @return {Promise}
   */
  _deleteDetails() {
    const data = [this.$.details.cookie];
    this.$.detailsContainer.opened = false;
    return this._delete(data);
  }
  /**
   * Opens request details editor in place of the request details applet.
   */
  _editDetails() {
    this.$.editor.cookie = this.$.details.cookie;
    this.$.details.cookie = undefined;
    this.$.detailsContainer.opened = false;
    this.$.editorContainer.opened = true;
  }
  // Forces bottom sheet content to resize
  _resizeSheetContent() {
    this.$.details.notifyResize();
  }
  // Forces bottom sheet content to resize
  _resizeEditorSheetContent() {
    this.$.editor.notifyResize();
  }
  _resizeExportContent() {
    this.$.exportOptionsContainer.notifyResize();
  }
  // Handles cookie edit cancel event
  _cancelEdit() {
    this.$.editorContainer.opened = false;
    this.$.editor.cookie = undefined;
  }
  /**
   * Opens an empty cookie editor.
   */
  addCookie() {
    this._clearMenuOptions();
    this.$.editor.cookie = undefined;
    this.$.editorContainer.opened = true;
  }
  /**
   * Saves cookie editts be sending `session-cookie-update` event
   * @param {CustomEvent} e
   * @return {Promise}
   */
  _saveEdit(e) {
    const cookie = e.detail;
    const oldCookie = this.$.editor.cookie;
    if (oldCookie && !this._compareCookies(oldCookie, cookie)) {
      this._nextInsertAtPosition = true;
      this._delete([oldCookie]);
    }
    this._cancelEdit();
    const ec = new CustomEvent('session-cookie-update', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        cookie: cookie
      }
    });
    this.dispatchEvent(ec);
    if (!ec.defaultPrevented) {
      this.$.noModel.opened = true;
      return;
    }
    return ec.detail.result
    .catch((cause) => {
      const msg = 'Cookie save error ' + cause.message;
      this.$.errorToast.text = msg;
      this.$.errorToast.opened = true;
    });
  }
  /**
   * Generates file name for the export options panel.
   * @return {String}
   */
  _generateFileName() {
    return 'arc-session-cookies.json';
  }
  /**
   * Fired when queries the application for list of session cookies.
   * The element expects the `result` property to be set on the `detail`
   * object with a promise resolved to a list of cookies.
   *
   * This event is cancelable.
   *
   * @event session-cookie-list-all
   */

  /**
   * Fired when the cookie should be updated by the application.
   *
   * The event is cancelable.
   *
   * @event session-cookie-update
   * @param {Object} cookie A cookie object.
   */

  /**
   * Fired when cookies are to be deleted by the application.
   *
   * The event is cancelable.
   *
   * @event session-cookie-remove
   * @param {Array<Object>} cookies A list of cookie objects.
   */
}
window.customElements.define(CookieManager.is, CookieManager);
