/* ==========================================
   Playables SDK v1.0.0 (Game lifecycle bridge)
   ========================================== */
(function() {
  'use strict';
  if (window.playablesSDK) return;
  var HANDLER_NAME = 'playablesGameEventHandler';
  var ANDROID_BRIDGE_NAME = '_MetaPlayablesBridge';
  var RAF_FRAME_THRESHOLD = 3;
  var gameReadySent = false;
  var firstInteractionSent = false;
  var errorSent = false;
  var frameCount = 0;
  var originalRAF = window.requestAnimationFrame;

  function hasIOSBridge() {
    return !!(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers[HANDLER_NAME]);
  }
  function hasAndroidBridge() {
    return !!(window[ANDROID_BRIDGE_NAME] && typeof window[ANDROID_BRIDGE_NAME].postEvent === 'function');
  }
  function isInIframe() {
    return !!(window.parent && window.parent !== window);
  }
  function sendEvent(eventName, payload) {
    var message = { type: eventName, payload: payload || {}, timestamp: Date.now() };
    if (hasIOSBridge()) {
      try { window.webkit.messageHandlers[HANDLER_NAME].postMessage(message); } catch (e) {}
      return;
    }
    if (hasAndroidBridge()) {
      try {
        var p = payload || {};
        p.__secureToken = window.__fbAndroidBridgeAuthToken || '';
        window[ANDROID_BRIDGE_NAME].postEvent(eventName, JSON.stringify(p));
      } catch (e) {}
      return;
    }
    if (isInIframe()) {
      try { window.parent.postMessage(message, '*'); } catch (e) {}
      return;
    }
  }
  function onFrame() {
    if (gameReadySent) return;
    frameCount++;
    if (frameCount >= RAF_FRAME_THRESHOLD) {
      gameReadySent = true;
      sendEvent('game_ready', { frame_count: frameCount, detected_at: Date.now() });
      return;
    }
    originalRAF.call(window, onFrame);
  }
  if (originalRAF) {
    window.requestAnimationFrame = function(callback) {
      if (!gameReadySent) {
        return originalRAF.call(window, function(timestamp) {
          frameCount++;
          if (frameCount >= RAF_FRAME_THRESHOLD && !gameReadySent) {
            gameReadySent = true;
            sendEvent('game_ready', { frame_count: frameCount, detected_at: Date.now() });
          }
          callback(timestamp);
        });
      }
      return originalRAF.call(window, callback);
    };
  }
  function setupFirstInteractionDetection() {
    var events = ['touchstart', 'mousedown', 'keydown'];
    function onFirstInteraction() {
      if (firstInteractionSent) return;
      firstInteractionSent = true;
      sendEvent('user_interaction_start', null);
      for (var i = 0; i < events.length; i++) {
        document.removeEventListener(events[i], onFirstInteraction, true);
      }
    }
    for (var i = 0; i < events.length; i++) {
      document.addEventListener(events[i], onFirstInteraction, true);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFirstInteractionDetection);
  } else {
    setupFirstInteractionDetection();
  }
  window.addEventListener('error', function(event) {
    if (errorSent) return;
    errorSent = true;
    sendEvent('error', { message: event.message || 'Unknown error', source: event.filename || '', lineno: event.lineno || 0, colno: event.colno || 0, auto_captured: true });
  });
  window.addEventListener('unhandledrejection', function(event) {
    if (errorSent) return;
    errorSent = true;
    var reason = event.reason;
    sendEvent('error', { message: (reason instanceof Error) ? reason.message : String(reason), type: 'unhandled_promise_rejection', auto_captured: true });
  });
  window.playablesSDK = {
    complete: function(score) { sendEvent('game_ended', { score: score, completed: true }); },
    error: function(message) { if (errorSent) return; errorSent = true; sendEvent('error', { message: message || 'Unknown error', auto_captured: false }); },
    sendEvent: function(eventName, payload) { if (!eventName || typeof eventName !== 'string') return; sendEvent(eventName, payload); }
  };
  if (originalRAF) { originalRAF.call(window, onFrame); }
})();

/* ==========================================
   تهيئة Lenis Smooth Scroll
   ========================================== */
const lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1.5,
    smoothTouch: true,
    touchMultiplier: 2.5,
    infinite: false,
});
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

/* ==========================================
   إدارة الحالة المركزية (AppState)
   ========================================== */
const AppState = {
    lang: localStorage.getItem('lang') || 'ar',
    theme: localStorage.getItem('theme') || 'dark',
    fontSize: parseInt(localStorage.getItem('fontSize')) || 16,
    highContrast: localStorage.getItem('highContrast') === 'true',
    invert: localStorage.getItem('invert') === 'true',
    webCount: 0,
    visitCount: 0,
};

function applyTheme() {
    document.body.classList.toggle('light-mode', AppState.theme === 'light');
    const modeText = document.getElementById('modeText');
    if (modeText) modeText.innerText = AppState.theme === 'light' ? translations[AppState.lang].modeDark : translations[AppState.lang].modeLight;
}
function applyLang() {
    document.documentElement.lang = AppState.lang;
    document.documentElement.dir = AppState.lang === 'ar' ? 'rtl' : 'ltr';
    updateLanguageTexts();
}
function applyFontSize() {
    document.documentElement.style.setProperty('--base-font-size', AppState.fontSize + 'px');
    toggleResetFontBtn();
}
function applyHighContrast() {
    document.body.classList.toggle('high-contrast-text', AppState.highContrast);
    const contrastBtn = document.getElementById('contrastBtn');
    if (contrastBtn) contrastBtn.classList.toggle('active', AppState.highContrast);
}
function applyInvert() {
    document.documentElement.classList.toggle('invert-mode', AppState.invert);
    const invertBtn = document.getElementById('invertBtn');
    if (invertBtn) invertBtn.classList.toggle('active', AppState.invert);
}
function savePreferences() {
    localStorage.setItem('lang', AppState.lang);
    localStorage.setItem('theme', AppState.theme);
    localStorage.setItem('fontSize', AppState.fontSize);
    localStorage.setItem('highContrast', AppState.highContrast);
    localStorage.setItem('invert', AppState.invert);
}
applyTheme(); applyLang(); applyFontSize(); applyHighContrast(); applyInvert();

/* ==========================================
   الترجمات
   ========================================== */
const translations = {
    ar: { welcome: "مرحباً", modeLight: "الوضع الفاتح", modeDark: "الوضع الداكن", languageLabel: "اللغة", webContrib: "مشارك في +", accTitle: "الوصول", fontSize: "حجم الخط", defaultFont: "الافتراضي", contrast: "تباين عالي", invertColors: "عكس اللون", visitorTitle: "عدد زوار الموقع", copyright: "جميع الحقوق محفوظة 2026لـ احمد السعيد غنيم", redirect: "سيتم انتقالك خلال", redirectingNow: "جاري الانتقال...", cancel: "إلغاء", shareSite: "مشاركة الموقع الخاص بي", copyLink: "نسخ الرابط", copied: "تم النسخ!", sharePanelText: "مشاركة الموقع", shareLinkTitle: "مشاركة الرابط", shareViaApps: "مشاركة عبر التطبيقات", notSupported: "متصفحك لا يدعم هذه الميزة" },
    en: { welcome: "Welcome", modeLight: "Light Mode", modeDark: "Dark Mode", languageLabel: "Language", webContrib: "Participant in +", accTitle: "Accessibility", fontSize: "Font Size", defaultFont: "Default", contrast: "High Contrast", invertColors: "Invert Colors", visitorTitle: "Visitor Count", copyright: "All Rights Reserved to Developer Ahmed Ghoneim", redirect: "Redirecting in", redirectingNow: "Redirecting...", cancel: "Cancel", shareSite: "Share my website", copyLink: "Copy Link", copied: "Copied!", sharePanelText: "Share Website", shareLinkTitle: "Share Link", shareViaApps: "Share via Apps", notSupported: "Browser not supported" }
};

function updateLanguageTexts() {
    const t = translations[AppState.lang];
    document.getElementById('welcome-msg').innerText = t.welcome;
    document.getElementById('modeText').innerText = AppState.theme === 'light' ? t.modeDark : t.modeLight;
    document.getElementById('lang-label-text').innerText = t.languageLabel;
    const webCounterSpan = document.getElementById('web-counter');
    const currentWeb = webCounterSpan ? webCounterSpan.innerText : AppState.webCount;
    document.getElementById('web-contrib').innerHTML = `${t.webContrib}<span id="web-counter">${currentWeb}</span> Web`;
    document.getElementById('acc-title').innerText = t.accTitle;
    document.getElementById('font-size-label').innerText = t.fontSize;
    document.getElementById('reset-font-btn').innerText = t.defaultFont;
    document.getElementById('contrast-label').innerText = t.contrast;
    document.getElementById('invert-label').innerText = t.invertColors;
    document.getElementById('visitor-msg').innerText = t.visitorTitle;
    document.getElementById('copyright-text').innerText = t.copyright;
    document.getElementById('qr-title').innerText = t.shareSite;
    document.getElementById('copy-text').innerText = t.copyLink;
    document.getElementById('share-panel-text').innerText = t.sharePanelText;
    document.getElementById('share-action-title').innerText = t.shareLinkTitle;
    document.getElementById('popup-copy-text').innerText = t.copyLink;
    document.getElementById('popup-native-text').innerText = t.shareViaApps;
    const langSlider = document.getElementById('langSlider');
    const langAr = document.getElementById('lang-ar');
    const langEn = document.getElementById('lang-en');
    if (AppState.lang === 'ar') {
        langSlider.style.transform = 'translateX(0) translate3d(0,0,0)';
        langAr.classList.add('active'); langEn.classList.remove('active');
    } else {
        langSlider.style.transform = 'translateX(28px) translate3d(0,0,0)';
        langEn.classList.add('active'); langAr.classList.remove('active');
    }
}

/* ==========================================
   أحداث الأزرار الأساسية
   ========================================== */
document.getElementById('modeToggle').addEventListener('click', () => {
    AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
    applyTheme(); savePreferences();
});
document.getElementById('langToggle').addEventListener('click', () => {
    AppState.lang = AppState.lang === 'ar' ? 'en' : 'ar';
    applyLang(); savePreferences();
});
document.getElementById('accToggle').addEventListener('click', () => {
    document.getElementById('accBox').classList.toggle('open');
});

function changeFontSize(step) {
    AppState.fontSize += step;
    if (AppState.fontSize < 12) AppState.fontSize = 12;
    if (AppState.fontSize > 24) AppState.fontSize = 24;
    applyFontSize(); savePreferences();
}
document.getElementById('font-increase-btn').addEventListener('click', () => changeFontSize(2));
document.getElementById('font-decrease-btn').addEventListener('click', () => changeFontSize(-2));
document.getElementById('reset-font-btn').addEventListener('click', () => {
    AppState.fontSize = 16;
    applyFontSize(); savePreferences();
});
function toggleResetFontBtn() {
    const container = document.getElementById('reset-font-container');
    if (!container) return;
    if (AppState.fontSize !== 16) { container.style.maxHeight = '30px'; container.style.opacity = '1'; }
    else { container.style.maxHeight = '0'; container.style.opacity = '0'; }
}
document.getElementById('contrastBtn').addEventListener('click', function() {
    AppState.highContrast = !AppState.highContrast;
    applyHighContrast(); savePreferences();
});
document.getElementById('invertBtn').addEventListener('click', function() {
    AppState.invert = !AppState.invert;
    applyInvert(); savePreferences();
});

/* ==========================================
   فتح وإغلاق النوافذ
   ========================================== */
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const overlay = document.getElementById('overlay');
const qrPopup = document.getElementById('qrPopup');
const shareActionPopup = document.getElementById('shareActionPopup');

function closeAllPanels() {
    settingsPanel.classList.remove('active');
    settingsBtn.classList.remove('rotate');
    qrPopup.classList.remove('active');
    shareActionPopup.classList.remove('active');
    overlay.classList.remove('active');
}
settingsBtn.addEventListener('click', () => {
    if (settingsPanel.classList.contains('active')) { closeAllPanels(); }
    else {
        settingsPanel.classList.add('active');
        settingsBtn.classList.add('rotate');
        overlay.classList.add('active');
        triggerWaveAnimation();
        if (!countersAnimated) {
            setTimeout(() => {
                animateCounter('web-counter', 100, 1500);
                animateCounter('visit-counter', totalVisits, 2000);
                countersAnimated = true;
            }, 400);
        }
    }
});
overlay.addEventListener('click', closeAllPanels);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllPanels(); });

/* ==========================================
   الموجة على الأزرار
   ========================================== */
function triggerWaveAnimation() {
    document.querySelectorAll('.links-container .btn').forEach((btn, i) => {
        btn.style.animation = 'none';
        btn.style.opacity = '1';
        btn.classList.remove('wave-active');
        void btn.offsetWidth;
        setTimeout(() => requestAnimationFrame(() => btn.classList.add('wave-active')), i * 120);
        setTimeout(() => requestAnimationFrame(() => btn.classList.remove('wave-active')), i * 120 + 850);
    });
}

/* ==========================================
   عداد الانتقال (الـ Timer)
   ========================================== */
let isRedirecting = false;
let redirectInterval;
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        if (isRedirecting) { e.preventDefault(); return; }
        e.preventDefault();
        isRedirecting = true;
        const targetUrl = this.href;
        const timerDisplay = this.nextElementSibling;
        let count = 3;
        document.querySelectorAll('.redirect-timer').forEach(el => { el.classList.remove('active'); el.innerHTML = ''; });
        timerDisplay.classList.add('active');
        const t = translations[AppState.lang];
        timerDisplay.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;"><span class="ios-spinner" id="timer-icon"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></span> <span id="timer-text">${t.redirect} <span id="timer-count">${count}</span></span> <button class="cancel-btn" id="cancel-btn">${t.cancel}</button></div>`;
        const countSpan = timerDisplay.querySelector('#timer-count');
        const cancelBtn = timerDisplay.querySelector('#cancel-btn');
        const timerIcon = timerDisplay.querySelector('#timer-icon');
        const timerText = timerDisplay.querySelector('#timer-text');
        cancelBtn.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); clearInterval(redirectInterval); timerDisplay.classList.remove('active'); isRedirecting = false; });
        redirectInterval = setInterval(() => {
            count--;
            if (count > 0) countSpan.innerText = count;
            else if (count === 0) {
                clearInterval(redirectInterval);
                cancelBtn.style.display = 'none';
                timerIcon.className = 'fas fa-check-circle'; timerIcon.style.color = '#4CAF50';
                timerText.innerHTML = t.redirectingNow;
                setTimeout(() => {
                    window.location.href = targetUrl;
                    setTimeout(() => { timerDisplay.classList.remove('active'); isRedirecting = false; }, 600);
                }, 500);
            }
        }, 1000);
    });
});

/* ==========================================
   عدادات الزوار والإحصائيات
   ========================================== */
let baseVisits = 29600, totalVisits = baseVisits, countersAnimated = false;
fetch('https://api.counterapi.dev/v1/ahmedghoneim_portfolio/visits/up')
    .then(r => r.json())
    .then(d => { totalVisits = baseVisits + d.count; })
    .catch(() => {
        let localVisits = localStorage.getItem('local_visits') || 0;
        localVisits++;
        localStorage.setItem('local_visits', localVisits);
        totalVisits = baseVisits + parseInt(localVisits);
    });
function animateCounter(id, target, duration) {
    const el = document.getElementById(id);
    let startTime = null;
    function step(ts) {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        let val = Math.round(ease * target);
        if (val > target) val = target;
        el.innerText = val.toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
        else el.innerText = Math.floor(target).toLocaleString();
    }
    requestAnimationFrame(step);
}
document.getElementById('glassCounter').addEventListener('click', e => { e.stopPropagation(); document.getElementById('infoPopup').classList.toggle('active'); });

/* ==========================================
   Sortable (السحب والإفلات)
   ========================================== */
new Sortable(document.querySelector('.links-container'), {
    animation: 400,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    fallbackClass: 'sortable-fallback',
    forceFallback: true,
    fallbackTolerance: 3,
    delay: 150,
    delayOnTouchOnly: true,
    touchStartThreshold: 5,
    swapThreshold: 0.65,
    direction: 'vertical'
});

/* ==========================================
   مشاركة سريعة من داخل الأزرار
   ========================================== */
let currentLink = '', currentPlatform = '';
document.querySelectorAll('.quick-share-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        currentLink = this.getAttribute('data-url');
        currentPlatform = this.getAttribute('data-platform');
        document.getElementById('share-action-desc').innerText = currentPlatform;
        shareActionPopup.classList.add('active'); overlay.classList.add('active');
    });
});
document.getElementById('closeShareActionBtn').addEventListener('click', () => {
    shareActionPopup.classList.remove('active');
    if (!settingsPanel.classList.contains('active') && !qrPopup.classList.contains('active')) overlay.classList.remove('active');
});
document.getElementById('popupCopyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(currentLink).then(() => {
        const span = document.getElementById('popup-copy-text');
        const t = translations[AppState.lang];
        span.innerText = t.copied;
        setTimeout(() => span.innerText = t.copyLink, 2000);
    });
});
document.getElementById('popupNativeShareBtn').addEventListener('click', () => {
    if (navigator.share) navigator.share({ title: `Ahmed Ghoneim - ${currentPlatform}`, url: currentLink }).catch(console.error);
    else alert(translations[AppState.lang].notSupported);
});

/* ==========================================
   QR Code ومشاركة الموقع
   ========================================== */
document.getElementById('innerShareBtn').addEventListener('click', () => {
    const url = window.location.href;
    document.getElementById('qrCodeContainer').innerHTML = '';
    if (typeof QRCodeStyling === 'undefined') {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/qr-code-styling@1.5.0/lib/qr-code-styling.js';
        s.onload = () => createQR(url);
        document.head.appendChild(s);
    } else createQR(url);
    qrPopup.classList.add('active'); overlay.classList.add('active');
});
function createQR(url) {
    new QRCodeStyling({
        width: 180, height: 180, type: "svg", data: url,
        image: "https://i.supaimg.com/d73ac461-53ca-466f-bc1e-61f2abd83dfe/01659496-a3b9-4e9f-9a68-1da631d42a99.jpg",
        dotsOptions: { color: "#000000", type: "rounded" },
        cornersSquareOptions: { color: "#000000", type: "extra-rounded" },
        cornersDotOptions: { color: "#000000", type: "dot" },
        backgroundOptions: { color: "#ffffff" },
        imageOptions: { margin: 5, imageSize: 0.4 }
    }).append(document.getElementById('qrCodeContainer'));
}
document.getElementById('closeQrBtn').addEventListener('click', () => {
    qrPopup.classList.remove('active');
    if (!settingsPanel.classList.contains('active') && !shareActionPopup.classList.contains('active')) overlay.classList.remove('active');
});
document.getElementById('copyLinkBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const span = document.getElementById('copy-text');
        const t = translations[AppState.lang];
        span.innerText = t.copied;
        setTimeout(() => span.innerText = t.copyLink, 2000);
    });
});

/* ==========================================
   The End (نص النهاية)
   ========================================== */
const theEnd = document.getElementById('theEndText');
new IntersectionObserver(entries => { entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')); }, { threshold: 0.5 }).observe(theEnd);
theEnd.addEventListener('click', () => lenis.scrollTo(0, { duration: 2.5, easing: t => 1 - Math.pow(1 - t, 5) }));

/* ==========================================
   Service Worker و contextmenu
   ========================================== */
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
document.addEventListener('contextmenu', e => e.preventDefault());