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
