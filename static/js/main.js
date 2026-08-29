// MailFlow Client JavaScript Application (Stateless)
const STORAGE_KEY = 'mailflow_config';

// -------------------------------------------------------------
// TOAST NOTIFICATIONS
// -------------------------------------------------------------
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// -------------------------------------------------------------
// LOCAL STORAGE CONFIGURATION MANAGER
// -------------------------------------------------------------
function loadLocalSmtpConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load local config:", e);
  }
  return null;
}

function saveLocalSmtpConfig(config, rememberPassword = false) {
  try {
    const dataToSave = { ...config };
    if (!rememberPassword) {
      delete dataToSave.password; // Do not persist password if unchecked
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    showToast("✓ Configuration saved to browser storage", "success");
  } catch (e) {
    showToast("Failed to save configuration", "danger");
  }
}

function clearLocalSmtpConfig() {
  localStorage.removeItem(STORAGE_KEY);
  showToast("✓ Saved configuration cleared from browser", "info");
}

// -------------------------------------------------------------
// SMTP PRESETS
// -------------------------------------------------------------
const SMTP_PRESETS = {
  gmail: { host: 'smtp.gmail.com', port: 465, security: 'SSL' },
  google_workspace: { host: 'smtp.gmail.com', port: 465, security: 'SSL' },
  outlook: { host: 'smtp.office365.com', port: 587, security: 'STARTTLS' },
  yahoo: { host: 'smtp.mail.yahoo.com', port: 465, security: 'SSL' },
  custom: { host: '', port: 465, security: 'SSL' }
};

function applySmtpPreset(presetName) {
  const preset = SMTP_PRESETS[presetName];
  if (!preset) return;
  
  const hostEl = document.getElementById('smtp_host');
  const portEl = document.getElementById('smtp_port');
  const secEl = document.getElementById('security');
  
  if (hostEl && preset.host) hostEl.value = preset.host;
  if (portEl) portEl.value = preset.port;
  if (secEl) secEl.value = preset.security;
}

// -------------------------------------------------------------
// VARIABLE CHIP INSERTION AT CURSOR
// -------------------------------------------------------------
function insertVariableAtCursor(fieldId, varName) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  const textToInsert = `{{ ${varName} }}`;
  const start = field.selectionStart || 0;
  const end = field.selectionEnd || 0;
  const val = field.value;

  field.value = val.substring(0, start) + textToInsert + val.substring(end);
  field.selectionStart = field.selectionEnd = start + textToInsert.length;
  field.focus();
}

// Global state for campaign creation wizard
window.MailFlowState = {
  smtpConfig: null,
  csvData: null,
  recipients: [],
  headers: [],
  subject: '',
  body: '',
  isHtml: false,
  speed: 'normal',
  customRate: 30
};
