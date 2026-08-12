/* ==========================================================================
   BENYAMIN — Ultra-High Impact Animated Favicon Engine
   ========================================================================== */
(function() {
  if (window.__benyaminFaviconEngineLoaded) return;
  window.__benyaminFaviconEngineLoaded = true;

  const SIZE = 64;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  // Remove static icon tags so browser strictly uses our dynamic animated icon
  let iconTag = document.getElementById('dynamicFavicon');
  if (!iconTag) {
    iconTag = document.createElement('link');
    iconTag.id = 'dynamicFavicon';
    iconTag.rel = 'icon';
    iconTag.type = 'image/png';
    document.head.appendChild(iconTag);
  }

  let progress = 0;
  let lastTime = performance.now();

  function renderAnimatedFrame(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;
    progress += dt * 1.2;

    ctx.clearRect(0, 0, SIZE, SIZE);

    // 1. Solid Pitch Black Canvas Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // 2. High Fashion Editorial Serif 'B' Monogram
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 42px Georgia, Didot, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('B', SIZE / 2, SIZE / 2 + 2);

    // 3. Bright Silver Light Sweep Flare
    const sweepCycle = (progress % 2.0) / 2.0; // Sweeps every 2 seconds
    if (sweepCycle < 0.85) {
      const x = sweepCycle * (SIZE * 2.4) - SIZE * 0.7;
      const grad = ctx.createLinearGradient(x - 12, 0, x + 12, SIZE);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.75)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.globalCompositeOperation = 'source-over';
    }

    // 4. Vibrant Pulsing Halo Ring
    const pulse = (Math.sin(progress * Math.PI * 2.5) + 1) / 2;
    const borderAlpha = 0.35 + pulse * 0.65;
    const borderWidth = 2 + pulse * 2.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, ' + borderAlpha.toFixed(2) + ')';
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(borderWidth / 2, borderWidth / 2, SIZE - borderWidth, SIZE - borderWidth);

    // 5. Update Favicon Link
    iconTag.href = canvas.toDataURL('image/png');
  }

  let lastDraw = 0;
  const fpsInterval = 1000 / 25; // Smooth 25 fps update rate

  function animationLoop(timestamp) {
    requestAnimationFrame(animationLoop);
    const elapsed = timestamp - lastDraw;
    if (elapsed > fpsInterval) {
      lastDraw = timestamp - (elapsed % fpsInterval);
      if (!document.hidden) {
        renderAnimatedFrame(timestamp);
      }
    }
  }

  requestAnimationFrame(animationLoop);
})();
