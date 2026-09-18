/* Homepage-only hero controller. Keep the approved desktop movie unchanged. */
(() => {
  'use strict';

  const video = document.querySelector('.home-page .hero-video-full[data-hero-desktop]');
  if (!video) return;

  const hero = video.closest('.hero');
  const mobileQuery = window.matchMedia('(max-width: 900px)');
  const desktopCuts = [0, 19 / 30, 55 / 30, 85 / 30, 106 / 30, 124 / 30, 160 / 30, 228 / 30];
  const mobileCuts = [0, 19 / 30, 55 / 30, 72 / 30, 107 / 30, 123 / 30, 159 / 30, 227 / 30];
  let mobile = mobileQuery.matches;
  let source = '';
  let pendingStart = null;

  // The two existing edits have different scene lengths. Keep the same scene
  // when a phone rotates or a desktop preview is changed to mobile.
  const correspondingTime = (time, wasMobile, willBeMobile) => {
    const from = wasMobile ? mobileCuts : desktopCuts;
    const to = willBeMobile ? mobileCuts : desktopCuts;
    const t = Math.max(0, Math.min(time, from[from.length - 1] - 0.001));
    let scene = 0;
    while (scene < from.length - 2 && t >= from[scene + 1]) scene += 1;
    const progress = (t - from[scene]) / (from[scene + 1] - from[scene]);
    return to[scene] + progress * (to[scene + 1] - to[scene]);
  };

  const syncFraming = (time = video.currentTime) => {
    const boat = mobile && time >= mobileCuts[3] && time < mobileCuts[4];
    const women = mobile && time >= mobileCuts[1] && time < mobileCuts[2];
    hero.classList.toggle('mobile-boat-scene', boat);
    hero.classList.toggle('mobile-framed-scene', boat || women);
    hero.classList.toggle('portrait-scene', !mobile && time >= 9.16);
  };

  const playSafely = () => {
    // A phone may decline autoplay in power-saving mode. The mobile boat
    // poster remains available; do not leave an unhandled rejected promise.
    const result = video.play();
    if (result && typeof result.catch === 'function') result.catch(() => {});
  };

  const selectSource = () => {
    const nextMobile = mobileQuery.matches;
    const nextSource = nextMobile ? video.dataset.heroMobile : video.dataset.heroDesktop;
    if (!nextSource || nextSource === source) return;

    const oldTime = pendingStart === null ? video.currentTime : pendingStart;
    pendingStart = source
      ? correspondingTime(oldTime || 0, mobile, nextMobile)
      : (nextMobile ? 2.45 : 0);
    mobile = nextMobile;
    source = nextSource;
    hero.dataset.heroView = mobile ? 'mobile' : 'desktop';
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    if (mobile && video.dataset.heroMobilePoster) {
      video.poster = video.dataset.heroMobilePoster;
    } else {
      video.removeAttribute('poster');
    }

    syncFraming(pendingStart);
    video.src = source;
    video.load();
  };

  video.addEventListener('loadedmetadata', () => {
    if (pendingStart !== null) {
      const end = Number.isFinite(video.duration) ? Math.max(0, video.duration - 0.01) : pendingStart;
      video.currentTime = Math.max(0, Math.min(pendingStart, end));
      pendingStart = null;
    }
    syncFraming();
    playSafely();
  });
  video.addEventListener('timeupdate', () => syncFraming());
  video.addEventListener('seeked', () => syncFraming());

  // Frame-accurate framing at scene cuts, with timeupdate as the fallback.
  if (typeof video.requestVideoFrameCallback === 'function') {
    const onFrame = (_now, metadata) => {
      syncFraming(metadata.mediaTime);
      video.requestVideoFrameCallback(onFrame);
    };
    video.requestVideoFrameCallback(onFrame);
  }

  // This listener is the important fix: do not choose the video only once.
  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', selectSource);
  } else {
    mobileQuery.addListener(selectSource);
  }
  window.addEventListener('pageshow', () => {
    selectSource();
    playSafely();
  });

  selectSource();
})();
