import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';

export default function FireworksIntro({ brandName = "AVIRA", tagline = "PYROTECH" }) {
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Check if fireworks was triggered manually or first visit
    const manualTrigger = sessionStorage.getItem('aviraTriggerFireworks') === 'true';
    if (manualTrigger) {
      sessionStorage.removeItem('aviraTriggerFireworks');
      startFireworks();
      return;
    }

    // Auto-show once per session
    if (!sessionStorage.getItem('aviraIntroShown')) {
      sessionStorage.setItem('aviraIntroShown', 'true');
      startFireworks();
    }

    function startFireworks() {
      setVisible(true);
      setFading(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let animationFrame;
    const rockets = [];
    const particles = [];
    const rings = [];
    const stars = [];
    const colors = [
      '#FFD700', // Gold
      '#FF3B30', // Crimson Red
      '#FF9500', // Orange
      '#FF2D55', // Pink
      '#00E5FF', // Cyan
      '#76FF03', // Neon Lime
      '#E040FB', // Purple
      '#FFFFFF'  // White
    ];

    // Populate twinkling background stars
    const starCount = window.innerWidth < 640 ? 50 : 100;
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        speed: 0.02 + Math.random() * 0.03
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const createExplosion = (x, y, color) => {
      const count = window.innerWidth < 640 ? 60 : 110;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.8 + Math.random() * 5.8;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: 0.045,
          friction: 0.985,
          life: 1,
          decay: 0.007 + Math.random() * 0.009,
          size: 1 + Math.random() * 2.2,
          color: i % 4 === 0 ? '#FFFFFF' : color
        });
      }

      // Sparkle burst
      for (let i = 0; i < 25; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          gravity: 0.06,
          friction: 0.98,
          life: 1,
          decay: 0.015,
          size: 1.2,
          color: '#FFD700'
        });
      }

      // Shockwave ring
      rings.push({ x, y, radius: 4, alpha: 1, color });
    };

    const launchRocket = (tx, ty, color) => {
      rockets.push({
        x: width / 2 + (Math.random() - 0.5) * (width * 0.4),
        y: height + 20,
        tx, ty,
        speed: 7 + Math.random() * 2,
        color
      });
    };

    const update = () => {
      ctx.fillStyle = 'rgba(7, 5, 12, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Draw starry sky
      stars.forEach(s => {
        s.alpha += s.speed;
        const currentAlpha = 0.2 + Math.abs(Math.sin(s.alpha)) * 0.6;
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        const dx = r.tx - r.x;
        const dy = r.ty - r.y;
        const dist = Math.hypot(dx, dy);
        r.x += (dx / dist) * r.speed;
        r.y += (dy / dist) * r.speed;

        // Sparkle tail
        ctx.save();
        ctx.fillStyle = '#FFE57F';
        ctx.beginPath();
        ctx.arc(r.x + (Math.random() - 0.5) * 3, r.y + 4, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (dist < 14) {
          createExplosion(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Update expanding rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ring.radius += 4.5;
        ring.alpha -= 0.035;
        if (ring.alpha <= 0) {
          rings.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = ring.alpha;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrame = requestAnimationFrame(update);
    };

    update();

    // Staggered rocket launch sequence
    const launches = [
      [0.35, 0.35, '#FFD700', 100],
      [0.65, 0.28, '#FF3B30', 380],
      [0.50, 0.22, '#00E5FF', 650],
      [0.25, 0.40, '#76FF03', 920],
      [0.75, 0.38, '#FF9500', 1180],
      [0.50, 0.32, '#FFFFFF', 1450],
      [0.40, 0.25, '#FF2D55', 1700],
      [0.60, 0.30, '#FFD700', 1950]
    ];

    const timeouts = launches.map(([x, y, color, delay]) => {
      return setTimeout(() => launchRocket(width * x, height * y, color), delay);
    });

    // Start fade out after ~3.5 seconds
    const fadeTimeout = setTimeout(() => setFading(true), 3500);
    const endTimeout = setTimeout(() => {
      cancelAnimationFrame(animationFrame);
      setVisible(false);
    }, 4800);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
      timeouts.forEach(clearTimeout);
      clearTimeout(fadeTimeout);
      clearTimeout(endTimeout);
    };
  }, [visible]);

  const handleDismiss = () => {
    setFading(true);
    setTimeout(() => setVisible(false), 500);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] overflow-hidden bg-radial from-[#1f1105] via-[#0d0702] to-black flex items-center justify-center transition-all duration-1000 ${
        fading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Skip Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md text-xs font-bold transition-all border border-white/20 cursor-pointer"
      >
        <span>Skip</span>
        <X size={14} />
      </button>

      {/* Brand Typography Centerpiece Reveal */}
      <div className="relative z-10 text-center select-none px-4 animate-brand-appear">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles size={16} className="text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="text-yellow-300 text-xs sm:text-sm uppercase tracking-[0.45em] font-extrabold drop-shadow">
            CELEBRATE • LIGHT • JOY
          </span>
          <Sparkles size={16} className="text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-widest leading-none drop-shadow-[0_0_40px_rgba(255,215,0,0.85)] font-outfit">
          {brandName} <span className="text-red-500 drop-shadow-[0_0_35px_rgba(239,68,68,0.9)]">{tagline}</span>
        </h1>

        <div className="h-0.5 w-40 sm:w-64 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto my-4" />

        <p className="text-yellow-100/90 text-xs sm:text-sm md:text-base tracking-[0.3em] font-bold uppercase drop-shadow">
          Direct Sivakasi Crackers • Light Up Every Moment
        </p>
      </div>
    </div>
  );
}
