
(function () {
  'use strict';

  const bookingUrl = 'book-a-retreat.html#checkout';

  function isBookNowTarget(target) {
    if (!(target instanceof Element)) return false;
    const strong = target.closest('.retreats-greece-feature .retreats-greece-meta strong');
    return !!strong && strong.textContent.trim().toLowerCase() === 'book now';
  }

  function goToBooking(event) {
    if (!isBookNowTarget(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    window.location.href = bookingUrl;
  }

  // Capture before the outer Greece card link can navigate.
  document.addEventListener('pointerup', goToBooking, true);
  document.addEventListener('touchend', goToBooking, true);
  document.addEventListener('click', goToBooking, true);
})();
