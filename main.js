// NAV scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20));

// Mobile nav
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('nav-mobile');
burger.addEventListener('click', () => mobileNav.classList.toggle('open'));
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

// Matrix canvas rain
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモ';
const fontSize = 13;
let columns = Math.floor(canvas.width / fontSize);
let drops = Array(columns).fill(1).map(() => Math.random() * -100);

function drawMatrix() {
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#00ff88';
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

// Feature card scroll reveal
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

// About section reveal
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
