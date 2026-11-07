(() => {
  const loader = document.getElementById('cinematicLoader');
  const role = document.getElementById('loaderRole');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Build scroll-reveal targets without changing the existing layout or content.
  const revealTargets = [
    ...document.querySelectorAll('main > section:not(.hero) .container, main > section:not(.hero) .section-head, main > section:not(.hero) .about-grid, main > section:not(.hero) .stack-marquee-inner, main > section:not(.hero) .project-slide, main > section:not(.hero) .contact-grid, footer .footer-inner')
  ];
  revealTargets.forEach((el, index) => {
    if (el.classList.contains('reveal')) el.classList.remove('reveal');
    el.classList.add('scroll-reveal');
    if (index % 4 === 1) el.dataset.delay = '1';
    if (index % 4 === 2) el.dataset.delay = '2';
    if (index % 4 === 3) el.dataset.delay = '3';
  });

  // Reveal smaller content groups as well, so the motion continues throughout the page.
  document.querySelectorAll('.specialty-item, .stat, .skill-card, .experience-item, .project-info, .contact-card, .contact-form').forEach((el, index) => {
    if (el.closest('.scroll-reveal')) return;
    el.classList.add('scroll-reveal');
    if (index % 4) el.dataset.delay = String(index % 4);
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

  const finish = () => {
    document.body.classList.remove('is-loading');
    loader?.classList.add('is-leaving');
    window.setTimeout(() => loader?.remove(), 1200);
  };

  if (!loader) return;
  if (reduceMotion) {
    finish();
    return;
  }

  const words = [
    { text: 'Creative', color: 'blue' },
    { text: 'Developer', color: 'pink' },
    { text: 'Designer', color: 'blue' }
  ];
  let index = 0;
  const showWord = () => {
    role.classList.remove('flip-in');
    role.classList.toggle('role-pink', words[index].color === 'pink');
    role.textContent = words[index].text;
    void role.offsetWidth;
    role.classList.add('flip-in');
  };

  window.setTimeout(() => {
    showWord();
    const interval = window.setInterval(() => {
      index += 1;
      if (index >= words.length) {
        window.clearInterval(interval);
        window.setTimeout(finish, 700);
        return;
      }
      showWord();
    }, 760);
  }, 980);
})();
