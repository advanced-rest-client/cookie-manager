import { html } from 'lit-html';
import { ArcDemoPage } from '@advanced-rest-client/arc-demo-helper/ArcDemoPage.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-button.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-group.js';
import '@polymer/paper-toast/paper-toast.js';
import '@advanced-rest-client/arc-data-export/arc-data-export.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import '../cookie-manager.js';

class DemoPage extends ArcDemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'compatibility',
      'outlined',
      'listType',
      'exportSheetOpened',
      'exportFile',
      'exportData'
    ]);
    this._componentName = 'cookie-manager';
    this.demoStates = ['Filles', 'Outlined', 'Anypoint'];
    this.listType = 'default';

    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._listTypeHandler = this._listTypeHandler.bind(this);
    this._removeHandler = this._removeHandler.bind(this);
    this._exportOpenedChanged = this._exportOpenedChanged.bind(this);

    window.addEventListener('file-data-save', this._fileExportHandler.bind(this));
    window.addEventListener('google-drive-data-save', this._fileExportHandler.bind(this));
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.compatibility = state === 2;
  }

  _listTypeHandler(e) {
    const { name, checked } = e.target;
    if (!checked) {
      return;
    }
    this.listType = name;
  }

  _listHandler(e) {
    e.preventDefault();
    e.detail.result = Promise.resolve(DataGenerator.generateCookiesData({
      size: 20
    }));
  }

  _removeHandler(e) {
    e.preventDefault();
    const cookies = e.detail.cookies;
    e.detail.result = Promise.resolve()
    .then(() => {
      cookies.forEach((cookie) => this._scheduleCookieRemove(cookie));
    });
  }

  _scheduleCookieRemove(cookie) {
    setTimeout(() => {
      document.body.dispatchEvent(new CustomEvent('session-cookie-removed', {
        bubbles: true,
        detail: cookie
      }));
    });
  }

  _updateHandler(e) {
    e.preventDefault();
    const { cookie } = e.detail;
    e.detail.result = Promise.resolve();

    setTimeout(() => {
      document.body.dispatchEvent(new CustomEvent('session-cookie-changed', {
        bubbles: true,
        detail: cookie
      }));
    });
  }

  _fileExportHandler(e) {
    const { content, file } = e.detail;
    setTimeout(() => {
      this.exportData = JSON.stringify(JSON.parse(content), null, 2);
      this.exportFile = file;
      this.exportSheetOpened = true;
    });
    e.preventDefault();
  }

  _exportOpenedChanged(e) {
    this.exportSheetOpened = e.detail.value;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      outlined,
      listType,
      exportSheetOpened,
      exportData,
      exportFile
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the cookies manager element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-chanegd="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >

          <cookie-manager
            ?compatibility="${compatibility}"
            ?outlined="${outlined}"
            .listType="${listType}"
            @session-cookie-list-all="${this._listHandler}"
            @session-cookie-remove="${this._removeHandler}"
            @session-cookie-update="${this._updateHandler}"
            slot="content"></cookie-manager>

          <label slot="options" id="listTypeLabel">List type</label>
          <anypoint-radio-group
            slot="options"
            selectable="anypoint-radio-button"
            aria-labelledby="listTypeLabel"
          >
            <anypoint-radio-button
              @change="${this._listTypeHandler}"
              checked
              name="default"
              >Default</anypoint-radio-button
            >
            <anypoint-radio-button
              @change="${this._listTypeHandler}"
              name="comfortable"
              >Comfortable</anypoint-radio-button
            >
            <anypoint-radio-button
              @change="${this._listTypeHandler}"
              name="compact"
              >Compact</anypoint-radio-button
            >
          </anypoint-radio-group>
        </arc-interactive-demo>

        <bottom-sheet
          .opened="${exportSheetOpened}"
          @opened-changed="${this._exportOpenedChanged}">
          <h3>Export demo</h3>
          <p>This is a preview of the file. Normally export module would save this data to file / Drive.</p>
          <p>File: ${exportFile}</p>
          <pre>${exportData}</pre>
        </bottom-sheet>

        <arc-data-export appversion="demo-page"></arc-data-export>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>ARC cookies manager screen</h2>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new DemoPage();
instance.render();
window._demo = instance;
