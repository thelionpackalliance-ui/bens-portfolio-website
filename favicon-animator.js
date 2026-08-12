/* ==========================================================================
   BENYAMIN — High-Fashion Animated Favicon Controller
   ========================================================================== */
(function() {
  if (window.__benyaminFaviconAnimated) return;
  window.__benyaminFaviconAnimated = true;

  const SIZE = 64;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  let faviconLink = document.querySelector('link[rel="icon"][type="image/png"]') || document.querySelector('link[rel="icon"]');
  if (!faviconLink) {
    faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    faviconLink.type = 'image/png';
    document.head.appendChild(faviconLink);
  }

  let progress = 0;
  let lastTime = performance.now();

  function drawAnimatedFavicon(time) {
    const dt = (time - lastTime) / 1000;
    lastTime = time;
    progress += dt * 0.85;

    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 44px Georgia, Didot, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('B', SIZE / 2, SIZE / 2 + 2);

    const sweepPos = (progress % 2.5) / 2.5;
    if (sweepPos < 1.0) {
      const x = sweepPos * (SIZE * 2.2) - SIZE * 0.6;
      const grad = ctx.createLinearGradient(x - 14, 0, x + 14, SIZE);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.globalCompositeOperation = 'source-over';
    }

    const pulse = (Math.sin(progress * Math.PI * 2) + 1) / 2;
    const borderAlpha = 0.2 + pulse * 0.4;
    ctx.strokeStyle = 'rgba(255, 255, 255, ' + borderAlpha.toFixed(2) + ')';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, SIZE - 2, SIZE - 2);

    faviconLink.href = canvas.toDataURL('image/png');
  }

  let lastDraw = 0;
  const fpsInterval = 1000 / 20;
  function loop(timestamp) {
    requestAnimationFrame(loop);
    const elapsed = timestamp - lastDraw;
    if (elapsed > fpsInterval) {
      lastDraw = timestamp - (elapsed % fpsInterval);
      if (!document.hidden) {
        drawAnimatedFavicon(timestamp);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => loop(performance.now()));
  } else {
    loop(performance.now());
  }
})();
