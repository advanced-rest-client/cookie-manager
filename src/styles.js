import { css } from 'lit-element';
export default css`
:host {
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
  font-size: var(--arc-font-headline-font-size);
  font-weight: var(--arc-font-headline-font-weight);
  letter-spacing: var(--arc-font-headline-letter-spacing);
  line-height: var(--arc-font-headline-line-height);
  flex: 1;
}

anypoint-listbox anypoint-icon-item {
  cursor: pointer;
}

[hidden] {
  display: none !important;
}

paper-progress {
  width: 100%;
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

.icon {
  display: block;
  width: 24px;
  height: 24px;
  fill: currentColor;
}
`;
