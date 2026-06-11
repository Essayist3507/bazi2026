/* ===== Stack Scroll — Vanilla JS card stacking animation ===== */
(function() {
  'use strict';
  window.StackScroll = { init: init, destroy: destroy };

  var cards = [], observer = null, ticking = false;
  var opts = {};

  var defaultOptions = {
    itemDistance: 80,       // visual gap between stacked cards (px)
    itemScale: 0.03,        // scale decrement per card depth
    itemStackOffset: 24,    // sticky top offset increment per card
    baseTop: 80,            // first card sticky top
    baseScale: 0.92,        // scale of the bottom-most card
    blurAmount: 3,          // blur per depth level (px)
    rotationAmount: 0,      // rotation per depth level (deg)
    cardSelector: '.stack-card',
    containerSelector: '.stack-container',
    smoothScroll: true
  };

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function updateCards() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var vh = window.innerHeight;

    // Determine which card is the "active" top card
    var topCardIndex = 0;
    for (var i = cards.length - 1; i >= 0; i--) {
      var rect = cards[i].getBoundingClientRect();
      if (rect.top <= opts.baseTop + opts.itemStackOffset * i + 10) {
        topCardIndex = i;
        break;
      }
    }

    cards.forEach(function(card, i) {
      // Scale: cards further down in stack are smaller
      // When a card is "active" (at top), it scales to 1
      var depthFromTop = Math.max(0, topCardIndex - i);
      var targetScale = 1 - (depthFromTop * opts.itemScale);
      targetScale = Math.max(opts.baseScale, targetScale);

      // Blur: cards behind the top card get blurred
      var blur = depthFromTop > 0 ? depthFromTop * opts.blurAmount : 0;

      // Rotation if enabled
      var rot = opts.rotationAmount ? depthFromTop * opts.rotationAmount : 0;

      var transform = 'translate3d(0,0,0) scale(' + targetScale.toFixed(3) + ')';
      if (rot) transform += ' rotate(' + rot.toFixed(1) + 'deg)';

      card.style.transform = transform;
      card.style.filter = blur > 0.1 ? 'blur(' + blur.toFixed(1) + 'px)' : '';
      card.style.zIndex = cards.length - i;
      card.style.opacity = depthFromTop > 2 ? Math.max(0.3, 1 - depthFromTop * 0.2) : '1';
    });

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateCards);
      ticking = true;
    }
  }

  function init(options) {
    opts = {};
    for (var k in defaultOptions) opts[k] = defaultOptions[k];
    if (options) for (var k in options) opts[k] = options[k];

    var container = document.querySelector(opts.containerSelector);
    if (!container) { console.warn('StackScroll: container not found'); return; }

    cards = Array.from(container.querySelectorAll(opts.cardSelector));
    if (!cards.length) return;

    // Setup each card
    cards.forEach(function(card, i) {
      var topVal = opts.baseTop + opts.itemStackOffset * i;
      var scale = 1 - (i * opts.itemScale);
      scale = Math.max(opts.baseScale, scale);

      card.style.position = 'sticky';
      card.style.top = topVal + 'px';
      card.style.zIndex = cards.length - i;
      card.style.transformOrigin = 'top center';
      card.style.willChange = 'transform, filter';
      card.style.transition = 'transform 0.15s ease-out, filter 0.15s ease-out, opacity 0.15s ease-out';
      card.style.transform = 'scale(' + scale.toFixed(3) + ')';
    });

    // Gap after last card to allow full unscroll
    var spacer = container.querySelector('.stack-end-spacer');
    if (!spacer) {
      spacer = document.createElement('div');
      spacer.className = 'stack-end-spacer';
      spacer.style.height = (opts.baseTop + opts.itemStackOffset * cards.length + window.innerHeight * 0.6) + 'px';
      container.appendChild(spacer);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateCards();

    // Smooth scroll via CSS
    if (opts.smoothScroll) {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }

  function destroy() {
    window.removeEventListener('scroll', onScroll);
    cards.forEach(function(card) {
      card.style.position = '';
      card.style.top = '';
      card.style.transform = '';
      card.style.filter = '';
      card.style.zIndex = '';
      card.style.opacity = '';
      card.style.willChange = '';
      card.style.transition = '';
    });
    cards = [];
    document.documentElement.style.scrollBehavior = '';
  }
})();
