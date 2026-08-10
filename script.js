/* ==========================================================================
   BENYAMIN — CINEMATIC INTRO & 3D COVERFLOW MOTION ENGINE (LENIS + GSAP)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lenis Smooth Scroll Engine
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // 2. Register GSAP Plugins & Setup Animations
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    if (typeof Draggable !== 'undefined') {
      gsap.registerPlugin(Draggable);
    }
  }

  // Always run Cinematic Intro (handles fallback if GSAP unavailable)
  runCinematicIntro(lenis);
  initAccordionMotionEngine();
  initLightboxEngine();
  initResponsiveGSAPMatchMedia();
});

/* ==========================================================================
   Phase 3: GSAP matchMedia Mobile Hero & Parallax Motion Control
   ========================================================================== */
function initResponsiveGSAPMatchMedia() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const mm = gsap.matchMedia();

  // Mobile Devices (max-width: 768px)
  mm.add("(max-width: 768px)", () => {
    const mobileHeroCard = document.querySelector('.mobile-hero-portrait-card');
    const mobileHeroImg = document.querySelector('.mobile-hero-img');
    const heroHeadline = document.querySelectorAll('#hero .hero-headline .line-content');

    if (mobileHeroCard) {
      // 1. Initial Clip-Path Reveal of Mobile Hero Card
      gsap.to(mobileHeroCard, {
        clipPath: 'inset(0% 0 0 0 round 16px)',
        duration: 1.1,
        delay: 0.2,
        ease: 'power4.out'
      });

      // 2. Staggered Headline Reveal
      if (heroHeadline.length > 0) {
        gsap.fromTo(heroHeadline,
          { y: '105%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 1.0, delay: 0.45, stagger: 0.12, ease: 'power3.out' }
        );
      }

      // 3. Scroll Parallax: Image slowly translates downward and scales down slightly on mobile scroll
      if (mobileHeroImg) {
        gsap.to(mobileHeroImg, {
          yPercent: 15,
          scale: 0.95,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        });
      }
    }
  });

  // Mobile & Tablet (<1024px)
  mm.add("(max-width: 1024px)", () => {
    gsap.set('.coverflow-card, .floating-image-card, .accordion-img', {
      willChange: 'transform, opacity'
    });
  });

  // Desktop (>1024px)
  mm.add("(min-width: 1025px)", () => {
    gsap.set('.coverflow-card, .floating-image-card, .accordion-img', {
      willChange: 'transform, opacity, clip-path'
    });
  });
}

/* ==========================================================================
   Phase 3: GSAP FLIP Full-Screen Responsive Lightbox Engine
   ========================================================================== */
function initLightboxEngine() {
  const overlay = document.getElementById('lightboxOverlay');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  const viewPhotoPill = document.getElementById('viewPhotoPill');
  const coverflowCards = document.querySelectorAll('.coverflow-card');
  if (!overlay || !lightboxImg) return;

  if (typeof gsap !== 'undefined' && typeof Flip !== 'undefined') {
    gsap.registerPlugin(Flip);
  }

  let activeSourceImg = null;
  let isLightboxOpen = false;
  let isZoomedIn = false;
  let currentZoom = 1.0;

  // Desktop Hover "View Photo" Indicator Pill Tracking
  if (viewPhotoPill && coverflowCards.length > 0) {
    const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (isDesktopPointer && typeof gsap !== 'undefined') {
      const xTo = gsap.quickTo(viewPhotoPill, 'x', { duration: 0.2, ease: 'power2.out' });
      const yTo = gsap.quickTo(viewPhotoPill, 'y', { duration: 0.2, ease: 'power2.out' });

      coverflowCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          if (!isLightboxOpen) viewPhotoPill.classList.add('active');
        });

        card.addEventListener('mousemove', (e) => {
          if (!isLightboxOpen) {
            xTo(e.clientX);
            yTo(e.clientY);
          }
        });

        card.addEventListener('mouseleave', () => {
          viewPhotoPill.classList.remove('active');
        });
      });
    }
  }

  function openLightbox(sourceImg) {
    if (isLightboxOpen || !sourceImg) return;
    
    const imgSrc = sourceImg.src || sourceImg.getAttribute('src');
    if (!imgSrc) return;

    isLightboxOpen = true;
    isZoomedIn = false;
    currentZoom = 1.0;
    activeSourceImg = sourceImg;

    if (viewPhotoPill) viewPhotoPill.classList.remove('active');

    // Set src & alt
    lightboxImg.src = imgSrc;
    lightboxImg.alt = sourceImg.alt || 'Enlarged Portfolio View';

    // Lock body scrolling & show overlay
    document.body.classList.add('lightbox-active');
    overlay.classList.add('active');

    // Perform Smooth GSAP Scale & Fade In
    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(lightboxImg);
      gsap.fromTo(lightboxImg, 
        { scale: 0.7, opacity: 0, y: 30 },
        { scale: 1.0, opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }
      );
    }
  }

  // Expose window.openLightbox globally
  window.openLightbox = openLightbox;

  function closeLightbox() {
    if (!isLightboxOpen) return;
    isLightboxOpen = false;
    isZoomedIn = false;
    currentZoom = 1.0;

    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(lightboxImg);
      gsap.to(lightboxImg, {
        scale: 0.7,
        opacity: 0,
        y: 20,
        duration: 0.35,
        ease: 'power3.in',
        onComplete: () => {
          overlay.classList.remove('active');
          document.body.classList.remove('lightbox-active');
          activeSourceImg = null;
          gsap.set(lightboxImg, { scale: 1.0, y: 0, opacity: 1 });
        }
      });
    } else {
      overlay.classList.remove('active');
      document.body.classList.remove('lightbox-active');
      activeSourceImg = null;
    }
  }

  // Desktop Mouse Wheel Zoom Mechanics (1.0x up to 3.0x)
  overlay.addEventListener('wheel', (e) => {
    if (!isLightboxOpen) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.25 : 0.25;
    currentZoom = Math.min(3.0, Math.max(1.0, currentZoom + delta));
    if (typeof gsap !== 'undefined') {
      gsap.to(lightboxImg, { scale: currentZoom, duration: 0.25, ease: 'power2.out' });
    }
  }, { passive: false });

  // Laptop/Desktop/Mobile Double-Click / Tap Toggle Zoom
  lightboxImg.addEventListener('click', (e) => {
    e.stopPropagation();
    isZoomedIn = !isZoomedIn;
    currentZoom = isZoomedIn ? 2.2 : 1.0;
    if (typeof gsap !== 'undefined') {
      gsap.to(lightboxImg, { scale: currentZoom, duration: 0.4, ease: 'power3.out' });
    }
  });

  // Attach click & tap events to all gallery images across desktop and mobile
  const zoomableImgs = document.querySelectorAll('.floating-image-card img, .coverflow-card img, .accordion-img, .mobile-hero-img');
  zoomableImgs.forEach(img => {
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(img);
    });
  });

  // Close handlers (close button & clicking overlay backdrop)
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === document.getElementById('lightboxStage') || (e.target.classList && e.target.classList.contains('lightbox-stage'))) {
      closeLightbox();
    }
  });

  // ESC key to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isLightboxOpen) {
      closeLightbox();
    }
  });
}

/* ==========================================================================
   What I Do Best: GSAP Smooth Accordion & Clip-Path Image Reveal Engine
   (Device-Responsive: Hover on Desktop, Tap on Touch/Mobile)
   ========================================================================== */
function initAccordionMotionEngine() {
  const accordionItems = document.querySelectorAll('.accordion-item');
  const accordionImages = document.querySelectorAll('.accordion-img');
  if (accordionItems.length === 0) return;

  // Detect desktop mouse hover capability
  const isHoverDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Track active item & image state
  let activeItem = document.querySelector('.accordion-item.active') || accordionItems[0];
  let activeImgId = activeItem ? activeItem.getAttribute('data-img') : 'img-1';

  // Helper function to handle item activation (both hover & click)
  function activateAccordionItem(item) {
    if (item === activeItem) return; // Ignore if already active

    const targetImgId = item.getAttribute('data-img');
    const targetImg = document.getElementById(targetImgId);
    const prevImg = document.getElementById(activeImgId);

    // --- 1. Close Currently Active Accordion Item ---
    if (activeItem) {
      activeItem.classList.remove('active');
      const prevContent = activeItem.querySelector('.accordion-content');
      const prevDesc = activeItem.querySelector('.accordion-desc');

      if (typeof gsap !== 'undefined') {
        gsap.to(prevContent, {
          height: 0,
          duration: 0.5,
          ease: 'power3.inOut'
        });
        if (prevDesc) {
          gsap.to(prevDesc, {
            y: 20,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in'
          });
        }
      } else {
        prevContent.style.height = '0px';
      }
    }

    // --- 2. Open Selected Accordion Item ---
    item.classList.add('active');
    activeItem = item;
    activeImgId = targetImgId;

    const newContent = item.querySelector('.accordion-content');
    const newDesc = item.querySelector('.accordion-desc');

    if (typeof gsap !== 'undefined') {
      gsap.to(newContent, {
        height: 'auto',
        duration: 0.6,
        ease: 'power3.inOut'
      });

      if (newDesc) {
        gsap.fromTo(newDesc,
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, delay: 0.15, ease: 'power3.out' }
        );
      }
    } else {
      newContent.style.height = 'auto';
    }

    // --- 3. GSAP Clip-Path Mask Image Swap ---
    if (targetImg && prevImg && targetImg !== prevImg) {
      if (typeof gsap !== 'undefined') {
        // Layer new image on top
        gsap.set(targetImg, { zIndex: 2 });
        gsap.set(prevImg, { zIndex: 1 });

        gsap.fromTo(targetImg,
          {
            clipPath: 'inset(100% 0 0 0 round 16px)',
            scale: 1.1
          },
          {
            clipPath: 'inset(0% 0 0 0 round 16px)',
            scale: 1,
            duration: 0.75,
            ease: 'power3.inOut',
            onComplete: () => {
              accordionImages.forEach(img => img.classList.remove('active'));
              targetImg.classList.add('active');

              // Reset previous image clip-path underneath
              gsap.set(prevImg, {
                clipPath: 'inset(100% 0 0 0 round 16px)',
                scale: 1.1,
                zIndex: 1
              });
            }
          }
        );
      } else {
        accordionImages.forEach(img => img.classList.remove('active'));
        targetImg.classList.add('active');
      }
    }
  }

  accordionItems.forEach((item) => {
    const content = item.querySelector('.accordion-content');
    const desc = item.querySelector('.accordion-desc');
    const header = item.querySelector('.accordion-header');

    // Initialize height state
    if (item === activeItem) {
      if (typeof gsap !== 'undefined') {
        gsap.set(content, { height: 'auto' });
        if (desc) gsap.set(desc, { y: 0, opacity: 1 });
      } else {
        content.style.height = 'auto';
      }
    } else {
      if (typeof gsap !== 'undefined') {
        gsap.set(content, { height: 0 });
        if (desc) gsap.set(desc, { y: 20, opacity: 0 });
      } else {
        content.style.height = '0px';
      }
    }

    if (!header) return;

    if (isHoverDevice) {
      // Desktop: trigger expansion and clip-path image reveal on hover (mouseenter)
      header.addEventListener('mouseenter', () => activateAccordionItem(item));
      header.addEventListener('click', () => activateAccordionItem(item));
    } else {
      // Mobile / Touch: trigger expansion and clip-path image reveal on tap (click)
      header.addEventListener('click', () => activateAccordionItem(item));
    }
  });
}

/* Phase 2: Cinematic Intro Animation Timeline */
function runCinematicIntro(lenis) {
  const preloader = document.getElementById('cinematicPreloader');
  const chars = document.querySelectorAll('.preloader-char');
  const titleWrapper = document.querySelector('.preloader-content-wrapper') || document.querySelector('.preloader-title');
  const subTexts = document.querySelectorAll('.preloader-sub-text');

  let hidden = false;
  function hidePreloader() {
    if (!preloader || hidden) return;
    hidden = true;
    preloader.classList.add('is-hidden');
    setTimeout(() => {
      preloader.style.display = 'none';
      initPhysicsMotionEngine(lenis);
      triggerHeroTextReveal();
    }, 500);
  }

  // Safety fallback timer: guarantee preloader closes in 3.8 seconds max
  const fallbackTimer = setTimeout(() => {
    hidePreloader();
  }, 3800);

  if (!preloader || typeof gsap === 'undefined') {
    clearTimeout(fallbackTimer);
    hidePreloader();
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      clearTimeout(fallbackTimer);
      hidePreloader();
    }
  });

  // Step A: BENYAMIN characters reveal sequentially from invisible mask
  if (chars.length > 0) {
    tl.from(chars, {
      y: '100%',
      opacity: 0,
      duration: 1.0,
      stagger: 0.05,
      ease: 'expo.out'
    });
  }

  // Step B: Subtitles ("modeling" & "portfolio") fade & slide up
  if (subTexts.length > 0) {
    tl.from(subTexts, {
      y: 15,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power3.out'
    }, '-=0.4');
  }

  // Step C: Brief pause, then slight contract (scale: 0.95)
  if (titleWrapper) {
    tl.to(titleWrapper, {
      scale: 0.95,
      duration: 0.35,
      ease: 'power2.inOut'
    }, '+=0.4')
    // Step D: Kinetic fly-through camera zoom (scale: 80, opacity: 0)
    .to(titleWrapper, {
      scale: 80,
      opacity: 0,
      duration: 0.85,
      ease: 'expo.inOut'
    });
  }

  // Step E: White overlay curtain slides UP to reveal hero underneath
  tl.to(preloader, {
    yPercent: -100,
    duration: 0.75,
    ease: 'power4.inOut'
  }, '-=0.45');
}

function triggerHeroTextReveal() {
  const heroLineContents = document.querySelectorAll('.hero-headline .line-content');
  if (heroLineContents.length > 0) {
    gsap.from(heroLineContents, {
      y: '105%',
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: 'power4.out'
    });
  }
}

function initPhysicsMotionEngine(lenis) {
  // Global Reversible Marquee Loop with Velocity Acceleration
  const marqueeContent = document.querySelectorAll('.marquee-content');
  let marqueeTween = null;

  if (marqueeContent.length > 0) {
    marqueeTween = gsap.to(marqueeContent, {
      xPercent: -100,
      repeat: -1,
      duration: 22,
      ease: 'none'
    });
  }

  if (lenis) {
    lenis.on('scroll', (e) => {
      const velocity = e.velocity || 0;
      const speed = Math.abs(velocity);
      const direction = e.direction || 1;

      // Reversible Marquee Acceleration
      if (marqueeTween) {
        const boost = Math.min(speed * 0.2, 4);
        const targetScale = (1 + boost) * (direction === -1 ? -1.5 : 1.5);

        gsap.to(marqueeTween, {
          timeScale: targetScale,
          duration: 0.3,
          overwrite: 'auto'
        });

        gsap.to(marqueeTween, {
          timeScale: 1,
          duration: 0.8,
          delay: 0.2,
          overwrite: 'auto'
        });
      }
    });
  }

  // 3D Magnetic Hover Elements (.magnetic-3d) — Refined Motion
  const magnetic3dEls = document.querySelectorAll('.magnetic-3d');
  magnetic3dEls.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const bounds = el.getBoundingClientRect();
      const relX = e.clientX - (bounds.left + bounds.width / 2);
      const relY = e.clientY - (bounds.top + bounds.height / 2);

      gsap.to(el, {
        rotateX: -relY * 0.035,
        rotateY: relX * 0.035,
        x: relX * 0.06,
        y: relY * 0.06,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    });
  });

  // Spring-Physics Custom Cursor Follower
  const cursorFollower = document.getElementById('cursorFollower');
  const heroTriggers = document.querySelectorAll('.hover-trigger-hero');

  if (cursorFollower && heroTriggers.length > 0) {
    const xTo = gsap.quickTo(cursorFollower, 'x', { duration: 0.45, ease: 'power3.out' });
    const yTo = gsap.quickTo(cursorFollower, 'y', { duration: 0.45, ease: 'power3.out' });

    heroTriggers.forEach(trigger => {
      trigger.addEventListener('mousemove', (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
        gsap.to(cursorFollower, { opacity: 1, duration: 0.3, overwrite: 'auto' });
      });

      trigger.addEventListener('mouseleave', () => {
        gsap.to(cursorFollower, { opacity: 0, duration: 0.35, ease: 'power2.out' });
      });
    });
  }



  // Bio Line Masks Reveal
  const bioLineContents = document.querySelectorAll('.bio-text .line-content');
  if (bioLineContents.length > 0) {
    gsap.from(bioLineContents, {
      y: '105%',
      opacity: 0,
      duration: 1.1,
      stagger: 0.12,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: '.bio-stats-section',
        start: 'top 75%'
      }
    });
  }

  // Initialize Dead-Centered 3D Coverflow Gallery Engine
  init3DCoverflowGallery();

  // Footer CTA Parallax Tilt Interaction
  const footerCta = document.querySelector('.footer-cta-headline');
  const footerSection = document.querySelector('.footer-section');
  if (footerCta && footerSection) {
    footerSection.addEventListener('mousemove', (e) => {
      const bounds = footerSection.getBoundingClientRect();
      const relX = (e.clientX - bounds.left) / bounds.width - 0.5;
      const relY = (e.clientY - bounds.top) / bounds.height - 0.5;

      gsap.to(footerCta, {
        x: relX * 35,
        y: relY * 25,
        duration: 0.6,
        ease: 'power2.out'
      });
    });
  }

  // Back To Top Smooth Scroll
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.5 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}
/* Phase 2: Perfectly Centered Infinite 3D Coverflow Engine with Lerp Physics */
function init3DCoverflowGallery() {
  const wrapper = document.getElementById('coverflowWrapper');
  const track = document.getElementById('coverflowTrack');
  const cards = Array.from(document.querySelectorAll('.coverflow-card'));
  const navDotsContainer = document.getElementById('coverflowNavDots');
  const worksSection = document.getElementById('works');

  if (!wrapper || !track || cards.length === 0) return;

  const totalCards = cards.length;
  let virtualPos = 2; // Smooth floating current index
  let targetPos = 2;  // Target index (can be any integer/float)
  let autoTimer = null;
  let isSectionVisible = false;

  function getSpacing() {
    const width = window.innerWidth;
    if (width <= 480) return 140;
    if (width <= 768) return 170;
    if (width <= 1024) return 200;
    return 250;
  }

  function startAutoPlay() {
    stopAutoPlay();
    if (!isSectionVisible) return;
    autoTimer = setInterval(() => {
      targetPos += 1;
    }, 3200);
  }

  function stopAutoPlay() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function resetAutoPlay() {
    stopAutoPlay();
    if (isSectionVisible) {
      startAutoPlay();
    }
  }

  // Viewport ScrollTrigger: Auto-drag ONLY when user scrolls into the Works section
  if (typeof ScrollTrigger !== 'undefined' && worksSection) {
    const worksHeader = worksSection.querySelector('.works-header-row');
    const worksWrapper = worksSection.querySelector('.coverflow-wrapper');

    if (worksHeader) {
      gsap.fromTo(worksHeader,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: worksSection,
            start: 'top 80%'
          }
        }
      );
    }

    if (worksWrapper) {
      gsap.fromTo(worksWrapper,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: worksSection,
            start: 'top 75%'
          }
        }
      );
    }

    ScrollTrigger.create({
      trigger: worksSection,
      start: 'top 85%',
      end: 'bottom 15%',
      onEnter: () => {
        isSectionVisible = true;
        startAutoPlay();
      },
      onLeave: () => {
        isSectionVisible = false;
        stopAutoPlay();
      },
      onEnterBack: () => {
        isSectionVisible = true;
        startAutoPlay();
      },
      onLeaveBack: () => {
        isSectionVisible = false;
        stopAutoPlay();
      }
    });
  } else {
    isSectionVisible = true;
    startAutoPlay();
  }

  // Pause auto-play on mouse hover, resume on mouse leave
  wrapper.addEventListener('mouseenter', stopAutoPlay);
  wrapper.addEventListener('mouseleave', () => {
    if (isSectionVisible) startAutoPlay();
  });

  // Generate Navigation Dots
  if (navDotsContainer) {
    navDotsContainer.innerHTML = '';
    cards.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `coverflow-dot ${idx === 2 ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        snapToCardIndex(idx);
        resetAutoPlay();
      });
      navDotsContainer.appendChild(dot);
    });
  }

  function snapToCardIndex(idx) {
    const currentWrapped = ((Math.round(targetPos) % totalCards) + totalCards) % totalCards;
    let diff = idx - currentWrapped;
    if (diff < -totalCards / 2) diff += totalCards;
    if (diff > totalCards / 2) diff -= totalCards;
    targetPos += diff;
  }

  // 60FPS Ultra-Smooth Render Ticker with Infinite Wrap Math
  function renderCoverflow() {
    const cardSpacing = getSpacing();

    // Smooth lerp interpolation towards target position
    virtualPos += (targetPos - virtualPos) * 0.12;

    cards.forEach((card, i) => {
      // Calculate infinite circular distance `diff`
      let diff = i - (virtualPos % totalCards);
      while (diff < -totalCards / 2) diff += totalCards;
      while (diff > totalCards / 2) diff -= totalCards;

      const absDiff = Math.abs(diff);

      if (absDiff < 0.08) {
        // Absolute Center Active Card
        gsap.set(card, {
          scale: 1.06,
          rotateY: 0,
          z: 130,
          x: 0,
          filter: 'brightness(1)',
          opacity: 1,
          zIndex: 100
        });
      } else {
        // Inactive Side Cards
        const sideDir = diff > 0 ? 1 : -1;
        const rotateYVal = sideDir * -34 * Math.min(1.2, absDiff);
        const scaleVal = Math.max(0.68, 1 - absDiff * 0.14);
        const brightnessVal = Math.max(0.3, 1 - absDiff * 0.35);
        const opacityVal = absDiff > 3.2 ? 0 : Math.max(0.35, 1 - absDiff * 0.22);
        const xOffset = diff * cardSpacing;
        const zVal = -absDiff * 140;

        gsap.set(card, {
          scale: scaleVal,
          rotateY: rotateYVal,
          z: zVal,
          x: xOffset,
          filter: `brightness(${brightnessVal})`,
          opacity: opacityVal,
          zIndex: Math.max(1, 80 - Math.round(absDiff * 10))
        });
      }
    });

    // Update Dots
    const currentActiveIdx = ((Math.round(virtualPos) % totalCards) + totalCards) % totalCards;
    const dots = document.querySelectorAll('.coverflow-dot');
    dots.forEach((dot, dIdx) => {
      if (dIdx === currentActiveIdx) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // Register GSAP render ticker
  gsap.ticker.add(renderCoverflow);

  // Click on any card in the carousel to center it AND open Lightbox
  cards.forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      snapToCardIndex(idx);
      resetAutoPlay();
      const cardImg = card.querySelector('img');
      if (cardImg && typeof window.openLightbox === 'function') {
        window.openLightbox(cardImg);
      }
    });
  });

  // Ultra-Smooth GSAP Draggable Interaction
  if (typeof Draggable !== 'undefined') {
    let startX = 0;
    let startTargetPos = 0;

    Draggable.create(track, {
      type: 'x',
      trigger: wrapper,
      inertia: true,
      allowNativeTouchScrolling: false,
      edgeResistance: 0.65,
      throwResistance: 800,
      dragResistance: 0.05,
      onDragStart: function() {
        startX = this.x;
        startTargetPos = targetPos;
        stopAutoPlay();
      },
      onDrag: function() {
        const deltaX = this.x - startX;
        const cardSpacing = getSpacing();
        targetPos = startTargetPos - (deltaX / cardSpacing);
      },
      onDragEnd: function() {
        const deltaX = this.x - startX;
        const cardSpacing = getSpacing();
        const stepShift = Math.round(-deltaX / cardSpacing);
        targetPos = startTargetPos + stepShift;
        gsap.set(track, { x: 0 });
        resetAutoPlay();
      },
      onClick: function(e) {
        const clickedCard = e.target.closest('.coverflow-card');
        if (clickedCard) {
          const cardIdx = cards.indexOf(clickedCard);
          if (cardIdx !== -1) snapToCardIndex(cardIdx);
          const cardImg = clickedCard.querySelector('img');
          if (cardImg && typeof window.openLightbox === 'function') {
            window.openLightbox(cardImg);
          }
        }
      }
    });
  }
}
