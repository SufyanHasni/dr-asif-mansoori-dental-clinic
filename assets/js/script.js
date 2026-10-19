
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmallScreen = window.matchMedia('(max-width: 767px)').matches;

  /* ---------------- BEFORE / AFTER COMPARISON SLIDER ---------------- */
  const slider = document.getElementById('sliderContainer');
  const afterLayer = document.getElementById('afterImageWrapper');
  const handle = document.getElementById('sliderHandle');
  let sliderDragging = false;

  function setSlider(clientX) {
    if (!slider || !afterLayer || !handle) return;
    const rect = slider.getBoundingClientRect();
    if (!rect.width) return;
    const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    afterLayer.style.width = `${percent}%`;
    handle.style.left = `${percent}%`;
    handle.setAttribute('aria-valuenow', String(Math.round(percent)));
  }

  if (slider && afterLayer && handle) {
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', 'Compare before and after dental treatment');
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');
    handle.setAttribute('aria-valuenow', '50');
    handle.setAttribute('tabindex', '0');

    slider.addEventListener('pointerdown', (event) => {
      sliderDragging = true;
      if (handle.setPointerCapture && event.target === handle) {
        try { handle.setPointerCapture(event.pointerId); } catch (_) {}
      }
      setSlider(event.clientX);
    });
    window.addEventListener('pointermove', (event) => {
      if (sliderDragging) setSlider(event.clientX);
    }, { passive: true });
    window.addEventListener('pointerup', () => { sliderDragging = false; }, { passive: true });
    window.addEventListener('pointercancel', () => { sliderDragging = false; }, { passive: true });
    slider.addEventListener('click', (event) => {
      if (event.target.closest('#sliderHandle')) return;
      setSlider(event.clientX);
    });
    handle.addEventListener('keydown', (event) => {
      const current = Number(handle.getAttribute('aria-valuenow') || 50);
      let next = current;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next -= 2;
      else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next += 2;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = 100;
      else return;
      event.preventDefault();
      const rect = slider.getBoundingClientRect();
      setSlider(rect.left + rect.width * Math.max(0, Math.min(100, next)) / 100);
    });
  }

  /* ---------------- STICKY TOOTH CLEANING MINI-GAME ---------------- */
  const modal = document.getElementById('tooth-cleaning-modal');
  const toothCanvas = document.getElementById('stickyToothCanvas');
  let toothCtx = null;
  let cleanliness = 0;
  let scrubbing = false;
  let canvasReady = false;

  window.toggleToothCleaningModal = function toggleToothCleaningModal() {
    if (!modal) return;
    modal.classList.toggle('hidden');
    const open = !modal.classList.contains('hidden');
    const toggle = document.getElementById('toggle-cleaning-btn');
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      requestAnimationFrame(() => {
        setupToothCanvas();
        drawTooth();
      });
    }
  };

  function setupToothCanvas() {
    if (!toothCanvas) return;
    const rect = toothCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const wantedW = Math.round(rect.width * dpr);
    const wantedH = Math.round(rect.height * dpr);
    if (toothCanvas.width !== wantedW || toothCanvas.height !== wantedH) {
      toothCanvas.width = wantedW;
      toothCanvas.height = wantedH;
    }
    toothCtx = toothCanvas.getContext('2d');
    if (!toothCtx) return;
    toothCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvasReady = true;
  }

  function drawTooth() {
    if (!toothCtx || !toothCanvas || !canvasReady) return;
    const rect = toothCanvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    toothCtx.clearRect(0, 0, w, h);
    toothCtx.save();
    toothCtx.translate(w / 2, h / 2);
    toothCtx.fillStyle = '#f8fafc';
    toothCtx.strokeStyle = '#bae6fd';
    toothCtx.lineWidth = 2;
    toothCtx.beginPath();
    if (typeof toothCtx.roundRect === 'function') toothCtx.roundRect(-37, -47, 74, 94, [26, 26, 18, 18]);
    else toothCtx.rect(-37, -47, 74, 94);
    toothCtx.fill();
    toothCtx.stroke();

    if (cleanliness < 100) {
      toothCtx.fillStyle = `rgba(180, 120, 40, ${(100 - cleanliness) / 150})`;
      toothCtx.beginPath();
      toothCtx.ellipse(0, 0, 29, 32, -.1, 0, Math.PI * 2);
      toothCtx.fill();
    } else {
      toothCtx.fillStyle = '#0891b2';
      toothCtx.font = 'bold 12px Inter, sans-serif';
      toothCtx.textAlign = 'center';
      toothCtx.fillText('✨ Clean & Shining!', 0, -58);
      toothCtx.textAlign = 'start';
    }
    toothCtx.restore();
  }

  function scrub(event) {
    if (!toothCanvas || cleanliness >= 100) return;
    const rect = toothCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    if (Math.hypot(x - rect.width / 2, y - rect.height / 2) > 58) return;
    cleanliness = Math.min(100, cleanliness + 2);
    const percent = document.getElementById('sticky-clean-percent');
    const bar = document.getElementById('sticky-clean-bar');
    if (percent) percent.textContent = `${cleanliness}%`;
    if (bar) bar.style.width = `${cleanliness}%`;
    drawTooth();
  }

  if (toothCanvas) {
    toothCanvas.addEventListener('pointerdown', (event) => {
      scrubbing = true;
      try { toothCanvas.setPointerCapture(event.pointerId); } catch (_) {}
      scrub(event);
    });
    toothCanvas.addEventListener('pointermove', (event) => { if (scrubbing) scrub(event); });
    toothCanvas.addEventListener('pointerup', () => { scrubbing = false; });
    toothCanvas.addEventListener('pointercancel', () => { scrubbing = false; });
  }
  window.addEventListener('resize', () => {
    if (modal && !modal.classList.contains('hidden')) {
      setupToothCanvas();
      drawTooth();
    }
  }, { passive: true });

  /* ---------------- LIGHTWEIGHT FLOATING DENTAL BACKDROP ---------------- */
  function initBackground() {
    const canvas = document.getElementById('cartoon-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0, height = 0, rafId = 0, lastFrame = 0;
    const frameInterval = isSmallScreen ? 1000 / 24 : 1000 / 30;
    const particles = [];
    const particleLimit = isSmallScreen ? 8 : 17;
    let pageVisible = !document.hidden;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1 : 1.35);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles.length = 0;
      for (let i = 0; i < particleLimit; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: isSmallScreen ? 12 + Math.random() * 11 : 15 + Math.random() * 19,
          kind: Math.random() > .68 ? 'sparkle' : 'tooth',
          vx: (Math.random() - .5) * (isSmallScreen ? .18 : .28),
          vy: (Math.random() - .5) * (isSmallScreen ? .18 : .28),
          phase: Math.random() * Math.PI * 2,
          alpha: .10 + Math.random() * .13
        });
      }
    }

    function drawTooth(p, time) {
      ctx.save();
      ctx.translate(p.x, p.y + Math.sin(time / 1500 + p.phase) * 3);
      ctx.rotate(Math.sin(time / 2400 + p.phase) * .12);
      ctx.globalAlpha = p.alpha;
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = 'rgba(226, 250, 255, .75)';
      ctx.lineWidth = 1.4;
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(-s * .42, -s * .22);
      ctx.bezierCurveTo(-s * .52, -s * .58, s * .52, -s * .58, s * .42, -s * .22);
      ctx.bezierCurveTo(s * .38, s * .10, s * .28, s * .48, s * .12, s * .48);
      ctx.bezierCurveTo(0, s * .48, 0, s * .19, 0, s * .19);
      ctx.bezierCurveTo(0, s * .19, 0, s * .48, -s * .12, s * .48);
      ctx.bezierCurveTo(-s * .28, s * .48, -s * .38, s * .10, -s * .42, -s * .22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    function drawSparkle(p, time) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(time / 4500 + p.phase);
      ctx.globalAlpha = p.alpha + Math.sin(time / 800 + p.phase) * .035;
      ctx.fillStyle = '#2dd4bf';
      ctx.beginPath();
      ctx.moveTo(0, -p.size * .55);
      ctx.lineTo(p.size * .16, -p.size * .16);
      ctx.lineTo(p.size * .55, 0);
      ctx.lineTo(p.size * .16, p.size * .16);
      ctx.lineTo(0, p.size * .55);
      ctx.lineTo(-p.size * .16, p.size * .16);
      ctx.lineTo(-p.size * .55, 0);
      ctx.lineTo(-p.size * .16, -p.size * .16);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function render(time) {
      rafId = 0;
      if (!pageVisible || document.hidden) return;
      if (time - lastFrame < frameInterval) {
        rafId = requestAnimationFrame(render);
        return;
      }
      lastFrame = time;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -40) p.x = width + 40;
        if (p.x > width + 40) p.x = -40;
        if (p.y < -40) p.y = height + 40;
        if (p.y > height + 40) p.y = -40;
        if (p.kind === 'tooth') drawTooth(p, time);
        else drawSparkle(p, time);
      }
      rafId = requestAnimationFrame(render);
    }

    function start() {
      if (!pageVisible || document.hidden || reducedMotion || rafId) return;
      rafId = requestAnimationFrame(render);
    }
    function stop() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      ctx.clearRect(0, 0, width, height);
    }

    resize();
    if (!reducedMotion) start();
    document.addEventListener('visibilitychange', () => {
      pageVisible = !document.hidden;
      if (pageVisible) start(); else stop();
    });
    window.addEventListener('resize', resize, { passive: true });
    if (reducedMotion) canvas.style.display = 'none';
  }

  /* ---------------- SCROLL REVEALS + HEADER ---------------- */
  function initMotion() {
    const sections = document.querySelectorAll('.reveal-element');
    if ('IntersectionObserver' in window && !reducedMotion) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
      sections.forEach((section) => {
        if (section.id === 'home') {
          section.classList.add('is-visible');
          return;
        }
        section.classList.add('motion-ready');
        observer.observe(section);
      });
    } else {
      sections.forEach((section) => section.classList.add('is-visible'));
    }

    const header = document.querySelector('header');
    let previousY = window.scrollY;
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        if (header) {
          if (currentY > previousY && currentY > 140) header.classList.add('header-hidden');
          else header.classList.remove('header-hidden');
        }
        previousY = Math.max(0, currentY);
        scrollTicking = false;
      });
    }, { passive: true });

    // Service cards reveal with a gentle stagger after the section becomes visible.
    const cards = document.querySelectorAll('#expertise .glass-card');
    if ('IntersectionObserver' in window && !reducedMotion) {
      const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Array.from(cards).indexOf(entry.target);
          entry.target.animate(
            [{ opacity: 0, transform: 'translate3d(0,18px,0) scale(.985)' },
             { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' }],
            { duration: 520, delay: Math.min(index % 3, 2) * 85, easing: 'cubic-bezier(.2,.75,.2,1)', fill: 'both' }
          );
          cardObserver.unobserve(entry.target);
        });
      }, { threshold: .08 });
      cards.forEach(card => cardObserver.observe(card));
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initBackground();
    initMotion();
  });
})();
