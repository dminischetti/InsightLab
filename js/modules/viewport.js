export const initViewportAnimations = () => {
  const animated = document.querySelectorAll('[data-animate]');
  if (!animated.length) return;

  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    animated.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.2 }
  );

  animated.forEach((element) => observer.observe(element));
};

export const initProgressBar = () => {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;

  const update = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const progress = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrolled / scrollHeight) * 100)) : 0;
    bar.style.width = `${progress}%`;
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
};

export const initHeroParallax = () => {
  const target = document.querySelector('[data-hero-parallax]');
  if (!target) return;
  if (typeof window === 'undefined') return;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery.matches) {
    target.style.setProperty('--hero-offset', '0px');
    return;
  }

  let rafId = null;
  const updateOffset = () => {
    const rect = target.getBoundingClientRect();
    const offset = Math.max(-48, Math.min(48, rect.top * -0.06));
    target.style.setProperty('--hero-offset', `${offset.toFixed(2)}px`);
    rafId = null;
  };

  const handleScroll = () => {
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(updateOffset);
  };

  updateOffset();
  window.addEventListener('scroll', handleScroll, { passive: true });

  const handleMotionChange = (event) => {
    if (event.matches) {
      target.style.setProperty('--hero-offset', '0px');
      window.removeEventListener('scroll', handleScroll);
    } else {
      updateOffset();
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
  };

  if (typeof motionQuery.addEventListener === 'function') {
    motionQuery.addEventListener('change', handleMotionChange);
  } else if (typeof motionQuery.addListener === 'function') {
    motionQuery.addListener(handleMotionChange);
  }
};
