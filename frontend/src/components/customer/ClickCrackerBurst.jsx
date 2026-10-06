import React, { useEffect, useRef } from 'react';

/**
 * ClickCrackerBurst
 * Global interactive cracker blast animation that triggers colorful
 * radial spoke sparkler bursts wherever the user clicks or taps on the screen.
 * Matching the exact radial dashed burst aesthetics in the reference image.
 */
export default function ClickCrackerBurst() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const bursts = [];
    let animationFrameId = null;

    // Vibrant festive color palette matching the reference image
    const COLORS = [
      '#FF007F', // Vivid Magenta / Deep Pink
      '#0080FF', // Electric Dodger Blue
      '#FF2D55', // Bright Crimson Pink
      '#00BFFF', // Deep Sky Blue
      '#FF6B00', // Saffron Orange
      '#FFD700', // Sparkling Gold
      '#8A2BE2', // Neon Purple
    ];

    const createBurstCluster = (clickX, clickY) => {
      const now = performance.now();

      // Define 4 to 6 scattered sub-burst offsets around click point (matching the screenshot)
      const offsets = [
        { dx: 0, dy: 0, color: '#FF007F', spokes: 14, maxRadius: 28, delay: 0, hasCenterDot: true },
        { dx: -22, dy: -28, color: '#FF2D55', spokes: 12, maxRadius: 24, delay: 35, hasCenterDot: false },
        { dx: 34, dy: -18, color: '#0080FF', spokes: 14, maxRadius: 26, delay: 60, hasCenterDot: false },
        { dx: -38, dy: 16, color: '#FF007F', spokes: 16, maxRadius: 22, delay: 45, isDotted: true },
        { dx: -10, dy: 32, color: '#00BFFF', spokes: 14, maxRadius: 26, delay: 80, hasCenterDot: false },
        { dx: 42, dy: 22, color: '#FF2D55', spokes: 12, maxRadius: 24, delay: 100, hasCenterDot: false },
      ];

      offsets.forEach((cfg) => {
        bursts.push({
          x: clickX + cfg.dx,
          y: clickY + cfg.dy,
          color: cfg.color || COLORS[Math.floor(Math.random() * COLORS.length)],
          spokes: cfg.spokes,
          maxRadius: cfg.maxRadius * (0.85 + Math.random() * 0.3),
          duration: 520 + Math.random() * 120, // 520 - 640ms
          startTime: now + cfg.delay,
          hasCenterDot: cfg.hasCenterDot,
          isDotted: cfg.isDotted || false,
          rotation: (Math.random() * Math.PI) / 6,
          rotationSpeed: (Math.random() - 0.5) * 0.8,
        });
      });

      // Start loop if not already running
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const handleClick = (e) => {
      // Don't spawn if clicking outside viewport or special inputs if needed
      const x = e.clientX;
      const y = e.clientY;
      createBurstCluster(x, y);
    };

    window.addEventListener('pointerdown', handleClick, { passive: true });

    // Easing helper: fast initial burst with smooth deceleration
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);

    const render = (currentTime) => {
      ctx.clearRect(0, 0, width, height);

      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];

        if (currentTime < b.startTime) {
          continue; // Wait for staggered delay
        }

        const elapsed = currentTime - b.startTime;
        const progress = Math.min(1, elapsed / b.duration);

        if (progress >= 1) {
          bursts.splice(i, 1);
          continue;
        }

        const easedProgress = easeOutCubic(progress);
        const opacity = Math.max(0, 1 - Math.pow(progress, 1.8));

        // Radii calculations
        const currentOuterRadius = b.maxRadius * easedProgress;
        const currentInnerRadius = currentOuterRadius * (0.42 + 0.28 * progress); // Spokes expand and hollow outwards
        const currentRotation = b.rotation + b.rotationSpeed * progress;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = b.color;
        ctx.fillStyle = b.color;
        ctx.lineWidth = b.isDotted ? 2 : 2.5;
        ctx.lineCap = 'round';

        // Draw radial spokes / rays
        const angleStep = (Math.PI * 2) / b.spokes;
        for (let s = 0; s < b.spokes; s++) {
          const angle = currentRotation + s * angleStep;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          if (b.isDotted) {
            // Dotted circle sparks
            const dotX = b.x + cos * currentOuterRadius;
            const dotY = b.y + sin * currentOuterRadius;
            ctx.beginPath();
            ctx.arc(dotX, dotY, 1.4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Spoke ray marks
            const x1 = b.x + cos * currentInnerRadius;
            const y1 = b.y + sin * currentInnerRadius;
            const x2 = b.x + cos * currentOuterRadius;
            const y2 = b.y + sin * currentOuterRadius;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }

        // Optional central spark dot
        if (b.hasCenterDot && progress < 0.6) {
          const dotRadius = Math.max(0, 3.5 * (1 - progress / 0.6));
          ctx.beginPath();
          ctx.arc(b.x, b.y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      if (bursts.length > 0) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        animationFrameId = null;
        ctx.clearRect(0, 0, width, height);
      }
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handleClick);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[999999]"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
      }}
    />
  );
}
