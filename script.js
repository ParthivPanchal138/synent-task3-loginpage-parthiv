
(function () {
  'use strict';

  /* ── DOM REFS (cached once) ── */
  const dom = {
    particles:     document.getElementById('particles'),
    submitBtn:     document.getElementById('submitBtn'),
    passwordInput: document.getElementById('passwordInput'),
    eyeIcon:       document.getElementById('eyeIcon'),
    eyeBtn:        document.getElementById('eyeBtn'),
    emailInput:    document.getElementById('emailInput'),
    emailField:    document.getElementById('emailField'),
    passwordField: document.getElementById('passwordField'),
    rememberMe:    document.getElementById('rememberMe'),
    toast:         document.getElementById('toast'),
    toastMsg:      document.getElementById('toastMsg'),
    forgotModal:   document.getElementById('forgotModal'),
    resetEmail:    document.getElementById('resetEmail'),
  };

  let toastTimer = null;

  /* ── PARTICLES ── */
  function initParticles() {
    if (!dom.particles) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const frag = document.createDocumentFragment();

    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'particle';

      const size = Math.random() * 3 + 1.5;

      p.style.cssText = `
        width:${size}px;
        height:${size}px;
        left:${Math.random() * 100}%;
        animation-duration:${Math.random() * 12 + 8}s;
        animation-delay:${Math.random() * 10}s;
        opacity:0;
      `;

      frag.appendChild(p);
    }

    dom.particles.appendChild(frag);
  }

  /* ── RIPPLE ── */
  function spawnRipple(e) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const btn = dom.submitBtn;
    const r = document.createElement('span');
    r.className = 'ripple';

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    r.style.cssText = `
      width:${size}px;
      height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px
    `;

    btn.appendChild(r);
    setTimeout(() => r.remove(), 700);
  }

  /* ── PASSWORD TOGGLE ── */
  function togglePassword() {
    const input = dom.passwordInput;
    const icon  = dom.eyeIcon;

    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';

    icon.innerHTML = isHidden
      ? `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
      `
      : `
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
        <circle cx="12" cy="12" r="3"/>
      `;
  }

  /* ── VALIDATION ── */
  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  function validatePassword(v) {
    return v.length >= 6;
  }

  function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    field.classList.remove('has-error');

    const input = field.querySelector('.field-input');
    if (input) input.removeAttribute('aria-invalid');

    const errorEl = field.querySelector('.error-msg');
    if (errorEl) errorEl.removeAttribute('role');
  }

  function setError(fieldId) {
    const field = document.getElementById(fieldId);
    field.classList.add('has-error');

    const input = field.querySelector('.field-input');
    if (input) input.setAttribute('aria-invalid', 'true');

    const errorEl = field.querySelector('.error-msg');
    if (errorEl) errorEl.setAttribute('role', 'alert');
  }

  /* ── REAL-TIME FIELD VALIDATION ── */
  function validateEmailField() {
    const value = dom.emailInput.value;
    if (value && !validateEmail(value)) {
      setError('emailField');
      return false;
    }
    clearError('emailField');
    return true;
  }

  function validatePasswordField() {
    const value = dom.passwordInput.value;
    if (value && !validatePassword(value)) {
      setError('passwordField');
      return false;
    }
    clearError('passwordField');
    return true;
  }

  /* ── TOAST ── */
  function showToast(msg, type = 'error') {
    const t = dom.toast;
    const m = dom.toastMsg;

    t.className = `toast ${type === 'success' ? 'success-toast' : 'error'}`;
    t.setAttribute('role', 'status');
    t.setAttribute('aria-live', 'polite');
    m.textContent = msg;

    t.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
  }

  /* ── LOGIN ── */
  function handleLogin(e) {
    e.preventDefault();

    const emailOk    = validateEmailField() && validateEmail(dom.emailInput.value);
    const passwordOk = validatePasswordField() && validatePassword(dom.passwordInput.value);

    if (!emailOk) setError('emailField');
    if (!passwordOk) setError('passwordField');

    if (!emailOk || !passwordOk) {
      showToast('Please fix the errors above.', 'error');
      (!emailOk ? dom.emailInput : dom.passwordInput).focus();
      return;
    }

    const btn = dom.submitBtn;
    btn.classList.add('loading');
    btn.disabled = true;

    setTimeout(() => {
      btn.classList.remove('loading');
      btn.classList.add('success');
      btn.disabled = false;
      btn.querySelector('.btn-text').textContent = '✓ Signed In!';

      persistRememberedEmail();
      showToast('Welcome back! Redirecting…', 'success');

      setTimeout(() => {
        btn.classList.remove('success');
        btn.querySelector('.btn-text').textContent = 'Sign In →';
      }, 3000);
    }, 2000);
  }

  /* ── SOCIAL LOGIN ── */
  function socialLogin(provider) {
    showToast(`Connecting with ${provider}…`, 'success');
  }

  /* ── FORGOT PASSWORD ── */
  let lastFocusedBeforeModal = null;

  function openForgot() {
    lastFocusedBeforeModal = document.activeElement;
    dom.forgotModal.classList.add('open');
    dom.resetEmail.focus();
  }

  function closeForgot() {
    dom.forgotModal.classList.remove('open');
    if (lastFocusedBeforeModal) lastFocusedBeforeModal.focus();
  }

  function sendReset() {
    const email = dom.resetEmail.value;

    if (!validateEmail(email)) {
      showToast('Please enter a valid email.', 'error');
      return;
    }

    closeForgot();
    showToast('Reset link sent! Check your inbox.', 'success');
  }

  /* ── EVENT WIRING ── */
  function bindEvents() {
    dom.submitBtn.addEventListener('mousedown', spawnRipple);
    dom.submitBtn.addEventListener('click', handleLogin);

    dom.eyeBtn.addEventListener('click', togglePassword);

    dom.emailInput.addEventListener('input', () => clearError('emailField'));
    dom.passwordInput.addEventListener('input', () => clearError('passwordField'));
    dom.emailInput.addEventListener('blur', validateEmailField);
    dom.passwordInput.addEventListener('blur', validatePasswordField);

    document.querySelectorAll('.social-btn').forEach((btn) => {
      const provider = btn.textContent.trim();
      btn.addEventListener('click', () => socialLogin(provider));
    });

    document.querySelector('.forgot-link').addEventListener('click', openForgot);
    document.querySelector('.modal-close').addEventListener('click', closeForgot);
    document.querySelector('.modal-submit').addEventListener('click', sendReset);

    dom.forgotModal.addEventListener('click', function (e) {
      if (e.target === this) closeForgot();
    });

    document.querySelector('.checkbox-wrap span, .remember-row span')?.addEventListener('click', () => {
      dom.rememberMe.click();
    });

    document.addEventListener('keydown', function (e) {
      const modalOpen = dom.forgotModal.classList.contains('open');

      if (e.key === 'Enter') {
        if (modalOpen) {
          if (e.target === dom.resetEmail) sendReset();
          return;
        }

        if (e.target === dom.emailInput || e.target === dom.passwordInput) {
          handleLogin(e);
        }
      }

      if (e.key === 'Escape' && modalOpen) {
        closeForgot();
      }

      if (e.key === 'Tab' && modalOpen) {
        trapModalFocus(e);
      }
    });
  }

  /* ── FOCUS TRAP ── */
  function trapModalFocus(e) {
    const focusable = dom.forgotModal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ── REMEMBER ME PERSISTENCE ── */
  const REMEMBER_KEY = 'stackspark_remembered_email';

  function loadRememberedEmail() {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        dom.emailInput.value = saved;
        dom.rememberMe.checked = true;
      }
    } catch (_) { /* storage unavailable, ignore */ }
  }

  function persistRememberedEmail() {
    try {
      if (dom.rememberMe.checked && validateEmail(dom.emailInput.value)) {
        localStorage.setItem(REMEMBER_KEY, dom.emailInput.value.trim());
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
    } catch (_) { /* storage unavailable, ignore */ }
  }

  /* ── INIT ── */
  function init() {
    initParticles();
    bindEvents();
    loadRememberedEmail();
  }

  document.addEventListener('DOMContentLoaded', init);
})();