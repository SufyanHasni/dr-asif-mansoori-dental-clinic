/* -------------------------------------------------------------
   BEFORE / AFTER IMAGE COMPARISON SLIDER
   ------------------------------------------------------------- */
const sliderContainer = document.getElementById('sliderContainer');
const afterImageWrapper = document.getElementById('afterImageWrapper');
const sliderHandle = document.getElementById('sliderHandle');

let isDragging = false;

function updateSliderPosition(clientX) {
    if (!sliderContainer || !afterImageWrapper || !sliderHandle) return;
    const rect = sliderContainer.getBoundingClientRect();
    const positionX = clientX - rect.left;
    
    let percentage = (positionX / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    
    afterImageWrapper.style.width = percentage + '%';
    sliderHandle.style.left = percentage + '%';
}

if (sliderHandle) {
    sliderHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        updateSliderPosition(e.clientX);
    });

    sliderHandle.addEventListener('touchstart', (e) => {
        isDragging = true;
    });

    window.addEventListener('touchend', () => {
        isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        if (e.touches && e.touches[0]) {
            updateSliderPosition(e.touches[0].clientX);
        }
    });
}

if (sliderContainer) {
    sliderContainer.addEventListener('click', (e) => {
        updateSliderPosition(e.clientX);
    });
}


/* -------------------------------------------------------------
   STICKY TOOTH CLEANING GAME
   ------------------------------------------------------------- */
function toggleToothCleaningModal() {
    const modal = document.getElementById('tooth-cleaning-modal');
    if (modal) {
        modal.classList.toggle('hidden');
        if (!modal.classList.contains('hidden')) {
            initStickyToothCanvas();
        }
    }
}

let stickyCanvas, stickyCtx, stickyCleanProgress = 0;
let isScrubbing = false;

function initStickyToothCanvas() {
    stickyCanvas = document.getElementById('stickyToothCanvas');
    if (!stickyCanvas) return;
    stickyCtx = stickyCanvas.getContext('2d');
    stickyCanvas.width = stickyCanvas.offsetWidth || 300;
    stickyCanvas.height = stickyCanvas.offsetHeight || 180;

    drawStickyTooth();

    // Cleaning interaction listeners
    stickyCanvas.onmousedown = (e) => { isScrubbing = true; scrubTooth(e); };
    window.onmouseup = () => { isScrubbing = false; };
    stickyCanvas.onmousemove = (e) => { if (isScrubbing) scrubTooth(e); };

    stickyCanvas.ontouchstart = (e) => { isScrubbing = true; scrubTooth(e.touches[0]); e.preventDefault(); };
    window.ontouchend = () => { isScrubbing = false; };
    stickyCanvas.ontouchmove = (e) => { if (isScrubbing && e.touches[0]) { scrubTooth(e.touches[0]); e.preventDefault(); } };
}

function scrubTooth(e) {
    if (!stickyCanvas || stickyCleanProgress >= 100) return;
    const rect = stickyCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const w = stickyCanvas.width;
    const h = stickyCanvas.height;
    const toothX = w / 2;
    const toothY = h / 2;

    // Check distance from center of tooth
    const dist = Math.hypot(x - toothX, y - toothY);
    if (dist < 50) {
        stickyCleanProgress += 3;
        if (stickyCleanProgress > 100) stickyCleanProgress = 100;

        const percentEl = document.getElementById('sticky-clean-percent');
        const barEl = document.getElementById('sticky-clean-bar');
        if (percentEl) percentEl.textContent = stickyCleanProgress + '%';
        if (barEl) barEl.style.width = stickyCleanProgress + '%';

        drawStickyTooth();
    }
}

function drawStickyTooth() {
    if (!stickyCtx || !stickyCanvas) return;
    const w = stickyCanvas.width;
    const h = stickyCanvas.height;
    
    stickyCtx.clearRect(0, 0, w, h);
    
    // Tooth background shape
    stickyCtx.fillStyle = '#f8fafc';
    stickyCtx.beginPath();
    if (typeof stickyCtx.roundRect === 'function') {
        stickyCtx.roundRect(w/2 - 40, h/2 - 50, 80, 100, [30, 30, 20, 20]);
    } else {
        stickyCtx.rect(w/2 - 40, h/2 - 50, 80, 100);
    }
    stickyCtx.fill();

    // Stains overlay based on progress
    if (stickyCleanProgress < 100) {
        stickyCtx.fillStyle = `rgba(180, 120, 40, ${(100 - stickyCleanProgress) / 100})`;
        stickyCtx.beginPath();
        stickyCtx.arc(w/2, h/2, 35, 0, Math.PI * 2);
        stickyCtx.fill();
    } else {
        // Sparkle effect when fully clean
        stickyCtx.fillStyle = '#38bdf8';
        stickyCtx.font = '20px sans-serif';
        stickyCtx.fillText('✨ Clean & Shining!', w/2 - 60, h/2 - 60);
    }
}


/* -------------------------------------------------------------
   CARTOON TEETH & BRUSH ANIMATED BACKGROUND CANVAS
   ------------------------------------------------------------- */
function initCartoonBackground() {
    const canvas = document.getElementById('cartoon-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const items = [];
    const itemCount = Math.min(25, Math.floor(width / 50));

    for (let i = 0; i < itemCount; i++) {
        items.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 24 + Math.random() * 26,
            type: ['tooth', 'tooth', 'brush', 'paste', 'sparkle'][Math.floor(Math.random() * 5)],
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            angle: Math.random() * Math.PI * 2,
            vAngle: (Math.random() - 0.5) * 0.02,
            opacity: 0.25 + Math.random() * 0.35
        });
    }

    function drawCartoonTooth(c, x, y, size, angle, opacity) {
        c.save();
        c.translate(x, y);
        c.rotate(angle);
        c.globalAlpha = opacity;

        const w = size;
        const h = size * 1.2;

        c.fillStyle = '#ffffff';
        c.strokeStyle = '#38bdf8';
        c.lineWidth = 2;

        c.beginPath();
        c.moveTo(-w * 0.4, -h * 0.3);
        c.bezierCurveTo(-w * 0.5, -h * 0.6, w * 0.5, -h * 0.6, w * 0.4, -h * 0.3);
        c.bezierCurveTo(w * 0.5, h * 0.1, w * 0.35, h * 0.5, w * 0.2, h * 0.5);
        c.bezierCurveTo(w * 0.05, h * 0.5, 0, h * 0.2, 0, h * 0.2);
        c.bezierCurveTo(0, h * 0.2, -w * 0.05, h * 0.5, -w * 0.2, h * 0.5);
        c.bezierCurveTo(-w * 0.35, h * 0.5, -w * 0.5, h * 0.1, -w * 0.4, -h * 0.3);
        c.closePath();
        c.fill();
        c.stroke();

        c.fillStyle = '#0f172a';
        c.beginPath();
        c.arc(-w * 0.15, -h * 0.15, size * 0.08, 0, Math.PI * 2);
        c.arc(w * 0.15, -h * 0.15, size * 0.08, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = '#ffffff';
        c.beginPath();
        c.arc(-w * 0.13, -h * 0.18, size * 0.03, 0, Math.PI * 2);
        c.arc(w * 0.17, -h * 0.18, size * 0.03, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = 'rgba(244, 114, 182, 0.6)';
        c.beginPath();
        c.arc(-w * 0.25, -h * 0.03, size * 0.08, 0, Math.PI * 2);
        c.arc(w * 0.25, -h * 0.03, size * 0.08, 0, Math.PI * 2);
        c.fill();

        c.strokeStyle = '#0f172a';
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(0, -h * 0.05, size * 0.12, 0.1 * Math.PI, 0.9 * Math.PI);
        c.stroke();

        c.restore();
    }

    function drawToothbrush(c, x, y, size, angle, opacity) {
        c.save();
        c.translate(x, y);
        c.rotate(angle);
        c.globalAlpha = opacity;

        const length = size * 1.8;
        const width = size * 0.25;

        c.fillStyle = '#14b8a6';
        c.beginPath();
        if (typeof c.roundRect === 'function') {
            c.roundRect(-width / 2, -length / 2, width, length, 6);
        } else {
            c.rect(-width / 2, -length / 2, width, length);
        }
        c.fill();

        c.fillStyle = '#f8fafc';
        c.fillRect(-width / 2, -length / 2 - 8, width, 10);

        c.fillStyle = '#38bdf8';
        c.fillRect(-width / 2 - 2, -length / 2 - 16, width + 4, 8);

        c.restore();
    }

    function drawToothpaste(c, x, y, size, angle, opacity) {
        c.save();
        c.translate(x, y);
        c.rotate(angle);
        c.globalAlpha = opacity;

        c.fillStyle = '#818cf8';
        c.beginPath();
        c.moveTo(-size * 0.3, size * 0.4);
        c.lineTo(size * 0.3, size * 0.4);
        c.lineTo(size * 0.25, -size * 0.3);
        c.lineTo(-size * 0.25, -size * 0.3);
        c.closePath();
        c.fill();

        c.fillStyle = '#f43f5e';
        c.fillRect(-size * 0.12, -size * 0.5, size * 0.24, size * 0.2);

        c.restore();
    }

    function drawSparkle(c, x, y, size, opacity) {
        c.save();
        c.translate(x, y);
        c.globalAlpha = opacity;
        c.fillStyle = '#2dd4bf';

        c.beginPath();
        c.moveTo(0, -size * 0.5);
        c.quadraticCurveTo(0, 0, size * 0.5, 0);
        c.quadraticCurveTo(0, 0, 0, size * 0.5);
        c.quadraticCurveTo(0, 0, -size * 0.5, 0);
        c.quadraticCurveTo(0, 0, 0, -size * 0.5);
        c.fill();

        c.restore();
    }

    function animateBackground() {
        ctx.clearRect(0, 0, width, height);

        items.forEach(item => {
            item.x += item.vx;
            item.y += item.vy;
            item.angle += item.vAngle;

            if (item.x < -50) item.x = width + 50;
            if (item.x > width + 50) item.x = -50;
            if (item.y < -50) item.y = height + 50;
            if (item.y > height + 50) item.y = -50;

            if (item.type === 'tooth') {
                drawCartoonTooth(ctx, item.x, item.y, item.size, item.angle, item.opacity);
            } else if (item.type === 'brush') {
                drawToothbrush(ctx, item.x, item.y, item.size, item.angle, item.opacity);
            } else if (item.type === 'paste') {
                drawToothpaste(ctx, item.x, item.y, item.size, item.angle, item.opacity);
            } else {
                drawSparkle(ctx, item.x, item.y, item.size * 0.8, item.opacity);
            }
        });

        requestAnimationFrame(animateBackground);
    }

    animateBackground();
}

// Global initialization on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initCartoonBackground();

    let lastScrollY = window.scrollY;
    const headerEl = document.querySelector('header');

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (headerEl) {
            if (currentScrollY > lastScrollY && currentScrollY > 80) {
                headerEl.classList.add('header-hidden');
            } else {
                headerEl.classList.remove('header-hidden');
            }
        }
        lastScrollY = currentScrollY;
    }, { passive: true });

    const observerOptions = { threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-element').forEach(el => observer.observe(el));
});