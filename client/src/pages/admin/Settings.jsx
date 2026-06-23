// =============================================================
// FILE: client/src/pages/admin/Settings.jsx
// =============================================================

import { useState, useRef, useEffect, useMemo } from "react";
import {
    AdminSidebar,
    AdminMobileSidebar,
} from "../../components/AdminSidebar";
import AdminDateChip from "../../components/AdminDateChip";
import AdminNotificationsBell from "../../components/AdminNotificationsBell";
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    HelpCircle,
    Menu,
    Palette,
    Pencil,
    QrCode,
    Search,
    Upload,
    UsersRound,
    X,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import * as settingsService from "../../services/settingsService";
import * as personnelService from "../../services/personnelService";
import BarangayPersonnelManager from "../../components/BarangayPersonnelManager";
import { DEFAULT_OFFICE_SCHEDULE } from "../../services/publicBrandingService";
import {
    SYSTEM_THEMES,
    applySystemTheme,
    cacheSystemTheme,
    normalizeSystemTheme,
} from "../../theme";
import {
    CERTIFICATE_TEMPLATE_OPTIONS,
    buildCertificatePrintHtml,
    getSignatoryTemplateUsage,
    getTemplateFieldLabels,
} from "../../utils/certificateTemplateEngine";

// ─── Injected styles (mirrors HTML stylesheet) ───────────────
let stylesInjected = false;
function useSettingsStyles() {
    useEffect(() => {
        if (stylesInjected) return;
        stylesInjected = true;
        const el = document.createElement("style");
        el.setAttribute("data-settings", "true");
        el.innerText = `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&display=swap');

        .st-body { font-family: 'Source Serif 4', serif; }

        /* TABS */
        .st-tabs { display:flex; gap:0; border-bottom:2px solid #e4dfd4; margin-bottom:28px; overflow-x:auto; overflow-y:hidden; }
        .st-tab-btn {
            padding:10px 24px;
            font-family:'Source Serif 4',serif;
            font-size:13px; font-weight:600;
            color:#9090aa; background:none; border:none;
            border-bottom:2px solid transparent; margin-bottom:-2px;
            cursor:pointer; display:flex; align-items:center; gap:8px;
            white-space:nowrap;
            transition:all .15s;
        }
        .st-tab-btn:hover { color:var(--color-primary); }
        .st-tab-btn.active { color:var(--color-primary); border-bottom-color:var(--color-primary); }
        .st-tab-btn svg { opacity:.6; }
        .st-tab-btn.active svg { opacity:1; }

        /* PANELS */
        .st-panel { background:#fff; border:1px solid #e4dfd4; border-radius:6px; overflow:hidden; margin-bottom:20px; }
        .st-panel-header {
            padding:16px 24px; border-bottom:1px solid #e4dfd4;
            display:flex; align-items:center; justify-content:space-between;
            background:#f8f6f1;
        }
        .st-panel-title { font-family:'Playfair Display',serif; font-size:14px; font-weight:700; color:var(--color-primary); }
        .st-panel-desc  { font-size:11px; color:#9090aa; margin-top:2px; }
        .st-panel-body  { padding:24px; }

        /* FORM */
        .st-form-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
        .st-form-grid-1 { display:grid; grid-template-columns:1fr; gap:18px; }
        .st-field { display:flex; flex-direction:column; gap:6px; }
        .st-field label { font-size:10.5px; font-weight:600; color:#4a4a6a; letter-spacing:1.2px; text-transform:uppercase; }
        .st-field label .req { color:#b02020; margin-left:2px; }
        .st-label-with-help { display:flex; align-items:center; gap:7px; }
        .st-help-btn { width:18px; height:18px; border:1px solid #d8cfbd; border-radius:50%; background:#fff; color:#4a4a6a; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; padding:0; }
        .st-help-btn:hover { border-color:var(--color-primary); color:var(--color-primary); background:rgba(var(--color-primary-rgb),.06); }
        .st-field input, .st-field textarea, .st-field select {
            width:100%; padding:10px 14px;
            border:1.5px solid #e4dfd4; border-radius:4px;
            font-family:'Source Serif 4',serif; font-size:13px; color:#1a1a2e;
            background:#f8f6f1; outline:none;
            transition:border-color .15s, background .15s;
        }
        .st-field input:focus, .st-field textarea:focus, .st-field select:focus {
            border-color:var(--color-primary); background:rgba(var(--color-primary-rgb),.08);
        }
        .st-field textarea { resize:vertical; min-height:80px; line-height:1.6; }
        .st-field .hint { font-size:10.5px; color:#9090aa; line-height:1.5; }

        /* SAVE BAR */
        .st-save-bar {
            display:flex; align-items:center; justify-content:space-between;
            padding:14px 24px; background:#f5edce; border-top:1px solid #e0d4a8;
        }
        .st-save-bar p { font-size:11.5px; color:#7a6530; }
        .st-btn-save {
            display:inline-flex; align-items:center; gap:8px;
            padding:9px 24px;
            background:linear-gradient(135deg,var(--color-primary-soft),var(--color-primary-dark));
            color:#fff; border:none; border-radius:4px;
            font-family:'Playfair Display',serif; font-size:12px; font-weight:700;
            letter-spacing:1.5px; text-transform:uppercase; cursor:pointer;
        }
        .st-btn-cancel {
            display:inline-flex; align-items:center; gap:8px;
            padding:9px 20px; background:none; color:#4a4a6a;
            border:1px solid #e4dfd4; border-radius:4px;
            font-family:'Source Serif 4',serif; font-size:12px; cursor:pointer; margin-right:8px;
        }

        /* BRANDING OVERVIEW */
        .st-branding-overview .st-panel-body { padding:20px; }
        .st-branding-overview-grid {
            display:grid;
            grid-template-columns:minmax(0,1.05fr) minmax(320px,.95fr);
            gap:18px;
            align-items:stretch;
        }
        .st-branding-overview-grid.single {
            grid-template-columns:minmax(0,540px);
        }
        .st-config-card {
            min-width:0;
            border:1px solid #eee7da;
            border-radius:8px;
            background:#fff;
            display:flex;
            flex-direction:column;
            overflow:hidden;
        }
        .st-config-card-header {
            padding:16px 18px;
            background:#fbfaf7;
            border-bottom:1px solid #eee7da;
            display:flex;
            align-items:flex-start;
            gap:12px;
        }
        .st-config-icon {
            width:34px;
            height:34px;
            border-radius:7px;
            display:flex;
            align-items:center;
            justify-content:center;
            color:var(--color-primary);
            background:rgba(var(--color-primary-rgb),.08);
            border:1px solid rgba(var(--color-primary-rgb),.14);
            flex:0 0 auto;
        }
        .st-config-title {
            font-family:'Playfair Display',serif;
            font-size:14px;
            font-weight:700;
            color:var(--color-primary);
            line-height:1.2;
        }
        .st-config-desc {
            font-size:11.5px;
            color:#77758d;
            line-height:1.45;
            margin-top:3px;
        }
        .st-theme-list {
            padding:16px;
            display:flex;
            flex-direction:column;
            gap:10px;
        }
        .st-theme-choice {
            width:100%;
            min-height:58px;
            border:1px solid #e4dfd4;
            border-radius:7px;
            background:#fff;
            display:grid;
            grid-template-columns:minmax(0,1fr) auto auto;
            align-items:center;
            gap:12px;
            padding:12px 14px;
            text-align:left;
            cursor:pointer;
            font-family:'Source Serif 4',serif;
            transition:border-color .15s, background .15s, box-shadow .15s;
        }
        .st-theme-choice:hover {
            border-color:rgba(var(--color-primary-rgb),.4);
            background:#fbfaf7;
        }
        .st-theme-choice.active {
            border-color:var(--color-primary);
            background:rgba(var(--color-primary-rgb),.06);
            box-shadow:0 0 0 1px rgba(var(--color-primary-rgb),.25) inset;
        }
        .st-theme-name {
            display:block;
            font-size:13px;
            font-weight:700;
            color:#1a1a2e;
        }
        .st-theme-meta {
            display:block;
            margin-top:2px;
            font-size:10.5px;
            color:#77758d;
            overflow:hidden;
            text-overflow:ellipsis;
            white-space:nowrap;
        }
        .st-theme-swatches {
            display:flex;
            align-items:center;
            gap:5px;
        }
        .st-theme-swatch {
            width:30px;
            height:22px;
            border-radius:5px;
            border:1px solid rgba(0,0,0,.1);
        }
        .st-theme-check {
            width:18px;
            height:18px;
            color:var(--color-primary);
            opacity:0;
        }
        .st-theme-choice.active .st-theme-check { opacity:1; }
        .st-config-footer {
            margin-top:auto;
            padding:12px 16px;
            background:#fbfaf7;
            border-top:1px solid #eee7da;
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:12px;
            flex-wrap:wrap;
        }
        .st-config-footer-note {
            font-size:11.5px;
            color:#77758d;
            line-height:1.4;
        }
        .st-btn-save-compact {
            padding:8px 16px;
            font-size:11px;
            letter-spacing:0;
            white-space:nowrap;
        }
        .st-secondary-action {
            display:inline-flex;
            align-items:center;
            justify-content:center;
            gap:8px;
            min-height:34px;
            padding:8px 14px;
            background:#fff;
            color:var(--color-primary);
            border:1px solid rgba(var(--color-primary-rgb),.24);
            border-radius:6px;
            font-family:'Source Serif 4',serif;
            font-size:12px;
            font-weight:700;
            cursor:pointer;
            white-space:nowrap;
        }
        .st-secondary-action:hover {
            background:rgba(var(--color-primary-rgb),.06);
            border-color:rgba(var(--color-primary-rgb),.4);
        }
        .st-qr-content {
            padding:16px;
            display:grid;
            grid-template-columns:178px minmax(0,1fr);
            gap:16px;
            align-items:center;
        }
        .st-qr-preview {
            width:100%;
            min-height:188px;
            padding:10px;
            background:#fff;
            border:1px solid #e4dfd4;
            border-radius:8px;
            display:flex;
            align-items:center;
            justify-content:center;
        }
        .st-url-chip {
            width:100%;
            padding:9px 10px;
            border:1px solid #e4dfd4;
            border-radius:6px;
            background:#f8f6f1;
            color:#4a4a6a;
            font-family:'Courier New',monospace;
            font-size:10.5px;
            line-height:1.4;
            word-break:break-all;
        }
        .st-qr-note {
            margin-top:10px;
            font-size:11.5px;
            color:#77758d;
            line-height:1.5;
        }

        /* LOGO UPLOAD */
        .st-logo-preview {
            width:100px; height:100px; border-radius:50%;
            border:2px solid #e4dfd4; background:#f8f6f1;
            display:flex; align-items:center; justify-content:center;
            overflow:hidden; flex-shrink:0; position:relative;
        }
        .st-logo-preview img { width:96px; height:96px; border-radius:50%; object-fit:cover; }
        .st-upload-btn {
            display:inline-flex; align-items:center; gap:8px; padding:8px 18px;
            background:var(--color-primary); color:#fff; border:none; border-radius:4px;
            font-family:'Source Serif 4',serif; font-size:12px; font-weight:600;
            cursor:pointer;
        }
        .st-upload-btn-secondary {
            display:inline-flex; align-items:center; gap:8px; padding:8px 18px;
            background:none; color:#b02020; border:1px solid rgba(176,32,32,.3);
            border-radius:4px; font-family:'Source Serif 4',serif;
            font-size:12px; font-weight:600; cursor:pointer; margin-left:8px;
        }

        /* E-SIGNATURE */
        .st-esig-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:22px; padding-top:22px; border-top:1px dashed #e4dfd4; }
        .st-esig-block { display:flex; flex-direction:column; gap:8px; }
        .st-esig-label { font-size:10.5px; font-weight:600; color:#4a4a6a; letter-spacing:1.2px; text-transform:uppercase; }
        .st-esig-sublabel { font-size:10px; color:#9090aa; margin-top:-4px; }
        .st-esig-wrap {
            border:1.5px dashed #e4dfd4; border-radius:4px; background:#fafaf8;
            height:110px; display:flex; flex-direction:column;
            align-items:center; justify-content:center; gap:6px;
            position:relative; overflow:hidden; cursor:crosshair;
        }
        .st-esig-wrap.has-sig { border-style:solid; border-color:var(--color-primary); background:#fff; cursor:default; }
        .st-esig-wrap img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; padding:8px; }
        .st-esig-actions { display:flex; gap:6px; flex-wrap:wrap; }
        .st-esig-btn {
            display:inline-flex; align-items:center; gap:5px; padding:5px 12px;
            font-family:'Source Serif 4',serif; font-size:11px; font-weight:600;
            border-radius:3px; cursor:pointer; transition:all .15s;
        }
        .st-esig-btn.draw   { background:var(--color-primary); color:#fff; border:none; }
        .st-esig-btn.upload { background:none; color:var(--color-primary); border:1.5px solid var(--color-primary); }
        .st-esig-btn.clear  { background:none; color:#b02020; border:1.5px solid rgba(176,32,32,.3); }
        .st-esig-status { display:inline-flex; align-items:center; gap:5px; font-size:10px; padding:3px 10px; border-radius:20px; font-weight:600; margin-left:6px; }
        .st-esig-status.set    { background:#e8f5ee; color:#1a7a4a; }
        .st-esig-status.notset { background:#f0f0f0; color:#9090aa; }

        /* DRAW MODAL */
        .st-modal-overlay { display:none; position:fixed; inset:0; background:rgba(9,26,62,.6); z-index:600; align-items:center; justify-content:center; }
        .st-modal-overlay.open { display:flex; }
        .st-modal { background:#fff; border-radius:8px; box-shadow:0 20px 60px rgba(0,0,0,.3); width:520px; overflow:hidden; }
        .st-modal-header { padding:16px 24px; background:var(--color-primary); display:flex; align-items:center; justify-content:space-between; }
        .st-modal-title { font-family:'Playfair Display',serif; font-size:15px; color:#fff; font-weight:700; }
        .st-modal-close { background:none; border:none; cursor:pointer; color:rgba(255,255,255,.6); }
        .st-modal-body { padding:20px 24px; }
        .st-usage-summary { font-size:12px; color:#4a4a6a; line-height:1.55; margin-bottom:12px; }
        .st-usage-list { display:flex; flex-direction:column; gap:8px; max-height:360px; overflow:auto; padding-right:4px; }
        .st-usage-item { border:1px solid #eee7da; border-radius:5px; padding:10px 12px; background:#fbfaf7; }
        .st-usage-name { font-size:12.5px; font-weight:700; color:var(--color-primary); }
        .st-usage-desc { font-size:10.8px; color:#77758d; margin-top:2px; line-height:1.4; }
        .st-usage-key { font-family:'Courier New',monospace; font-size:10px; color:#9090aa; margin-top:5px; }
        .st-modal-canvas { width:100%; height:180px; border:1.5px solid #e4dfd4; border-radius:4px; background:#fff; cursor:crosshair; display:block; touch-action:none; }
        .st-modal-hint { font-size:10.5px; color:#9090aa; text-align:center; margin-top:6px; }
        .st-modal-footer { padding:14px 24px; border-top:1px solid #e4dfd4; display:flex; justify-content:space-between; align-items:center; background:#f8f6f1; }

        /* CERT TYPES TABLE */
        .st-cert-table-header > span:not(:first-child) { text-align:center; }
        .st-cert-row { display:grid; grid-template-columns:minmax(220px,1fr) 150px 100px 210px; align-items:center; padding:12px 22px; border-bottom:1px solid #f0ece4; gap:10px; }
        .st-cert-row:last-child { border-bottom:none; }
        .st-cert-name { font-size:12.5px; font-weight:600; }
        .st-cert-desc { font-size:10.5px; color:#9090aa; margin-top:1px; }
        .st-badge-active   { font-size:10.5px; background:#e8f5ee; color:#1a7a4a; border-radius:10px; padding:2px 10px; font-weight:700; display:inline-block; width:fit-content; }
        .st-badge-inactive { font-size:10.5px; background:#f0ece4; color:#9090aa; border-radius:10px; padding:2px 10px; font-weight:700; display:inline-block; width:fit-content; }
        .st-cert-row > .st-badge-active,
        .st-cert-row > .st-badge-inactive { justify-self:center; }
        .st-toggle-btn { background:none; border:1px solid #e4dfd4; border-radius:4px; padding:5px 14px; font-size:10.5px; cursor:pointer; font-family:inherit; color:#9090aa; }
        .st-toggle-btn:disabled { opacity:.45; cursor:not-allowed; }
        .st-view-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; background:#fff; border:1px solid rgba(var(--color-primary-rgb),.22); border-radius:4px; padding:5px 12px; font-size:10.5px; cursor:pointer; font-family:inherit; color:var(--color-primary); white-space:nowrap; }
        .st-view-btn:hover { background:rgba(var(--color-primary-rgb),.06); border-color:var(--color-primary); }
        .st-cert-actions { display:flex; align-items:center; justify-content:center; gap:8px; flex-wrap:wrap; }
        .st-cert-toolbar { padding:14px 22px; display:flex; align-items:center; justify-content:space-between; gap:14px; border-bottom:1px solid #e4dfd4; background:#fff; flex-wrap:wrap; }
        .st-cert-search { position:relative; flex:1; min-width:240px; max-width:420px; }
        .st-cert-search svg { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:#9090aa; }
        .st-cert-search input { width:100%; padding:9px 12px 9px 34px; border:1.5px solid #e4dfd4; border-radius:4px; font-family:'Source Serif 4',serif; font-size:12.5px; background:#f8f6f1; color:#1a1a2e; outline:none; }
        .st-cert-search input:focus { border-color:var(--color-primary); background:rgba(var(--color-primary-rgb),.08); }
        .st-fee-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; background:#fff; border:1px solid #e4dfd4; border-radius:4px; padding:6px 10px; font-size:10.5px; font-weight:700; cursor:pointer; font-family:inherit; color:#9090aa; min-width:92px; white-space:nowrap; }
        .st-fee-btn.fee { border-color:rgba(184,104,0,.35); background:#fff8ed; color:#b86800; }
        .st-fee-btn.free { border-color:rgba(26,122,74,.25); background:#f2fbf6; color:#1a7a4a; }
        .st-fee-btn:hover { border-color:currentColor; }
        .st-fee-btn:disabled { opacity:.45; cursor:not-allowed; }
        .st-fee-cell { display:flex; align-items:center; justify-content:center; min-width:0; }
        .st-fee-editor-amount { display:flex; align-items:stretch; width:100%; }
        .st-fee-label { display:block; margin-bottom:7px; font-size:10px; font-weight:700; color:#4a4a6a; letter-spacing:1px; text-transform:uppercase; }
        .st-fee-prefix { min-width:48px; padding:0 10px; display:flex; align-items:center; justify-content:center; border:1.5px solid #e4dfd4; border-right:none; border-radius:4px 0 0 4px; background:#f8f6f1; color:#7a6530; font-size:11px; font-weight:700; }
        .st-fee-amount-input { min-width:0; width:100%; height:40px; padding:8px 10px; border:1.5px solid #e4dfd4; border-radius:0 4px 4px 0; font-family:'Source Serif 4',serif; font-size:14px; color:#1a1a2e; background:#fff; outline:none; }
        .st-fee-amount-input:focus { border-color:var(--color-primary); background:rgba(var(--color-primary-rgb),.08); }
        .st-fee-modal-note { margin-top:9px; font-size:11px; color:#77758d; line-height:1.5; }
        .st-fee-free-btn { border:1px solid rgba(26,122,74,.28); background:#f2fbf6; color:#1a7a4a; border-radius:4px; padding:8px 12px; font-family:inherit; font-size:11px; font-weight:700; cursor:pointer; }
        .st-fee-free-btn:disabled { opacity:.45; cursor:not-allowed; }
        .st-cert-pager { padding:10px 22px; display:flex; align-items:center; justify-content:space-between; gap:12px; background:#f8f6f1; border-top:1px solid #e4dfd4; font-size:11px; color:#9090aa; flex-wrap:wrap; }
        .st-cert-pager-actions { display:flex; align-items:center; gap:8px; }
        .st-cert-page-btn { width:28px; height:28px; border:1px solid #e4dfd4; background:#fff; color:#4a4a6a; border-radius:4px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .st-cert-page-btn:disabled { opacity:.4; cursor:not-allowed; }
        .st-cert-page-pill { min-width:72px; height:28px; padding:0 10px; border:1px solid #e4dfd4; background:#fff; color:#4a4a6a; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; }

        /* CERT CHIP SELECTOR */
        .st-cert-chips { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:22px; }
        .st-cert-chip { padding:7px 16px; border-radius:20px; font-size:11.5px; font-weight:600; cursor:pointer; border:1.5px solid #e4dfd4; color:#4a4a6a; background:#fff; transition:all .15s; }
        .st-cert-chip:hover { border-color:var(--color-primary); color:var(--color-primary); }
        .st-cert-chip.active { background:var(--color-primary); color:#fff; border-color:var(--color-primary); }

        @media (max-width:767px) {
            .st-tabs { margin-bottom:22px; }
            .st-tab-btn { padding:10px 14px; }
            .st-branding-overview .st-panel-body { padding:16px; }
            .st-branding-overview-grid, .st-branding-overview-grid.single { grid-template-columns:1fr; }
            .st-theme-choice { grid-template-columns:minmax(0,1fr) auto; }
            .st-theme-check { display:none; }
            .st-theme-meta { white-space:normal; }
            .st-qr-content { grid-template-columns:1fr; }
            .st-qr-preview { min-height:auto; }
            .st-form-grid-2  { grid-template-columns:1fr; }
            .st-esig-grid    { grid-template-columns:1fr; }
            .st-cert-row     { grid-template-columns:1fr auto; gap:8px; }
            .st-cert-row > span:first-of-type, .st-cert-row > span:last-of-type { grid-column: auto; }
            .st-cert-toolbar { align-items:stretch; }
            .st-cert-search { min-width:100%; max-width:none; }
            .st-modal { width:95vw; }
        }
        `;
        document.head.appendChild(el);
    }, []);
}

const MAX_IMAGE_UPLOAD_BYTES = 2 * 1024 * 1024;
const CERT_TYPES_PER_PAGE = 8;
const SHOW_LEGACY_BRANDING_PREVIEW = false;

function getResidentPortalLoginUrl() {
    const raw =
        import.meta.env.VITE_APP_URL?.trim() ||
        "https://certifast-two.vercel.app";
    const base = raw.replace(/\/+$/, "");
    if (/\/resident\/login$/i.test(base)) return base;
    return `${base}/resident/login`;
}

const SIGNATORY_HELP_META = {
    captain: {
        title: "Punong Barangay (Captain)",
        note: "Templates where the Punong Barangay appears as the approving signatory.",
    },
    kagawad: {
        title: "Barangay Kagawad",
        note: "Templates that use the main Kagawad slot, usually beside or instead of the captain.",
    },
    kagawad1: {
        title: "Witness Kagawad 1",
        note: "Templates that place this Kagawad in a witness or Kagawad-only signature block.",
    },
    kagawad2: {
        title: "Witness Kagawad 2",
        note: "Templates that place this Kagawad in a witness or Kagawad-only signature block.",
    },
    kagawad3: {
        title: "Kagawad 3",
        note: "Templates that use the third Kagawad signature slot from Doc #2.",
    },
};

function dataUrlByteSize(dataUrl) {
    const base64 = String(dataUrl || "").split(",")[1] || "";
    return Math.floor((base64.length * 3) / 4);
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result || "");
        reader.onerror = () => reject(new Error("Failed to read image file"));
        reader.readAsDataURL(file);
    });
}

function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load image for optimization"));
        img.src = dataUrl;
    });
}

async function optimizeImageForSettings(file) {
    const originalDataUrl = await readFileAsDataUrl(file);
    if (dataUrlByteSize(originalDataUrl) <= MAX_IMAGE_UPLOAD_BYTES) {
        return originalDataUrl;
    }

    const img = await loadImage(originalDataUrl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return originalDataUrl;

    const maxDimension = 1800;
    const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
    let width = Math.max(1, Math.round(img.width * scale));
    let height = Math.max(1, Math.round(img.height * scale));

    canvas.width = width;
    canvas.height = height;

    const isPng = String(file.type || "").toLowerCase() === "image/png";
    const exportType = isPng ? "image/png" : "image/jpeg";
    let quality = 0.96;
    let bestDataUrl = originalDataUrl;

    for (let i = 0; i < 8; i += 1) {
        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const candidate = canvas.toDataURL(
            exportType,
            exportType === "image/jpeg" ? quality : undefined,
        );
        bestDataUrl = candidate;

        if (dataUrlByteSize(candidate) <= MAX_IMAGE_UPLOAD_BYTES) {
            return candidate;
        }

        quality = Math.max(0.84, quality - 0.04);
        width = Math.max(1, Math.round(width * 0.92));
        height = Math.max(1, Math.round(height * 0.92));
    }

    return bestDataUrl;
}

// ─── Cert types initial data ──────────────────────────────────
const INITIAL_CERT_TYPES = CERTIFICATE_TEMPLATE_OPTIONS.map((cert, index) => ({
    id: cert.templateKey || index + 1,
    templateId: null,
    templateKey: cert.templateKey || "",
    name: cert.name,
    desc: cert.desc,
    fee: cert.hasFee,
    feeAmount: normalizeFeeAmount(cert.feeAmount),
    active: true,
}));

const CERTIFICATE_TEMPLATE_SOURCE_INDEX = new Map(
    CERTIFICATE_TEMPLATE_OPTIONS.map((cert, index) => [
        cert.templateKey,
        index,
    ]),
);

function mapCertificateTemplate(template, index) {
    return {
        id: template.templateId || template.templateKey || `template-${index}`,
        templateId: template.templateId || null,
        templateKey: template.templateKey || "",
        name: template.name || "Certificate Template",
        desc: template.desc || template.description || "",
        fee: Boolean(template.hasFee ?? template.has_fee),
        feeAmount: normalizeFeeAmount(template.feeAmount ?? template.fee_amount),
        active: template.isActive !== false && template.is_active !== false,
        displayOrder:
            template.displayOrder ?? template.display_order ?? Number.MAX_SAFE_INTEGER,
    };
}

function sortCertificateTemplatesBySourceOrder(templates) {
    return [...templates].sort((left, right) => {
        const leftSourceIndex =
            CERTIFICATE_TEMPLATE_SOURCE_INDEX.get(left.templateKey) ??
            Number.MAX_SAFE_INTEGER;
        const rightSourceIndex =
            CERTIFICATE_TEMPLATE_SOURCE_INDEX.get(right.templateKey) ??
            Number.MAX_SAFE_INTEGER;

        if (leftSourceIndex !== rightSourceIndex) {
            return leftSourceIndex - rightSourceIndex;
        }
        if (left.displayOrder !== right.displayOrder) {
            return left.displayOrder - right.displayOrder;
        }
        return left.name.localeCompare(right.name);
    });
}

function normalizeFeeAmount(value) {
    if (value === null || value === undefined || value === "") return null;
    const parsed =
        typeof value === "number"
            ? value
            : Number.parseFloat(String(value).replace(/,/g, "").trim());
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return Math.round(parsed * 100) / 100;
}

function parseFeeAmountDraft(value) {
    if (value === null || value === undefined || value === "") {
        return { value: null };
    }
    const parsed = Number.parseFloat(String(value).replace(/,/g, "").trim());
    if (!Number.isFinite(parsed) || parsed < 0) {
        return { error: "Enter a valid non-negative fee amount." };
    }
    if (parsed > 99999999.99) {
        return { error: "Fee amount is too large." };
    }
    return { value: Math.round(parsed * 100) / 100 };
}

function formatFeeAmount(value) {
    const amount = normalizeFeeAmount(value);
    if (amount === null) return "";
    return amount.toFixed(2);
}

function formatPesoAmount(value) {
    const amount = normalizeFeeAmount(value);
    if (amount === null) return "";
    return `PHP ${amount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

const TEMPLATE_PREVIEW_BASE_DATA = {
    residentName: "Juan Dela Cruz",
    name: "Juan Dela Cruz",
    resident_name: "Juan Dela Cruz",
    prefix: "Mr.",
    age: "35",
    dateOfBirth: "1991-05-12",
    date_of_birth: "1991-05-12",
    civilStatus: "Single",
    civil_status: "Single",
    nationality: "Filipino",
    address: "Purok 8, Del Pilar Street",
    purpose: "Employment",
    businessName: "Dela Cruz Sari-Sari Store",
    businessType: "Retail",
    businessAddress: "14th Street, East Tapinac",
    businessArea: "24 sqm",
    partnerName: "Maria Santos",
    wardName: "Miguel Dela Cruz",
    relationship: "uncle",
    childName: "Miguel Dela Cruz",
    childDOB: "2024-02-14",
    fatherName: "Juan Dela Cruz",
    motherName: "Maria Dela Cruz",
    requestingInstitution: "City Employment Office",
    claimantName: "Juan Dela Cruz",
    claimantRelationship: "son",
    assistanceType: "medical assistance",
    issuedAt: new Date(),
};

function sampleValueForTemplateField(key) {
    const normalized = String(key || "").toLowerCase();
    if (normalized.includes("date") || normalized.includes("dob")) {
        return "2026-05-19";
    }
    if (normalized.includes("validuntil")) return "2026-12-31";
    if (normalized.includes("eventname")) {
        return "Mobile Legends Bang Bang Tournament 2025";
    }
    if (normalized.includes("eventorganizer")) {
        return "Sangguniang Kabataan of Barangay East Tapinac";
    }
    if (normalized.includes("eventpartner")) return "Community Heroes";
    if (normalized.includes("eventtime")) return "10 AM onwards";
    if (normalized.includes("eventvenue")) {
        return "Barangay East Tapinac Covered Court";
    }
    if (normalized.includes("businesspermitno")) return "ET-BPI-2026-1048";
    if (normalized.includes("age")) return "35";
    if (normalized.includes("gender")) return "Female";
    if (normalized.includes("amount")) return "5000";
    if (normalized.includes("area")) return "24 sqm";
    if (normalized.includes("monthlyincome")) return "P3,800";
    if (normalized.includes("occupation")) return "Purok Leader";
    if (normalized.includes("permittype")) return "Road Damage Permit";
    if (normalized.includes("businessstatusperiod")) {
        return "March 2020 to January 2021";
    }
    if (normalized.includes("businesspurpose")) return "Renewal Application";
    if (normalized.includes("businessownername")) return "Juan Dela Cruz";
    if (normalized.includes("businessname")) return "Dela Cruz Sari-Sari Store";
    if (normalized.includes("damagecause")) return "Fire Blaze";
    if (normalized.includes("damagetime")) return "9:30 P.M.";
    if (normalized.includes("nonresidentnames")) {
        return "Chaehun Bae\nYunghae Lee\nEunhwan Lee";
    }
    if (normalized.includes("companyname")) {
        return "Subic Water and Sewerage Co. Inc.";
    }
    if (normalized.includes("siblingname")) return "Mon-Andrei Monsalud";
    if (normalized.includes("childname")) return "Gerald Fresnido";
    if (normalized.includes("address")) return "Purok 8, Del Pilar Street";
    if (normalized.includes("business")) return "Dela Cruz Sari-Sari Store";
    if (normalized.includes("relationship")) return "son";
    if (normalized.includes("purpose")) return "Employment";
    if (normalized.includes("partner") || normalized.includes("spouse")) {
        return "Maria Santos";
    }
    if (normalized.includes("companiontwoname")) return "Keisha Dela Cruz";
    if (normalized.includes("companionname")) return "Mark Anthony Ramirez";
    if (normalized.includes("companionrole")) return "Driver";
    if (normalized.includes("companiontworole")) return "Passenger";
    if (normalized.includes("wardthreename")) return "Czyrine Bordios";
    if (normalized.includes("wardtwoname")) return "Keisha Bordios";
    if (normalized.includes("wardname")) return "Aleah Bordios";
    if (normalized.includes("boundarynorth")) return "ALN 167 Right of Way";
    if (normalized.includes("boundaryeast")) return "ALN 167";
    if (normalized.includes("boundarysouth")) return "ALN 016";
    if (normalized.includes("boundarywest")) return "ALN 013";
    if (normalized.includes("bordersize")) return "300 sqm";
    if (normalized.includes("name")) return "Juan Dela Cruz";
    return "Sample information";
}

function buildTemplatePreviewData(cert) {
    const fieldEntries = getTemplateFieldLabels(cert?.templateKey, cert?.name).map(
        (field) => [
            field.key,
            field.type === "checkbox"
                ? (field.defaultValue ?? true)
                : sampleValueForTemplateField(field.key),
        ],
    );
    const extraFields = {
        ...Object.fromEntries(fieldEntries),
        templateKey: cert?.templateKey || "",
    };

    return {
        ...TEMPLATE_PREVIEW_BASE_DATA,
        ...extraFields,
        certType: cert?.name || "Certificate Preview",
        templateKey: cert?.templateKey || "",
        extraFields,
    };
}

function TemplatePreviewModal({ cert, settings, onClose }) {
    const previewHtml = useMemo(() => {
        if (!cert) return "";
        return buildCertificatePrintHtml({
            cert,
            certType: cert.name,
            templateKey: cert.templateKey,
            data: buildTemplatePreviewData(cert),
            settings,
        });
    }, [cert, settings]);

    useEffect(() => {
        if (!cert) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [cert, onClose]);

    if (!cert) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(9, 18, 38, 0.58)",
                zIndex: 3000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: "min(1080px, 96vw)",
                    height: "min(880px, 92vh)",
                    background: "#fff",
                    borderRadius: 8,
                    overflow: "hidden",
                    boxShadow: "0 24px 70px rgba(0,0,0,.28)",
                    display: "flex",
                    flexDirection: "column",
                }}
                onClick={(event) => event.stopPropagation()}
            >
                <div
                    style={{
                        padding: "14px 18px",
                        background: "var(--color-primary)",
                        color: "#fff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <div style={{ minWidth: 0 }}>
                        <div
                            style={{
                                fontFamily: "'Playfair Display',serif",
                                fontSize: 15,
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {cert.name}
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "rgba(255,255,255,.66)",
                                marginTop: 2,
                            }}
                        >
                            Template preview uses sample data.
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            width: 32,
                            height: 32,
                            border: "1px solid rgba(255,255,255,.28)",
                            background: "rgba(255,255,255,.08)",
                            color: "#fff",
                            borderRadius: 4,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            flexShrink: 0,
                        }}
                        title="Close preview"
                    >
                        <X size={16} />
                    </button>
                </div>
                <iframe
                    title={`${cert.name} preview`}
                    srcDoc={previewHtml}
                    style={{
                        border: "none",
                        width: "100%",
                        flex: 1,
                        background: "#f4f2ed",
                    }}
                />
            </div>
        </div>
    );
}

// ─── Signature Block Sub-component ───────────────────────────
function SignatoryUsageModal({ slot, usage, onClose }) {
    if (!slot) return null;
    const meta = SIGNATORY_HELP_META[slot] || {
        title: "Signatory",
        note: "Templates that use this signatory slot.",
    };

    return (
        <div className="st-modal-overlay open" style={{ zIndex: 3200 }}>
            <div className="st-modal" style={{ width: 620, maxWidth: "95vw" }}>
                <div className="st-modal-header">
                    <div>
                        <div className="st-modal-title">{meta.title}</div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "rgba(255,255,255,.65)",
                                marginTop: 3,
                            }}
                        >
                            Certificate signature usage
                        </div>
                    </div>
                    <button className="st-modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <div className="st-modal-body">
                    <div className="st-usage-summary">
                        {meta.note} <strong>{usage.length}</strong>{" "}
                        {usage.length === 1 ? "template uses" : "templates use"} this slot.
                    </div>
                    <div className="st-usage-list">
                        {usage.length === 0 ? (
                            <div className="st-usage-item">
                                <div className="st-usage-name">No templates yet</div>
                                <div className="st-usage-desc">
                                    This signatory slot is configured but not currently used by a template layout.
                                </div>
                            </div>
                        ) : (
                            usage.map((item) => (
                                <div className="st-usage-item" key={item.templateKey}>
                                    <div className="st-usage-name">{item.name}</div>
                                    {item.desc && (
                                        <div className="st-usage-desc">{item.desc}</div>
                                    )}
                                    <div className="st-usage-key">{item.templateKey}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TemplateActionConfirmModal({ action, cert, onCancel, onConfirm }) {
    if (!action || !cert) return null;

    const isDisable = action.type === "disable";
    const title = isDisable
        ? "Disable Template?"
        : action.nextFee
          ? "Mark as With Fee?"
          : "Mark as Free?";
    const body = isDisable
        ? `${cert.name} will be hidden from resident certificate requests. Existing requests are not changed.`
        : action.nextFee
          ? `${cert.name} will tell residents that payment is required when claiming. You can set the exact amount after confirming.`
          : `${cert.name} will no longer show as fee-required to residents. Any saved amount is kept but hidden while the template is free.`;
    const confirmText = isDisable
        ? "Disable Template"
        : action.nextFee
          ? "Mark With Fee"
          : "Mark Free";

    return (
        <div className="st-modal-overlay open" style={{ zIndex: 3300 }}>
            <div className="st-modal" style={{ width: 460, maxWidth: "95vw" }}>
                <div className="st-modal-header">
                    <div className="st-modal-title">{title}</div>
                    <button className="st-modal-close" onClick={onCancel}>
                        <X size={18} />
                    </button>
                </div>
                <div className="st-modal-body">
                    <div
                        style={{
                            fontSize: 13,
                            color: "#1a1a2e",
                            lineHeight: 1.65,
                        }}
                    >
                        {body}
                    </div>
                    {action.type === "fee" && action.nextFee && !cert.feeAmount && (
                        <div
                            style={{
                                marginTop: 12,
                                padding: "10px 12px",
                                border: "1px solid #f5d78e",
                                background: "#fff8ed",
                                borderRadius: 5,
                                color: "#8a5200",
                                fontSize: 11.5,
                                lineHeight: 1.5,
                            }}
                        >
                            Tip: set the amount after confirming so residents
                            know exactly how much money to bring.
                        </div>
                    )}
                </div>
                <div className="st-modal-footer">
                    <button className="st-btn-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        className="st-btn-save"
                        onClick={onConfirm}
                        style={{
                            background: isDisable
                                ? "linear-gradient(135deg,#b02020,#7a0a0a)"
                                : undefined,
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

function FeeEditorModal({ cert, saving, onClose, onSave }) {
    const [amount, setAmount] = useState(() =>
        cert?.fee && cert?.feeAmount
            ? formatFeeAmount(cert.feeAmount)
            : "",
    );
    const [error, setError] = useState("");

    if (!cert) return null;

    const submitAmount = async (value) => {
        const parsed = parseFeeAmountDraft(value);
        if (parsed.error) {
            setError(parsed.error);
            return;
        }
        if (parsed.value === null) {
            setError("Enter a fee amount, or choose Set as Free.");
            return;
        }

        setError("");
        await onSave(parsed.value);
    };

    return (
        <div
            className="st-modal-overlay open"
            style={{ zIndex: 3400 }}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) onClose();
            }}
        >
            <div className="st-modal" style={{ width: 430, maxWidth: "95vw" }}>
                <div className="st-modal-header">
                    <div>
                        <div className="st-modal-title">Edit Certificate Fee</div>
                        <div
                            style={{
                                color: "rgba(255,255,255,.62)",
                                fontSize: 10.5,
                                marginTop: 2,
                            }}
                        >
                            {cert.name}
                        </div>
                    </div>
                    <button
                        className="st-modal-close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close fee editor"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="st-modal-body">
                    <label className="st-fee-label" htmlFor="certificate-fee">
                        Fee Amount
                    </label>
                    <div className="st-fee-editor-amount">
                        <span className="st-fee-prefix">PHP</span>
                        <input
                            id="certificate-fee"
                            type="number"
                            min="0"
                            step="0.01"
                            className="st-fee-amount-input"
                            value={amount}
                            onChange={(event) => {
                                setAmount(event.target.value);
                                setError("");
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    submitAmount(amount);
                                }
                            }}
                            placeholder="0.00"
                            disabled={saving}
                            autoFocus
                        />
                    </div>
                    <div className="st-fee-modal-note">
                        Entering <strong>0</strong> makes this certificate free.
                        Residents will see the saved amount before submitting.
                    </div>
                    {error && (
                        <div
                            style={{
                                marginTop: 10,
                                color: "#b02020",
                                fontSize: 11.5,
                            }}
                        >
                            {error}
                        </div>
                    )}
                </div>
                <div className="st-modal-footer">
                    <button
                        type="button"
                        className="st-fee-free-btn"
                        onClick={() => submitAmount(0)}
                        disabled={saving}
                    >
                        Set as Free
                    </button>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            type="button"
                            className="st-btn-cancel"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="st-btn-save"
                            onClick={() => submitAmount(amount)}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Fee"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SigBlock({ id, label, sublabel, sig, onSet, onClear, onDraw }) {
    const fileRef = useRef();
    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onSet(ev.target.result);
        reader.readAsDataURL(file);
    };
    return (
        <div className="st-esig-block">
            <div className="st-esig-label">
                {label}
                <span className={`st-esig-status ${sig ? "set" : "notset"}`}>
                    {sig ? "✓ Signature Set" : "● Not Set"}
                </span>
            </div>
            <div className="st-esig-sublabel">{sublabel}</div>
            <div className={`st-esig-wrap ${sig ? "has-sig" : ""}`}>
                {!sig && (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4,
                            pointerEvents: "none",
                        }}
                    >
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#ccc"
                            strokeWidth="1.5"
                        >
                            <path d="M12 19l7-7 3 3-7 7-3-3z" />
                            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                        </svg>
                        <span style={{ fontSize: 10, color: "#9090aa" }}>
                            No signature yet
                        </span>
                    </div>
                )}
                {sig && <img src={sig} alt="signature" />}
            </div>
            <div className="st-esig-actions">
                <button className="st-esig-btn draw" onClick={() => onDraw(id)}>
                    <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M12 19l7-7 3 3-7 7-3-3z" />
                        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                    </svg>
                    Draw Signature
                </button>
                <button
                    className="st-esig-btn upload"
                    onClick={() => fileRef.current.click()}
                >
                    <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <polyline points="16 16 12 12 8 16" />
                        <line x1="12" y1="12" x2="12" y2="21" />
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                    Upload Image
                </button>
                {sig && (
                    <button className="st-esig-btn clear" onClick={onClear}>
                        Clear
                    </button>
                )}
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    style={{ display: "none" }}
                    onChange={handleFile}
                />
            </div>
            <div style={{ fontSize: 10, color: "#9090aa" }}>
                Accepted: PNG/JPG with transparent background recommended.
            </div>
        </div>
    );
}

// ─── Draw Signature Modal ─────────────────────────────────────
function DrawModal({ open, onClose, onSave }) {
    const canvasRef = useRef();
    const drawing = useRef(false);
    const last = useRef([0, 0]);
    const [color, setColor] = useState("#0e2554");
    const [thickness, setThickness] = useState(2);

    const getPos = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const sx = canvas.width / rect.width;
        const sy = canvas.height / rect.height;
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        return [(cx - rect.left) * sx, (cy - rect.top) * sy];
    };

    const clearCanvas = () => {
        const c = canvasRef.current;
        if (c) c.getContext("2d").clearRect(0, 0, c.width, c.height);
    };

    const handleSave = () => {
        const dataUrl = canvasRef.current.toDataURL("image/png");
        onSave(dataUrl);
        onClose();
    };

    useEffect(() => {
        if (!open) return;
        clearCanvas();
    }, [open]);

    const startDraw = (e) => {
        e.preventDefault();
        drawing.current = true;
        last.current = getPos(e, canvasRef.current);
    };
    const draw = (e) => {
        e.preventDefault();
        if (!drawing.current) return;
        const ctx = canvasRef.current.getContext("2d");
        const [x, y] = getPos(e, canvasRef.current);
        ctx.beginPath();
        ctx.moveTo(last.current[0], last.current[1]);
        ctx.lineTo(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
        last.current = [x, y];
    };
    const stopDraw = () => {
        drawing.current = false;
    };

    if (!open) return null;

    return (
        <div className="st-modal-overlay open">
            <div className="st-modal">
                <div className="st-modal-header">
                    <div className="st-modal-title">Draw Your Signature</div>
                    <button className="st-modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <div className="st-modal-body">
                    <canvas
                        ref={canvasRef}
                        className="st-modal-canvas"
                        width={472}
                        height={180}
                        onMouseDown={startDraw}
                        onMouseMove={draw}
                        onMouseUp={stopDraw}
                        onMouseLeave={stopDraw}
                        onTouchStart={startDraw}
                        onTouchMove={draw}
                        onTouchEnd={stopDraw}
                    />
                    <div className="st-modal-hint">
                        Draw your signature above using your mouse or stylus.
                    </div>
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            marginTop: 14,
                            alignItems: "center",
                        }}
                    >
                        <label
                            style={{
                                fontSize: 11,
                                color: "#4a4a6a",
                                fontWeight: 600,
                            }}
                        >
                            Ink Color:
                        </label>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            style={{
                                width: 32,
                                height: 28,
                                border: "1px solid #e4dfd4",
                                borderRadius: 3,
                                cursor: "pointer",
                                padding: 2,
                            }}
                        />
                        <label
                            style={{
                                fontSize: 11,
                                color: "#4a4a6a",
                                fontWeight: 600,
                                marginLeft: 8,
                            }}
                        >
                            Thickness:
                        </label>
                        <input
                            type="range"
                            min={1}
                            max={5}
                            value={thickness}
                            onChange={(e) => setThickness(e.target.value)}
                            style={{ width: 80 }}
                        />
                        <button
                            onClick={clearCanvas}
                            style={{
                                marginLeft: "auto",
                                padding: "5px 14px",
                                background: "none",
                                border: "1.5px solid rgba(176,32,32,.3)",
                                color: "#b02020",
                                borderRadius: 3,
                                fontFamily: "inherit",
                                fontSize: 11,
                                cursor: "pointer",
                            }}
                        >
                            Clear Canvas
                        </button>
                    </div>
                </div>
                <div className="st-modal-footer">
                    <span style={{ fontSize: 11, color: "#9090aa" }}>
                        This will be saved as an image on your documents.
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: "8px 18px",
                                background: "none",
                                border: "1px solid #e4dfd4",
                                borderRadius: 4,
                                fontFamily: "inherit",
                                fontSize: 12,
                                cursor: "pointer",
                                color: "#4a4a6a",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            style={{
                                padding: "8px 22px",
                                background:
                                    "linear-gradient(135deg,var(--color-primary-soft),var(--color-primary-dark))",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                fontFamily: "'Playfair Display',serif",
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: 1,
                                cursor: "pointer",
                            }}
                        >
                            Use Signature
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────
export default function Settings({ admin, onNavigate, onLogout }) {
    useSettingsStyles();

    const role = String(admin?.role || "")
        .trim()
        .toLowerCase();
    const isSuperAdmin = role === "admin" || role === "superadmin";
    const canManageSystemTheme =
        role === "admin" || role === "superadmin";

    // layout
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const sidebarWidth = isMobile ? 0 : isTablet ? 60 : 240;
    const [showMobile, setShowMobile] = useState(false);
    const [activePage, setActivePage] = useState("settings");

    const handleNavigate = (key) => {
        if (!String(key).startsWith("/")) setActivePage(key);
        if (onNavigate) onNavigate(key);
    };

    // tabs
    const [activeTab, setActiveTab] = useState("branding");
    const [systemTheme, setSystemTheme] = useState("default");

    // branding – logos
    const [brgyLogo, setBrgyLogo] = useState(null);
    const [cityLogo, setCityLogo] = useState(null);
    const [bagongPilipinasLogo, setBagongPilipinasLogo] = useState(
        "/bagong-pilipinas-logo.png",
    );
    const brgyFileRef = useRef();
    const cityFileRef = useRef();
    const bagongPilipinasFileRef = useRef();
    const publicPortalQrRef = useRef(null);
    const residentPortalLoginUrl = getResidentPortalLoginUrl();

    const handleLogoUpload = async (e, setter) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const optimizedDataUrl = await optimizeImageForSettings(file);
            if (dataUrlByteSize(optimizedDataUrl) > MAX_IMAGE_UPLOAD_BYTES) {
                setMessage({
                    text: "Image is still too large after optimization. Please use a smaller image.",
                    type: "error",
                });
                return;
            }
            setter(optimizedDataUrl);
            setMessage({
                text: "Image optimized for upload.",
                type: "success",
            });
        } catch {
            setMessage({
                text: "Failed to process image. Please try another file.",
                type: "error",
            });
        }
    };

    // branding – barangay info
    const [brgyInfo, setBrgyInfo] = useState({
        name: "Barangay East Tapinac",
        city: "City of Olongapo",
        address: "54 - 14th Street corner Gallagher Street, Olongapo City",
        contact: "(047) 123-4567",
        email: "brgy.easttapinac@olongapo.gov.ph",
        passwordResetEmail: "it-admin@easttapinac.gov.ph",
    });
    const [officeSchedule, setOfficeSchedule] = useState(
        DEFAULT_OFFICE_SCHEDULE,
    );
    const updateOfficeSchedule = (index, key, value) => {
        setOfficeSchedule((prev) =>
            prev.map((row, rowIndex) =>
                rowIndex === index ? { ...row, [key]: value } : row,
            ),
        );
    };
    const handleDownloadPublicPortalQr = () => {
        const canvas = publicPortalQrRef.current?.querySelector("canvas");
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = "CertiFast Resident Portal QR.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    // branding – officials / e-signatures
    const [officials, setOfficials] = useState({
        captainName: "Hon. Dante L. Hondo",
        captainTitle: "Punong Barangay",
        kagawadName: "Hon. Jojo D. De Leon",
        kagawadTitle: "Barangay Kagawad",
        kagawad1Name: "Hon. Crisanta D. Daniel",
        kagawad1Title: "Barangay Kagawad",
        kagawad2Name: "Hon. Florencia S. Abad",
        kagawad2Title: "Barangay Kagawad",
        kagawad3Name: "Hon. Andrea A. Austria",
        kagawad3Title: "Barangay Kagawad",
        secondaryName: "",
        secondaryTitle: "",
    });
    const [sig1, setSig1] = useState(null);
    const [sig2, setSig2] = useState(null);
    const [drawModal, setDrawModal] = useState({ open: false, target: null });
    const [templatePreviewCert, setTemplatePreviewCert] = useState(null);
    const [, setPersonnelRoster] = useState(null);
    const [signatoryHelpSlot, setSignatoryHelpSlot] = useState(null);
    const signatoryUsage = useMemo(() => getSignatoryTemplateUsage(), []);
    const templatePreviewSettings = useMemo(
        () => ({
            brgy_name: brgyInfo.name,
            brgy_city: brgyInfo.city,
            brgy_address: brgyInfo.address,
            brgy_contact: brgyInfo.contact,
            brgy_email: brgyInfo.email,
            brgy_logo_url: brgyLogo || "",
            city_logo_url: cityLogo || "",
            bagong_pilipinas_logo_url: bagongPilipinasLogo || "",
            captain_name: officials.captainName,
            captain_title: officials.captainTitle,
            kagawad_name: officials.kagawadName,
            kagawad_title: officials.kagawadTitle,
            kagawad_1_name: officials.kagawad1Name,
            kagawad_1_title: officials.kagawad1Title,
            kagawad_2_name: officials.kagawad2Name,
            kagawad_2_title: officials.kagawad2Title,
            kagawad_3_name: officials.kagawad3Name,
            kagawad_3_title: officials.kagawad3Title,
            secondary_name: officials.secondaryName,
            secondary_title: officials.secondaryTitle,
            captain_sig_base64: sig1 || "",
            secondary_sig_base64: sig2 || "",
        }),
        [
            brgyInfo,
            brgyLogo,
            cityLogo,
            bagongPilipinasLogo,
            officials,
            sig1,
            sig2,
        ],
    );

    // cert types
    const [certTypes, setCertTypes] = useState(INITIAL_CERT_TYPES);
    const [certSearch, setCertSearch] = useState("");
    const [certPage, setCertPage] = useState(1);
    const [certTemplatesLoading, setCertTemplatesLoading] = useState(false);
    const [savingTemplateId, setSavingTemplateId] = useState(null);
    const [templateAction, setTemplateAction] = useState(null);
    const [feeEditorCertId, setFeeEditorCertId] = useState(null);

    const updateCertType = async (id, changes) => {
        const current = certTypes.find((c) => c.id === id);
        if (!current) return false;
        const next = { ...current, ...changes };

        setCertTypes((prev) =>
            prev.map((c) => (c.id === id ? next : c)),
        );

        if (!current.templateId) return true;

        setSavingTemplateId(id);
        try {
            const token = localStorage.getItem("adminToken");
            const payload = {};
            if (Object.prototype.hasOwnProperty.call(changes, "fee")) {
                payload.hasFee = next.fee;
            }
            if (Object.prototype.hasOwnProperty.call(changes, "active")) {
                payload.isActive = next.active;
            }
            if (Object.prototype.hasOwnProperty.call(changes, "feeAmount")) {
                payload.feeAmount = normalizeFeeAmount(next.feeAmount);
            }
            await settingsService.updateCertificateTemplate(
                current.templateId,
                payload,
                token,
            );
            setMessage({
                text: "Certificate template updated.",
                type: "success",
            });
            return true;
        } catch (err) {
            setCertTypes((prev) =>
                prev.map((c) => (c.id === id ? current : c)),
            );
            setMessage({
                text: err.message || "Failed to update certificate template",
                type: "error",
            });
            return false;
        } finally {
            setSavingTemplateId(null);
        }
    };

    const toggleCert = (id) => {
        const current = certTypes.find((c) => c.id === id);
        if (!current) return;
        if (current.active) {
            setTemplateAction({ type: "disable", certId: id });
            return;
        }
        updateCertType(id, { active: !current.active });
    };

    const confirmTemplateAction = () => {
        const action = templateAction;
        setTemplateAction(null);
        if (!action) return;

        if (action.type === "disable") {
            updateCertType(action.certId, { active: false });
        }
    };

    const saveFeeEditor = async (amount) => {
        if (!feeEditorCertId) return;
        const normalizedAmount = normalizeFeeAmount(amount) ?? 0;
        const saved = await updateCertType(feeEditorCertId, {
            fee: normalizedAmount > 0,
            feeAmount: normalizedAmount,
        });
        if (saved) setFeeEditorCertId(null);
    };

    // loading, errors, and messages
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({
        text: "",
        type: "success",
    });

    // Load settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const token = localStorage.getItem("adminToken");
                const data = await settingsService.getBarangaySettings(token);

                // Map DB settings to UI state
                const loadedTheme = normalizeSystemTheme(data.system_theme);
                setSystemTheme(loadedTheme);
                applySystemTheme(loadedTheme);
                cacheSystemTheme(loadedTheme);

                if (data.brgy_name)
                    setBrgyInfo((prev) => ({ ...prev, name: data.brgy_name }));
                if (data.brgy_city)
                    setBrgyInfo((prev) => ({ ...prev, city: data.brgy_city }));
                if (data.brgy_address)
                    setBrgyInfo((prev) => ({
                        ...prev,
                        address: data.brgy_address,
                    }));
                if (data.brgy_contact)
                    setBrgyInfo((prev) => ({
                        ...prev,
                        contact: data.brgy_contact,
                    }));
                if (data.brgy_email)
                    setBrgyInfo((prev) => ({
                        ...prev,
                        email: data.brgy_email,
                    }));
                if (data.password_reset_email)
                    setBrgyInfo((prev) => ({
                        ...prev,
                        passwordResetEmail: data.password_reset_email,
                    }));

                if (data.brgy_logo_url) setBrgyLogo(data.brgy_logo_url);
                if (data.city_logo_url) setCityLogo(data.city_logo_url);
                if (data.bagong_pilipinas_logo_url)
                    setBagongPilipinasLogo(data.bagong_pilipinas_logo_url);

                setOfficeSchedule(
                    DEFAULT_OFFICE_SCHEDULE.map((row, index) => {
                        const line = index + 1;
                        return {
                            label:
                                data[`office_schedule_line_${line}_label`] ||
                                row.label,
                            time:
                                data[`office_schedule_line_${line}_time`] ||
                                row.time,
                        };
                    }),
                );

                if (data.captain_name)
                    setOfficials((prev) => ({
                        ...prev,
                        captainName: data.captain_name,
                    }));
                if (data.captain_title)
                    setOfficials((prev) => ({
                        ...prev,
                        captainTitle: data.captain_title,
                    }));
                if (data.kagawad_name)
                    setOfficials((prev) => ({
                        ...prev,
                        kagawadName: data.kagawad_name,
                    }));
                if (data.kagawad_title)
                    setOfficials((prev) => ({
                        ...prev,
                        kagawadTitle: data.kagawad_title,
                    }));
                if (data.kagawad_1_name)
                    setOfficials((prev) => ({
                        ...prev,
                        kagawad1Name: data.kagawad_1_name,
                    }));
                if (data.kagawad_1_title)
                    setOfficials((prev) => ({
                        ...prev,
                        kagawad1Title: data.kagawad_1_title,
                    }));
                if (data.kagawad_2_name)
                    setOfficials((prev) => ({
                        ...prev,
                        kagawad2Name: data.kagawad_2_name,
                    }));
                if (data.kagawad_2_title)
                    setOfficials((prev) => ({
                        ...prev,
                        kagawad2Title: data.kagawad_2_title,
                    }));
                if (data.kagawad_3_name)
                    setOfficials((prev) => ({
                        ...prev,
                        kagawad3Name: data.kagawad_3_name,
                    }));
                if (data.kagawad_3_title)
                    setOfficials((prev) => ({
                        ...prev,
                        kagawad3Title: data.kagawad_3_title,
                    }));
                if (data.secondary_name)
                    setOfficials((prev) => ({
                        ...prev,
                        secondaryName: data.secondary_name,
                    }));
                if (data.secondary_title)
                    setOfficials((prev) => ({
                        ...prev,
                        secondaryTitle: data.secondary_title,
                    }));

                if (data.captain_sig_base64) setSig1(data.captain_sig_base64);
                if (data.secondary_sig_base64)
                    setSig2(data.secondary_sig_base64);
            } catch (err) {
                console.error("Failed to load settings:", err);
            }
        };

        loadSettings();
    }, []);

    useEffect(() => {
        let mounted = true;
        personnelService
            .getPersonnelRoster()
            .then((result) => {
                if (mounted) setPersonnelRoster(result);
            })
            .catch(() => {
                if (mounted) setPersonnelRoster(null);
            });
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;
        const loadCertificateTemplates = async () => {
            setCertTemplatesLoading(true);
            try {
                const token = localStorage.getItem("adminToken");
                const data = await settingsService.getCertificateTemplates(token, {
                    includeInactive: true,
                });
                if (mounted && Array.isArray(data) && data.length > 0) {
                    setCertTypes(
                        sortCertificateTemplatesBySourceOrder(
                            data.map(mapCertificateTemplate),
                        ),
                    );
                }
            } catch (err) {
                console.error("Failed to load certificate templates:", err);
            } finally {
                if (mounted) setCertTemplatesLoading(false);
            }
        };

        loadCertificateTemplates();
        return () => {
            mounted = false;
        };
    }, []);

    const filteredCertTypes = useMemo(() => {
        const term = certSearch.trim().toLowerCase();
        if (!term) return certTypes;
        return certTypes.filter((cert) => {
            const haystack = [
                cert.name,
                cert.desc,
                cert.templateKey,
                cert.fee ? "fee with fee paid" : "free no fee",
                cert.feeAmount ? formatPesoAmount(cert.feeAmount) : "",
                cert.active ? "active enabled" : "inactive disabled",
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return haystack.includes(term);
        });
    }, [certSearch, certTypes]);

    const certTotalPages = Math.max(
        1,
        Math.ceil(filteredCertTypes.length / CERT_TYPES_PER_PAGE),
    );
    const paginatedCertTypes = useMemo(
        () =>
            filteredCertTypes.slice(
                (certPage - 1) * CERT_TYPES_PER_PAGE,
                certPage * CERT_TYPES_PER_PAGE,
            ),
        [certPage, filteredCertTypes],
    );
    const certShowingStart = filteredCertTypes.length
        ? (certPage - 1) * CERT_TYPES_PER_PAGE + 1
        : 0;
    const certShowingEnd = Math.min(
        certPage * CERT_TYPES_PER_PAGE,
        filteredCertTypes.length,
    );

    useEffect(() => {
        setCertPage(1);
    }, [certSearch]);

    useEffect(() => {
        setCertPage((page) => Math.min(page, certTotalPages));
    }, [certTotalPages]);

    // Save branding settings
    const handleSaveBranding = async () => {
        setLoading(true);
        setMessage({ text: "", type: "success" });
        try {
            const token = localStorage.getItem("adminToken");
            const settings = {
                brgy_name: brgyInfo.name,
                brgy_city: brgyInfo.city,
                brgy_address: brgyInfo.address,
                brgy_contact: brgyInfo.contact,
                brgy_email: brgyInfo.email,
                password_reset_email: brgyInfo.passwordResetEmail,
                brgy_logo_url: brgyLogo || "",
                city_logo_url: cityLogo || "",
                bagong_pilipinas_logo_url: bagongPilipinasLogo || "",
            };
            officeSchedule.forEach((row, index) => {
                const line = index + 1;
                settings[`office_schedule_line_${line}_label`] = row.label;
                settings[`office_schedule_line_${line}_time`] = row.time;
            });

            await settingsService.updateBarangaySettings(settings, token);
            setMessage({
                text: "Branding and office schedule updated successfully!",
                type: "success",
            });
        } catch (err) {
            setMessage({
                text: err.message || "Failed to save branding",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTheme = async () => {
        setLoading(true);
        setMessage({ text: "", type: "success" });
        try {
            const token = localStorage.getItem("adminToken");
            const nextTheme = normalizeSystemTheme(systemTheme);
            await settingsService.updateBarangaySettings(
                { system_theme: nextTheme },
                token,
            );
            applySystemTheme(nextTheme);
            cacheSystemTheme(nextTheme);
            setSystemTheme(nextTheme);
            setMessage({
                text: "System theme updated successfully!",
                type: "success",
            });
        } catch (err) {
            setMessage({
                text: err.message || "Failed to save system theme",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    // Save officials settings
    const handleSaveOfficials = async () => {
        setLoading(true);
        setMessage({ text: "", type: "success" });
        try {
            const token = localStorage.getItem("adminToken");
            const settings = {
                captain_name: officials.captainName,
                captain_title: officials.captainTitle,
                kagawad_name: officials.kagawadName,
                kagawad_title: officials.kagawadTitle,
                kagawad_1_name: officials.kagawad1Name,
                kagawad_1_title: officials.kagawad1Title,
                kagawad_2_name: officials.kagawad2Name,
                kagawad_2_title: officials.kagawad2Title,
                kagawad_3_name: officials.kagawad3Name,
                kagawad_3_title: officials.kagawad3Title,
                secondary_name: officials.secondaryName,
                secondary_title: officials.secondaryTitle,
                captain_sig_base64: sig1 || "",
                secondary_sig_base64: sig2 || "",
            };

            await settingsService.updateBarangaySettings(settings, token);
            setMessage({
                text: "Officials updated successfully!",
                type: "success",
            });
        } catch (err) {
            setMessage({
                text: err.message || "Failed to save officials",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    // cert template editor

    const templateActionCert = templateAction
        ? certTypes.find((cert) => cert.id === templateAction.certId)
        : null;
    const feeEditorCert = feeEditorCertId
        ? certTypes.find((cert) => cert.id === feeEditorCertId)
        : null;

    if (!isSuperAdmin) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "#f8f6f1",
                    padding: "32px",
                }}
            >
                <div
                    style={{
                        background: "#fff",
                        border: "1px solid #e4dfd4",
                        borderRadius: 6,
                        padding: 20,
                        maxWidth: 720,
                        margin: "0 auto",
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontFamily: "'Playfair Display',serif",
                            fontSize: 20,
                            color: "var(--color-primary)",
                        }}
                    >
                        Restricted Access
                    </h2>
                    <p style={{ margin: "10px 0 0", color: "#4a4a6a" }}>
                        This section is restricted to Superadmin accounts only.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="st-body"
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#f8f6f1",
            }}
        >
            {/* Sidebar */}
            {!isMobile && (
                <AdminSidebar
                    admin={admin}
                    activePage={activePage}
                    onNavigate={handleNavigate}
                    onLogout={onLogout}
                    collapsed={isTablet}
                />
            )}
            {isMobile && showMobile && (
                <AdminMobileSidebar
                    admin={admin}
                    activePage={activePage}
                    onNavigate={handleNavigate}
                    onClose={() => setShowMobile(false)}
                    onLogout={onLogout}
                />
            )}

            {/* Main */}
            <div
                style={{
                    marginLeft: sidebarWidth,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Topbar */}
                <div
                    style={{
                        height: 62,
                        background: "#fff",
                        borderBottom: "1px solid #e4dfd4",
                        display: "flex",
                        alignItems: "center",
                        padding: "0 32px",
                        gap: 16,
                        position: "sticky",
                        top: 0,
                        zIndex: 50,
                        boxShadow: "0 1px 6px rgba(0,0,0,.06)",
                    }}
                >
                    {isMobile && (
                        <button
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#4a4a6a",
                                padding: 4,
                            }}
                            onClick={() => setShowMobile(true)}
                        >
                            <Menu size={20} />
                        </button>
                    )}
                    <div
                        style={{
                            fontFamily: "'Playfair Display',serif",
                            fontSize: isMobile ? 16 : 18,
                            fontWeight: 700,
                            color: "var(--color-primary)",
                            flex: 1,
                        }}
                    >
                        System Settings
                        {!isMobile && (
                            <span
                                style={{
                                    fontSize: 12,
                                    fontFamily: "'Source Serif 4',serif",
                                    color: "#9090aa",
                                    fontWeight: 400,
                                    marginLeft: 10,
                                }}
                            >
                                Admin only · Barangay configuration
                            </span>
                        )}
                    </div>
                    <AdminNotificationsBell
                        admin={admin}
                        onNavigate={handleNavigate}
                        onLogout={onLogout}
                    />
                    {!isMobile && <AdminDateChip compact={isTablet} />}
                </div>

                {/* Content */}
                <div
                    style={{
                        padding: isMobile ? "16px" : "28px 32px",
                        flex: 1,
                    }}
                >
                    {/* TABS */}
                    <div className="st-tabs">
                        <button
                            className={`st-tab-btn${activeTab === "branding" ? " active" : ""}`}
                            onClick={() => setActiveTab("branding")}
                        >
                            <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32" />
                            </svg>
                            Barangay Branding
                        </button>
                        <button
                            className={`st-tab-btn${activeTab === "personnel" ? " active" : ""}`}
                            onClick={() => setActiveTab("personnel")}
                        >
                            <UsersRound size={13} />
                            Personnel &amp; Terms
                        </button>
                        <button
                            className={`st-tab-btn${activeTab === "publicExperience" ? " active" : ""}`}
                            onClick={() => setActiveTab("publicExperience")}
                        >
                            <Palette size={13} />
                            Public Experience
                        </button>
                        <button
                            className={`st-tab-btn${activeTab === "templates" ? " active" : ""}`}
                            onClick={() => setActiveTab("templates")}
                        >
                            <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                            Certificate Templates
                        </button>
                    </div>

                    {/* Message Display */}
                    {message.text && (
                        <div
                            style={{
                                padding: "12px 16px",
                                borderRadius: 4,
                                marginBottom: 16,
                                background:
                                    message.type === "error"
                                        ? "#fef2f2"
                                        : "#f0fdf4",
                                border:
                                    message.type === "error"
                                        ? "1px solid #fecaca"
                                        : "1px solid #bbf7d0",
                                color:
                                    message.type === "error"
                                        ? "#dc2626"
                                        : "#16a34a",
                                fontSize: 13,
                                fontFamily: "'Source Serif 4',serif",
                            }}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* ══ TAB: BRANDING ══ */}
                    {activeTab === "publicExperience" && (
                        <>
                            <div className="st-panel st-branding-overview">
                                <div className="st-panel-header">
                                    <div>
                                        <div className="st-panel-title">
                                            Public Experience
                                        </div>
                                        <div className="st-panel-desc">
                                            App colors and resident portal access
                                            used by the public-facing CertiFast
                                            surfaces.
                                        </div>
                                    </div>
                                </div>
                                <div className="st-panel-body">
                                    <div
                                        className={`st-branding-overview-grid${
                                            canManageSystemTheme ? "" : " single"
                                        }`}
                                    >
                                        {canManageSystemTheme && (
                                            <section className="st-config-card">
                                                <div className="st-config-card-header">
                                                    <div className="st-config-icon">
                                                        <Palette size={17} />
                                                    </div>
                                                    <div>
                                                        <div className="st-config-title">
                                                            System Theme
                                                        </div>
                                                        <div className="st-config-desc">
                                                            Choose the color pair
                                                            used across admin and
                                                            resident navigation.
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="st-theme-list">
                                                    {Object.entries(
                                                        SYSTEM_THEMES,
                                                    ).map(([key, theme]) => {
                                                        const active =
                                                            systemTheme === key;
                                                        return (
                                                            <button
                                                                key={key}
                                                                type="button"
                                                                className={`st-theme-choice${
                                                                    active
                                                                        ? " active"
                                                                        : ""
                                                                }`}
                                                                aria-pressed={
                                                                    active
                                                                }
                                                                onClick={() =>
                                                                    setSystemTheme(
                                                                        key,
                                                                    )
                                                                }
                                                            >
                                                                <span>
                                                                    <span className="st-theme-name">
                                                                        {
                                                                            theme.label
                                                                        }
                                                                    </span>
                                                                    <span className="st-theme-meta">
                                                                        {
                                                                            theme.primary
                                                                        }{" "}
                                                                        /{" "}
                                                                        {
                                                                            theme.accent
                                                                        }
                                                                    </span>
                                                                </span>
                                                                <span className="st-theme-swatches">
                                                                    <span
                                                                        className="st-theme-swatch"
                                                                        style={{
                                                                            background:
                                                                                theme.primary,
                                                                        }}
                                                                    />
                                                                    <span
                                                                        className="st-theme-swatch"
                                                                        style={{
                                                                            background:
                                                                                theme.accent,
                                                                        }}
                                                                    />
                                                                </span>
                                                                <CheckCircle2 className="st-theme-check" />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <div className="st-config-footer">
                                                    <span className="st-config-footer-note">
                                                        Theme updates after save.
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="st-btn-save st-btn-save-compact"
                                                        onClick={
                                                            handleSaveTheme
                                                        }
                                                        disabled={loading}
                                                    >
                                                        {loading
                                                            ? "Saving..."
                                                            : "Save Theme"}
                                                    </button>
                                                </div>
                                            </section>
                                        )}

                                        <section className="st-config-card">
                                            <div className="st-config-card-header">
                                                <div className="st-config-icon">
                                                    <QrCode size={18} />
                                                </div>
                                                <div>
                                                    <div className="st-config-title">
                                                        Resident Login Page
                                                    </div>
                                                    <div className="st-config-desc">
                                                        Downloadable QR for
                                                        public signage and lobby
                                                        posters.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="st-qr-content">
                                                <div
                                                    ref={publicPortalQrRef}
                                                    className="st-qr-preview"
                                                >
                                                    <QRCodeCanvas
                                                        value={
                                                            residentPortalLoginUrl
                                                        }
                                                        size={
                                                            isMobile ? 160 : 176
                                                        }
                                                        level="H"
                                                        includeMargin
                                                        fgColor={
                                                            SYSTEM_THEMES[
                                                                systemTheme
                                                            ].primary
                                                        }
                                                        bgColor="#ffffff"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="st-url-chip">
                                                        {residentPortalLoginUrl}
                                                    </div>
                                                    <div className="st-qr-note">
                                                        Public login shortcut
                                                        only. Resident identity
                                                        QR codes remain separate.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="st-config-footer">
                                                <span className="st-config-footer-note">
                                                    Ready for print or digital
                                                    display.
                                                </span>
                                                <button
                                                    type="button"
                                                    className="st-secondary-action"
                                                    onClick={
                                                        handleDownloadPublicPortalQr
                                                    }
                                                >
                                                    <Download size={14} />
                                                    Save PNG
                                                </button>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>

                        </>
                    )}

                    {activeTab === "personnel" && (
                        <BarangayPersonnelManager
                            onRosterChange={setPersonnelRoster}
                        />
                    )}

                    {/* TAB: BRANDING */}
                    {activeTab === "branding" && (
                        <>

                            {/* SEALS & LOGOS */}
                            <div className="st-panel">
                                <div className="st-panel-header">
                                    <div>
                                        <div className="st-panel-title">
                                            Seals &amp; Logos
                                        </div>
                                        <div className="st-panel-desc">
                                            The city and barangay seals appear
                                            on all generated certificates. The
                                            Bagong Pilipinas logo appears only
                                            on BRGY.CERT# 3 templates.
                                        </div>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            isMobile || isTablet
                                            ? "1fr"
                                            : "repeat(3, minmax(0, 1fr))",
                                        borderBottom: "1px solid #e4dfd4",
                                    }}
                                >
                                    {/* City Seal */}
                                    <div
                                        style={{
                                            padding: 24,
                                            borderRight:
                                                isMobile || isTablet
                                                ? "none"
                                                : "1px solid #e4dfd4",
                                            borderBottom:
                                                isMobile || isTablet
                                                ? "1px solid #e4dfd4"
                                                : "none",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "10.5px",
                                                fontWeight: 600,
                                                color: "#4a4a6a",
                                                letterSpacing: "1.2px",
                                                textTransform: "uppercase",
                                                marginBottom: 14,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    width: 10,
                                                    height: 10,
                                                    background:
                                                        "var(--color-accent)",
                                                    borderRadius: 2,
                                                }}
                                            />
                                            City / Municipal Seal - Top Left
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 24,
                                            }}
                                        >
                                            <div className="st-logo-preview">
                                                {cityLogo ? (
                                                    <img
                                                        src={cityLogo}
                                                        alt="City Seal"
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            flexDirection:
                                                                "column",
                                                            alignItems:
                                                                "center",
                                                            gap: 4,
                                                            color: "#9090aa",
                                                        }}
                                                    >
                                                        <svg
                                                            width="28"
                                                            height="28"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="#ccc"
                                                            strokeWidth="1.5"
                                                        >
                                                            <rect
                                                                x="3"
                                                                y="3"
                                                                width="18"
                                                                height="18"
                                                                rx="2"
                                                            />
                                                            <circle
                                                                cx="8.5"
                                                                cy="8.5"
                                                                r="1.5"
                                                            />
                                                            <polyline points="21 15 16 10 5 21" />
                                                        </svg>
                                                        <span
                                                            style={{
                                                                fontSize: 9,
                                                                letterSpacing: 1,
                                                                textTransform:
                                                                    "uppercase",
                                                            }}
                                                        >
                                                            No Seal
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: "#1a1a2e",
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    City / Municipal Seal
                                                </h4>
                                                <p
                                                    style={{
                                                        fontSize: "11.5px",
                                                        color: "#9090aa",
                                                        lineHeight: 1.6,
                                                        marginBottom: 12,
                                                    }}
                                                >
                                                    Appears on the left side of
                                                    generated certificates and
                                                    permits.
                                                    <br />
                                                    PNG/JPG/SVG · 300×300px ·
                                                    Max 2MB
                                                </p>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 8,
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    <button
                                                        className="st-upload-btn"
                                                        onClick={() =>
                                                            cityFileRef.current.click()
                                                        }
                                                    >
                                                        <Upload size={13} />
                                                        Upload
                                                    </button>
                                                    {cityLogo && (
                                                        <button
                                                            className="st-upload-btn-secondary"
                                                            onClick={() =>
                                                                setCityLogo(
                                                                    null,
                                                                )
                                                            }
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                    <input
                                                        ref={cityFileRef}
                                                        type="file"
                                                        accept="image/*"
                                                        style={{
                                                            display: "none",
                                                        }}
                                                        onChange={(e) =>
                                                            handleLogoUpload(
                                                                e,
                                                                setCityLogo,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bagong Pilipinas Logo */}
                                    <div
                                        style={{
                                            padding: 24,
                                            borderRight:
                                                isMobile || isTablet
                                                ? "none"
                                                : "1px solid #e4dfd4",
                                            borderBottom:
                                                isMobile || isTablet
                                                ? "1px solid #e4dfd4"
                                                : "none",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "10.5px",
                                                fontWeight: 600,
                                                color: "#4a4a6a",
                                                letterSpacing: "1.2px",
                                                textTransform: "uppercase",
                                                marginBottom: 14,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    width: 10,
                                                    height: 10,
                                                    background: "#1d4ed8",
                                                    borderRadius: 2,
                                                }}
                                            />
                                            Bagong Pilipinas - DOC #3 Header
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 24,
                                            }}
                                        >
                                            <div
                                                className="st-logo-preview"
                                                style={{
                                                    borderRadius: 10,
                                                    borderStyle:
                                                        bagongPilipinasLogo
                                                            ? "solid"
                                                            : "dashed",
                                                }}
                                            >
                                                {bagongPilipinasLogo ? (
                                                    <img
                                                        src={
                                                            bagongPilipinasLogo
                                                        }
                                                        alt="Bagong Pilipinas Logo"
                                                        style={{
                                                            borderRadius: 0,
                                                            objectFit:
                                                                "contain",
                                                        }}
                                                    />
                                                ) : (
                                                    <span
                                                        style={{
                                                            color: "#9090aa",
                                                            fontSize: 9,
                                                            letterSpacing: 1,
                                                            textTransform:
                                                                "uppercase",
                                                            textAlign:
                                                                "center",
                                                        }}
                                                    >
                                                        No Logo
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: "#1a1a2e",
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    Bagong Pilipinas Logo
                                                </h4>
                                                <p
                                                    style={{
                                                        fontSize: "11.5px",
                                                        color: "#9090aa",
                                                        lineHeight: 1.6,
                                                        marginBottom: 12,
                                                    }}
                                                >
                                                    Appears beside the city seal
                                                    only on certificates from
                                                    BRGY.CERT# 3.
                                                    <br />
                                                    PNG/JPG/SVG · Transparent
                                                    background recommended · Max
                                                    2MB
                                                </p>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 8,
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    <button
                                                        className="st-upload-btn"
                                                        onClick={() =>
                                                            bagongPilipinasFileRef.current.click()
                                                        }
                                                    >
                                                        <Upload size={13} />
                                                        Upload
                                                    </button>
                                                    {bagongPilipinasLogo !==
                                                        "/bagong-pilipinas-logo.png" && (
                                                        <button
                                                            className="st-upload-btn-secondary"
                                                            onClick={() =>
                                                                setBagongPilipinasLogo(
                                                                    "/bagong-pilipinas-logo.png",
                                                                )
                                                            }
                                                        >
                                                            Use Default
                                                        </button>
                                                    )}
                                                    <input
                                                        ref={
                                                            bagongPilipinasFileRef
                                                        }
                                                        type="file"
                                                        accept="image/*"
                                                        style={{
                                                            display: "none",
                                                        }}
                                                        onChange={(e) =>
                                                            handleLogoUpload(
                                                                e,
                                                                setBagongPilipinasLogo,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Barangay Seal */}
                                    <div style={{ padding: 24 }}>
                                        <div
                                            style={{
                                                fontSize: "10.5px",
                                                fontWeight: 600,
                                                color: "#4a4a6a",
                                                letterSpacing: "1.2px",
                                                textTransform: "uppercase",
                                                marginBottom: 14,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    width: 10,
                                                    height: 10,
                                                    background:
                                                        "var(--color-primary)",
                                                    borderRadius: 2,
                                                }}
                                            />
                                            Barangay Seal - Top Right
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 24,
                                            }}
                                        >
                                            <div
                                                className="st-logo-preview"
                                                style={{
                                                    borderStyle: brgyLogo
                                                        ? "solid"
                                                        : "dashed",
                                                }}
                                            >
                                                {brgyLogo ? (
                                                    <img
                                                        src={brgyLogo}
                                                        alt="Barangay Seal"
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            flexDirection:
                                                                "column",
                                                            alignItems:
                                                                "center",
                                                            gap: 4,
                                                            color: "#9090aa",
                                                        }}
                                                    >
                                                        <svg
                                                            width="28"
                                                            height="28"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="#ccc"
                                                            strokeWidth="1.5"
                                                        >
                                                            <rect
                                                                x="3"
                                                                y="3"
                                                                width="18"
                                                                height="18"
                                                                rx="2"
                                                            />
                                                            <circle
                                                                cx="8.5"
                                                                cy="8.5"
                                                                r="1.5"
                                                            />
                                                            <polyline points="21 15 16 10 5 21" />
                                                        </svg>
                                                        <span
                                                            style={{
                                                                fontSize: 9,
                                                                letterSpacing: 1,
                                                                textTransform:
                                                                    "uppercase",
                                                            }}
                                                        >
                                                            No Seal
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: "#1a1a2e",
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    Barangay Seal
                                                </h4>
                                                <p
                                                    style={{
                                                        fontSize: "11.5px",
                                                        color: "#9090aa",
                                                        lineHeight: 1.6,
                                                        marginBottom: 12,
                                                    }}
                                                >
                                                    Appears on login page,
                                                    sidebar, and the right side
                                                    of generated certificates.
                                                    <br />
                                                    PNG/JPG/SVG · 300×300px ·
                                                    Max 2MB
                                                </p>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 8,
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    <button
                                                        className="st-upload-btn"
                                                        onClick={() =>
                                                            brgyFileRef.current.click()
                                                        }
                                                    >
                                                        <Upload size={13} />
                                                        Upload
                                                    </button>
                                                    {brgyLogo && (
                                                        <button
                                                            className="st-upload-btn-secondary"
                                                            onClick={() =>
                                                                setBrgyLogo(
                                                                    null,
                                                                )
                                                            }
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                    <input
                                                        ref={brgyFileRef}
                                                        type="file"
                                                        accept="image/*"
                                                        style={{
                                                            display: "none",
                                                        }}
                                                        onChange={(e) =>
                                                            handleLogoUpload(
                                                                e,
                                                                setBrgyLogo,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {SHOW_LEGACY_BRANDING_PREVIEW && (
                                    <div
                                        style={{
                                            padding: "20px 24px",
                                            background: "#f8f6f1",
                                        }}
                                    >
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: "#9090aa",
                                            letterSpacing: 1,
                                            textTransform: "uppercase",
                                            fontWeight: 600,
                                            marginBottom: 12,
                                        }}
                                    >
                                        Certificate Layout Preview
                                    </div>
                                    <div
                                        style={{
                                            background: "#fff",
                                            border: "1px solid #e4dfd4",
                                            borderRadius: 4,
                                            overflow: "hidden",
                                            fontFamily:
                                                "'Source Serif 4',serif",
                                        }}
                                    >
                                        {/* Header */}
                                        <div
                                            style={{
                                                padding: "18px 28px 14px",
                                                display: "grid",
                                                gridTemplateColumns:
                                                    "72px 1fr 72px",
                                                alignItems: "center",
                                                gap: 12,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 68,
                                                    height: 68,
                                                    borderRadius: "50%",
                                                    border: "1.5px solid #e4dfd4",
                                                    overflow: "hidden",
                                                    background: "#f8f6f1",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {cityLogo ? (
                                                    <img
                                                        src={cityLogo}
                                                        style={{
                                                            width: 66,
                                                            height: 66,
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                        }}
                                                        alt=""
                                                    />
                                                ) : (
                                                    <svg
                                                        width="20"
                                                        height="20"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#ccc"
                                                        strokeWidth="1.5"
                                                    >
                                                        <rect
                                                            x="3"
                                                            y="3"
                                                            width="18"
                                                            height="18"
                                                            rx="2"
                                                        />
                                                        <circle
                                                            cx="8.5"
                                                            cy="8.5"
                                                            r="1.5"
                                                        />
                                                        <polyline points="21 15 16 10 5 21" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div
                                                style={{ textAlign: "center" }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 8,
                                                        color: "#9090aa",
                                                        letterSpacing: 2,
                                                        textTransform:
                                                            "uppercase",
                                                        marginBottom: 2,
                                                    }}
                                                >
                                                    Republic of the Philippines
                                                </div>
                                                <div
                                                    style={{
                                                        fontFamily:
                                                            "'Playfair Display',serif",
                                                        fontSize: 14,
                                                        fontWeight: 700,
                                                        color: "var(--color-primary)",
                                                        lineHeight: 1.2,
                                                    }}
                                                >
                                                    {brgyInfo.name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 9,
                                                        color: "#4a4a6a",
                                                        marginTop: 1,
                                                    }}
                                                >
                                                    {brgyInfo.city}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 8,
                                                        fontWeight: 700,
                                                        color: "#4a4a6a",
                                                        letterSpacing: 1,
                                                        textTransform:
                                                            "uppercase",
                                                        marginTop: 5,
                                                    }}
                                                >
                                                    Office of the Punong
                                                    Barangay
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    width: 68,
                                                    height: 68,
                                                    borderRadius: "50%",
                                                    border: "1.5px dashed #e4dfd4",
                                                    overflow: "hidden",
                                                    background: "#f8f6f1",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                    marginLeft: "auto",
                                                }}
                                            >
                                                {brgyLogo ? (
                                                    <img
                                                        src={brgyLogo}
                                                        style={{
                                                            width: 66,
                                                            height: 66,
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                        }}
                                                        alt=""
                                                    />
                                                ) : (
                                                    <svg
                                                        width="20"
                                                        height="20"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#ccc"
                                                        strokeWidth="1.5"
                                                    >
                                                        <rect
                                                            x="3"
                                                            y="3"
                                                            width="18"
                                                            height="18"
                                                            rx="2"
                                                        />
                                                        <circle
                                                            cx="8.5"
                                                            cy="8.5"
                                                            r="1.5"
                                                        />
                                                        <polyline points="21 15 16 10 5 21" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                height: 3,
                                                background: "#c0392b",
                                            }}
                                        />
                                        <div
                                            style={{
                                                height: 2,
                                                background:
                                                    "var(--color-accent)",
                                            }}
                                        />
                                        <div
                                            style={{
                                                padding: "20px 32px",
                                                minHeight: 60,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    color: "#ccc",
                                                    fontSize: 11,
                                                    fontStyle: "italic",
                                                }}
                                            >
                                                — Certificate content goes here
                                                —
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                height: 2,
                                                background:
                                                    "var(--color-accent)",
                                            }}
                                        />
                                        <div
                                            style={{
                                                height: 3,
                                                background: "#c0392b",
                                            }}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: "#9090aa",
                                            marginTop: 8,
                                            textAlign: "center",
                                        }}
                                    >
                                        This header appears on every generated
                                        certificate and permit.
                                    </div>
                                    </div>
                                )}
                            </div>

                            {/* BARANGAY INFO */}
                            <div className="st-panel">
                                <div className="st-panel-header">
                                    <div>
                                        <div className="st-panel-title">
                                            Barangay Information
                                        </div>
                                        <div className="st-panel-desc">
                                            Displayed on certificates, permits,
                                            and system headers.
                                        </div>
                                    </div>
                                </div>
                                <div className="st-panel-body">
                                    <div
                                        className="st-form-grid-2"
                                        style={{ marginBottom: 18 }}
                                    >
                                        <div className="st-field">
                                            <label>
                                                Barangay Name{" "}
                                                <span className="req">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={brgyInfo.name}
                                                onChange={(e) =>
                                                    setBrgyInfo({
                                                        ...brgyInfo,
                                                        name: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="st-field">
                                            <label>
                                                City / Municipality{" "}
                                                <span className="req">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={brgyInfo.city}
                                                onChange={(e) =>
                                                    setBrgyInfo({
                                                        ...brgyInfo,
                                                        city: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div
                                        className="st-form-grid-1"
                                        style={{ marginBottom: 18 }}
                                    >
                                        <div className="st-field">
                                            <label>
                                                Full Address{" "}
                                                <span className="req">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={brgyInfo.address}
                                                onChange={(e) =>
                                                    setBrgyInfo({
                                                        ...brgyInfo,
                                                        address: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="st-form-grid-2">
                                        <div className="st-field">
                                            <label>Contact Number</label>
                                            <input
                                                type="text"
                                                value={brgyInfo.contact}
                                                onChange={(e) =>
                                                    setBrgyInfo({
                                                        ...brgyInfo,
                                                        contact: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="st-field">
                                            <label>Email Address</label>
                                            <input
                                                type="email"
                                                value={brgyInfo.email}
                                                onChange={(e) =>
                                                    setBrgyInfo({
                                                        ...brgyInfo,
                                                        email: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="st-field">
                                            <label>
                                                Admin Password Reset Email
                                            </label>
                                            <input
                                                type="email"
                                                value={
                                                    brgyInfo.passwordResetEmail
                                                }
                                                onChange={(e) =>
                                                    setBrgyInfo({
                                                        ...brgyInfo,
                                                        passwordResetEmail:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="it-admin@easttapinac.gov.ph"
                                            />
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    color: "#9090aa",
                                                    marginTop: 4,
                                                }}
                                            >
                                                Shown in the Admin Login
                                                password-reset instructions.
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            borderTop: "1px solid #e4dfd4",
                                            marginTop: 22,
                                            paddingTop: 22,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: 14,
                                                alignItems: "flex-start",
                                                marginBottom: 14,
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <div>
                                                <div className="st-panel-title">
                                                    Office Schedule
                                                </div>
                                                <div className="st-panel-desc">
                                                    Resident-facing office hours
                                                    and pickup address.
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#9090aa",
                                                    lineHeight: 1.5,
                                                    textAlign: "right",
                                                }}
                                            >
                                                Address uses the Full Address
                                                field above.
                                            </div>
                                        </div>
                                        {officeSchedule.map((row, index) => (
                                            <div
                                                key={`office-schedule-${index}`}
                                                className="st-form-grid-2"
                                                style={{
                                                    marginBottom:
                                                        index ===
                                                        officeSchedule.length - 1
                                                            ? 0
                                                            : 12,
                                                }}
                                            >
                                                <div className="st-field">
                                                    <label>
                                                        Schedule Row {index + 1}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={row.label}
                                                        onChange={(e) =>
                                                            updateOfficeSchedule(
                                                                index,
                                                                "label",
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Mon - Thu"
                                                    />
                                                </div>
                                                <div className="st-field">
                                                    <label>Hours / Status</label>
                                                    <input
                                                        type="text"
                                                        value={row.time}
                                                        onChange={(e) =>
                                                            updateOfficeSchedule(
                                                                index,
                                                                "time",
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="8:00 AM - 5:00 PM"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="st-save-bar">
                                    <p>
                                        <strong>Note:</strong> Changes will
                                        reflect on all new certificates
                                        immediately.
                                    </p>
                                    <div>
                                        <button
                                            className="st-btn-cancel"
                                            onClick={() => {
                                                setBrgyInfo({
                                                    name: "Barangay East Tapinac",
                                                    city: "City of Olongapo",
                                                    address:
                                                        "54 - 14th Street corner Gallagher Street, Olongapo City",
                                                    contact: "(047) 123-4567",
                                                    email: "brgy.easttapinac@olongapo.gov.ph",
                                                    passwordResetEmail:
                                                        "it-admin@easttapinac.gov.ph",
                                                });
                                                setOfficeSchedule(
                                                    DEFAULT_OFFICE_SCHEDULE,
                                                );
                                                setBrgyLogo(null);
                                                setCityLogo(null);
                                                setBagongPilipinasLogo(
                                                    "/bagong-pilipinas-logo.png",
                                                );
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="st-btn-save"
                                            onClick={handleSaveBranding}
                                            disabled={loading}
                                        >
                                            <svg
                                                width="13"
                                                height="13"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                                <polyline points="17 21 17 13 7 13 7 21" />
                                                <polyline points="7 3 7 8 15 8" />
                                            </svg>
                                            {loading
                                                ? "Saving..."
                                                : "Save Branding & Schedule"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* SIGNATORY OFFICIALS */}
                            <div className="st-panel" style={{ display: "none" }}>
                                <div className="st-panel-header">
                                    <div>
                                        <div className="st-panel-title">
                                            Signatory Officials
                                        </div>
                                        <div className="st-panel-desc">
                                            Names that appear on the signature
                                            block of all issued documents.
                                        </div>
                                    </div>
                                </div>
                                <div className="st-panel-body">
                                    <div
                                        className="st-form-grid-2"
                                        style={{ marginBottom: 18 }}
                                    >
                                        <div className="st-field">
                                            <label>
                                                <span className="st-label-with-help">
                                                    <span>
                                                        Punong Barangay (Captain){" "}
                                                        <span className="req">*</span>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="st-help-btn"
                                                        title="Show certificate usage"
                                                        onClick={() =>
                                                            setSignatoryHelpSlot("captain")
                                                        }
                                                    >
                                                        <HelpCircle size={12} />
                                                    </button>
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={officials.captainName}
                                                onChange={(e) =>
                                                    setOfficials({
                                                        ...officials,
                                                        captainName:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="st-field">
                                            <label>Captain's Title</label>
                                            <input
                                                type="text"
                                                value={officials.captainTitle}
                                                onChange={(e) =>
                                                    setOfficials({
                                                        ...officials,
                                                        captainTitle:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div
                                        className="st-form-grid-2"
                                        style={{ marginBottom: 18 }}
                                    >
                                        <div className="st-field">
                                            <label>
                                                <span className="st-label-with-help">
                                                    <span>Barangay Kagawad</span>
                                                    <button
                                                        type="button"
                                                        className="st-help-btn"
                                                        title="Show certificate usage"
                                                        onClick={() =>
                                                            setSignatoryHelpSlot("kagawad")
                                                        }
                                                    >
                                                        <HelpCircle size={12} />
                                                    </button>
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={officials.kagawadName}
                                                onChange={(e) =>
                                                    setOfficials({
                                                        ...officials,
                                                        kagawadName:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="st-field">
                                            <label>Kagawad Title</label>
                                            <input
                                                type="text"
                                                value={officials.kagawadTitle}
                                                onChange={(e) =>
                                                    setOfficials({
                                                        ...officials,
                                                        kagawadTitle:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="st-field">
                                            <label>
                                                <span className="st-label-with-help">
                                                    <span>Witness Kagawad 1</span>
                                                    <button
                                                        type="button"
                                                        className="st-help-btn"
                                                        title="Show certificate usage"
                                                        onClick={() =>
                                                            setSignatoryHelpSlot("kagawad1")
                                                        }
                                                    >
                                                        <HelpCircle size={12} />
                                                    </button>
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={officials.kagawad1Name}
                                                onChange={(e) =>
                                                    setOfficials({
                                                        ...officials,
                                                        kagawad1Name:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="st-field">
                                            <label>
                                                <span className="st-label-with-help">
                                                    <span>Witness Kagawad 2</span>
                                                    <button
                                                        type="button"
                                                        className="st-help-btn"
                                                        title="Show certificate usage"
                                                        onClick={() =>
                                                            setSignatoryHelpSlot("kagawad2")
                                                        }
                                                    >
                                                        <HelpCircle size={12} />
                                                    </button>
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={officials.kagawad2Name}
                                                onChange={(e) =>
                                                    setOfficials({
                                                        ...officials,
                                                        kagawad2Name:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="st-field">
                                            <label>
                                                <span className="st-label-with-help">
                                                    <span>Kagawad 3</span>
                                                    <button
                                                        type="button"
                                                        className="st-help-btn"
                                                        title="Show certificate usage"
                                                        onClick={() =>
                                                            setSignatoryHelpSlot("kagawad3")
                                                        }
                                                    >
                                                        <HelpCircle size={12} />
                                                    </button>
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={officials.kagawad3Name}
                                                onChange={(e) =>
                                                    setOfficials({
                                                        ...officials,
                                                        kagawad3Name:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="st-field">
                                            <label>Kagawad 3 Title</label>
                                            <input
                                                type="text"
                                                value={officials.kagawad3Title}
                                                onChange={(e) =>
                                                    setOfficials({
                                                        ...officials,
                                                        kagawad3Title:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="st-form-grid-2">
                                        <div className="st-field">
                                            <label>
                                                Secondary Signatory (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={officials.secondaryName}
                                                onChange={(e) =>
                                                    setOfficials({
                                                        ...officials,
                                                        secondaryName:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="e.g. Barangay Secretary"
                                            />
                                        </div>
                                        <div className="st-field">
                                            <label>
                                                Secondary Signatory Title
                                            </label>
                                            <input
                                                type="text"
                                                value={officials.secondaryTitle}
                                                onChange={(e) =>
                                                    setOfficials({
                                                        ...officials,
                                                        secondaryTitle:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="e.g. Barangay Secretary"
                                            />
                                        </div>
                                    </div>

                                    {/* E-Signatures */}
                                    <div className="st-esig-grid">
                                        <SigBlock
                                            id="esig1"
                                            label="E-Signature — Punong Barangay"
                                            sublabel="Appears above the captain's name on all certificates."
                                            sig={sig1}
                                            onSet={setSig1}
                                            onClear={() => setSig1(null)}
                                            onDraw={(id) =>
                                                setDrawModal({
                                                    open: true,
                                                    target: id,
                                                })
                                            }
                                        />
                                        <SigBlock
                                            id="esig2"
                                            label="E-Signature — Secondary (Optional)"
                                            sublabel="Only shown if a secondary signatory is set above."
                                            sig={sig2}
                                            onSet={setSig2}
                                            onClear={() => setSig2(null)}
                                            onDraw={(id) =>
                                                setDrawModal({
                                                    open: true,
                                                    target: id,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="st-save-bar">
                                    <p>
                                        <strong>Note:</strong> Signatory names
                                        and e-signatures appear on the signature
                                        block of all documents.
                                    </p>
                                    <div>
                                        <button
                                            className="st-btn-cancel"
                                            onClick={() => {
                                                setOfficials({
                                                    captainName:
                                                        "Hon. Dante L. Hondo",
                                                    captainTitle:
                                                        "Punong Barangay",
                                                    kagawadName:
                                                        "Hon. Jojo D. De Leon",
                                                    kagawadTitle:
                                                        "Barangay Kagawad",
                                                    kagawad1Name:
                                                        "Hon. Crisanta D. Daniel",
                                                    kagawad1Title:
                                                        "Barangay Kagawad",
                                                    kagawad2Name:
                                                        "Hon. Florencia S. Abad",
                                                    kagawad2Title:
                                                        "Barangay Kagawad",
                                                    kagawad3Name:
                                                        "Hon. Andrea A. Austria",
                                                    kagawad3Title:
                                                        "Barangay Kagawad",
                                                    secondaryName: "",
                                                    secondaryTitle: "",
                                                });
                                                setSig1(null);
                                                setSig2(null);
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="st-btn-save"
                                            onClick={handleSaveOfficials}
                                            disabled={loading}
                                        >
                                            <svg
                                                width="13"
                                                height="13"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                                <polyline points="17 21 17 13 7 13 7 21" />
                                                <polyline points="7 3 7 8 15 8" />
                                            </svg>
                                            {loading
                                                ? "Saving..."
                                                : "Save Officials"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ══ TAB: TEMPLATES ══ */}
                    {activeTab === "templates" && (
                        <>
                            {/* CERT TYPES TABLE */}
                            <div
                                className="st-panel"
                                style={{
                                    marginBottom: 20,
                                    borderColor: "#d4c8f0",
                                }}
                            >
                                <div
                                    className="st-panel-header"
                                    style={{
                                        background:
                                            "linear-gradient(135deg,#f3eeff,#ede8ff)",
                                        borderBottomColor: "#d4c8f0",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 28,
                                                height: 28,
                                                background: "#6a3db8",
                                                borderRadius: 5,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="white"
                                                strokeWidth="2"
                                            >
                                                <rect
                                                    x="3"
                                                    y="11"
                                                    width="18"
                                                    height="11"
                                                    rx="2"
                                                />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div
                                                className="st-panel-title"
                                                style={{
                                                    color: "#4a1fa8",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                }}
                                            >
                                                Certificate &amp; Permit Types
                                                <span
                                                    style={{
                                                        fontSize: 9,
                                                        fontWeight: 700,
                                                        background:
                                                            "rgba(var(--color-accent-rgb),.2)",
                                                        color: "var(--color-accent)",
                                                        border: "1px solid rgba(var(--color-accent-rgb),.35)",
                                                        borderRadius: 10,
                                                        padding: "1px 8px",
                                                        letterSpacing: 1,
                                                    }}
                                                >
                                                    ADMIN ONLY
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#7a5ab8",
                                                    marginTop: 2,
                                                }}
                                            >
                                                Templates are loaded from
                                                Supabase. Set which certificates
                                                are free, fee-based, and how
                                                much residents should bring.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="st-cert-toolbar">
                                    <div className="st-cert-search">
                                        <Search size={14} />
                                        <input
                                            type="text"
                                            value={certSearch}
                                            onChange={(e) =>
                                                setCertSearch(e.target.value)
                                            }
                                            placeholder="Search certificate templates..."
                                        />
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: "#9090aa",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {certTemplatesLoading
                                            ? "Loading templates..."
                                            : `${filteredCertTypes.length} of ${certTypes.length} templates`}
                                    </div>
                                </div>

                                <div style={{ overflowX: "auto" }}>
                                    {/* Table header */}
                                    <div
                                        className="st-cert-table-header"
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "minmax(220px,1fr) 150px 100px 210px",
                                            gap: 10,
                                            background: "#f8f6f1",
                                            borderBottom: "1px solid #e4dfd4",
                                            padding: "9px 22px",
                                        }}
                                    >
                                        {[
                                            "Certificate / Permit Name",
                                            "Fee / Amount",
                                            "Status",
                                            "Action",
                                        ].map((h) => (
                                            <span
                                                key={h}
                                                style={{
                                                    fontSize: "9.5px",
                                                    fontWeight: 600,
                                                    color: "#9090aa",
                                                    letterSpacing: 1,
                                                    textTransform: "uppercase",
                                                }}
                                            >
                                                {h}
                                            </span>
                                        ))}
                                    </div>
                                    {paginatedCertTypes.length === 0 && (
                                        <div
                                            style={{
                                                padding: "24px 22px",
                                                color: "#9090aa",
                                                fontSize: 12,
                                                textAlign: "center",
                                            }}
                                        >
                                            No certificate templates found.
                                        </div>
                                    )}
                                    {paginatedCertTypes.map((ct) => (
                                        <div
                                            key={ct.id}
                                            className="st-cert-row"
                                            style={{
                                                opacity: ct.active ? 1 : 0.55,
                                            }}
                                        >
                                            <div>
                                                <div className="st-cert-name">
                                                    {ct.name}
                                                </div>
                                                <div className="st-cert-desc">
                                                    {ct.desc}
                                                </div>
                                            </div>
                                            <div className="st-fee-cell">
                                                <button
                                                    type="button"
                                                    className={`st-fee-btn ${
                                                        ct.fee ? "fee" : "free"
                                                    }`}
                                                    onClick={() =>
                                                        setFeeEditorCertId(ct.id)
                                                    }
                                                    disabled={
                                                        savingTemplateId ===
                                                        ct.id
                                                    }
                                                    title={`Edit fee for ${ct.name}`}
                                                >
                                                    {savingTemplateId === ct.id
                                                        ? "Saving..."
                                                        : ct.fee
                                                          ? formatPesoAmount(
                                                                ct.feeAmount,
                                                            ) || "Edit fee"
                                                          : "Free"}
                                                    {savingTemplateId !==
                                                        ct.id && (
                                                        <Pencil size={11} />
                                                    )}
                                                </button>
                                            </div>
                                            <span
                                                className={
                                                    ct.active
                                                        ? "st-badge-active"
                                                        : "st-badge-inactive"
                                                }
                                            >
                                                {ct.active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                            <div className="st-cert-actions">
                                                <button
                                                    type="button"
                                                    className="st-view-btn"
                                                    onClick={() =>
                                                        setTemplatePreviewCert(ct)
                                                    }
                                                    title="View template preview"
                                                >
                                                    <Eye size={12} />
                                                    View Template
                                                </button>
                                                <button
                                                    className="st-toggle-btn"
                                                    style={{
                                                        color: ct.active
                                                            ? "#9090aa"
                                                            : "#1a7a4a",
                                                    }}
                                                    onClick={() =>
                                                        toggleCert(ct.id)
                                                    }
                                                    disabled={
                                                        savingTemplateId === ct.id
                                                    }
                                                >
                                                    {savingTemplateId === ct.id
                                                        ? "Saving"
                                                        : ct.active
                                                          ? "Disable"
                                                          : "Enable"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="st-cert-pager">
                                    <span>
                                        Showing {certShowingStart}-
                                        {certShowingEnd} of{" "}
                                        {filteredCertTypes.length} templates.
                                        Fee, amount, and active status save to
                                        Supabase.
                                    </span>
                                    <div className="st-cert-pager-actions">
                                        <button
                                            type="button"
                                            className="st-cert-page-btn"
                                            onClick={() =>
                                                setCertPage((page) =>
                                                    Math.max(1, page - 1),
                                                )
                                            }
                                            disabled={certPage <= 1}
                                            title="Previous page"
                                        >
                                            <ChevronLeft size={14} />
                                        </button>
                                        <span className="st-cert-page-pill">
                                            {certPage} / {certTotalPages}
                                        </span>
                                        <button
                                            type="button"
                                            className="st-cert-page-btn"
                                            onClick={() =>
                                                setCertPage((page) =>
                                                    Math.min(
                                                        certTotalPages,
                                                        page + 1,
                                                    ),
                                                )
                                            }
                                            disabled={
                                                certPage >= certTotalPages
                                            }
                                            title="Next page"
                                        >
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Draw Signature Modal */}
            <DrawModal
                open={drawModal.open}
                onClose={() => setDrawModal({ open: false, target: null })}
                onSave={(dataUrl) => {
                    if (drawModal.target === "esig1") setSig1(dataUrl);
                    if (drawModal.target === "esig2") setSig2(dataUrl);
                }}
            />
            <TemplatePreviewModal
                cert={templatePreviewCert}
                settings={templatePreviewSettings}
                onClose={() => setTemplatePreviewCert(null)}
            />
            <SignatoryUsageModal
                slot={signatoryHelpSlot}
                usage={signatoryUsage[signatoryHelpSlot] || []}
                onClose={() => setSignatoryHelpSlot(null)}
            />
            <TemplateActionConfirmModal
                action={templateAction}
                cert={templateActionCert}
                onCancel={() => setTemplateAction(null)}
                onConfirm={confirmTemplateAction}
            />
            <FeeEditorModal
                key={feeEditorCert?.id || "fee-editor"}
                cert={feeEditorCert}
                saving={savingTemplateId === feeEditorCertId}
                onClose={() => {
                    if (savingTemplateId !== feeEditorCertId) {
                        setFeeEditorCertId(null);
                    }
                }}
                onSave={saveFeeEditor}
            />
        </div>
    );
}
