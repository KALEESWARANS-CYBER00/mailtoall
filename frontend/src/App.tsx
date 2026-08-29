import { useState, useEffect } from 'react';
import { RippleGrid } from './RippleGrid';
import {
  Send,
  Settings,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  XCircle,
  Download,
  Sparkles,
  Laptop,
  Smartphone,
  Upload,
  Code,
  RefreshCw,
  Sliders,
  Shield,
  Check,
  ChevronRight,
  Terminal,
  Trash2,
  Inbox,
  UserCheck,
  TreePine,
  FileSpreadsheet,
  Save,
  Filter
} from 'lucide-react';

// Production Ready HTML Templates with Warm Neutral Woodland Styling & Dynamic Variables
const PRODUCTION_TEMPLATES = [
  {
    id: 'blank',
    name: '📄 Clean / Blank Canvas',
    subject: '',
    html: `<div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a2a30; color: #f2ede7; border-radius: 12px; padding: 30px; border: 1px solid #b76935;">
  <h2 style="color: #b76935; margin-top: 0;">Hello {{name}},</h2>
  <p style="color: #c5b8a8; font-size: 15px; line-height: 1.6;">
    Type your custom message content here...
  </p>
  <div style="margin-top: 24px; text-align: center;">
    <a href="https://yourwebsite.com" style="background: linear-gradient(135deg, #935e38, #b76935); color: #111e24; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; display: inline-block;">
      Call to Action &rarr;
    </a>
  </div>
</div>`
  },
  {
    id: 'newsletter',
    name: '🌿 Professional Announcement / Newsletter',
    subject: 'Important Update from {{company}}',
    html: `<div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a2a30; color: #f2ede7; border-radius: 14px; border: 1px solid #b76935; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
  <div style="border-bottom: 2px solid #935e38; padding-bottom: 15px; margin-bottom: 20px;">
    <h2 style="color: #b76935; margin: 0; font-size: 24px;">Dear {{name}},</h2>
    <span style="color: #c5b8a8; font-size: 13px;">Exclusive Briefing for {{company}}</span>
  </div>
  <p style="color: #c5b8a8; font-size: 15px; line-height: 1.7;">
    We are pleased to share our latest product updates and operational insights specifically tailored for your team at <strong>{{company}}</strong>.
  </p>
  <div style="background: rgba(183, 105, 53, 0.12); border-left: 4px solid #b76935; padding: 16px; margin: 24px 0; border-radius: 6px;">
    <p style="margin: 0; color: #f2ede7; font-weight: bold;">Executive Summary:</p>
    <p style="margin: 6px 0 0 0; color: #7a9e7e;">Enhance deliverability and drive engagement with personalized outreach.</p>
  </div>
  <a href="https://yourwebsite.com" style="display: inline-block; background: linear-gradient(135deg, #935e38, #b76935); color: #111e24; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 800; margin-top: 10px; box-shadow: 0 4px 15px rgba(183, 105, 53, 0.3);">
    View Full Document &rarr;
  </a>
  <hr style="border: 0; border-top: 1px solid #243238; margin: 32px 0 16px 0;" />
  <p style="color: #8a7a6a; font-size: 12px; text-align: center;">
    Sent to {{email}} | Priority Dispatch
  </p>
</div>`
  },
  {
    id: 'product_launch',
    name: '🚀 Product Feature Launch',
    subject: 'New Capabilities Unlocked for {{company}}',
    html: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #111e24; color: #f2ede7; border-radius: 16px; overflow: hidden; border: 1px solid rgba(183, 105, 53,0.35); font-size: 15px;">
  <div style="background: linear-gradient(135deg, #6f523b 0%, #935e38 50%, #38413f 100%); padding: 42px 32px; text-align: center;">
    <span style="background: rgba(17, 30, 36,0.6); color: #c5b8a8; font-size: 12px; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; border: 1px solid #b76935;">Platform Update</span>
    <h1 style="color: #ffffff; margin: 16px 0 10px 0; font-size: 28px; font-weight: 800;">Enterprise Solution Engine</h1>
    <p style="color: #c5b8a8; font-size: 16px; margin: 0;">Empowering {{company}} with scalable performance</p>
  </div>
  <div style="padding: 36px 32px; background: #1a2a30;">
    <p style="margin-top: 0; font-size: 17px; font-weight: 700; color: #f2ede7;">Hello {{name}},</p>
    <p style="color: #c5b8a8; line-height: 1.7;">
      Your organization, <strong>{{company}}</strong>, now has instant access to our upgraded bulk delivery system.
    </p>
    <div style="display: flex; gap: 16px; margin: 28px 0;">
      <div style="background: #243238; border: 1px solid rgba(183, 105, 53,0.25); padding: 18px; border-radius: 12px; width: 50%;">
        <div style="color: #7a9e7e; font-weight: 800; font-size: 20px;">Direct SMTP</div>
        <div style="color: #8a7a6a; font-size: 13px;">Zero Third-Party Storage</div>
      </div>
      <div style="background: #243238; border: 1px solid rgba(183, 105, 53,0.25); padding: 18px; border-radius: 12px; width: 50%;">
        <div style="color: #b76935; font-weight: 800; font-size: 20px;">100% Privacy</div>
        <div style="color: #8a7a6a; font-size: 13px;">Stateless Browser Engine</div>
      </div>
    </div>
    <div style="text-align: center; margin-top: 32px;">
      <a href="https://yourwebsite.com" style="background: linear-gradient(135deg, #935e38, #b76935); color: #111e24; text-decoration: none; padding: 14px 34px; border-radius: 8px; font-weight: 800; display: inline-block; box-shadow: 0 4px 18px rgba(183, 105, 53,0.35);">
        Get Started &rarr;
      </a>
    </div>
  </div>
</div>`
  }
];

// SMTP Presets
const SMTP_PRESETS = [
  { id: 'gmail', name: 'Gmail / Google Workspace', host: 'smtp.gmail.com', port: 465, security: 'SSL' },
  { id: 'outlook', name: 'Outlook 365', host: 'smtp.office365.com', port: 587, security: 'STARTTLS' },
  { id: 'sendgrid', name: 'SendGrid', host: 'smtp.sendgrid.net', port: 587, security: 'STARTTLS' },
  { id: 'mailgun', name: 'Mailgun', host: 'smtp.mailgun.org', port: 587, security: 'STARTTLS' },
  { id: 'custom', name: 'Custom SMTP Server', host: '', port: 465, security: 'SSL' }
];

export function App() {
  // Step State: 1 = SMTP Config, 2 = Custom HTML & Recipients, 3 = Send & Live Monitor
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: SMTP Config State
  const [smtpConfig, setSmtpConfig] = useState({
    smtp_host: 'smtp.gmail.com',
    smtp_port: 465,
    username: '',
    password: '',
    sender_email: '',
    sender_name: '',
    security: 'SSL',
    remember: true
  });
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [localDataFound, setLocalDataFound] = useState<{ smtp: boolean; draft: boolean }>({ smtp: false, draft: false });

  // Step 2: Content & Recipients State
  const [selectedTemplateId, setSelectedTemplateId] = useState('newsletter');
  const [subject, setSubject] = useState('Important Update from {{company}}');
  const [htmlBody, setHtmlBody] = useState(PRODUCTION_TEMPLATES[1].html);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [editorTab, setEditorTab] = useState<'code' | 'preview'>('code');

  // Recipients input state
  const [recipientInputMode, setRecipientInputMode] = useState<'text' | 'csv'>('text');
  const [rawEmailsText, setRawEmailsText] = useState('');
  const [parsedRecipients, setParsedRecipients] = useState<Array<{ email: string; name?: string; company?: string; [key: string]: any }>>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);

  // Test mail sending state
  const [testRecipientEmail, setTestRecipientEmail] = useState('');
  const [isSendingTestMail, setIsSendingTestMail] = useState(false);

  // Step 3: Campaign Dispatch & Monitor State
  const [sendSpeed, setSendSpeed] = useState<'fast' | 'normal' | 'stealth'>('normal');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<'idle' | 'sending' | 'paused' | 'completed' | 'cancelled'>('idle');
  const [progress, setProgress] = useState({ total: 0, sent: 0, failed: 0, percent: 0 });
  const [logs, setLogs] = useState<Array<{ time: string; type: 'info' | 'success' | 'error'; msg: string }>>([]);

  // Toast Notification state
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Load configuration from local storage on mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('mailflow_saas_smtp');
      const savedTemplate = localStorage.getItem('mailflow_saas_draft');

      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setSmtpConfig((prev) => ({ ...prev, ...parsed }));
      }
      if (savedTemplate) {
        const draft = JSON.parse(savedTemplate);
        if (draft.subject) setSubject(draft.subject);
        if (draft.htmlBody) setHtmlBody(draft.htmlBody);
      }

      setLocalDataFound({ smtp: !!savedConfig, draft: !!savedTemplate });
    } catch (e) {
      console.error('Error reading localStorage', e);
    }
  }, []);

  // Clear Saved LocalStorage Credentials & Form Data
  const handleClearSavedData = () => {
    try {
      localStorage.removeItem('mailflow_saas_smtp');
      localStorage.removeItem('mailflow_saas_draft');
      localStorage.removeItem('mailflow_red_config');
      localStorage.removeItem('mailflow_warm_config');
      setSmtpConfig({
        smtp_host: 'smtp.gmail.com',
        smtp_port: 465,
        username: '',
        password: '',
        sender_email: '',
        sender_name: '',
        security: 'SSL',
        remember: true
      });
      setSmtpStatus(null);
      setLocalDataFound({ smtp: false, draft: false });
      showToast('🗑️ All saved browser credentials and data cleared!', 'info');
    } catch (e) {
      showToast('Error clearing local data', 'error');
    }
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Production Email Validation & Parsing Engine (Strict Email Regex + De-duplication)
  const parseRawEmailsText = (text: string) => {
    const lines = text.split('\n').filter((line) => line.trim().length > 0);
    const parsed: Array<{ email: string; name?: string; company?: string }> = [];
    const seenEmails = new Set<string>();
    let dupes = 0;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    lines.forEach((line) => {
      const parts = line.split(',').map((p) => p.trim());
      const emailMatch = parts.find((p) => emailRegex.test(p));

      if (emailMatch) {
        const cleanEmail = emailMatch.toLowerCase();
        if (seenEmails.has(cleanEmail)) {
          dupes++;
        } else {
          seenEmails.add(cleanEmail);
          const otherParts = parts.filter((p) => p !== emailMatch);
          parsed.push({
            email: cleanEmail,
            name: otherParts[0] || cleanEmail.split('@')[0],
            company: otherParts[1] || 'Organization'
          });
        }
      }
    });

    setDuplicateCount(dupes);
    setParsedRecipients(parsed);
  };

  // Download Sample CSV template
  const handleDownloadSampleCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8,email,name,company,role,location\nuser1@example.com,Alex Morgan,Acme Corp,CTO,New York\nuser2@enterprise.com,Sam Rivera,Apex Labs,VP Product,San Francisco";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mailflow_recipients_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded sample recipient CSV template", "info");
  };

  // Preset SMTP click handler
  const handleApplyPreset = (presetId: string) => {
    const preset = SMTP_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSmtpConfig((prev) => ({
      ...prev,
      smtp_host: preset.host || prev.smtp_host,
      smtp_port: preset.port,
      security: preset.security
    }));
    showToast(`Applied ${preset.name} configuration`, 'info');
  };

  // Test SMTP connection API
  const handleTestSmtp = async () => {
    if (!smtpConfig.username || !smtpConfig.password) {
      showToast('Please enter your SMTP Username and Password', 'error');
      return;
    }
    setIsTestingSmtp(true);
    setSmtpStatus(null);
    try {
      const res = await fetch('/api/smtp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpConfig)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSmtpStatus({ success: true, message: data.message || 'SMTP Connection Verified!' });
        showToast('✓ SMTP connection established successfully!', 'success');
        if (smtpConfig.remember) {
          localStorage.setItem('mailflow_saas_smtp', JSON.stringify(smtpConfig));
        }
      } else {
        setSmtpStatus({ success: false, message: data.error || 'Connection failed.' });
        showToast(data.error || 'SMTP Connection Failed', 'error');
      }
    } catch (e: any) {
      setSmtpStatus({ success: false, message: 'Server error testing SMTP connection.' });
      showToast('Error connecting to backend API', 'error');
    } finally {
      setIsTestingSmtp(false);
    }
  };

  // Save current draft
  const handleSaveDraft = () => {
    try {
      localStorage.setItem('mailflow_saas_draft', JSON.stringify({ subject, htmlBody }));
      showToast('✓ Draft saved to local browser storage!', 'success');
    } catch (e) {
      showToast('Failed to save draft', 'error');
    }
  };

  // Insert variable into HTML body
  const insertVariable = (varName: string) => {
    const tag = `{{${varName}}}`;
    setHtmlBody((prev) => prev + ` ${tag}`);
    showToast(`Inserted placeholder ${tag}`, 'info');
  };

  // Select preset template
  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = PRODUCTION_TEMPLATES.find((t) => t.id === id);
    if (tmpl) {
      setSubject(tmpl.subject);
      setHtmlBody(tmpl.html);
      showToast(`Loaded ${tmpl.name}`, 'info');
    }
  };

  // Send Test Mail API
  const handleSendTestMail = async () => {
    if (!testRecipientEmail) {
      showToast('Please enter your test email address', 'error');
      return;
    }
    setIsSendingTestMail(true);

    try {
      const res = await fetch('/api/campaigns/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtp_config: smtpConfig,
          template_subject: subject,
          template_body: htmlBody,
          test_email: testRecipientEmail,
          recipient_data: { name: 'Test Recipient', company: 'Your Organization', role: 'Verified User' },
          is_html: true
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✓ Test email delivered to ${testRecipientEmail}!`, 'success');
      } else {
        showToast(data.error || 'Test email failed', 'error');
      }
    } catch (e: any) {
      showToast('Error sending test email', 'error');
    } finally {
      setIsSendingTestMail(false);
    }
  };

  // Step 3: Launch Campaign Dispatch to All
  const handleStartCampaign = async () => {
    if (parsedRecipients.length === 0) {
      showToast('Please add at least 1 valid recipient before launching', 'error');
      return;
    }
    if (!smtpConfig.username || !smtpConfig.password) {
      showToast('Please configure SMTP credentials in Step 1', 'error');
      setCurrentStep(1);
      return;
    }

    setJobStatus('sending');
    setProgress({ total: parsedRecipients.length, sent: 0, failed: 0, percent: 0 });
    setLogs([
      { time: new Date().toLocaleTimeString(), type: 'info', msg: `🌿 Initiating SaaS bulk campaign dispatch to ${parsedRecipients.length} recipients...` }
    ]);

    try {
      const res = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: parsedRecipients,
          smtp_config: smtpConfig,
          subject: subject,
          body: htmlBody,
          is_html: true,
          speed: sendSpeed
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveJobId(data.job_id);
        showToast('🚀 Bulk dispatch active! Monitoring live sending...', 'success');
      } else {
        setJobStatus('cancelled');
        showToast(data.error || 'Failed to start dispatch job', 'error');
      }
    } catch (e: any) {
      setJobStatus('cancelled');
      showToast('API network error launching campaign', 'error');
    }
  };

  // Poll job status if active
  useEffect(() => {
    if (!activeJobId || jobStatus !== 'sending') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${activeJobId}`);
        if (res.ok) {
          const data = await res.json();
          const job = data.job;
          if (job) {
            const total = job.total || parsedRecipients.length;
            const sent = job.successful || 0;
            const failed = job.failed || 0;
            const processed = sent + failed;
            const percent = total > 0 ? Math.round((processed / total) * 100) : 0;

            setProgress({ total, sent, failed, percent });

            // Reconstruct logs from job results list to prevent duplication
            if (job.results) {
              const sendingTime = new Date(job.created_at * 1000).toLocaleTimeString();
              const initialLine = { time: sendingTime, type: 'info' as const, msg: `🌿 Initiating SaaS bulk campaign dispatch to ${total} recipients...` };
              const runLines = job.results.map((r: any) => ({
                time: r.sent_at ? r.sent_at.split(' ')[1] || r.sent_at : new Date().toLocaleTimeString(),
                type: (r.status === 'SENT' ? 'success' : 'error') as 'success' | 'error',
                msg: `${r.status === 'SENT' ? '✓ Sent' : '✕ Failed'}: ${r.email} (${r.message || 'Delivered'})`
              }));
              setLogs([initialLine, ...runLines]);
            }

            if (job.status === 'completed') {
              setJobStatus('completed');
              showToast('🎉 Campaign successfully completed!', 'success');
              clearInterval(interval);
            } else if (job.status === 'cancelled') {
              setJobStatus('cancelled');
              clearInterval(interval);
            }
          }
        }
      } catch (e) {
        console.error('Job status polling error', e);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeJobId, jobStatus, parsedRecipients.length]);

  // Pause / Resume / Cancel job buttons
  const handlePauseJob = async () => {
    if (!activeJobId) return;
    await fetch(`/api/jobs/${activeJobId}/pause`, { method: 'POST' });
    setJobStatus('paused');
    showToast('Campaign paused', 'info');
  };

  const handleResumeJob = async () => {
    if (!activeJobId) return;
    await fetch(`/api/jobs/${activeJobId}/resume`, { method: 'POST' });
    setJobStatus('sending');
    showToast('Campaign resumed', 'success');
  };

  const handleCancelJob = async () => {
    if (!activeJobId) return;
    await fetch(`/api/jobs/${activeJobId}/cancel`, { method: 'POST' });
    setJobStatus('cancelled');
    showToast('Campaign cancelled', 'error');
  };

  const handleResetConsole = () => {
    setActiveJobId(null);
    setJobStatus('idle');
    setProgress({ total: 0, sent: 0, failed: 0, percent: 0 });
    showToast('Console reset. Ready to launch another campaign!', 'info');
  };

  // Export Live Terminal Log File (.txt)
  const handleExportLogFile = () => {
    const textContent = logs.map((l) => `[${l.time}] ${l.type.toUpperCase()}: ${l.msg}`).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mailflow_dispatch_log_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    showToast('Exported terminal log file', 'info');
  };

  // Helper function to render live preview HTML with mock values
  const renderPreviewHtml = () => {
    let rendered = htmlBody;
    const sample = parsedRecipients[0] || { name: 'Recipient Name', company: 'Sample Enterprise', role: 'Executive', email: 'recipient@domain.com', location: 'Global' };
    Object.keys(sample).forEach((key) => {
      const reg = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      rendered = rendered.replace(reg, sample[key]);
    });
    return rendered;
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Ripple Grid Background */}
      <RippleGrid
        gridSize={44}
        speed={0.55}
        amplitude={7}
        lineColor="rgba(183, 105, 53, 0.18)"
        glowColor="rgba(183, 105, 53, 0.52)"
        baseOpacity={0.7}
      />

      {/* Toast Notification Container */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: toast.type === 'success' ? '#7a9e7e' : toast.type === 'error' ? '#a84030' : '#b76935',
            color: '#111e24',
            padding: '12px 20px',
            borderRadius: '10px',
            fontWeight: 700,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          {toast.type === 'success' && <CheckCircle2 size={18} />}
          {toast.type === 'error' && <AlertCircle size={18} />}
          {toast.type === 'info' && <Sparkles size={18} />}
          {toast.text}
        </div>
      )}

      {/* Top Header */}
      <header
        style={{
          background: 'rgba(17, 30, 36, 0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--card-border)',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #935e38, #b76935)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px var(--copper-glow)'
            }}
          >
            <TreePine size={22} color="#111e24" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', color: '#f2ede7', display: 'flex', alignItems: 'center', gap: '8px' }}>
              MailFlow <span className="badge badge-warm">Production SaaS</span>
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Stateless Bulk Email Engine • Pure Browser Privacy</p>
          </div>
        </div>

        {/* Header Quick Status Indicator */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'var(--bg-tertiary)',
              borderRadius: '20px',
              border: '1px solid var(--card-border)',
              fontSize: '13px'
            }}
          >
            <Shield size={16} color={smtpStatus?.success ? '#7a9e7e' : '#b76935'} />
            <span style={{ color: smtpStatus?.success ? '#7a9e7e' : 'var(--text-secondary)' }}>
              {smtpStatus?.success ? 'SMTP Connection Live' : 'SMTP Unconfigured'}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'var(--bg-tertiary)',
              borderRadius: '20px',
              border: '1px solid var(--card-border)',
              fontSize: '13px'
            }}
          >
            <UserCheck size={16} color="#b76935" />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{parsedRecipients.length} Target Recipients</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {/* STEP PROGRESS WIZARD */}
        <div className="glass-card" style={{ padding: '20px 32px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            {/* Connecting line */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '10%',
                right: '10%',
                height: '2px',
                background: 'var(--bg-tertiary)',
                transform: 'translateY(-50%)',
                zIndex: 0
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '10%',
                width: currentStep === 1 ? '0%' : currentStep === 2 ? '40%' : '80%',
                height: '2px',
                background: 'var(--accent-gradient)',
                transform: 'translateY(-50%)',
                transition: 'all 0.4s ease',
                zIndex: 0
              }}
            />

            {/* Step 1 Item */}
            <div
              onClick={() => setCurrentStep(1)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: currentStep === 1 ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                border: `1px solid ${currentStep === 1 ? 'var(--camel)' : 'var(--card-border)'}`,
                padding: '10px 20px',
                borderRadius: '30px',
                zIndex: 1,
                boxShadow: currentStep === 1 ? '0 0 18px var(--copper-glow)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: currentStep > 1 ? '#7a9e7e' : currentStep === 1 ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: '#111e24'
                }}
              >
                {currentStep > 1 ? <Check size={16} /> : '1'}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: currentStep === 1 ? '#fff' : 'var(--text-secondary)' }}>1. Configure SMTP</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Host & Mail Server Auth</div>
              </div>
            </div>

            {/* Step 2 Item */}
            <div
              onClick={() => setCurrentStep(2)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: currentStep === 2 ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                border: `1px solid ${currentStep === 2 ? 'var(--camel)' : 'var(--card-border)'}`,
                padding: '10px 20px',
                borderRadius: '30px',
                zIndex: 1,
                boxShadow: currentStep === 2 ? '0 0 18px var(--copper-glow)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: currentStep > 2 ? '#7a9e7e' : currentStep === 2 ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: '#111e24'
                }}
              >
                {currentStep > 2 ? <Check size={16} /> : '2'}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: currentStep === 2 ? '#fff' : 'var(--text-secondary)' }}>2. Custom HTML & Recipients</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rich Editor & CSV Upload</div>
              </div>
            </div>

            {/* Step 3 Item */}
            <div
              onClick={() => setCurrentStep(3)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: currentStep === 3 ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                border: `1px solid ${currentStep === 3 ? 'var(--camel)' : 'var(--card-border)'}`,
                padding: '10px 20px',
                borderRadius: '30px',
                zIndex: 1,
                boxShadow: currentStep === 3 ? '0 0 18px var(--copper-glow)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: currentStep === 3 ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: '#111e24'
                }}
              >
                3
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: currentStep === 3 ? '#fff' : 'var(--text-secondary)' }}>3. Send to All</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Live Dispatch Console</div>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 1: CONFIGURE SMTP */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Settings color="#b76935" size={24} /> Step 1: Configure SMTP Mail Server
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Enter your email server credentials. Stored strictly in your browser's local memory with 100% wipe capability.
                  </p>
                </div>

                {/* Preset Quick Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {SMTP_PRESETS.map((preset) => (
                    <button key={preset.id} className="btn-preset" onClick={() => handleApplyPreset(preset.id)}>
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Local Storage Restored Banner — shown when saved config exists */}
              {localDataFound.smtp && (
                <div
                  style={{
                    marginBottom: '22px',
                    padding: '14px 20px',
                    borderRadius: '10px',
                    background: 'rgba(183, 105, 53, 0.1)',
                    border: '1px solid rgba(183, 105, 53, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#b76935" />
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#f2ede7' }}>Saved credentials restored from browser</span>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        SMTP account: <strong style={{ color: 'var(--text-secondary)' }}>{smtpConfig.username || 'Unknown'}</strong>
                        {' '} via <strong style={{ color: 'var(--text-secondary)' }}>{smtpConfig.smtp_host}</strong>
                        {localDataFound.draft && ' · Email draft also loaded'}
                      </p>
                    </div>
                  </div>
                  <button
                    className="btn-preset"
                    style={{ color: '#c0604a', border: '1px solid rgba(192, 96, 74, 0.35)', flexShrink: 0 }}
                    onClick={handleClearSavedData}
                  >
                    <Trash2 size={13} /> Forget & Clear
                  </button>
                </div>
              )}

              {/* Form Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    SMTP Host Server
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. smtp.gmail.com or smtp.sendgrid.net"
                    value={smtpConfig.smtp_host}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, smtp_host: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Port & Security Protocol
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="number"
                      className="input-field"
                      style={{ width: '120px' }}
                      placeholder="465"
                      value={smtpConfig.smtp_port}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, smtp_port: parseInt(e.target.value) || 465 })}
                    />
                    <select
                      className="input-field"
                      value={smtpConfig.security}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, security: e.target.value })}
                    >
                      <option value="SSL">SSL (Port 465)</option>
                      <option value="STARTTLS">STARTTLS (Port 587)</option>
                      <option value="NONE">None / Plain (Port 25)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    SMTP Username / Account Email
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="your-account@domain.com"
                    value={smtpConfig.username}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    SMTP Password / App Password
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Enter your SMTP password or App key"
                    value={smtpConfig.password}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Sender Display Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Acme Marketing Team"
                    value={smtpConfig.sender_name}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, sender_name: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Sender Email Address (From:)
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="leave empty to default to SMTP username"
                    value={smtpConfig.sender_email}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, sender_email: e.target.value })}
                  />
                </div>
              </div>

              {/* Status Feedback Badge */}
              {smtpStatus && (
                <div
                  style={{
                    marginTop: '24px',
                    padding: '16px',
                    borderRadius: '8px',
                    background: smtpStatus.success ? 'rgba(122, 158, 126, 0.15)' : 'rgba(185, 92, 71, 0.15)',
                    border: `1px solid ${smtpStatus.success ? '#7a9e7e' : '#a84030'}`,
                    color: smtpStatus.success ? '#7a9e7e' : '#c0604a',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  {smtpStatus.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  <span>{smtpStatus.message}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={smtpConfig.remember}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, remember: e.target.checked })}
                    />
                    Store credentials in browser local storage
                  </label>

                  <button className="btn-preset" onClick={handleClearSavedData} style={{ color: '#c0604a', border: '1px solid rgba(224, 122, 95, 0.3)' }}>
                    <Trash2 size={13} /> Clear Saved Browser Data
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-secondary" onClick={handleTestSmtp} disabled={isTestingSmtp}>
                    {isTestingSmtp ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Shield size={16} />}
                    {isTestingSmtp ? 'Testing Connection...' : '⚡ Test SMTP Connection'}
                  </button>
                  <button className="btn btn-primary" onClick={() => setCurrentStep(2)}>
                    Next: Custom HTML & Recipients <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CUSTOM HTML & RECIPIENTS */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Code color="#b76935" size={22} /> Step 2: Custom HTML Editor & Email Content
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Select a template or paste custom HTML code with dynamic placeholders.
                  </p>
                </div>

                {/* Templates & Draft Action */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button className="btn-preset" onClick={handleSaveDraft}>
                    <Save size={13} /> Save Draft
                  </button>
                  <select
                    className="input-field"
                    style={{ width: '240px', padding: '8px 12px' }}
                    value={selectedTemplateId}
                    onChange={(e) => handleSelectTemplate(e.target.value)}
                  >
                    {PRODUCTION_TEMPLATES.map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Input */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Email Subject Line (Supports Dynamic Variables)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Special Briefing for {{name}} at {{company}}"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* Variables Toolbar */}
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Insert Dynamic Variable:</span>
                {['name', 'email', 'company', 'role', 'location'].map((v) => (
                  <button key={v} className="chip" onClick={() => insertVariable(v)}>
                    + {`{{${v}}}`}
                  </button>
                ))}
              </div>

              {/* Editor / Live Preview Dual Pane */}
              <div style={{ border: '1px solid var(--card-border)', borderRadius: '12px', overflow: 'hidden' }}>
                {/* Header Switcher */}
                <div
                  style={{
                    background: 'var(--bg-secondary)',
                    padding: '12px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--card-border)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className={`btn-preset ${editorTab === 'code' ? 'active' : ''}`}
                      onClick={() => setEditorTab('code')}
                    >
                      <Code size={14} /> HTML Source Code
                    </button>
                    <button
                      className={`btn-preset ${editorTab === 'preview' ? 'active' : ''}`}
                      onClick={() => setEditorTab('preview')}
                    >
                      <Sparkles size={14} /> Live Rendered Preview
                    </button>
                  </div>

                  {editorTab === 'preview' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className={`btn-preset ${previewDevice === 'desktop' ? 'active' : ''}`}
                        onClick={() => setPreviewDevice('desktop')}
                      >
                        <Laptop size={14} /> Desktop View
                      </button>
                      <button
                        className={`btn-preset ${previewDevice === 'mobile' ? 'active' : ''}`}
                        onClick={() => setPreviewDevice('mobile')}
                      >
                        <Smartphone size={14} /> Mobile Frame
                      </button>
                    </div>
                  )}
                </div>

                {/* Editor Content Area */}
                {editorTab === 'code' ? (
                  <textarea
                    rows={12}
                    className="input-field"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '13px',
                      borderRadius: 0,
                      border: 'none',
                      lineHeight: '1.6',
                      background: '#0c1419',
                      color: '#c5b8a8'
                    }}
                    value={htmlBody}
                    onChange={(e) => setHtmlBody(e.target.value)}
                  />
                ) : (
                  <div
                    style={{
                      padding: '24px',
                      background: '#0a1218',
                      minHeight: '340px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <div
                      style={{
                        width: previewDevice === 'mobile' ? '380px' : '100%',
                        maxWidth: '700px',
                        borderRadius: previewDevice === 'mobile' ? '24px' : '12px',
                        border: previewDevice === 'mobile' ? '8px solid #243238' : '1px solid var(--card-border)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                        background: '#fff',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <iframe
                        title="Live Email Preview"
                        srcDoc={renderPreviewHtml()}
                        style={{ width: '100%', height: previewDevice === 'mobile' ? '480px' : '380px', border: 'none' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RECIPIENTS SECTION */}
            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Inbox color="#b76935" size={20} /> Target Mail Recipients ({parsedRecipients.length})
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Upload your recipient list. Automatically deduplicated & syntax validated.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button className="btn-preset" onClick={handleDownloadSampleCsv}>
                    <FileSpreadsheet size={13} /> Sample CSV Template
                  </button>
                  <button
                    className={`btn-preset ${recipientInputMode === 'text' ? 'active' : ''}`}
                    onClick={() => setRecipientInputMode('text')}
                  >
                    Raw Email List
                  </button>
                  <button
                    className={`btn-preset ${recipientInputMode === 'csv' ? 'active' : ''}`}
                    onClick={() => setRecipientInputMode('csv')}
                  >
                    CSV File Upload
                  </button>
                </div>
              </div>

              {recipientInputMode === 'text' ? (
                <div>
                  <textarea
                    rows={5}
                    className="input-field"
                    placeholder="Paste email list here (one per line, or email, name, company):&#10;user@domain.com, Recipient Name, Organization Name"
                    value={rawEmailsText}
                    onChange={(e) => {
                      setRawEmailsText(e.target.value);
                      parseRawEmailsText(e.target.value);
                    }}
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    <span>Format per line: <code>email, name, company</code></span>
                    {duplicateCount > 0 && <span style={{ color: '#b76935', fontWeight: 600 }}>Filtered out {duplicateCount} duplicate email(s)</span>}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    border: '2px dashed var(--card-border)',
                    borderRadius: '12px',
                    padding: '36px',
                    textAlign: 'center',
                    background: 'rgba(183, 105, 53,0.04)',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.csv';
                    input.onchange = async (e: any) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const text = await file.text();
                      setRawEmailsText(text);
                      parseRawEmailsText(text);
                      showToast(`Loaded CSV file: ${file.name}`, 'success');
                    };
                    input.click();
                  }}
                >
                  <Upload size={32} color="#b76935" style={{ marginBottom: '10px' }} />
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Click to Browse & Upload CSV File</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Supports headers: email, name, company, role, location
                  </p>
                </div>
              )}

              {/* Parsed Recipients Preview Table */}
              {parsedRecipients.length === 0 ? (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '32px',
                    textAlign: 'center',
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-muted)'
                  }}
                >
                  <Filter size={28} color="var(--camel)" style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>No Recipients Loaded Yet</p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>Upload a CSV file or paste recipient email addresses above to populate your list.</p>
                </div>
              ) : (
                <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px' }}>#</th>
                        <th style={{ padding: '8px 12px' }}>Recipient Email</th>
                        <th style={{ padding: '8px 12px' }}>Name</th>
                        <th style={{ padding: '8px 12px' }}>Company</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRecipients.slice(0, 5).map((r, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(183, 105, 53,0.1)' }}>
                          <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#fff' }}>{r.email}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{r.name || '—'}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{r.company || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedRecipients.length > 5 && (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                      + {parsedRecipients.length - 5} additional recipients ready...
                    </p>
                  )}
                </div>
              )}

              {/* TEST MAIL BAR */}
              <div
                style={{
                  marginTop: '24px',
                  padding: '16px 20px',
                  background: 'rgba(183, 105, 53,0.06)',
                  borderRadius: '10px',
                  border: '1px solid var(--card-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Send size={18} color="#b76935" />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Send Single Test Email</span>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verify HTML layout in your inbox before bulk send</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="email"
                    className="input-field"
                    style={{ width: '240px', padding: '8px 12px' }}
                    placeholder="your.test@domain.com"
                    value={testRecipientEmail}
                    onChange={(e) => setTestRecipientEmail(e.target.value)}
                  />
                  <button className="btn btn-secondary" onClick={handleSendTestMail} disabled={isSendingTestMail}>
                    {isSendingTestMail ? 'Sending...' : 'Send Test Mail'}
                  </button>
                </div>
              </div>

              {/* Navigation Footer */}
              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-secondary" onClick={() => setCurrentStep(1)}>
                  &larr; Back to SMTP Settings
                </button>
                <button className="btn btn-primary" onClick={() => setCurrentStep(3)}>
                  Next: Launch & Monitor <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SEND TO ALL & LIVE DISPATCH MONITOR */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <TreePine color="#b76935" size={24} /> Step 3: Launch Campaign to All
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Configure dispatch rate and monitor live real-time sending progress console.
                  </p>
                </div>

                {/* Speed Throttling Select */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sliders size={16} /> Throttle Speed:
                  </span>
                  <select
                    className="input-field"
                    style={{ width: '160px', padding: '8px 12px' }}
                    value={sendSpeed}
                    onChange={(e: any) => setSendSpeed(e.target.value)}
                  >
                    <option value="fast">⚡ Fast (60/min)</option>
                    <option value="normal">🛡️ Safe (30/min)</option>
                    <option value="stealth">🕵️ Stealth (10/min)</option>
                  </select>
                </div>
              </div>

              {/* Big Action Button */}
              {jobStatus === 'idle' && (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <button
                    className="btn btn-primary"
                    style={{
                      fontSize: '18px',
                      padding: '16px 48px',
                      borderRadius: '12px',
                      boxShadow: '0 0 35px var(--copper-glow)',
                      animation: 'pulse 2s infinite'
                    }}
                    onClick={handleStartCampaign}
                  >
                    <Send size={22} /> 🔥 DISPATCH MAIL TO ALL ({parsedRecipients.length} RECIPIENTS)
                  </button>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
                    Will send to {parsedRecipients.length} emails using {smtpConfig.smtp_host || 'configured SMTP host'}
                  </p>
                </div>
              )}

              {/* Progress Gauge & Stats Row */}
              {jobStatus !== 'idle' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
                  {/* Gauge Circle */}
                  <div
                    style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid var(--card-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                      <svg width="140" height="140" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" stroke="var(--bg-tertiary)" strokeWidth="10" fill="none" />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="url(#woodGrad)"
                          strokeWidth="10"
                          fill="none"
                          strokeDasharray="264"
                          strokeDashoffset={264 - (264 * progress.percent) / 100}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                        />
                        <defs>
                          <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#935e38" />
                            <stop offset="100%" stopColor="#b76935" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center'
                        }}
                      >
                        <span style={{ fontSize: '26px', fontWeight: 900, color: '#fff' }}>{progress.percent}%</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>COMPLETE</span>
                      </div>
                    </div>
                    <div style={{ marginTop: '16px', fontSize: '13px', fontWeight: 600, color: '#7a9e7e' }}>
                      {jobStatus === 'sending' ? '⚡ DISPATCHING...' : jobStatus.toUpperCase()}
                    </div>
                  </div>

                  {/* Metrics & Control Buttons */}
                  <div
                    style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid var(--card-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Total Queue</span>
                        <span style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>{progress.total}</span>
                      </div>
                      <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#7a9e7e', display: 'block' }}>Successfully Sent</span>
                        <span style={{ fontSize: '24px', fontWeight: 800, color: '#7a9e7e' }}>{progress.sent}</span>
                      </div>
                      <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#a84030', display: 'block' }}>Failed / Bounced</span>
                        <span style={{ fontSize: '24px', fontWeight: 800, color: '#a84030' }}>{progress.failed}</span>
                      </div>
                    </div>

                    {/* Dispatch Control Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                      {jobStatus === 'sending' && (
                        <button className="btn btn-secondary" onClick={handlePauseJob}>
                          <Pause size={16} /> Pause Campaign
                        </button>
                      )}
                      {jobStatus === 'paused' && (
                        <button className="btn btn-primary" onClick={handleResumeJob}>
                          <Play size={16} /> Resume Dispatch
                        </button>
                      )}
                      {(jobStatus === 'sending' || jobStatus === 'paused') && (
                        <button className="btn btn-danger" onClick={handleCancelJob}>
                          <XCircle size={16} /> Emergency Cancel
                        </button>
                      )}
                      {(jobStatus === 'completed' || jobStatus === 'cancelled') && (
                        <button className="btn btn-primary" onClick={handleResetConsole}>
                          <RefreshCw size={16} /> Prepare New Campaign
                        </button>
                      )}
                      {activeJobId && (
                        <a
                          href={`/api/jobs/${activeJobId}/results?format=csv`}
                          className="btn btn-secondary"
                          style={{ marginLeft: 'auto' }}
                        >
                          <Download size={16} /> Export CSV Report
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TERMINAL LOG CONSOLE */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Terminal size={16} color="#b76935" /> Real-time Live Log Matrix Terminal
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {logs.length > 0 && (
                      <button className="btn-preset" onClick={handleExportLogFile} style={{ fontSize: '11px', padding: '4px 8px' }}>
                        <Download size={12} /> Export Log (.txt)
                      </button>
                    )}
                    <button className="btn-preset" onClick={() => setLogs([])} style={{ fontSize: '11px', padding: '4px 8px' }}>
                      <Trash2 size={12} /> Clear Console
                    </button>
                  </div>
                </div>

                <div className="terminal-console">
                  {logs.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Logs will stream live here when dispatch starts...
                    </div>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className="terminal-line">
                        <span className="terminal-time">[{log.time}]</span>
                        <span className={log.type === 'success' ? 'terminal-success' : log.type === 'error' ? 'terminal-error' : ''}>
                          {log.msg}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Step Navigation Back */}
              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-start' }}>
                <button className="btn btn-secondary" onClick={() => setCurrentStep(2)}>
                  &larr; Back to HTML & Content Editor
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '12px' }}>
        MailFlow Production SaaS — Organic Bulk Mail Engine & Pure Stateless Storage
      </footer>
    </div>
  );
}

export default App;
