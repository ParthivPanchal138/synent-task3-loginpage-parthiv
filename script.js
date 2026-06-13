(function () {
   'use strict';
   const dom = {
     particles: document.getElementById('particles'),
     submitBtn: document.getElementById('submitBtn'),
     passwordInput: document.getElementById('passwordInput'),
     eyeIcon: document.getElementById('eyeIcon'),
     eyeBtn: document.getElementById('eyeBtn'),
     emailInput: document.getElementById('emailInput'),
     emailField: document.getElementById('emailField'),
     passwordField: document.getElementById('passwordField'),
     rememberMe: document.getElementById('rememberMe'),
     toast: document.getElementById('toast'),
     toastMsg: document.getElementById('toastMsg'),
     forgotModal: document.getElementById('forgotModal'),
     resetEmail: document.getElementById('resetEmail'),
   };
   let toastTimer = null;

   function initParticles() { /* same logic, uses dom.particles + DocumentFragment */ }
   function spawnRipple(e) { /* extracted from inline mousedown listener */ }

 function validatePassword(v) {
   return v.length >= 6;
 }
/* ── RIPPLE ── */
 function bindEvents() {
   dom.submitBtn.addEventListener('mousedown', spawnRipple);
   dom.submitBtn.addEventListener('click', handleLogin);
   dom.eyeBtn.addEventListener('click', togglePassword);
   dom.emailInput.addEventListener('input', () => clearError('emailField'));
   dom.passwordInput.addEventListener('input', () => clearError('passwordField'));
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
   document.addEventListener('keydown', function (e) {
     if (e.key === 'Enter') handleLogin(e);
     if (e.key === 'Escape') closeForgot();
  });
 }

 function init() {
   initParticles();
   bindEvents();
 }
 document.addEventListener('DOMContentLoaded', init);
})();
/* ── PASSWORD TOGGLE ── */
function togglePassword() {

  const input = document.getElementById('passwordInput');
  const icon  = document.getElementById('eyeIcon');

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
 function validateEmailField() {
  const value = dom.emailInput.value;
   if (value && !validateEmail(value)) { setError('emailField'); return false; }
   clearError('emailField');
   return true;
 }

 function validatePasswordField() {
   const value = dom.passwordInput.value;
   if (value && !validatePassword(value)) { setError('passwordField'); return false; }
   clearError('passwordField');
   return true;
 }
 function clearError(fieldId) {
   const field = document.getElementById(fieldId);
   field.classList.remove('has-error');
   const input = field.querySelector('.field-input');
   if (input) input.removeAttribute('aria-invalid');
   const errorEl = field.querySelector('.error-msg');
   if (errorEl) errorEl.removeAttribute('role');
 }
/* ── TOAST ── */
let toastTimer;

function showToast(msg, type='error') {

  const t = document.getElementById('toast');
  const m = document.getElementById('toastMsg');

  t.className = `toast ${type === 'success' ? 'success-toast' : 'error'}`;
   t.setAttribute('role', 'status');
   t.setAttribute('aria-live', 'polite');
  m.textContent = msg;

  t.classList.add('show');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    t.classList.remove('show');
  }, 3500);
}

/* ── LOGIN ── */
function handleLogin(e) {

  e.preventDefault();

  const email    = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;

  let valid = true;

  if (!validateEmail(email)) {
    document.getElementById('emailField').classList.add('has-error');
    valid = false;
  }

  if (password.length < 6) {
    document.getElementById('passwordField').classList.add('has-error');
    valid = false;
  }

  if (!valid) {
    showToast('Please fix the errors above.', 'error');
    return;
  }

  const btn = document.getElementById('submitBtn');

  btn.classList.add('loading');

  setTimeout(() => {

    btn.classList.remove('loading');

    btn.classList.add('success');

    btn.querySelector('.btn-text').textContent = '✓ Signed In!';

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
function openForgot() {
  document.getElementById('forgotModal').classList.add('open');
}

function closeForgot() {
  document.getElementById('forgotModal').classList.remove('open');
}

function sendReset() {

  const email = document.getElementById('resetEmail').value;

  if (!validateEmail(email)) {
    showToast('Please enter a valid email.', 'error');
    return;
  }

  closeForgot();

  showToast('Reset link sent! Check your inbox.', 'success');
}

/* Close modal on overlay click */
document.getElementById('forgotModal').addEventListener('click', function(e) {
  if (e.target === this) closeForgot();
});

/* ── ENTER KEY ── */
document.addEventListener('keydown', function(e) {

  if (e.key === 'Enter') {
    handleLogin(e);
  }

  if (e.key === 'Escape') {
    closeForgot();
  }
});