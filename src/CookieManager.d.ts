/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   src/CookieManager.js
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

import {LitElement, html} from 'lit-element';

export {CookieManager};

declare namespace UiElements {

  /**
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
   */
  class CookieManager extends LitElement {
    readonly hasItems: Boolean|null;
    readonly listHidden: Boolean|null;

    /**
     * A computed flag that determines that the query to the databastore
     * has been performed and empty result was returned.
     * This can be true only if not in search.
     */
    readonly dataUnavailable: Boolean|null;
    readonly _details: any;
    readonly _detailsContainer: any;
    readonly _editor: any;
    readonly _editorContainer: any;
    readonly _exportOptionsContainer: any;

    /**
     * Changes information density of list items.
     * By default it uses material's peper item with two lines (72px heigth)
     * Possible values are:
     *
     * - `default` or empty - regular list view
     * - `comfortable` - enables MD single line list item vie (52px heigth)
     * - `compact` - enables list that has 40px heigth (touch recommended)
     */
    listType: string|null|undefined;

    /**
     * Enables outlined theme.
     */
    outlined: boolean|null|undefined;

    /**
     * Enables compatibility with Anypoint components.
     */
    compatibility: boolean|null|undefined;

    /**
     * List of cookies to display
     */
    items: any[]|null|undefined;

    /**
     * True when loading data from the datastore.
     */
    loading: boolean|null|undefined;

    /**
     * Current search query.
     */
    isSearch: boolean|null|undefined;

    /**
     * Indicates that the export options panel is currently rendered.
     */
    _exportOptionsOpened: boolean|null|undefined;
    _exportOptions: object|null|undefined;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    render(): any;
    reset(): void;

    /**
     * Handles an exception by sending exception details to GA.
     *
     * @param message A message to send.
     */
    _handleException(message: String|null): void;

    /**
     * Queries application for list of cookies.
     * It dispatches `session-cookie-list-all` cuystom event.
     *
     * @returns Resolved when cookies are available.
     */
    queryCookies(): Promise<any>|null;

    /**
     * Resets the state after finishing search. It restors previous items
     * without changing query options.
     */
    _resetSearch(): void;

    /**
     * Handles items delete event.
     */
    _onDelete(e: any): any;

    /**
     * Performs a delete action of cookie items.
     *
     * @param cookies List of deleted items.
     */
    _delete(cookies: Array<object|null>|null): Promise<any>|null;

    /**
     * Handler for `accept` event dispatched by export options element.
     *
     * @returns Result of calling `_doExportItems()`
     */
    _acceptExportOptions(e: CustomEvent|null): Promise<any>|null;
    _cancelExportOptions(): void;

    /**
     * Calls `_dispatchExportData()` from requests lists mixin with
     * prepared arguments
     *
     * @param cookies List of cookies to export.
     * @param detail Export configuration
     */
    _doExportItems(cookies: Array<object|null>|null, detail: String|null): Promise<any>|null;

    /**
     * Dispatches `arc-data-export` event and returns it.
     *
     * @param cookies List of cookies to export.
     */
    _dispatchExportData(cookies: Array<object|null>|null, opts: object|null): CustomEvent|null;

    /**
     * Handles export event from the list.
     */
    _onExport(e: CustomEvent|null): void;

    /**
     * Menu item handler to export all data to file
     *
     * @returns Result of calling `_doExportItems()`
     */
    _exportAllFile(): Promise<any>|null;

    /**
     * Menu item handler to export all data to file
     */
    openExportAll(): void;

    /**
     * Handler for the `list-items-search` event fired by the list view
     * Sets `isSearch` property and calls `query()` function to perform the
     * query.
     */
    _onSearch(e: CustomEvent|null): void;
    _filterItems(items: any, query: any): any;

    /**
     * Performs a query on a list.
     *
     * @param query The query to performs. Pass empty string
     * (or nothing) to reset the query.
     */
    query(query: String|null): void;
    _deselectMainMenu(): void;

    /**
     * Handler for delete all menu option click
     */
    _deleteAllClick(): void;

    /**
     * Called when delete datastore dialog is closed.
     */
    _onClearDialogResult(e: any): void;

    /**
     * Compares two cookies.
     * Cookies are the same if `domain`, `path` and `name` matches.
     *
     * @param a A cookie to compare
     * @param b Other cookie to compare
     * @returns True if the two cookies are the same.
     */
    _compareCookies(a: object|null, b: any): Boolean|null;

    /**
     * Returns cookie index on the `items` list.
     *
     * @param cookie A cookie object as in Electron API.
     * @returns Cookie index on the list or `-1` if not found.
     */
    _getCookieIndex(cookie: object|null): Number|null;

    /**
     * Clears a cookie from the list if matching cookie is n the list.
     */
    _onCookieRemoved(e: any): void;
    clearSelection(): void;

    /**
     * Updates the cookie on the list or adds new one.
     */
    _onCookieChanged(e: any): void;

    /**
     * Opens details panel for the cookie
     */
    _onDetails(e: CustomEvent|null): void;

    /**
     * Deletes a request from the details panel.
     */
    _deleteDetails(): Promise<any>|null;

    /**
     * Opens request details editor in place of the request details applet.
     */
    _editDetails(): void;

    /**
     * Forces bottom sheet content to resize
     */
    _resizeSheetContent(): void;

    /**
     * Forces bottom sheet content to resize
     */
    _resizeEditorSheetContent(): void;
    _resizeExportContent(e: any): void;

    /**
     * Handles cookie edit cancel event
     */
    _cancelEdit(): void;

    /**
     * Opens an empty cookie editor.
     */
    addCookie(): void;

    /**
     * Saves cookie editts be sending `session-cookie-update` event
     */
    _saveEdit(e: CustomEvent|null): Promise<any>|null;

    /**
     * Generates file name for the export options panel.
     */
    _generateFileName(): String|null;
    _headerTemplate(): any;
    _busyTemplate(): any;
    _unavailableTemplate(): any;
    _listTemplate(): any;
    _cookieDetailsTemplate(): any;
    _cookieEditorTemplate(): any;
    _cookieExportTemplate(): any;
    _toastsTemplate(): any;
    _clearDialogTemplate(): any;
  }
}