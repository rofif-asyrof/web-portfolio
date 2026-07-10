const nav = document.getElementById('nav');
const progress = document.getElementById('scrollProgress');
const navLinks = document.querySelectorAll('#navLinks a');
const sectionIds = ['about', 'experience', 'projects', 'skills', 'education'];

let ticking = false;

/**
 * Updates the scroll progress bar width and toggles the navigation bar's
 * blurred background state based on the current scroll position.
 */
function updateScrollState() {
  ticking = false;

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const current = window.scrollY;
  const percent = maxScroll > 0 ? Math.min(100, (current / maxScroll) * 100) : 0;

  progress.style.width = percent + '%';
  nav.classList.toggle('is-scrolled', current > 28);
}

/**
 * Wrapper for updateScrollState using requestAnimationFrame to ensure
 * smooth scroll performance without layout thrashing.
 */
function requestScrollUpdate() {
  if (!ticking) {
    window.requestAnimationFrame(updateScrollState);
    ticking = true;
  }
}

window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate);
updateScrollState();

const navBrand = document.getElementById('navBrand');
if (navBrand) {
  navBrand.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

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

/* ============ DRAWER MENU ============ */

const toggle = document.getElementById('navToggle');
const drawer = document.getElementById('navDrawer');
const backdrop = document.getElementById('drawerBackdrop');
const drawerClose = document.getElementById('drawerClose');
const drawerLinks = drawer.querySelectorAll('a');

/**
 * Opens the mobile navigation drawer, shows the backdrop,
 * and locks the body scrolling.
 */
function openDrawer() {
  drawer.classList.add('is-open');
  backdrop.classList.add('is-open');
  toggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

/**
 * Closes the mobile navigation drawer, hides the backdrop,
 * and restores body scrolling.
 */
function closeDrawer() {
  drawer.classList.remove('is-open');
  backdrop.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

toggle.addEventListener('click', openDrawer);
drawerClose.addEventListener('click', closeDrawer);
backdrop.addEventListener('click', closeDrawer);

drawerLinks.forEach(link => {
  link.addEventListener('click', closeDrawer);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
    closeDrawer();
  }
});

/* ============ CONTACT FORM ============ */

const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('formSubmit');
const successMsg = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Clear previous errors
    form.querySelectorAll('.form__error').forEach(el => (el.textContent = ''));

    const name = form.querySelector('#f-name').value.trim();
    const email = form.querySelector('#f-email').value.trim();
    const subject = form.querySelector('#f-subject').value.trim();
    const message = form.querySelector('#f-msg').value.trim();

    let hasError = false;

    if (!name) {
      form.querySelector('[data-err="name"]').textContent = 'Name is required.';
      hasError = true;
    }

    if (!email) {
      form.querySelector('[data-err="email"]').textContent = 'Email is required.';
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      form.querySelector('[data-err="email"]').textContent = 'Please enter a valid email.';
      hasError = true;
    }

    if (!subject) {
      form.querySelector('[data-err="subject"]').textContent = 'Subject is required.';
      hasError = true;
    }

    if (!message) {
      form.querySelector('[data-err="message"]').textContent = 'Message is required.';
      hasError = true;
    }

    if (hasError) return;

    // Submit to Formspree
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        form.reset();
        successMsg.classList.add('is-visible');
        submitBtn.textContent = 'Sent ✓';
        setTimeout(() => {
          successMsg.classList.remove('is-visible');
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Send Message <span class="arr">↗</span>';
        }, 5000);
      } else {
        submitBtn.textContent = 'Failed — try again';
        submitBtn.disabled = false;
        setTimeout(() => {
          submitBtn.innerHTML = 'Send Message <span class="arr">↗</span>';
        }, 3000);
      }
    } catch {
      submitBtn.textContent = 'Network error — try again';
      submitBtn.disabled = false;
      setTimeout(() => {
        submitBtn.innerHTML = 'Send Message <span class="arr">↗</span>';
      }, 3000);
    }
  });
}

/* ============ SCROLL-STACK HERO → ABOUT TRANSITION ============ */

const heroEl = document.querySelector('.hero');
const aboutEl = document.getElementById('about');
const scrollStack = document.querySelector('.scroll-stack');

if (heroEl && aboutEl && scrollStack) {
  let stackTicking = false;

  /**
   * Calculates the scroll percentage relative to the hero section's height
   * and applies scale/rotate transforms to create a stacking card illusion.
   */
  function updateStackTransform() {
    stackTicking = false;
    const heroH = heroEl.offsetHeight;
    const stackTop = scrollStack.getBoundingClientRect().top;
    const p = Math.max(0, Math.min(1, -stackTop / heroH));

    heroEl.style.transform = `scale(${1 - 0.2 * p}) rotate(${-5 * p}deg)`;
    aboutEl.style.transform = `scale(${0.8 + 0.2 * p}) rotate(${5 - 5 * p}deg)`;
  }

  /**
   * Throttles the scroll-stack transformation using requestAnimationFrame.
   */
  function onStackScroll() {
    if (!stackTicking) {
      requestAnimationFrame(updateStackTransform);
      stackTicking = true;
    }
  }

  window.addEventListener('scroll', onStackScroll, { passive: true });
  window.addEventListener('resize', onStackScroll);
  updateStackTransform();
}
