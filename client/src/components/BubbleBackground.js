import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

// RGB string palettes per theme
const DARK_PALETTE  = [
  '88,166,255',   // blue
  '63,185,80',    // green
  '167,139,250',  // purple
  '248,113,113',  // red
  '56,189,248',   // cyan
  '251,191,36',   // amber
];

const LIGHT_PALETTE = [
  '9,105,218',    // blue
  '26,127,55',    // green
  '124,58,237',   // violet
  '207,34,46',    // red
  '3,169,244',    // cyan
  '180,120,0',    // amber
];

function makeBubble(w, h, colors) {
  const r = 36 + Math.random() * 90;
  return {
    x:          Math.random() * w,
    y:          h + r + Math.random() * h,   // start below viewport
    r,
    dx:         (Math.random() - 0.5) * 0.35,
    dy:         -(0.25 + Math.random() * 0.55),
    color:      colors[Math.floor(Math.random() * colors.length)],
    opacity:    0.070 + Math.random() * 0.149,
    phase:      Math.random() * Math.PI * 2,
    phaseSpeed: 0.006 + Math.random() * 0.009,
    wobble:     0,
    wobbleAmp:  0.15 + Math.random() * 0.25,
    wobbleFreq: 0.008 + Math.random() * 0.012,
  };
}

function BubbleBackground() {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const palette  = isDark ? DARK_PALETTE : LIGHT_PALETTE;
    const COUNT    = 22;
    const bubbles  = Array.from({ length: COUNT }, () =>
      makeBubble(canvas.width, canvas.height, palette)
    );

    // Scatter some bubbles already on-screen at startup
    bubbles.forEach((b, i) => {
      if (i < COUNT * 0.6) {
        b.y = Math.random() * canvas.height;
      }
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.forEach((b) => {
        // Advance position
        b.wobble  += b.wobbleFreq;
        b.phase   += b.phaseSpeed;
        b.x += b.dx + Math.sin(b.wobble) * b.wobbleAmp;
        b.y += b.dy;

        // Recycle when off top
        if (b.y + b.r < 0) {
          Object.assign(b, makeBubble(canvas.width, canvas.height, palette));
        }
        // Wrap horizontal
        if (b.x - b.r >  canvas.width)  b.x = -b.r;
        if (b.x + b.r <  0)             b.x = canvas.width + b.r;

        const pr = b.r + Math.sin(b.phase) * 3;          // pulsing radius
        const po = b.opacity + Math.sin(b.phase) * 0.0225; // pulsing opacity

        // ── Body gradient ────────────────────────────────────────────────
        const grad = ctx.createRadialGradient(
          b.x - pr * 0.28, b.y - pr * 0.28, pr * 0.05,
          b.x,             b.y,             pr
        );
        grad.addColorStop(0,    `rgba(${b.color}, ${(po * 2.0).toFixed(3)})`);
        grad.addColorStop(0.45, `rgba(${b.color}, ${(po * 1.25).toFixed(3)})`);
        grad.addColorStop(0.8,  `rgba(${b.color}, ${(po * 0.625).toFixed(3)})`);
        grad.addColorStop(1,    `rgba(${b.color}, 0)`);

        ctx.beginPath();
        ctx.arc(b.x, b.y, pr, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // ── Rim ring ─────────────────────────────────────────────────────
        ctx.beginPath();
        ctx.arc(b.x, b.y, pr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${b.color}, ${(po * 0.69).toFixed(3)})`;
        ctx.lineWidth   = isDark ? 0.8 : 1;
        ctx.stroke();

        // ── Specular highlight (top-left crescent) ────────────────────
        const hlGrad = ctx.createRadialGradient(
          b.x - pr * 0.3, b.y - pr * 0.36, 0,
          b.x - pr * 0.3, b.y - pr * 0.36, pr * 0.45
        );
        hlGrad.addColorStop(0,   `rgba(255,255,255, ${isDark ? 0.225 : 0.69})`);
        hlGrad.addColorStop(0.5, `rgba(255,255,255, ${isDark ? 0.075 : 0.225})`);
        hlGrad.addColorStop(1,   'rgba(255,255,255,0)');

        ctx.beginPath();
        ctx.arc(b.x, b.y, pr, 0, Math.PI * 2);
        ctx.fillStyle = hlGrad;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        zIndex:        0,
      }}
    />
  );
}

export default BubbleBackground;
