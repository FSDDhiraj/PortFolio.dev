/*
 * Constellation Grid — vanilla JavaScript adaptation of the supplied React canvas component.
 * Runs only inside the landing hero and fades out at the hero boundary.
 *
 * Visual behavior preserved from the reference:
 * - 55px node grid with subtle pulse
 * - mouse velocity tracking and cursor shockwave repulsion
 * - Hooke's-law spring return + damping
 * - proximity connections, cyan node highlights, radar rings and hex labels
 *
 * Optimizations: spatial hashing for nearby connections, capped DPR, reduced-motion
 * handling, and pausing while the document is hidden.
 */
(() => {
  const canvas = document.getElementById("constellationCanvas");
  if (!canvas) return;

  const hero = canvas.closest(".hero");
  if (!hero) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

  let animationFrameId = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastTime = performance.now();
  let paused = false;
  let nodes = [];

  const mouse = {
    x: -1000,
    y: -1000,
    prevX: -1000,
    prevY: -1000,
    vx: 0,
    vy: 0,
    radius: 220,
  };

  const SPRING_K = 18;
  const DAMPING = 0.82;
  const GRID_SPACING = 55;
  const MAX_CONN_DIST = 75;
  const MAX_CONN_DIST_SQ = MAX_CONN_DIST * MAX_CONN_DIST;

  function initNodes() {
    nodes = [];
    const cols = Math.ceil(width / GRID_SPACING) + 1;
    const rows = Math.ceil(height / GRID_SPACING) + 1;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * GRID_SPACING;
        const y = j * GRID_SPACING;
        nodes.push({
          x,
          y,
          vx: 0,
          vy: 0,
          baseX: x,
          baseY: y,
          radius: Math.random() * 1.2 + 1.2,
          label: `${(i * 7).toString(16).toUpperCase()}:${(j * 11).toString(16).toUpperCase()}`,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  function handleResize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = hero.clientWidth;
    height = hero.clientHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    // Reset transform rather than stacking a new scale on every resize.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initNodes();
    renderStaticFrame();
  }

  function handlePointerMove(event) {
    if (event.pointerType === "touch" && coarsePointer) {
      // Touch can move the field too, but don't keep it active after the finger leaves.
      const rect = hero.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      return;
    }
    const rect = hero.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  }

  function handlePointerLeave() {
    mouse.x = -1000;
    mouse.y = -1000;
    mouse.vx = 0;
    mouse.vy = 0;
  }

  function updateNodes(dt) {
    mouse.vx = (mouse.x - mouse.prevX) / (dt * 1000 || 1);
    mouse.vy = (mouse.y - mouse.prevY) / (dt * 1000 || 1);
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;

    const speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);

    for (const node of nodes) {
      node.pulse += dt * 3;

      const dx = mouse.x - node.x;
      const dy = mouse.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Cursor velocity drives a stronger shockwave as the pointer moves faster.
      if (dist < mouse.radius && dist > 0) {
        const power = 1 - dist / mouse.radius;
        const force = power * (1500 + speed * 150);
        const angle = Math.atan2(dy, dx);
        node.vx -= Math.cos(angle) * force * dt;
        node.vy -= Math.sin(angle) * force * dt;
      }

      // Spring force pulls each node back to its original grid anchor.
      const homeDx = node.baseX - node.x;
      const homeDy = node.baseY - node.y;
      node.vx += homeDx * SPRING_K * dt;
      node.vy += homeDy * SPRING_K * dt;

      node.vx *= DAMPING;
      node.vy *= DAMPING;

      node.x += node.vx * dt * 60;
      node.y += node.vy * dt * 60;
    }
  }

  // Spatial hashing preserves the reference's 75px line distance without
  // checking every possible pair on large desktop screens.
  function buildSpatialBuckets() {
    const buckets = new Map();
    const cellSize = MAX_CONN_DIST;

    nodes.forEach((node, index) => {
      const cx = Math.floor(node.x / cellSize);
      const cy = Math.floor(node.y / cellSize);
      const key = `${cx},${cy}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(index);
    });

    return buckets;
  }

  function drawConnections() {
    const buckets = buildSpatialBuckets();
    const cellSize = MAX_CONN_DIST;

    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      const cx = Math.floor(node.x / cellSize);
      const cy = Math.floor(node.y / cellSize);

      for (let ox = -1; ox <= 1; ox++) {
        for (let oy = -1; oy <= 1; oy++) {
          const nearby = buckets.get(`${cx + ox},${cy + oy}`);
          if (!nearby) continue;

          for (const otherIndex of nearby) {
            if (otherIndex <= index) continue;
            const other = nodes[otherIndex];
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < MAX_CONN_DIST_SQ) {
              const dist = Math.sqrt(distSq);
              const alpha = (1 - dist / MAX_CONN_DIST) * 0.15;
              ctx.strokeStyle = `rgba(231, 238, 248, ${alpha})`;
              ctx.lineWidth = 0.7;
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          }
        }
      }
    }
  }

  function drawNodes() {
    for (const node of nodes) {
      const dx = mouse.x - node.x;
      const dy = mouse.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isNear = dist < mouse.radius;

      const baseAlpha = isNear ? 0.95 : 0.22 + Math.sin(node.pulse) * 0.08;
      const accent = "56, 189, 248";
      const neutral = "230, 237, 247";

      ctx.fillStyle = isNear
        ? `rgba(${accent}, ${baseAlpha})`
        : `rgba(${neutral}, ${baseAlpha})`;

      const currentRadius = isNear
        ? node.radius * 2.2
        : node.radius + Math.sin(node.pulse) * 0.3;

      ctx.beginPath();
      ctx.arc(node.x, node.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
      ctx.fill();

      // Nearby radar rings and hexadecimal coordinate readouts.
      if (dist < 90) {
        const pulseRing = ((node.pulse * 20) % 30) + 4;
        const ringAlpha = (1 - pulseRing / 34) * 0.4;

        ctx.strokeStyle = `rgba(${accent}, ${ringAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseRing, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = '8px ui-monospace, SFMono-Regular, Consolas, monospace';
        ctx.fillStyle = `rgba(${accent}, 0.85)`;
        ctx.fillText(node.label, node.x + 10, node.y - 10);
      }
    }
  }

  function renderFrame(dt, animate = true) {
    ctx.clearRect(0, 0, width, height);

    if (animate) updateNodes(dt);
    drawConnections();
    drawNodes();
  }

  function renderStaticFrame() {
    if (motionQuery.matches) {
      renderFrame(0, false);
    }
  }

  function render(now) {
    if (paused || motionQuery.matches) return;

    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    renderFrame(dt, true);
    animationFrameId = requestAnimationFrame(render);
  }

  function startAnimation() {
    if (paused || motionQuery.matches || animationFrameId) return;
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(render);
  }

  function stopAnimation() {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      paused = true;
      stopAnimation();
    } else {
      paused = false;
      if (motionQuery.matches) renderStaticFrame();
      else startAnimation();
    }
  }

  handleResize();

  window.addEventListener("resize", handleResize, { passive: true });
  hero.addEventListener("pointermove", handlePointerMove, { passive: true });
  hero.addEventListener("pointerleave", handlePointerLeave, { passive: true });
  document.addEventListener("visibilitychange", handleVisibilityChange);

  const handleMotionChange = () => {
    stopAnimation();
    if (motionQuery.matches) renderStaticFrame();
    else startAnimation();
  };
  motionQuery.addEventListener?.("change", handleMotionChange);

  if (!motionQuery.matches) startAnimation();

  // Clean up when navigating away from this page.
  window.addEventListener("pagehide", () => {
    stopAnimation();
    window.removeEventListener("resize", handleResize);
    hero.removeEventListener("pointermove", handlePointerMove);
    hero.removeEventListener("pointerleave", handlePointerLeave);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    motionQuery.removeEventListener?.("change", handleMotionChange);
  }, { once: true });
})();
