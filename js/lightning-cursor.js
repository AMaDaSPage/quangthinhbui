(() => {
  // Chỉ chạy trên thiết bị có chuột (không chạy trên touch)
  if (!window.matchMedia || !matchMedia("(pointer: fine)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "cursor-fx-canvas";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d", { alpha: true });

  let dpr = Math.max(1, window.devicePixelRatio || 1);
  function resize() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  const mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    px: window.innerWidth / 2,
    py: window.innerHeight / 2,
    active: false,
  };

  const sparks = [];
  function addSpark(x, y) {
    const a = Math.random() * Math.PI * 2;
    const s = 1.5 + Math.random() * 2.5;
    sparks.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 16 + Math.random() * 10,
      r: 1 + Math.random() * 1.5,
    });
  }

  function drawLightning(x0, y0, x1, y1) {
    const dx = x1 - x0, dy = y1 - y0;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return;

    const steps = Math.min(28, Math.max(10, Math.floor(dist / 10)));
    const nx = -dy / dist, ny = dx / dist;
    const ampBase = Math.min(18, Math.max(6, dist * 0.15));

    ctx.beginPath();
    ctx.moveTo(x0, y0);

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const ox = (Math.random() - 0.5) * ampBase * (1 - t);
      const oy = (Math.random() - 0.5) * ampBase * (1 - t);
      const px = x0 + dx * t + nx * ox;
      const py = y0 + dy * t + ny * oy;
      ctx.lineTo(px, py);
    }
    ctx.lineTo(x1, y1);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // glow
    ctx.strokeStyle = "rgba(255, 172, 120, 0.22)";
    ctx.lineWidth = 6;
    ctx.stroke();

    // core
    ctx.strokeStyle = "rgba(181, 136, 39, 0.75)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function tick() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // ✅ QUAN TRỌNG: xóa dần nét cũ, KHÔNG phủ đen nền web
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.18)"; // tăng -> trail ngắn hơn; giảm -> trail dài hơn
    ctx.fillRect(0, 0, w, h);

    // quay lại chế độ vẽ bình thường
    ctx.globalCompositeOperation = "source-over";

    if (mouse.active) {
      drawLightning(mouse.px, mouse.py, mouse.x, mouse.y);
      for (let i = 0; i < 2; i++) addSpark(mouse.x, mouse.y);
      mouse.px = mouse.x;
      mouse.py = mouse.y;
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.life -= 1;

      const a = Math.max(0, p.life / 26);
      ctx.beginPath();
      ctx.fillStyle = `rgba(180,220,255,${0.55 * a})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      if (p.life <= 0) sparks.splice(i, 1);
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  window.addEventListener("mousemove", (e) => {
    mouse.active = true;
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (Math.hypot(mouse.x - mouse.px, mouse.y - mouse.py) > 200) {
      mouse.px = mouse.x;
      mouse.py = mouse.y;
    }
  }, { passive: true });

  window.addEventListener("mouseleave", () => { mouse.active = false; }, { passive: true });
})();
