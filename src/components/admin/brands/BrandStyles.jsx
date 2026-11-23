export default function BrandStyles() {
  return (
    <style>{`
      .br-page {
        width: 100%;
        max-width: 1600px;
        margin: 0 auto;
        color: #202124;
        font-family: "Segoe UI", Arial, sans-serif;
        font-size: 13px;
      }

      .br-page * { box-sizing: border-box; }
      .br-page button, .br-page input,
      .br-page select, .br-page textarea {
        font-family: inherit;
      }

      .br-stats {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        margin-bottom: 16px;
        overflow: hidden;
        background: #fff;
        border: 1px solid #e5e5e5;
        border-radius: 13px;
        box-shadow: 0 1px 3px rgba(0,0,0,.035);
      }

      .br-stat {
        min-width: 0;
        padding: 20px 22px;
        border-right: 1px solid #e9e9e9;
      }

      .br-stat:last-child { border-right: none; }

      .br-stat-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 5px;
      }

      .br-stat-head > span:first-child { font-size: 13px; }

      .br-stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        flex-shrink: 0;
        border-radius: 50%;
        background: var(--brand-light);
        color: var(--brand-primary);
      }

      .br-stat strong {
        display: block;
        margin: 0 0 5px;
        font-size: 22px;
        font-weight: 650;
        line-height: 1.3;
      }

      .br-stat small { color: #848484; font-size: 11px; }

      .br-panel {
        padding: 23px;
        background: #fff;
        border: 1px solid #e5e5e5;
        border-radius: 13px;
      }

      .br-panel-title,
      .br-edit-header,
      .br-section-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
      }

      .br-panel-title { margin-bottom: 20px; }

      .br-panel-title h1,
      .br-edit-header h1 {
        margin: 0;
        color: #171717;
        font-size: 21px;
        font-weight: 650;
      }

      .br-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 36px;
        padding: 8px 14px;
        border: 1px solid transparent;
        border-radius: 9px;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        text-decoration: none;
        cursor: pointer;
      }

      .br-btn:disabled { opacity: .6; cursor: not-allowed; }

      .br-btn-primary {
        background: var(--brand-primary);
        color: #fff;
        border-color: var(--brand-primary);
      }

      .br-btn-primary:hover:not(:disabled) {
        background: var(--brand-hover);
      }

      .br-btn-outline {
        background: #fff;
        color: #252525;
        border-color: #dedede;
      }

      .br-btn-outline:hover { background: #f8f8f8; }

      .br-table-frame {
        border: 1px solid #e5e5e5;
        border-radius: 12px;
        overflow: hidden;
      }

      .br-tabs {
        display: flex;
        gap: 23px;
        padding: 0 20px;
        border-bottom: 1px solid #e7e7e7;
        overflow-x: auto;
      }

      .br-tabs button {
        position: relative;
        flex-shrink: 0;
        min-height: 55px;
        border: none;
        background: transparent;
        color: #777;
        font-size: 13px;
        cursor: pointer;
      }

      .br-tabs button.active {
        color: var(--brand-primary);
        font-weight: 650;
      }

      .br-tabs button.active::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 2px;
        background: var(--brand-primary);
      }

      .br-tools {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 12px 15px;
        border-bottom: 1px solid #e7e7e7;
      }

      .br-search {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        max-width: 510px;
        height: 38px;
        padding: 0 12px;
        border: 1px solid var(--brand-primary);
        border-radius: 10px;
        color: #999;
      }

      .br-search input {
        min-width: 0;
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        color: #242424;
        font-size: 13px;
      }

      .br-search button {
        display: flex;
        padding: 0;
        border: none;
        background: transparent;
        color: #888;
        cursor: pointer;
      }

      .br-sort {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 11px;
        border: 1px solid #e4e4e4;
        border-radius: 9px;
      }

      .br-sort select {
        border: none;
        outline: none;
        background: transparent;
        font-size: 12px;
      }

      .br-table-scroll { overflow-x: auto; }

      .br-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 800px;
        text-align: left;
      }

      .br-table th {
        padding: 16px;
        color: #858585;
        font-size: 12px;
        font-weight: 500;
        border-bottom: 1px solid #e9e9e9;
      }

      .br-table td {
        padding: 15px 16px;
        height: 79px;
        border-bottom: 1px solid #ededed;
        font-size: 12px;
      }

      .br-table tbody tr:last-child td { border-bottom: none; }

      .br-brand-cell {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 150px;
      }

      .br-logo,
      .br-logo-preview {
        width: 47px;
        height: 47px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        flex-shrink: 0;
        border: 1px solid #ededed;
        border-radius: 12px;
        background: #f7f8f7;
        color: var(--brand-primary);
        font-size: 22px;
        font-weight: 700;
      }

      .br-logo img, .br-logo-preview img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .br-brand-cell strong,
      .br-brand-cell small { display: block; }

      .br-brand-cell strong { font-size: 13px; font-weight: 600; }
      .br-brand-cell small { margin-top: 3px; color: #888; font-size: 11px; }

      .br-capitalize { text-transform: capitalize; }

      .br-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 5px 10px;
        border-radius: 30px;
        font-size: 11px;
        font-weight: 600;
        text-transform: capitalize;
      }

      .br-pill.active,
      .br-pill.approved {
        background: var(--brand-light);
        color: var(--brand-primary);
      }

      .br-pill.pending { background: #fff1d7; color: #ad7000; }
      .br-pill.inactive { background: #f1f1f1; color: #666; }
      .br-pill.rejected { background: #ffeded; color: #c52c38; }
      .br-pill.archived { background: #f1f0f7; color: #655a82; }

      .br-row-actions {
        display: flex;
        align-items: center;
        width: fit-content;
        border: 1px solid #e5e5e5;
        border-radius: 9px;
        overflow: hidden;
      }

      .br-row-actions > * {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        border-right: 1px solid #e5e5e5;
        background: #f9f9f9;
        color: #666;
        cursor: pointer;
      }

      .br-row-actions > *:last-child { border-right: none; }

      .br-row-actions > *:hover {
        color: var(--brand-primary);
        background: var(--brand-light);
      }

      .br-row-actions > *:disabled { opacity: .5; }

      .br-star-active { color: #efa000; }

      .br-row-actions .br-delete-icon:hover {
        color: #dc2626;
        background: #fef2f2;
      }

      .br-empty {
        height: 165px !important;
        text-align: center;
        color: #888;
      }

      .br-empty svg { vertical-align: middle; margin-right: 8px; }

      .br-pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 13px 17px;
        color: #777;
        font-size: 12px;
        border-top: 1px solid #eaeaea;
      }

      .br-pagination > div { display: flex; align-items: center; gap: 13px; }

      .br-pagination button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border: 1px solid #e4e4e4;
        border-radius: 7px;
        background: #fff;
        cursor: pointer;
      }

      .br-pagination button:disabled { opacity: .4; cursor: not-allowed; }

      .br-alert {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 12px 14px;
        margin-bottom: 15px;
        border-radius: 9px;
        font-size: 12px;
      }

      .br-alert-error {
        color: #b42318;
        background: #fff1f0;
        border: 1px solid #ffc8c4;
      }

      .br-alert-success {
        color: var(--brand-primary);
        background: var(--brand-light);
        border: 1px solid var(--brand-border);
      }

      .br-spin { animation: br-spin 1s linear infinite; }
      @keyframes br-spin { to { transform: rotate(360deg); } }

      /* Brand Editor */

      .br-edit-header {
        margin: 0 auto 24px;
        max-width: 1120px;
      }

      .br-edit-header > div:first-child {
        display: flex;
        align-items: center;
        gap: 11px;
      }

      .br-header-actions { display: flex; gap: 9px; }

      .br-editor-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.8fr) minmax(280px, .9fr);
        gap: 16px;
        align-items: start;
        max-width: 1120px;
        margin: 0 auto;
      }

      .br-editor-main,
      .br-editor-aside {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 0;
      }

      .br-section {
        min-width: 0;
        padding: 23px;
        border: 1px solid #e3e3e3;
        border-radius: 18px;
        background: #fff;
        box-shadow: 0 1px 2px rgba(0,0,0,.03);
      }

      .br-section h2 {
        margin: 0 0 17px;
        font-size: 16px;
        font-weight: 650;
        color: #171717;
      }

      .br-section-heading h2 { margin-bottom: 5px; }

      .br-section-heading p {
        margin: 0 0 18px;
        color: #858585;
        font-size: 12px;
      }

      .br-field { margin-bottom: 19px; }
      .br-field:last-child { margin-bottom: 0; }

      .br-field label {
        display: block;
        margin-bottom: 8px;
        color: #242424;
        font-size: 12px;
        font-weight: 600;
      }

      .br-field input,
      .br-field textarea,
      .br-field select {
        width: 100%;
        min-height: 38px;
        padding: 9px 12px;
        border: 1px solid #cfd7dd;
        border-radius: 11px;
        outline: none;
        background: #fff;
        color: #202124;
        font-size: 13px;
      }

      .br-field textarea { resize: vertical; }

      .br-field input:focus,
      .br-field textarea:focus,
      .br-field select:focus {
        border-color: var(--brand-primary);
        box-shadow: 0 0 0 3px var(--brand-light);
      }

      .br-field small {
        display: block;
        margin-top: 7px;
        color: #858585;
        font-size: 11px;
      }

      .br-logo-upload {
        display: flex;
        align-items: center;
        gap: 18px;
      }

      .br-logo-preview { width: 120px; height: 120px; }

      .br-logo-upload p {
        margin-top: 9px;
        color: #858585;
        font-size: 12px;
      }

      .br-upload-button { cursor: pointer; }

      .br-toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        padding: 13px;
        border: 1px solid #e5e5e5;
        border-radius: 13px;
        cursor: pointer;
      }

      .br-toggle-row strong,
      .br-toggle-row small { display: block; }

      .br-toggle-row strong { font-size: 12px; font-weight: 600; }
      .br-toggle-row small { margin-top: 4px; color: #858585; line-height: 1.5; }

      .br-toggle-row input {
        width: 19px;
        height: 19px;
        flex-shrink: 0;
        accent-color: var(--brand-primary);
      }

      .br-info-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 15px;
        border: 1px solid #e5e5e5;
        border-radius: 13px;
        font-size: 12px;
      }

      .br-info-row strong { font-size: 11px; color: #858585; font-weight: 500; }

      .br-serp-preview {
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 16px;
        margin: 15px 0;
        border: 1px solid #e5e5e5;
        border-radius: 12px;
        background: #f7f7f7;
      }

      .br-serp-preview strong { font-size: 12px; }
      .br-serp-preview small { color: #858585; font-size: 11px; }

      .br-serp-preview > span {
        color: #1a0dab;
        font-size: 15px;
      }

      .br-serp-preview p { margin: 0; color: #777; font-size: 12px; }

      .br-slug-input {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .br-slug-input span { color: #858585; font-size: 12px; }

      .br-loading {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        min-height: 220px;
        color: #888;
      }

      /* Delete Confirmation */

      .br-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 18px;
        background: rgba(0,0,0,.46);
      }

      .br-modal {
        position: relative;
        width: 100%;
        max-width: 440px;
        padding: 30px;
        border-top: 4px solid #dc2626;
        border-radius: 18px;
        background: #fff;
        text-align: center;
        box-shadow: 0 25px 70px rgba(0,0,0,.18);
      }

      .br-modal-close {
        position: absolute;
        top: 15px;
        right: 15px;
        display: flex;
        border: none;
        background: transparent;
        color: #777;
        cursor: pointer;
      }

      .br-modal-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 60px;
        margin: 0 auto 16px;
        border-radius: 50%;
        background: #fee2e2;
        color: #dc2626;
      }

      .br-modal h2 { margin: 0 0 10px; font-size: 21px; }

      .br-modal p {
        margin: 0 0 25px;
        color: #667085;
        font-size: 13px;
        line-height: 1.7;
      }

      .br-modal-actions { display: flex; gap: 11px; }

      .br-modal-actions .br-btn { flex: 1; min-height: 43px; }

      .br-btn-danger { background: #dc2626; color: #fff; }
      .br-btn-danger:hover { background: #b91c1c; }

      @media (max-width: 1200px) {
        .br-stats { grid-template-columns: repeat(3, minmax(0,1fr)); }
        .br-stat { border-bottom: 1px solid #e9e9e9; }
      }

      @media (max-width: 850px) {
        .br-editor-grid { grid-template-columns: 1fr; }
        .br-stats { grid-template-columns: repeat(2, minmax(0,1fr)); }
      }

      @media (max-width: 550px) {
        .br-panel { padding: 13px; }
        .br-stat { padding: 14px; }
        .br-tools { flex-direction: column; align-items: stretch; }
        .br-search { max-width: none; }
        .br-tabs { gap: 17px; padding: 0 13px; }
        .br-section { padding: 17px; }
        .br-edit-header { align-items: flex-start; }
        .br-panel-title h1, .br-edit-header h1 { font-size: 18px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .br-spin { animation: none; }
      }
    `}</style>
  );
}
