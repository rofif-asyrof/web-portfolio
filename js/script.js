const nav = document.getElementById('nav');
const progress = document.getElementById('scrollProgress');
const navLinks = document.querySelectorAll('#navLinks a');
const sectionIds = ['about', 'experience', 'projects', 'skills', 'education'];

let ticking = false;

function updateScrollState() {
  ticking = false;

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const current = window.scrollY;
  const percent = maxScroll > 0 ? Math.min(100, (current / maxScroll) * 100) : 0;

  progress.style.width = percent + '%';
  nav.classList.toggle('is-scrolled', current > 28);
}

function requestScrollUpdate() {
  if (!ticking) {
    window.requestAnimationFrame(updateScrollState);
    ticking = true;
  }
}

window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate);
updateScrollState();

const activeObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
      });
    });
  },
  {
    rootMargin: '-35% 0px -55% 0px',
    threshold: 0,
  }
);

sectionIds.forEach(id => {
  const section = document.getElementById(id);
  if (section) activeObserver.observe(section);
});

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.12,
  }
);

document.querySelectorAll('.reveal').forEach(element => {
  revealObserver.observe(element);
});
