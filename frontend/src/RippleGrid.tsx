import { useEffect, useRef } from 'react';

interface RippleGridProps {
  /** Pixels between grid lines */
  gridSize?: number;
  /** Ripple wave speed (higher = faster) */
  speed?: number;
  /** Max displacement of grid nodes in px */
  amplitude?: number;
  /** Primary line color (CSS rgba string) */
  lineColor?: string;
  /** Ripple glow color */
  glowColor?: string;
  /** Opacity of base grid (0–1) */
  baseOpacity?: number;
}

export function RippleGrid({
  gridSize = 42,
  speed = 0.6,
  amplitude = 6,
  lineColor = 'rgba(183, 105, 53, 0.28)',
  glowColor = 'rgba(147, 94, 56, 0.55)',
  baseOpacity = 0.55,
}: RippleGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Track mouse for interactive ripple origin
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const onMouseMove = (e: MouseEvent) => {
      mouse = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove);

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const cols = Math.ceil(W / gridSize) + 2;
      const rows = Math.ceil(H / gridSize) + 2;

      // Build displaced grid point map
      const pts: Array<Array<{ x: number; y: number; intensity: number }>> = [];

      for (let row = 0; row <= rows; row++) {
        pts[row] = [];
        for (let col = 0; col <= cols; col++) {
          const baseX = col * gridSize;
          const baseY = row * gridSize;

          // Distance from mouse for interactive ripple
          const dx = baseX - mouse.x;
          const dy = baseY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const mouseWave = Math.exp(-dist / 260) * Math.sin(dist * 0.04 - t * 3.5) * amplitude * 1.4;

          // Ambient wave
          const ambientWave =
            Math.sin(col * 0.35 + t * speed) * amplitude * 0.5 +
            Math.cos(row * 0.35 + t * speed * 0.8) * amplitude * 0.4;

          const totalDisplace = mouseWave + ambientWave;
          const intensity = Math.min(1, Math.abs(mouseWave) / amplitude);

          pts[row][col] = {
            x: baseX + Math.cos(Math.atan2(dy, dx)) * totalDisplace,
            y: baseY + Math.sin(Math.atan2(dy, dx)) * totalDisplace,
            intensity,
          };
        }
      }

      ctx.globalAlpha = baseOpacity;

      // Draw horizontal lines
      for (let row = 0; row <= rows; row++) {
        ctx.beginPath();
        for (let col = 0; col <= cols; col++) {
          const p = pts[row][col];
          if (col === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        // Use glow color near mouse influence, base color elsewhere
        const rowIntensity = pts[row].reduce((sum, p) => sum + p.intensity, 0) / cols;
        ctx.strokeStyle = rowIntensity > 0.15 ? glowColor : lineColor;
        ctx.lineWidth = rowIntensity > 0.2 ? 1.5 : 1;
        ctx.stroke();
      }

      // Draw vertical lines
      for (let col = 0; col <= cols; col++) {
        ctx.beginPath();
        for (let row = 0; row <= rows; row++) {
          const p = pts[row][col];
          if (row === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        const colIntensity = pts.reduce((sum, r) => sum + r[col].intensity, 0) / rows;
        ctx.strokeStyle = colIntensity > 0.15 ? glowColor : lineColor;
        ctx.lineWidth = colIntensity > 0.2 ? 1.5 : 1;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      t += 0.016;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [gridSize, speed, amplitude, lineColor, glowColor, baseOpacity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

export default RippleGrid;
