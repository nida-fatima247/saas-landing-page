/* ==========================================================
   AUTONIX — Main interactions
========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  /* ----------------------------------------------------------
     1. PRELOADER -> NAVBAR HANDOFF
     Brand name is huge & centered for 2s, then the whole
     preloader curtain slides up while the brand text/logo
     shrinks and glides into the exact position of the navbar
     logo, at which point the real navbar fades in.
  ---------------------------------------------------------- */
  const preloader = document.getElementById('preloader');
  const preloaderInner = document.getElementById('preloader-inner');
  const navbar = document.getElementById('navbar');
  const navBrand = document.getElementById('nav-brand');

  function runPreloaderSequence() {
    // Measure the SAME kind of box on both ends: the whole logo+name
    // group, not a mix of inner spans — otherwise the icon's width
    // throws off the horizontal delta.
    const targetRect = navBrand.getBoundingClientRect();
    const startRect = preloaderInner.getBoundingClientRect();

    // Uniform scale from height (both boxes have the same aspect logic:
    // icon + gap + text, centered).
    const scaleFactor = (targetRect.height / startRect.height) * 1.2;

    // Because transform-origin is 'top left' below, the top-left corner
    // is the fixed point during scale — so a plain top-to-top /
    // left-to-left delta lands exactly on target, with no drift.
    const deltaX = targetRect.left - startRect.left;
    const deltaY = targetRect.top - startRect.top;

    const tl = gsap.timeline({ delay: 0.5 });

    // curtain rises
    tl.to(preloader, {
      y: '-100%',
      duration: 1.1,
      ease: 'power4.inOut',
    }, 0);

    // brand block shrinks + travels toward navbar slot while curtain rises.
    // +window.innerHeight compensates for the parent curtain's own -100% shift,
    // since this element's translate is measured in the same fixed-viewport space.
    tl.to(preloaderInner, {
      scale: scaleFactor,
      x: deltaX,
      y: deltaY + window.innerHeight,
      duration: 1.1,
      ease: 'power4.inOut',
      transformOrigin: 'top left',
    }, 0);

    tl.to(preloaderInner, { opacity: 0, duration: 0.25 }, 0.85);

    // reveal real navbar right as curtain clears it
    tl.call(() => {
      navbar.classList.add('is-visible');
      gsap.fromTo(navbar, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    }, null, 0.9);

    tl.set(preloader, { display: 'none' }, 1.15);

    tl.add(playHeroReveal, 1.0);
  }


    /* 2. HERO CONTENT REVEAL */
 
 function playHeroReveal() {
  const heroEls = gsap.utils.toArray('.hero [data-reveal]');

  gsap.timeline()
    .to(heroEls, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12,
    })
    .to('.float-chip', {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.1,
    }, '-=0.5');
}
 

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(runPreloaderSequence);
  } else {
    runPreloaderSequence();
  }
  /* ----------------------------------------------------------
     3. SCROLL-TRIGGERED REVEALS (rest of page)
  ---------------------------------------------------------- */
  const revealGroups = {};
  document.querySelectorAll('section:not(.hero) [data-reveal]').forEach((el) => {
    const section = el.closest('section');
    const key = section.id || Math.random();
    if (!revealGroups[key]) revealGroups[key] = [];
    revealGroups[key].push(el);
  });

  Object.values(revealGroups).forEach((els) => {
    gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: els[0],
        start: 'top 85%',
      },
    });
  });

  /* ----------------------------------------------------------
     4. NAVBAR — hide/show on scroll direction + hamburger
  ---------------------------------------------------------- */
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (!navbar.classList.contains('is-visible')) return;
    if (current > lastScroll && current > 200) {
      gsap.to(navbar, { y: -100, duration: 0.4, ease: 'power2.out' });
    } else {
      gsap.to(navbar, { y: 0, duration: 0.4, ease: 'power2.out' });
    }
    lastScroll = current;
  });

  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('is-open');
    hamburger.classList.toggle('is-active');
  });
  mobileMenu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => mobileMenu.classList.remove('is-open'))
  );

  /* ----------------------------------------------------------
     5. MARQUEE — duplicate content for seamless infinite loop
  ---------------------------------------------------------- */
  const track = document.getElementById('marquee-track');
  if (track) {
    track.innerHTML += track.innerHTML;
  }

  /* ----------------------------------------------------------
     6. TESTIMONIALS SLIDER
  ---------------------------------------------------------- */
  const testiTrack = document.getElementById('testi-track');
  const testiCards = document.querySelectorAll('.testi-card');
  const prevBtn = document.getElementById('testi-prev');
  const nextBtn = document.getElementById('testi-next');
  let testiIndex = 0;

  function updateTesti() {
    if (!testiCards.length) return;
    const cardWidth = testiCards[0].offsetWidth + 24; // gap
    gsap.to(testiTrack, { x: -testiIndex * cardWidth, duration: 0.6, ease: 'power3.out' });
  }
  nextBtn?.addEventListener('click', () => {
    testiIndex = Math.min(testiIndex + 1, testiCards.length - 1);
    updateTesti();
  });
  prevBtn?.addEventListener('click', () => {
    testiIndex = Math.max(testiIndex - 1, 0);
    updateTesti();
  });
  window.addEventListener('resize', updateTesti);

  /* ----------------------------------------------------------
     7. FAQ ACCORDION
  ---------------------------------------------------------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('is-open'));
      if (!isOpen) item.classList.add('is-open');
    });
  });

  /* ----------------------------------------------------------
     8. Puzzle piece / problem card hover tilt
  ---------------------------------------------------------- */
  document.querySelectorAll('.puzzle-piece, .problem-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, { rotateX: y * -6, rotateY: x * 6, duration: 0.4, ease: 'power2.out', transformPerspective: 800 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power2.out' });
    });
  });
});