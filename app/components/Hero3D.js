"use client";

import { useEffect, useRef } from "react";

export default function Hero3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const gears = [
      { x: 0.5, y: 0.4, radius: 80, teeth: 12, speed: 0.01, rotation: 0 },
      { x: 0.65, y: 0.55, radius: 50, teeth: 8, speed: -0.015, rotation: 0 },
      { x: 0.35, y: 0.55, radius: 60, teeth: 10, speed: -0.012, rotation: 0 },
    ];

    const drawGear = (x, y, radius, teeth, rotation) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      const toothDepth = radius * 0.15;
      const toothWidth = (Math.PI * 2) / (teeth * 2.5);

      // Gear body
      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const angle = (i / teeth) * Math.PI * 2;
        const nextAngle = ((i + 1) / teeth) * Math.PI * 2;

        const x1 = Math.cos(angle) * radius;
        const y1 = Math.sin(angle) * radius;
        const x2 = Math.cos(angle + toothWidth) * (radius + toothDepth);
        const y2 = Math.sin(angle + toothWidth) * (radius + toothDepth);
        const x3 = Math.cos(nextAngle - toothWidth) * (radius + toothDepth);
        const y3 = Math.sin(nextAngle - toothWidth) * (radius + toothDepth);
        const x4 = Math.cos(nextAngle) * radius;
        const y4 = Math.sin(nextAngle) * radius;

        if (i === 0) ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);
      }
      ctx.closePath();

      const gradient = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 0, 0, 0, radius);
      gradient.addColorStop(0, "#9ca3af");
      gradient.addColorStop(0.5, "#6b7280");
      gradient.addColorStop(1, "#4b5563");
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Center
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = "#d97706";
      ctx.fill();
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.clearRect(0, 0, w, h);

      gears.forEach((gear) => {
        gear.rotation += gear.speed;
        drawGear(w * gear.x, h * gear.y, gear.radius, gear.teeth, gear.rotation);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />;
}
