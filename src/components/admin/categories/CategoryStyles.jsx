export default function CategoryStyles() {
  return (
    <style>{`
      .cat-root {
        width: 100%;
        max-width: 1600px;
        margin: 0 auto;
        font: 13px "Segoe UI", Arial, sans-serif;
        color: #202124;
      }

      .cat-root * {
        box-sizing: border-box;
      }

      .cat-root button,
      .cat-root input,
      .cat-root select,
      .cat-root textarea {
        font: inherit;
      }

      .cat-stats {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        background: white;
        border: 1px solid #e5e5e5;
        border-radius: 13px;
        overflow: hidden;
        margin-bottom: 16px;
      }

      .cat-stat {
        min-width: 0;
        padding: 19px 21px;
        border-right: 1px solid #e8e8e8;
      }

      .cat-stat:last-child {
        border-right: 0;
      }

      .cat-stat-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 6px;
      }

      .cat-stat-icon {
        width: 35px;
        height: 35px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: var(--brand-light, #eaf5ef);
        color: var(--brand-primary, #05714b);
      }

      .cat-stat strong {
        display: block;
        font-size: 22px;
        margin-bottom: 4px;
      }

      .cat-stat small,
      .cat-field small,
      .cat-help {
        font-size: 11px;
        color: #888;
        line-height: 1.5;
      }

      .cat-panel {
        padding: 23px;
        background: white;
        border: 1px solid #e5e5e5;
        border-radius: 13px;
      }

      .cat-panel-title,
      .cat-editor-head,
      .cat-section-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
      }

      .cat-panel-title {
        margin-bottom: 19px;
      }

      .cat-panel-title h1,
      .cat-editor-title h1 {
        font-size: 21px;
        margin: 0;
        font-weight: 650;
        color: #171717;
      }

      .cat-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 36px;
        padding: 8px 13px;
        border: 1px solid transparent;
        border-radius: 9px;
        cursor: pointer;
        font-weight: 600;
        text-decoration: none;
        white-space: nowrap;
      }

      .cat-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .cat-primary {
        color: #fff;
        background: var(--brand-primary, #05714b);
      }

      .cat-primary:hover {
        filter: brightness(0.92);
      }

      .cat-outline {
        background: white;
        color: #242424;
        border-color: #dedede;
      }

      .cat-outline:hover {
        background: #f8f8f8;
      }

      .cat-danger {
        background: #dc2626;
        color: #fff;
      }

      .cat-table-border {
        border: 1px solid #e5e5e5;
        border-radius: 12px;
        overflow: hidden;
      }

      .cat-tabs {
        display: flex;
        gap: 23px;
        padding: 0 20px;
        border-bottom: 1px solid #e7e7e7;
        overflow-x: auto;
      }

      .cat-tabs button {
        position: relative;
        min-height: 53px;
        flex-shrink: 0;
        color: #777;
        border: 0;
        background: none;
        cursor: pointer;
        text-transform: capitalize;
      }

      .cat-tabs button.active {
        color: var(--brand-primary, #05714b);
        font-weight: 650;
      }

      .cat-tabs button.active::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--brand-primary, #05714b);
      }

      .cat-tools {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 14px;
        padding: 13px 15px;
        border-bottom: 1px solid #e8e8e8;
      }

      .cat-search {
        display: flex;
        align-items: center;
        gap: 9px;
        width: 100%;
        max-width: 510px;
        border: 1px solid var(--brand-primary, #05714b);
        border-radius: 10px;
        padding: 0 12px;
        height: 39px;
        color: #888;
      }

      .cat-search input {
        border: 0;
        outline: 0;
        background: transparent;
        min-width: 0;
        flex: 1;
      }

      .cat-search button {
        display: flex;
        padding: 0;
        border: 0;
        background: none;
        cursor: pointer;
        color: #888;
      }

      .cat-sort {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 11px;
        border: 1px solid #e4e4e4;
        border-radius: 9px;
      }

      .cat-sort select {
        border: 0;
        outline: 0;
        background: transparent;
      }

      .cat-table-wrap {
        overflow-x: auto;
      }

      .cat-table {
        width: 100%;
        min-width: 800px;
        border-collapse: collapse;
        text-align: left;
      }

      .cat-table th {
        color: #777;
        font-size: 12px;
        font-weight: 500;
        padding: 16px;
        border-bottom: 1px solid #e9e9e9;
      }

      .cat-table td {
        padding: 14px 16px;
        height: 78px;
        border-bottom: 1px solid #ededed;
      }

      .cat-table tbody tr:last-child td {
        border: 0;
      }

      .cat-name {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 180px;
      }

      .cat-name strong,
      .cat-name small {
        display: block;
      }

      .cat-name small {
        font-size: 11px;
        color: #888;
        margin-top: 3px;
      }

      .cat-thumb {
        width: 46px;
        height: 46px;
        display: grid;
        place-items: center;
        flex-shrink: 0;
        overflow: hidden;
        border: 1px solid #ececec;
        border-radius: 11px;
        background: #f7f8f7;
        color: #9ba5a0;
      }

      .cat-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cat-pill {
        display: inline-flex;
        align-items: center;
        border-radius: 30px;
        padding: 5px 9px;
        text-transform: capitalize;
        font-size: 11px;
        font-weight: 650;
      }

      .cat-pill.active {
        background: var(--brand-light, #eaf5ef);
        color: var(--brand-primary, #05714b);
      }

      .cat-pill.inactive {
        background: #f0f0f0;
        color: #777;
      }

      .cat-featured {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 9px;
        border-radius: 20px;
        background: #f3f3f3;
        font-size: 11px;
      }

      .cat-actions {
        display: inline-flex;
        border: 1px solid #e6e6e6;
        border-radius: 8px;
        overflow: hidden;
      }

      .cat-actions > * {
        display: grid;
        place-items: center;
        width: 33px;
        height: 33px;
        background: #fafafa;
        color: #686868;
        border: 0;
        border-right: 1px solid #e6e6e6;
        cursor: pointer;
      }

      .cat-actions > *:last-child {
        border: 0;
      }

      .cat-actions > *:hover {
        background: var(--brand-light, #eaf5ef);
        color: var(--brand-primary, #05714b);
      }

      .cat-actions .cat-star {
        color: #e9a000;
      }

      .cat-empty {
        text-align: center !important;
        height: 145px !important;
        color: #858585;
      }

      .cat-empty svg {
        vertical-align: middle;
        margin-right: 7px;
      }

      .cat-pagination {
        padding: 13px 16px;
        border-top: 1px solid #eee;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        color: #777;
        font-size: 12px;
      }

      .cat-pagination > div {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .cat-pagination button {
        width: 30px;
        height: 30px;
        display: grid;
        place-items: center;
        border: 1px solid #e4e4e4;
        border-radius: 7px;
        background: #fff;
        cursor: pointer;
      }

      .cat-pagination button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .cat-notice {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 14px;
        margin: 0 0 15px;
        border-radius: 9px;
        font-size: 12px;
      }

      .cat-notice-error {
        background: #fff0f0;
        color: #b42318;
        border: 1px solid #ffc8c4;
      }

      .cat-notice-success {
        background: var(--brand-light, #eaf5ef);
        color: var(--brand-primary, #05714b);
        border: 1px solid var(--brand-border, #d6e9df);
      }

      .cat-editor-head {
        max-width: 1130px;
        margin: 0 auto 24px;
      }

      .cat-editor-title,
      .cat-editor-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .cat-editor-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.85fr) minmax(280px, 0.9fr);
        gap: 16px;
        max-width: 1130px;
        margin: auto;
        align-items: start;
      }

      .cat-editor-main,
      .cat-editor-aside {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 0;
      }

      .cat-section {
        background: #fff;
        border: 1px solid #e3e3e3;
        border-radius: 18px;
        padding: 23px;
        min-width: 0;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      }

      .cat-section h2 {
        font-size: 16px;
        font-weight: 650;
        margin: 0 0 17px;
      }

      .cat-section-heading h2 {
        margin-bottom: 3px;
      }

      .cat-section-heading p {
        margin: 0 0 15px;
      }

      .cat-field {
        display: block;
        margin-bottom: 18px;
        font-size: 12px;
        font-weight: 600;
      }

      .cat-field:last-child {
        margin-bottom: 0;
      }

      .cat-field > input,
      .cat-field > textarea,
      .cat-field > select,
      .cat-slug input {
        display: block;
        width: 100%;
        border: 1px solid #cfd7dd;
        border-radius: 10px;
        padding: 9px 12px;
        min-height: 38px;
        margin-top: 8px;
        background: white;
        color: #202124;
        outline: none;
        font-size: 13px;
        font-weight: 400;
      }

      .cat-field textarea {
        resize: vertical;
      }

      .cat-field input:focus,
      .cat-field textarea:focus,
      .cat-field select:focus {
        border-color: var(--brand-primary, #05714b);
        box-shadow: 0 0 0 3px var(--brand-light, #eaf5ef);
      }

      .cat-field small {
        display: block;
        margin-top: 6px;
        font-weight: 400;
      }

      .cat-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px;
        border: 1px solid #e6e6e6;
        border-radius: 13px;
        cursor: pointer;
      }

      .cat-toggle strong,
      .cat-toggle small {
        display: block;
      }

      .cat-toggle small {
        margin-top: 4px;
        font-size: 11px;
        color: #888;
        line-height: 1.5;
      }

      .cat-toggle input {
        width: 19px;
        height: 19px;
        accent-color: var(--brand-primary, #05714b);
      }

      .cat-hierarchy-help {
        padding: 13px;
        background: #f7faf8;
        border: 1px solid #e4ece7;
        border-radius: 12px;
        margin: 0 0 18px;
      }

      .cat-hierarchy-help strong {
        font-size: 12px;
      }

      .cat-hierarchy-help p {
        margin: 8px 0 0;
        color: #777;
        font-size: 11px;
      }

      .cat-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        border: 1px solid #e5e5e5;
        padding: 14px;
        border-radius: 12px;
      }

      .cat-info strong {
        font-size: 11px;
        color: #888;
        font-weight: 500;
        text-align: right;
      }

      .cat-media-line {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .cat-media-preview {
        width: 120px;
        height: 120px;
        display: grid;
        place-items: center;
        flex-shrink: 0;
        background: #f7f8f7;
        border: 1px solid #e7e7e7;
        border-radius: 13px;
        color: #999;
        overflow: hidden;
      }

      .cat-media-preview img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .cat-file-label {
        cursor: pointer;
      }

      .cat-help {
        font-weight: 400;
        margin-top: 8px;
      }

      .cat-serp {
        display: flex;
        flex-direction: column;
        gap: 5px;
        background: #f7f7f7;
        border: 1px solid #e5e5e5;
        border-radius: 12px;
        padding: 16px;
        margin: 14px 0 20px;
      }

      .cat-serp strong {
        font-size: 12px;
      }

      .cat-serp small {
        color: #777;
        font-size: 11px;
      }

      .cat-serp span {
        color: #1a0dab;
        font-size: 16px;
      }

      .cat-serp p {
        margin: 0;
        color: #777;
        font-size: 12px;
      }

      .cat-slug {
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .cat-slug > span {
        font-size: 12px;
        color: #888;
      }

      .cat-slug input {
        margin-top: 8px;
      }

      .cat-tag-wrap {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        padding: 7px 9px;
        min-height: 40px;
        border: 1px solid #cfd7dd;
        border-radius: 10px;
        margin-top: 8px;
      }

      .cat-tag {
        display: flex;
        align-items: center;
        gap: 5px;
        border-radius: 16px;
        padding: 4px 9px;
        background: #f0f0f0;
        font-size: 11px;
      }

      .cat-tag button,
      .cat-tag-wrap > button {
        border: 0;
        background: none;
        display: flex;
        cursor: pointer;
        padding: 1px;
      }

      .cat-tag-wrap input {
        flex: 1;
        min-width: 100px;
        border: 0;
        outline: 0;
        background: transparent;
        font-size: 12px;
      }

      .cat-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px;
        background: rgba(0, 0, 0, 0.5);
      }

      .cat-modal {
        position: relative;
        width: 100%;
        max-width: 430px;
        text-align: center;
        padding: 30px;
        border-top: 4px solid #dc2626;
        border-radius: 18px;
        background: white;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      }

      .cat-modal-x {
        position: absolute;
        top: 13px;
        right: 13px;
        display: flex;
        border: 0;
        background: none;
        color: #888;
        cursor: pointer;
      }

      .cat-modal-icon {
        display: grid;
        place-items: center;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #fee2e2;
        color: #dc2626;
        margin: 0 auto 16px;
      }

      .cat-modal h2 {
        font-size: 21px;
        margin: 0 0 9px;
      }

      .cat-modal p {
        line-height: 1.7;
        color: #667085;
        font-size: 13px;
        margin: 0 0 22px;
      }

      .cat-modal-buttons {
        display: flex;
        gap: 10px;
      }

      .cat-modal-buttons > * {
        flex: 1;
        min-height: 43px;
      }

      .cat-spinner {
        animation: cat-rotate 1s linear infinite;
      }

      @keyframes cat-rotate {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 1240px) {
        .cat-stats {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .cat-stat {
          border-bottom: 1px solid #e8e8e8;
        }
      }

      @media (max-width: 850px) {
        .cat-editor-grid {
          grid-template-columns: 1fr;
        }

        .cat-stats {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 580px) {
        .cat-panel,
        .cat-section {
          padding: 15px;
        }

        .cat-tools {
          flex-direction: column;
          align-items: stretch;
        }

        .cat-search {
          max-width: none;
        }

        .cat-editor-head {
          align-items: flex-start;
        }

        .cat-stat {
          padding: 14px;
        }

        .cat-panel-title h1,
        .cat-editor-title h1 {
          font-size: 18px;
        }

        .cat-media-line {
          flex-wrap: wrap;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .cat-spinner {
          animation: none;
        }
      }
    `}</style>
  );
}
