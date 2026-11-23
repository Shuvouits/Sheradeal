export default function GlobalVariantsStyles() {
  return (
    <style>{`
      .gv-page {
        --gv-green: var(--brand-primary, #05714B);
        --gv-green-light: var(--brand-light, #EAF5EF);
        --gv-border: #E4E6E5;
        --gv-text: #171717;
        --gv-muted: #818181;

        width: 100%;
        min-width: 0;
        padding: 12px 0 45px;
        font-family: "Segoe UI", Arial, sans-serif;
        color: var(--gv-text);
      }

      .gv-page *,
      .gv-page *::before,
      .gv-page *::after {
        box-sizing: border-box;
      }

      .gv-page button,
      .gv-page input,
      .gv-page select {
        font-family: inherit;
      }

      .gv-page button {
        cursor: pointer;
      }

      .gv-page button:disabled {
        opacity: .55;
        cursor: not-allowed;
      }

      .gv-container {
        width: 100%;
        max-width: 750px;
        margin: 0 auto;
      }

      .gv-header-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        padding: 23px 24px;
        margin-bottom: 16px;
        border: 1px solid var(--gv-border);
        border-radius: 24px;
        background: #FFFFFF;
        box-shadow: 0 1px 2px rgba(0,0,0,.05);
      }

      .gv-header-card h1 {
        margin: 0 0 8px;
        font-size: 23px;
        line-height: 1.3;
        font-weight: 700;
        letter-spacing: -.6px;
      }

      .gv-header-card p {
        margin: 0;
        font-size: 13px;
        line-height: 1.6;
        color: var(--gv-muted);
      }

      .gv-create-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        min-height: 36px;
        padding: 0 13px;
        border: 0;
        border-radius: 10px;
        background: var(--gv-green);
        color: white;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
      }

      .gv-create-button:hover {
        filter: brightness(.93);
      }

      .gv-list {
        display: flex;
        flex-direction: column;
        gap: 11px;
      }

      .gv-card {
        width: 100%;
        min-width: 0;
        overflow: hidden;
        background: #FFFFFF;
        border: 1px solid var(--gv-border);
        border-radius: 23px;
        box-shadow: 0 1px 2px rgba(0,0,0,.025);
      }

      .gv-summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 67px;
        gap: 16px;
        padding: 14px 20px;
      }

      .gv-summary-content {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        min-width: 0;
        gap: 10px 15px;
      }

      .gv-variant-name {
        flex-shrink: 0;
        font-size: 14px;
        font-weight: 650;
        color: #141414;
      }

      .gv-chips {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 5px;
        min-width: 0;
      }

      .gv-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        max-width: 100%;
        padding: 5px 10px;
        background: #F5F5F5;
        border-radius: 30px;
        font-size: 11px;
        color: #777;
        white-space: normal;
        overflow-wrap: anywhere;
      }

      .gv-color-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .gv-edit-button {
        width: 34px;
        height: 34px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 50%;
        color: #777;
      }

      .gv-edit-button:hover {
        background: var(--gv-green-light);
        color: var(--gv-green);
      }

      .gv-new-card {
        margin-bottom: 14px;
      }

      .gv-new-heading {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 17px 23px 0;
        color: var(--gv-green);
        font-size: 14px;
      }

      .gv-editor {
        padding: 23px;
        border-top: 1px solid #F0F0F0;
      }

      .gv-card > .gv-editor {
        border-top: 1px solid #EEEEEE;
      }

      .gv-new-card > .gv-editor {
        border-top: 0;
      }

      .gv-form-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 20px;
        margin-bottom: 23px;
      }

      .gv-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
      }

      .gv-field > span {
        font-size: 12px;
        font-weight: 650;
        color: #151515;
      }

      .gv-field > input,
      .gv-select-wrap {
        width: 100%;
        height: 43px;
        border: 1px solid #CBD5DC;
        border-radius: 24px;
        background: white;
        outline: none;
      }

      .gv-field > input {
        padding: 0 13px;
        color: #191919;
        font-size: 13px;
      }

      .gv-field > input:focus,
      .gv-option-input:focus,
      .gv-add-option > input:focus,
      .gv-select-wrap:focus-within {
        border-color: var(--gv-green);
        box-shadow: 0 0 0 3px var(--gv-green-light);
      }

      .gv-field small {
        color: #8A8A8A;
        font-size: 11px;
        line-height: 1.5;
      }

      .gv-select-wrap {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 0 12px;
      }

      .gv-select-wrap > svg {
        flex-shrink: 0;
        color: #5D5D5D;
      }

      .gv-select-wrap > select {
        width: 100%;
        min-width: 0;
        flex: 1;
        height: 100%;
        appearance: none;
        border: none;
        outline: none;
        background: transparent;
        color: #191919;
        font-size: 13px;
        cursor: pointer;
      }

      .gv-options-heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 10px;
      }

      .gv-options-heading strong {
        font-size: 13px;
        font-weight: 650;
      }

      .gv-options-heading small {
        font-size: 11px;
        color: #999;
      }

      .gv-options-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .gv-option-row,
      .gv-add-option {
        display: flex;
        align-items: center;
        gap: 9px;
        width: 100%;
        min-width: 0;
      }

      .gv-drag-handle,
      .gv-drag-placeholder {
        width: 15px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #B5B5B5;
      }

      .gv-drag-handle {
        cursor: grab;
        user-select: none;
      }

      .gv-drag-handle:active {
        cursor: grabbing;
      }

      .gv-option-input,
      .gv-add-option > input {
        height: 43px;
        min-width: 0;
        flex: 1;
        padding: 0 13px;
        border: 1px solid #CBD5DC;
        border-radius: 24px;
        outline: none;
        font-size: 13px;
        background: white;
        color: #202124;
      }

      .gv-option-input::placeholder,
      .gv-add-option > input::placeholder {
        color: #999;
      }

      .gv-color-control {
        display: flex;
        width: 43px;
        height: 43px;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
      }

      .gv-color-control input[type="color"] {
        width: 43px;
        height: 43px;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: transparent;
        overflow: hidden;
        cursor: pointer;
      }

      .gv-color-control input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 0;
      }

      .gv-color-control input[type="color"]::-webkit-color-swatch {
        border: none;
        border-radius: 50%;
      }

      .gv-icon-action,
      .gv-add-option-button {
        width: 37px;
        height: 40px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 0;
        background: transparent;
        color: #909090;
      }

      .gv-remove-option:hover {
        color: #DC2626;
      }

      .gv-add-option {
        margin-top: 11px;
      }

      .gv-add-option-button {
        height: 42px;
        width: 42px;
        border: 1px solid #E5E5E5;
        border-radius: 50%;
      }

      .gv-add-option-button:hover:not(:disabled) {
        border-color: var(--gv-green);
        color: var(--gv-green);
        background: var(--gv-green-light);
      }

      .gv-mobile-reorder {
        display: none;
      }

      .gv-editor-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        margin-top: 25px;
      }

      .gv-editor-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .gv-delete-button,
      .gv-cancel-button {
        min-width: 84px;
        height: 36px;
        padding: 0 15px;
        border-radius: 22px;
        background: white;
        font-size: 12px;
        font-weight: 600;
      }

      .gv-delete-button {
        border: 1px solid #FFABAB;
        color: #E11D48;
      }

      .gv-delete-button:hover {
        background: #FFF1F2;
      }

      .gv-cancel-button {
        border: 1px solid #E0E0E0;
        color: #555;
      }

      .gv-cancel-button:hover {
        background: #F7F7F7;
      }

      .gv-save-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        width: 100px;
        height: 38px;
        border: 0;
        border-radius: 24px;
        background: var(--gv-green);
        color: white;
        font-weight: 650;
        font-size: 12px;
      }

      .gv-save-button:hover:not(:disabled) {
        filter: brightness(.92);
      }

      .gv-search {
        display: flex;
        align-items: center;
        gap: 10px;
        height: 42px;
        padding: 0 14px;
        margin-bottom: 13px;
        background: white;
        border: 1px solid var(--gv-border);
        border-radius: 22px;
        color: #888;
      }

      .gv-search input {
        width: 100%;
        min-width: 0;
        border: 0;
        outline: 0;
        background: transparent;
        font-size: 12px;
      }

      .gv-loading,
      .gv-empty {
        min-height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 10px;
        border: 1px dashed #D7D7D7;
        border-radius: 22px;
        color: #888;
        font-size: 13px;
        text-align: center;
      }

      .gv-empty strong {
        color: #333;
        font-size: 14px;
      }

      .gv-empty p {
        margin: 0;
        color: #999;
        font-size: 12px;
      }

      .gv-message {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 13px 15px;
        margin-bottom: 14px;
        border: 1px solid;
        border-radius: 12px;
        font-size: 12px;
      }

      .gv-message > span {
        flex: 1;
      }

      .gv-message button {
        display: flex;
        background: transparent;
        border: 0;
        color: inherit;
      }

      .gv-error {
        background: #FFF1F2;
        color: #B42318;
        border-color: #FFC7C7;
      }

      .gv-success {
        background: var(--gv-green-light);
        color: var(--gv-green);
        border-color: var(--brand-border, #CDE7D9);
      }

      .gv-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px;
        background: rgba(0,0,0,.5);
      }

      .gv-modal {
        position: relative;
        width: 100%;
        max-width: 430px;
        padding: 28px;
        border-top: 4px solid #DC2626;
        border-radius: 18px;
        text-align: center;
        background: white;
        box-shadow: 0 20px 60px rgba(0,0,0,.2);
      }

      .gv-modal-close {
        position: absolute;
        top: 14px;
        right: 14px;
        border: none;
        background: transparent;
        color: #888;
      }

      .gv-modal-icon {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 17px;
        border-radius: 50%;
        background: #FEE2E2;
        color: #DC2626;
      }

      .gv-modal h2 {
        margin: 0 0 10px;
        font-size: 20px;
      }

      .gv-modal p {
        margin: 0 0 24px;
        font-size: 13px;
        line-height: 1.7;
        color: #667085;
      }

      .gv-modal-buttons {
        display: flex;
        gap: 10px;
      }

      .gv-modal-buttons button {
        flex: 1;
        height: 42px;
      }

      .gv-delete-confirm {
        background: #DC2626;
        border: 0;
        border-radius: 22px;
        color: white;
        font-size: 12px;
        font-weight: 650;
      }

      .gv-delete-confirm:hover {
        background: #B91C1C;
      }

      .gv-spin {
        animation: gv-rotate 1s linear infinite;
      }

      @keyframes gv-rotate {
        to { transform: rotate(360deg); }
      }

      @media (max-width: 700px) {
        .gv-header-card {
          padding: 20px;
          border-radius: 18px;
          align-items: flex-start;
        }

        .gv-header-card h1 {
          font-size: 20px;
        }

        .gv-create-button {
          padding: 0 10px;
          font-size: 11px;
        }

        .gv-editor {
          padding: 18px 15px;
        }

        .gv-form-grid {
          grid-template-columns: 1fr;
          gap: 14px;
        }

        .gv-summary {
          padding: 14px 15px;
        }

        .gv-mobile-reorder {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin: 3px 38px 5px 0;
        }

        .gv-mobile-reorder button {
          padding: 4px;
          border: 0;
          background: transparent;
          color: var(--gv-green);
          font-size: 10px;
        }
      }

      @media (max-width: 430px) {
        .gv-header-card {
          flex-wrap: wrap;
        }

        .gv-header-card > div {
          width: 100%;
        }

        .gv-options-heading small {
          display: none;
        }

        .gv-color-control,
        .gv-color-control input[type="color"] {
          width: 34px;
          height: 34px;
        }

        .gv-option-input,
        .gv-add-option > input {
          height: 39px;
        }

        .gv-icon-action {
          width: 26px;
        }

        .gv-editor-footer {
          flex-wrap: wrap;
        }

        .gv-editor-left {
          flex: 1;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .gv-spin {
          animation: none;
        }
      }
    `}</style>
  );
}
