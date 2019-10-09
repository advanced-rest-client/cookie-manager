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
import { LitElement, html } from 'lit-element';
import { moreVert, exportVariant, deleteIcon } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-menu-button/anypoint-menu-button.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-icon-item.js';
import '@polymer/paper-progress/paper-progress.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-fab/paper-fab.js';
import '@anypoint-web-components/anypoint-dialog/anypoint-dialog.js';
import '@advanced-rest-client/bottom-sheet/bottom-sheet.js';
import '@advanced-rest-client/cookies-list-items/cookies-list-items.js';
import '@advanced-rest-client/cookie-editor/cookie-editor.js';
import '@advanced-rest-client/cookie-details/cookie-details.js';
import '@advanced-rest-client/export-options/export-options.js';
import styles from './styles.js';
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
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 */
export class CookieManager extends LitElement {
  static get styles() {
    return styles;
  }

  static get properties() {
    return {
      /**
       * Changes information density of list items.
       * By default it uses material's peper item with two lines (72px heigth)
       * Possible values are:
       *
       * - `default` or empty - regular list view
       * - `comfortable` - enables MD single line list item vie (52px heigth)
       * - `compact` - enables list that has 40px heigth (touch recommended)
       */
      listType: { type: String },
      /**
       * Enables outlined theme.
       */
      outlined: { type: Boolean },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean },
      // List of cookies to display
      items: { type: Array },
      // True when loading data from the datastore.
      loading: { type: Boolean },
      // Current search query.
      isSearch: { type: Boolean },
      /**
       * When set is enables encryption options.
       * Currently only in the export panel.
       */
      withEncrypt: { type: Boolean },
      /**
       * Indicates that the export options panel is currently rendered.
       */
      _exportOptionsOpened: { type: Boolean },
      _exportOptions: { type: Object }
    };
  }
  /**
   * @return {Boolean} `true` if `items` is set and has cookies
   */
  get hasItems() {
    const { items } = this;
    return !!(items && items.length);
  }
  /**
   * @return {Boolean} `true` when the lists is hidden.
   */
  get listHidden() {
    const { hasItems, isSearch } = this;
    if (isSearch) {
      return false;
    }
    return !hasItems;
  }
  /**
   * A computed flag that determines that the query to the databastore
   * has been performed and empty result was returned.
   * This can be true only if not in search.
   * @return {Boolean}
   */
  get dataUnavailable() {
    const { hasItems, loading, isSearch } = this;
    return !isSearch && !loading && !hasItems;
  }

  get _details() {
    return this.shadowRoot.querySelector('#details');
  }

  get _detailsContainer() {
    return this.shadowRoot.querySelector('#detailsContainer');
  }

  get _editor() {
    return this.shadowRoot.querySelector('#editor');
  }

  get _editorContainer() {
    return this.shadowRoot.querySelector('#editorContainer');
  }

  get _exportOptionsContainer() {
    return this.shadowRoot.querySelector('#exportOptionsContainer');
  }

  constructor() {
    super();
    this._onCookieRemoved = this._onCookieRemoved.bind(this);
    this._onCookieChanged = this._onCookieChanged.bind(this);

    this._exportOptions = {
      file: this._generateFileName(),
      provider: 'file',
      providerOptions: {
        parents: ['My Drive']
      }
    }
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    window.addEventListener('session-cookie-removed', this._onCookieRemoved);
    window.addEventListener('session-cookie-changed', this._onCookieChanged);
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    window.removeEventListener('session-cookie-removed', this._onCookieRemoved);
    window.removeEventListener('session-cookie-changed', this._onCookieChanged);
  }

  firstUpdated() {
    if (!this.items) {
      this.reset();
    }
  }

  reset() {
    this.loading = false;
    this.items = undefined;
    this.queryCookies();
  }
  /**
   * Handles an exception by sending exception details to GA.
   * @param {String} message A message to send.
   */
  _handleException(message) {
    const e = new CustomEvent('send-analytics', {
     bubbles: true,
     composed: true,
     detail: {
       type: 'exception',
       description: message
     }
    });
    this.dispatchEvent(e);
    const toast = this.shadowRoot.querySelector('#errorToast');
    toast.text = message;
    toast.opened = true;
  }

  /**
   * Queries application for list of cookies.
   * It dispatches `session-cookie-list-all` cuystom event.
   * @return {Promise} Resolved when cookies are available.
   */
  async queryCookies() {
    this.loading = true;
    const e = new CustomEvent('session-cookie-list-all', {
      detail: {},
      cancelable: true,
      composed: true,
      bubbles: true
    });
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      this.loading = false;
      this._handleException('Cookie bridge not found in the DOM');
      return;
    }
    try {
      this.items = await e.detail.result;
    } catch (e) {
      this.items = undefined;
      this._handleException(e.message);
    }
    this.loading = false;
  }
  /**
   * Resets the state after finishing search. It restors previous items
   * without changing query options.
   */
  _resetSearch() {
    this.items = this._beforeQueryItems;
    this.isSearch = false;
    this._beforeQueryItems = undefined;
    if (!this.items || !this.items.length) {
      this.queryCookies();
    }
  }

  // Handles items delete event.
  _onDelete(e) {
    const { items } = e.detail;
    return this._delete(items);
  }
  /**
   * Performs a delete action of cookie items.
   *
   * @param {Array<Object>} cookies List of deleted items.
   * @return {Promise}
   */
  async _delete(cookies) {
    const e = new CustomEvent('session-cookie-remove', {
      detail: {
        cookies
      },
      cancelable: true,
      composed: true,
      bubbles: true
    });
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      this._handleException('Cookies model not in the DOM');
      return;
    }
    try {
      return await e.detail.result;
    } catch (e) {
      this._handleException(e.message);
    }
  }

  /**
   * Handler for `accept` event dispatched by export options element.
   * @param {CustomEvent} e
   * @return {Promise} Result of calling `_doExportItems()`
   */
  async _acceptExportOptions(e) {
    this._exportOptionsOpened = false;
    const { detail } = e;
    return await this._doExportItems(this._exportItems, detail);
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
  async _doExportItems(cookies, detail) {
    detail.options.kind = 'ARC#SessionCookies';
    const request = this._dispatchExportData(cookies, detail);
    if (!request.detail.result) {
      this._handleException('Cookie Manager: Export module not found');
      return;
    }
    try {
      await request.detail.result;
      if (detail.options.provider === 'drive') {
        // TODO: Render link to the folder
        this.shadowRoot.querySelector('#driveSaved').opened = true;
      }
    } catch (e) {
      this._handleException(e.message);
    }
    this._exportItems = undefined;
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
    return this._doExportItems(this.items, detail);
  }

  /**
   * Menu item handler to export all data to file
   */
  openExportAll() {
    this._deselectMainMenu();
    this._exportOptionsOpened = true;
    this._exportItems = this.items;
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

  _filterItems(items, query) {
    return items.filter((item) => {
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
    query = query.toLowerCase();
    const list = this._filterItems(items, query);
    this.items = list;
  }

  _deselectMainMenu() {
    setTimeout(() => {
      const menuOptions = this.shadowRoot.querySelector('#mainMenuOptions');
      menuOptions.selected = null;
    });
  }

  // Handler for delete all menu option click
  _deleteAllClick() {
    this._deselectMainMenu();
    const dialog = this.shadowRoot.querySelector('#dataClearDialog');
    dialog.opened = true;
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
    const items = this.items;
    items.splice(index, 1);
    this.items = [...items];
    this.clearSelection();
  }

  clearSelection() {
    const node = this.shadowRoot.querySelector('cookies-list-items');
    if (node) {
      node.clearSelection();
    }
  }

  // Updates the cookie on the list or adds new one.
  _onCookieChanged(e) {
    const cookie = e.detail;
    const index = this._getCookieIndex(cookie);
    const items = this.items || [];
    if (index === -1) {
      if (!this.items) {
        items.push(cookie);
      } else {
        if (this._nextInsertPosition !== undefined) {
          items.splice(this._nextInsertPosition, 0, cookie);
          this._nextInsertPosition = undefined;
        } else {
          items.push(cookie);
        }
      }
    } else {
      items[index] = cookie;
    }
    this.items = [...items];
  }

  /**
   * Opens details panel for the cookie
   * @param {CustomEvent} e
   */
  _onDetails(e) {
    const { item } = e.detail;
    this._details.cookie = item;
    this._detailsContainer.opened = true;
  }
  /**
   * Deletes a request from the details panel.
   * @return {Promise}
   */
  _deleteDetails() {
    const data = [this._details.cookie];
    this._detailsContainer.opened = false;
    return this._delete(data);
  }
  /**
   * Opens request details editor in place of the request details applet.
   */
  _editDetails() {
    const details = this._details;
    this._editor.cookie = details.cookie;
    details.cookie = undefined;
    this._detailsContainer.opened = false;
    this._editorContainer.opened = true;
  }
  // Forces bottom sheet content to resize
  _resizeSheetContent() {
    this._details.notifyResize();
  }
  // Forces bottom sheet content to resize
  _resizeEditorSheetContent() {
    this._editor.notifyResize();
  }
  _resizeExportContent(e) {
    this._exportOptionsContainer.notifyResize();
    this._exportOptionsOpened = e.target.opened;
  }
  // Handles cookie edit cancel event
  _cancelEdit() {
    this._editorContainer.opened = false;
    this._editor.cookie = undefined;
  }
  /**
   * Opens an empty cookie editor.
   */
  addCookie() {
    this._deselectMainMenu();
    this._editor.cookie = undefined;
    this._editorContainer.opened = true;
  }
  /**
   * Saves cookie editts be sending `session-cookie-update` event
   * @param {CustomEvent} e
   * @return {Promise}
   */
  async _saveEdit(e) {
    const cookie = e.detail;
    const oldCookie = this._editor.cookie;
    if (oldCookie && !this._compareCookies(oldCookie, cookie)) {
      this._nextInsertAtPosition = true;
      await this._delete([oldCookie]);
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
      this._handleException('Cookies model not in the DOM');
      return;
    }
    try {
      return await ec.detail.result;
    } catch (e) {
      this._handleException('Cookie save error ' + e.message);
    }
  }
  /**
   * Generates file name for the export options panel.
   * @return {String}
   */
  _generateFileName() {
    return 'arc-session-cookies.json';
  }

  _headerTemplate() {
    const { compatibility } = this;
    return html`<div class="header">
      <h2>Session cookies</h2>
      <div class="header-actions">
        <anypoint-menu-button
          dynamicalign
          closeOnActivate
          id="mainMenu"
          ?compatibility="${compatibility}">
          <anypoint-icon-button
            aria-label="Activate to open context menu"
            slot="dropdown-trigger"
            ?compatibility="${compatibility}">
            <span class="icon">${moreVert}</span>
          </anypoint-icon-button>
          <anypoint-listbox
            slot="dropdown-content"
            id="mainMenuOptions"
            ?compatibility="${compatibility}">
            <anypoint-icon-item
              class="menu-item"
              data-action="export-all"
              @click="${this.openExportAll}">
              <span class="icon" slot="item-icon">${exportVariant}</span>Export all
            </anypoint-icon-item>
            <anypoint-icon-item
              class="menu-item"
              data-action="delete-all"
              @click="${this._deleteAllClick}">
              <span class="icon" slot="item-icon">${deleteIcon}</span>Delete all
            </anypoint-icon-item>
          </anypoint-listbox>
        </anypoint-menu-button>
      </div>
    </div>`;
  }

  _busyTemplate() {
    if (!this.loading) {
      return '';
    }
    return html`<paper-progress indeterminate></paper-progress>`;
  }

  _unavailableTemplate() {
    const { dataUnavailable } = this;
    if (!dataUnavailable) {
      return '';
    }
    return html`
    <p class="empty-info">
      Cookie list is empty.
    </p>
    <anypoint-button
      emphasis="high"
      data-action="empty-add-cookie"
      @click="${this.addCookie}"
    >Create a cookie</anypoint-button>`;
  }

  _listTemplate() {
    const { listHidden } = this;
    if (listHidden) {
      return '';
    }
    const items = this.items || [];
    const { compatibility, outlined, listType } = this;
    return html`
    <cookies-list-items
      .items="${items}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      listtype="${listType}"
      @list-items-delete="${this._onDelete}"
      @list-items-export="${this._onExport}"
      @list-items-search="${this._onSearch}"
      @list-item-details="${this._onDetails}"
    ></cookies-list-items>`;
  }

  _cookieDetailsTemplate() {
    const { compatibility } = this;
    return html`
    <bottom-sheet
      id="detailsContainer"
      @overlay-opened="${this._resizeSheetContent}"
    >
      <cookie-details
        id="details"
        ?compatibility="${compatibility}"
        @delete="${this._deleteDetails}"
        @edit="${this._editDetails}"
      ></cookie-details>
    </bottom-sheet>`;
  }

  _cookieEditorTemplate() {
    const { compatibility, outlined } = this;
    return html`
    <bottom-sheet
      id="editorContainer"
      @overlay-opened="${this._resizeEditorSheetContent}"
    >
      <cookie-editor
        id="editor"
        ?compatibility="${compatibility}"
        ?outlined="${outlined}"
        @cancel="${this._cancelEdit}"
        @save="${this._saveEdit}"
      ></cookie-editor>
    </bottom-sheet>`;
  }

  _cookieExportTemplate() {
    const { compatibility, outlined, _exportOptions, _exportOptionsOpened, withEncrypt } = this;
    return html`
    <bottom-sheet
      id="exportOptionsContainer"
      .opened="${_exportOptionsOpened}"
      @overlay-opened="${this._resizeExportContent}"
    >
      <export-options
        id="exportOptions"
        ?compatibility="${compatibility}"
        ?outlined="${outlined}"
        ?withEncrypt="${withEncrypt}"
        .file="${_exportOptions.file}"
        .provider="${_exportOptions.provider}"
        .providerOptions="${_exportOptions.providerOptions}"
        @accept="${this._acceptExportOptions}"
        @cancel="${this._cancelExportOptions}"></export-options>
    </bottom-sheet>`;
  }

  _toastsTemplate() {
    return html`
    <paper-toast id="errorToast" class="error-toast" duration="5000"></paper-toast>
    <paper-toast id="driveSaved" text="Cookies saved on Google Drive."></paper-toast>`;
  }

  _clearDialogTemplate() {
    const {
      compatibility
    } = this;
    return html`<anypoint-dialog
      id="dataClearDialog"
      ?compatibility="${compatibility}"
      @overlay-closed="${this._onClearDialogResult}">
      <div class="title">Remove all session cookies?</div>
      <p>Maybe you should create a backup first?</p>
      <div class="buttons">
        <anypoint-button
          ?compatibility="${compatibility}"
          data-action="delete-export-all"
          @click="${this._exportAllFile}">Create backup file</anypoint-button>
        <anypoint-button
          ?compatibility="${compatibility}"
          dialog-dismiss>Cancel</anypoint-button>
        <anypoint-button
          ?compatibility="${compatibility}"
          dialog-confirm
          class="action-button" autofocus>Confirm</anypoint-button>
      </div>
    </anypoint-dialog>`;
  }

  render() {
    return html`
    ${this._headerTemplate()}
    ${this._busyTemplate()}
    ${this._unavailableTemplate()}
    ${this._listTemplate()}
    ${this._cookieDetailsTemplate()}
    ${this._cookieEditorTemplate()}
    ${this._cookieExportTemplate()}
    ${this._toastsTemplate()}
    ${this._clearDialogTemplate()}
    <paper-fab icon="arc:add" class="add-fab" @click="${this.addCookie}"></paper-fab>
    `;
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
