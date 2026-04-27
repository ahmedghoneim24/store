// Playables SDK v1.0.0
// Game lifecycle bridge: rAF-based game-ready detection + event communication
(function() {
  'use strict';

  // Idempotency: skip if already initialized (e.g., server-side injection
  // followed by client-side inject-javascript via the Bloks webview component).
  if (window.playablesSDK) return;

  var HANDLER_NAME = 'playablesGameEventHandler';
  var ANDROID_BRIDGE_NAME = '_MetaPlayablesBridge';
  var RAF_FRAME_THRESHOLD = 3;

  var gameReadySent = false;
  var firstInteractionSent = false;
  var errorSent = false;
  var frameCount = 0;
  var originalRAF = window.requestAnimationFrame;

  // --- Transport Layer ---

  function hasIOSBridge() {
    return !!(window.webkit &&
              window.webkit.messageHandlers &&
              window.webkit.messageHandlers[HANDLER_NAME]);
  }

  function hasAndroidBridge() {
    return !!(window[ANDROID_BRIDGE_NAME] &&
              typeof window[ANDROID_BRIDGE_NAME].postEvent === 'function');
  }

  function isInIframe() {
    return !!(window.parent && window.parent !== window);
  }

  function sendEvent(eventName, payload) {
    var message = {
      type: eventName,
      payload: payload || {},
      timestamp: Date.now()
    };

    if (hasIOSBridge()) {
      try {
        window.webkit.messageHandlers[HANDLER_NAME].postMessage(message);
      } catch (e) { /* ignore */ }
      return;
    }

    if (hasAndroidBridge()) {
    try {
      var p = payload || {};
      p.__secureToken = window.__fbAndroidBridgeAuthToken || '';
      window[ANDROID_BRIDGE_NAME].postEvent(
        eventName,
        JSON.stringify(p)
      );
    } catch (e) { /* ignore */ }
    return;
  }

    if (isInIframe()) {
      try {
        window.parent.postMessage(message, '*');
      } catch (e) { /* ignore */ }
      return;
    }
  }

  // --- rAF Game-Ready Detection ---

  function onFrame() {
    if (gameReadySent) return;

    frameCount++;
    if (frameCount >= RAF_FRAME_THRESHOLD) {
      gameReadySent = true;
      sendEvent('game_ready', {
        frame_count: frameCount,
        detected_at: Date.now()
      });
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
            sendEvent('game_ready', {
              frame_count: frameCount,
              detected_at: Date.now()
            });
          }
          callback(timestamp);
        });
      }
      return originalRAF.call(window, callback);
    };
  }

  // --- First User Interaction Detection ---

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

  // --- Auto Error Capture ---

  window.addEventListener('error', function(event) {
    if (errorSent) return;
    errorSent = true;
    sendEvent('error', {
      message: event.message || 'Unknown error',
      source: event.filename || '',
      lineno: event.lineno || 0,
      colno: event.colno || 0,
      auto_captured: true
    });
  });

  window.addEventListener('unhandledrejection', function(event) {
    if (errorSent) return;
    errorSent = true;
    var reason = event.reason;
    sendEvent('error', {
      message: (reason instanceof Error) ? reason.message : String(reason),
      type: 'unhandled_promise_rejection',
      auto_captured: true
    });
  });

  // --- Public API ---

  window.playablesSDK = {
    complete: function(score) {
      sendEvent('game_ended', {
        score: score,
        completed: true
      });
    },

    error: function(message) {
      if (errorSent) return;
      errorSent = true;
      sendEvent('error', {
        message: message || 'Unknown error',
        auto_captured: false
      });
    },

    sendEvent: function(eventName, payload) {
      if (!eventName || typeof eventName !== 'string') return;
      sendEvent(eventName, payload);
    }
  };

  // Kick off rAF detection in case no game code calls rAF immediately
  if (originalRAF) {
    originalRAF.call(window, onFrame);
  }
})();

window.Intl=window.Intl||{};Intl.t=function(s){return(Intl._locale&&Intl._locale[s])||s;};


        // ==========================================
        // تهيئة Lenis Smooth Scroll
        // ==========================================
        const lenis = new Lenis({
            duration: 1.2, 
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1.5,
            smoothTouch: true, 
            touchMultiplier: 2.5,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // ==========================================
        // وظائف The End
        // ==========================================
        const theEndText = document.getElementById('theEndText');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.5 });

        setTimeout(() => { observer.observe(theEndText); }, 3000);

        theEndText.addEventListener('click', () => {
            lenis.scrollTo(0, { duration: 2.5, easing: (t) => 1 - Math.pow(1 - t, 5) });
        });

        // ==========================================
        // باقي أكواد الموقع الأساسية
        // ==========================================
        const translations = {
            ar: { welcome: "مرحباً", modeLight: "الوضع الفاتح", modeDark: "الوضع الداكن", languageLabel: "اللغة", webContrib: "مشارك في +", accTitle: "الوصول", fontSize: "حجم الخط", defaultFont: "الافتراضي", contrast: "تباين عالي", invertColors: "عكس اللون", visitorTitle: "عدد زوار الموقع", copyright: "جميع الحقوق محفوظة 2026لـ احمد السعيد غنيم", redirect: "سيتم انتقالك خلال", redirectingNow: "جاري الانتقال...", cancel: "إلغاء", shareSite: "مشاركة الموقع الخاص بي", copyLink: "نسخ الرابط", copied: "تم النسخ!", sharePanelText: "مشاركة الموقع", shareLinkTitle: "مشاركة الرابط", shareViaApps: "مشاركة عبر التطبيقات", notSupported: "متصفحك لا يدعم هذه الميزة" },
            en: { welcome: "Welcome", modeLight: "Light Mode", modeDark: "Dark Mode", languageLabel: "Language", webContrib: "Participant in +", accTitle: "Accessibility", fontSize: "Font Size", defaultFont: "Default", contrast: "High Contrast", invertColors: "Invert Colors", visitorTitle: "Visitor Count", copyright: "All Rights Reserved to Developer Ahmed Ghoneim", redirect: "Redirecting in", redirectingNow: "Redirecting...", cancel: "Cancel", shareSite: "Share my website", copyLink: "Copy Link", copied: "Copied!", sharePanelText: "Share Website", shareLinkTitle: "Share Link", shareViaApps: "Share via Apps", notSupported: "Browser not supported" }
        };

        let currentLang = 'ar';
        let isRedirecting = false;
        let redirectInterval;
        
        let baseVisits = 29600; 
        let totalVisits = baseVisits;

        fetch('https://api.counterapi.dev/v1/ahmedghoneim_portfolio/visits/up')
            .then(response => response.json())
            .then(data => { totalVisits = baseVisits + data.count; })
            .catch(error => {
                let localVisits = localStorage.getItem('local_visits') || 0;
                localVisits++;
                localStorage.setItem('local_visits', localVisits);
                totalVisits = baseVisits + parseInt(localVisits);
            });

        function triggerWaveAnimation() {
            const buttons = document.querySelectorAll('.links-container .btn');
            buttons.forEach((btn, index) => {
                btn.style.animation = 'none';
                btn.style.opacity = '1';

                btn.classList.remove('wave-active');
                void btn.offsetWidth; 
                
                setTimeout(() => {
                    window.requestAnimationFrame(() => {
                        btn.classList.add('wave-active');
                    });
                }, index * 120); 
                
                setTimeout(() => {
                    window.requestAnimationFrame(() => {
                        btn.classList.remove('wave-active');
                    });
                }, (index * 120) + 850); 
            });
        }

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
                const t = translations[currentLang];
                
                timerDisplay.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;">
                        <span class="ios-spinner" id="timer-icon"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></span> 
                        <span id="timer-text">${t.redirect} <span id="timer-count">${count}</span></span>
                        <button class="cancel-btn" id="cancel-btn">${t.cancel}</button>
                    </div>
                `;

                const countSpan = timerDisplay.querySelector('#timer-count');
                const cancelBtn = timerDisplay.querySelector('#cancel-btn');
                const timerIcon = timerDisplay.querySelector('#timer-icon');
                const timerText = timerDisplay.querySelector('#timer-text');

                cancelBtn.addEventListener('click', (ev) => {
                    ev.preventDefault(); ev.stopPropagation(); clearInterval(redirectInterval);
                    timerDisplay.classList.remove('active'); isRedirecting = false;
                });

                redirectInterval = setInterval(() => {
                    count--;
                    if (count > 0) { countSpan.innerText = count; } 
                    else if (count === 0) {
                        clearInterval(redirectInterval); cancelBtn.style.display = 'none'; 
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

        function updateLanguage() {
            const t = translations[currentLang];
            document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = currentLang;
            document.getElementById('welcome-msg').innerText = t.welcome;
            document.getElementById('modeText').innerText = document.body.classList.contains('light-mode') ? t.modeDark : t.modeLight;
            document.getElementById('lang-label-text').innerText = t.languageLabel;
            document.getElementById('web-contrib').innerHTML = `${t.webContrib}<span id="web-counter">100</span> Web`;
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
            
            if (currentLang === 'ar') {
                window.requestAnimationFrame(() => {
                    langSlider.style.transform = 'translateX(0) translate3d(0,0,0)';
                    langAr.classList.add('active'); langEn.classList.remove('active');
                });
            } else {
                window.requestAnimationFrame(() => {
                    langSlider.style.transform = 'translateX(28px) translate3d(0,0,0)';
                    langEn.classList.add('active'); langAr.classList.remove('active');
                });
            }
        }

        const settingsBtn = document.getElementById('settingsBtn');
        const settingsPanel = document.getElementById('settingsPanel');
        const overlay = document.getElementById('overlay');
        const qrPopup = document.getElementById('qrPopup');
        const shareActionPopup = document.getElementById('shareActionPopup');

        // ==========================================
        // دوال ومؤشرات حركة العداد لمرة واحدة فقط وبدون تعليق
        // ==========================================
        let countersAnimated = false; // مؤشر لضمان عمل العداد مرة واحدة

        function animateCounter(id, target, duration) {
            const el = document.getElementById(id);
            let startTime = null;
            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                // حساب نسبة التقدم من 0 إلى 1
                const progress = Math.min((timestamp - startTime) / duration, 1);
                // معادلة (Easing) تم تعديلها (استخدمنا ^3 بدلاً من ^4) لتكون أسرع في النهاية وتمنع التعليق عند 99
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                // استخدام Math.round لتقريب الرقم بشكل سليم ومنع الكسور الطويلة
                let currentValue = Math.round(easeProgress * target);
                if (currentValue > target) currentValue = target; // أمان لعدم تجاوز الهدف
                
                el.innerText = currentValue.toLocaleString();
                
                if (progress < 1) { 
                    window.requestAnimationFrame(step); 
                } else { 
                    // تأكيد القيمة النهائية بدقة
                    el.innerText = Math.floor(target).toLocaleString(); 
                }
            }
            window.requestAnimationFrame(step);
        }

        const closePanelFunc = () => {
            const isActive = settingsPanel.classList.contains('active');
            window.requestAnimationFrame(() => {
                settingsBtn.classList.remove('rotate'); 
                settingsPanel.classList.remove('active'); 
                if (!qrPopup.classList.contains('active') && !shareActionPopup.classList.contains('active')) {
                    overlay.classList.remove('active'); 
                }
            });
            if (isActive) { triggerWaveAnimation(); }
        };

        settingsBtn.onclick = () => { 
            const isPanelOpen = settingsPanel.classList.contains('active');
            if(!isPanelOpen) {
                window.requestAnimationFrame(() => {
                    settingsBtn.classList.add('rotate'); 
                    settingsPanel.classList.add('active'); 
                    overlay.classList.add('active'); 
                });
                triggerWaveAnimation(); 
                
                // التأكد أن العداد سيتحرك لأول مرة فقط
                if (!countersAnimated) {
                    setTimeout(() => { 
                        animateCounter('web-counter', 100, 1500); 
                        animateCounter('visit-counter', totalVisits, 2000);
                        countersAnimated = true; // إيقاف عمل العداد عند الفتح مرة أخرى
                    }, 400);
                }
            } else {
                closePanelFunc();
            }
        };

        document.getElementById('modeToggle').onclick = () => { document.body.classList.toggle('light-mode'); updateLanguage(); };
        document.getElementById('langToggle').onclick = () => { currentLang = currentLang === 'ar' ? 'en' : 'ar'; updateLanguage(); };
        document.getElementById('accToggle').onclick = () => document.getElementById('accBox').classList.toggle('open');

        let currentSize = 16;
        function changeFontSize(step) {
            currentSize += step;
            if (currentSize >= 12 && currentSize <= 24) { document.documentElement.style.setProperty('--base-font-size', currentSize + 'px'); } 
            else { currentSize -= step; }
            toggleResetFontBtn();
        }

        function resetFontSize() {
            currentSize = 16; document.documentElement.style.setProperty('--base-font-size', currentSize + 'px'); toggleResetFontBtn();
        }

        function toggleResetFontBtn() {
            const resetContainer = document.getElementById('reset-font-container');
            if (currentSize !== 16) { resetContainer.style.maxHeight = '30px'; resetContainer.style.opacity = '1'; } 
            else { resetContainer.style.maxHeight = '0'; resetContainer.style.opacity = '0'; }
        }

        document.getElementById('contrastBtn').onclick = function() { this.classList.toggle('active'); document.body.classList.toggle('high-contrast-text'); };
        document.getElementById('invertBtn').onclick = function() { this.classList.toggle('active'); document.documentElement.classList.toggle('invert-mode'); };
        document.getElementById('glassCounter').onclick = (e) => { e.stopPropagation(); document.getElementById('infoPopup').classList.toggle('active'); };

        const linksContainerEl = document.querySelector('.links-container');
        new Sortable(linksContainerEl, {
            animation: 400, 
            easing: "cubic-bezier(0.22, 1, 0.36, 1)", 
            ghostClass: 'sortable-ghost', 
            dragClass: 'sortable-drag', 
            fallbackClass: 'sortable-fallback', 
            forceFallback: true, 
            fallbackTolerance: 3, 
            delay: 0, 
            delayOnTouchOnly: true, 
            touchStartThreshold: 5,
            swapThreshold: 0.65, 
            direction: 'vertical'
        });

        // ==========================================
        // وظائف نافذة المشاركة الجانبية (Quick Share)
        // ==========================================
        let currentLinkToShare = '';
        let currentPlatformToShare = '';
        const closeShareActionBtn = document.getElementById('closeShareActionBtn');
        const popupCopyBtn = document.getElementById('popupCopyBtn');
        const popupNativeShareBtn = document.getElementById('popupNativeShareBtn');

        document.querySelectorAll('.quick-share-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                // منع عمل الزر الرئيسي لمنع العداد من الظهور
                e.preventDefault();
                e.stopPropagation(); 
                
                currentLinkToShare = this.getAttribute('data-url');
                currentPlatformToShare = this.getAttribute('data-platform');
                
                document.getElementById('share-action-desc').innerText = currentPlatformToShare;
                
                window.requestAnimationFrame(() => {
                    shareActionPopup.classList.add('active');
                    overlay.classList.add('active');
                });
            });
        });

        const closeShareActionPopup = () => {
            window.requestAnimationFrame(() => {
                shareActionPopup.classList.remove('active');
                if (!settingsPanel.classList.contains('active') && !qrPopup.classList.contains('active')) { 
                    overlay.classList.remove('active'); 
                }
            });
        };

        closeShareActionBtn.addEventListener('click', closeShareActionPopup);

        popupCopyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(currentLinkToShare).then(() => {
                const textSpan = document.getElementById('popup-copy-text');
                const t = translations[currentLang];
                textSpan.innerText = t.copied;
                setTimeout(() => { textSpan.innerText = t.copyLink; }, 2000);
            });
        });

        popupNativeShareBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: `Ahmed Ghoneim - ${currentPlatformToShare}`,
                    url: currentLinkToShare
                }).catch(console.error);
            } else {
                alert(translations[currentLang].notSupported);
            }
        });

        // ==========================================
        // الباركود ومشاركة الموقع بالكامل
        // ==========================================
        const innerShareBtn = document.getElementById('innerShareBtn');
        const closeQrBtn = document.getElementById('closeQrBtn');
        const qrCodeContainer = document.getElementById('qrCodeContainer');
        const copyLinkBtn = document.getElementById('copyLinkBtn');

        innerShareBtn.addEventListener('click', () => {
            const currentUrl = window.location.href; 
            
            qrCodeContainer.innerHTML = '';
            
            const qrCode = new QRCodeStyling({
                width: 180,
                height: 180,
                type: "svg", 
                data: currentUrl,
                image: "https://i.supaimg.com/d73ac461-53ca-466f-bc1e-61f2abd83dfe/01659496-a3b9-4e9f-9a68-1da631d42a99.jpg",
                dotsOptions: { color: "#000000", type: "rounded" },
                cornersSquareOptions: { color: "#000000", type: "extra-rounded" },
                cornersDotOptions: { color: "#000000", type: "dot" },
                backgroundOptions: { color: "#ffffff" },
                imageOptions: { margin: 5, imageSize: 0.4 }
            });
            
            qrCode.append(qrCodeContainer);

            window.requestAnimationFrame(() => { qrPopup.classList.add('active'); });
        });

        const closeQrFunc = () => {
            window.requestAnimationFrame(() => {
                qrPopup.classList.remove('active');
                if (!settingsPanel.classList.contains('active') && !shareActionPopup.classList.contains('active')) { 
                    overlay.classList.remove('active'); 
                }
            });
        };

        closeQrBtn.onclick = closeQrFunc;

        overlay.onclick = () => { 
            closePanelFunc(); 
            closeQrFunc(); 
            closeShareActionPopup();
        };

        copyLinkBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                const copyText = document.getElementById('copy-text');
                const t = translations[currentLang];
                copyText.innerText = t.copied;
                setTimeout(() => { copyText.innerText = t.copyLink; }, 2000);
            });
        });

        document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    
    document.getElementById('font-increase-btn')?.addEventListener('click', ()=>changeFontSize(2));
    document.getElementById('font-decrease-btn')?.addEventListener('click', ()=>changeFontSize(-2));
    document.getElementById('reset-font-btn')?.addEventListener('click', resetFontSize);



if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))}
        // تحسين السلاسة - تقليل الضبابية أثناء الحركة
        const smoothPanels = [document.getElementById('settingsPanel'), document.getElementById('qrPopup'), document.getElementById('shareActionPopup')];
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                if(m.target.classList.contains('active')) {
                    m.target.classList.add('animating');
                    setTimeout(() => m.target.classList.remove('animating'), 400);
                }
            });
        });
        smoothPanels.forEach(p => p && observer.observe(p, {attributes:true, attributeFilter:['class']}));


        // توهج متكرر كل 5 ثواني
        setInterval(() => {
            const btns = document.querySelectorAll('.links-container .btn');
            btns.forEach((b, i) => {
                setTimeout(() => b.classList.add('initial-glow'), i * 80); // wave effect
            });
            setTimeout(() => {
                btns.forEach(b => b.classList.remove('initial-glow'));
            }, 1400);
        }, 5000);

