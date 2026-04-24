// ── Scroll: progress bar + nav ───────────────────────────
const progressBar = document.getElementById('progress-bar');
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (docHeight > 0 ? scrollTop / docHeight * 100 : 0) + '%';
  nav.classList.toggle('scrolled', scrollTop > 20);
}, { passive: true });

// ── Mobile nav ───────────────────────────────────────────
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('nav-mobile');
burger.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
});
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileNav.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}));

// ── Matrix canvas rain ───────────────────────────────────
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas, { passive: true });

const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモ';
const fontSize = 13;
let columns = Math.floor(canvas.width / fontSize);
let drops = Array(columns).fill(1).map(() => Math.random() * -100);

function drawMatrix() {
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontSize}px 'Space Mono', monospace`;
  for (let i = 0; i < drops.length; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillStyle = drops[i] * fontSize < 60 ? '#ffffff' : '#00ff88';
    ctx.fillText(char, i * fontSize, drops[i] * fontSize);
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  }
}
setInterval(drawMatrix, 50);

// ── Terminal typing animation ────────────────────────────
const terminalBody = document.querySelector('.terminal-body');
const SCRIPT = [
  { type: 'cmd', text: '/ban @spammer reason: spam' },
  { type: 'out', pre: '✓ ', body: 'User banned → ', hl: '#mod-logs' },
  { type: 'gap' },
  { type: 'cmd', text: '/ai moderate enable' },
  { type: 'out', pre: '✓ ', body: 'AI moderation ', hl: 'active' },
  { type: 'gap' },
  { type: 'cmd', text: '/log channel #server-logs' },
  { type: 'out', pre: '✓ ', body: 'Logging ', hl: 'all events' },
];

function runTerminal() {
  terminalBody.innerHTML = '';

  const cursorLine = document.createElement('div');
  cursorLine.className = 't-line';
  const prompt = document.createElement('span');
  prompt.className = 't-prompt';
  prompt.textContent = '$';
  const cmdSpan = document.createElement('span');
  cmdSpan.className = 't-cmd';
  const cursor = document.createElement('span');
  cursor.className = 't-cursor';
  cursor.textContent = '█';
  cursorLine.append(prompt, cmdSpan, cursor);
  terminalBody.appendChild(cursorLine);

  let idx = 0;

  function next() {
    if (idx >= SCRIPT.length) return;
    const item = SCRIPT[idx++];

    if (item.type === 'gap') {
      const gap = document.createElement('div');
      gap.className = 't-spacer';
      cursorLine.before(gap);
      setTimeout(next, 80);
      return;
    }

    if (item.type === 'out') {
      const div = document.createElement('div');
      div.className = 't-line t-out';
      div.innerHTML = `<span class="t-green">${item.pre}</span>${item.body}<span class="t-white">${item.hl}</span>`;
      cursorLine.before(div);
      setTimeout(next, 380);
      return;
    }

    // cmd: type character by character
    cmdSpan.textContent = ' ';
    let ci = 0;
    function tick() {
      if (ci < item.text.length) {
        cmdSpan.textContent = ' ' + item.text.slice(0, ++ci);
        setTimeout(tick, 26 + Math.random() * 22);
      } else {
        const done = document.createElement('div');
        done.className = 't-line';
        const dp = document.createElement('span');
        dp.className = 't-prompt';
        dp.textContent = '$';
        const dc = document.createElement('span');
        dc.className = 't-cmd';
        dc.textContent = ' ' + item.text;
        done.append(dp, dc);
        cursorLine.replaceWith(done);
        done.after(cursorLine);
        cmdSpan.textContent = ' ';
        setTimeout(next, 260);
      }
    }
    tick();
  }

  setTimeout(next, 700);
}

runTerminal();

// ── Stat counter animation ───────────────────────────────
const statNums = document.querySelectorAll('.stat-num');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const raw = el.textContent.trim();
    const match = raw.match(/^([\d.]+)(.*)/);
    if (!match) { statObserver.unobserve(el); return; }
    const target = parseFloat(match[1]);
    const suffix = match[2];
    const isFloat = match[1].includes('.');
    const start = performance.now();
    const duration = 1400;
    function tick(now) {
      const ease = 1 - Math.pow(1 - Math.min((now - start) / duration, 1), 3);
      const val = target * ease;
      el.textContent = (isFloat ? val.toFixed(1) : Math.floor(val)) + suffix;
      if (ease < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    statObserver.unobserve(el);
  });
}, { threshold: 0.5 });
statNums.forEach(s => statObserver.observe(s));

// ── Live bot stats via /api/stats (top.gg proxy) ─────────
function fmt(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M+';
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'K+';
  return String(n);
}

fetch('/api/stats')
  .then(r => r.json())
  .then(data => {
    if (data.servers  != null) document.getElementById('stat-servers').textContent  = fmt(data.servers);
    if (data.members  != null) document.getElementById('stat-members').textContent  = fmt(data.members);
    if (data.commands != null) document.getElementById('stat-commands').textContent = fmt(data.commands);
  })
  .catch(() => {
    // Fallback to last-known values if API is unreachable
    document.getElementById('stat-servers').textContent  = '12K+';
    document.getElementById('stat-members').textContent  = '2M+';
    document.getElementById('stat-commands').textContent = '5M+';
  });

// ── Live bot uptime ───────────────────────────────────────
// Update BOT_START to match the actual date the bot went live
const BOT_START = new Date('2024-01-01T00:00:00Z');
const uptimeEl = document.getElementById('stat-uptime');
function refreshUptime() {
  const ms = Date.now() - BOT_START.getTime();
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  uptimeEl.textContent = `${d}d ${h}h`;
}
refreshUptime();
setInterval(refreshUptime, 60000);

// ── Feature card scroll reveal ───────────────────────────
const cards = document.querySelectorAll('.feature-card');
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('visible'), delay);
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
cards.forEach(c => cardObserver.observe(c));

// ── Generic staggered reveal (commands + testimonials) ───
const revealEls = document.querySelectorAll('.cmd-category, .testimonial-card');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 90);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
revealEls.forEach(el => revealObserver.observe(el));

// ── About section reveal ─────────────────────────────────
const aboutEls = document.querySelectorAll('.about-card-row, .about-text h2, .about-text p, .about-chips');
const aboutObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'none';
      }, i * 60);
      aboutObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
aboutEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(12px)';
  el.style.transition = '0.4s ease';
  aboutObserver.observe(el);
});
