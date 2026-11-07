# Dhiraj Sonawane — Static Portfolio

Static HTML, CSS, and JavaScript version of the supplied portfolio.

## Run locally

Open `index.html` directly, or use VS Code Live Server.

## Project files

- `index.html` — document structure and preserved sections.
- `styles.css` — existing portfolio design plus new hero/prismatic styles.
- `script.js` — navigation, mobile menu, scroll reveal, project carousel, contact interaction, and cursor-reactive prismatic field.
- `images/dhiraj-portrait.png` and `images/dhiraj-portrait.webp` — transparent portrait supplied earlier.

## Landing page

- Removed the hero filmstrip carousel.
- Added a clean two-column layout: name and content on the left, your portrait on the right.
- Subtitle: Full-Stack Developer.
- Added React, Next.js, and Node.js with inline SVG symbols.
- Added the four requested specialities in a compact feature strip below the main hero.
- Integrated the portrait into a perspective studio frame with ambient light, architectural grid, shadow, and soft bottom fade.

## Prismatic cursor background

A dependency-free 2D canvas layer runs behind the full page. Moving the pointer creates a soft prismatic light field, flowing wave ribbons, and fading ripple trails. Clicking creates a stronger ring. It respects reduced-motion preferences and is disabled on touch-only devices.

## Existing assets to add

The original uploaded HTML references the following local assets, but they were not part of the upload:

- `images/TimeFrame.png`
- `images/React-render.png`
- `images/invoice-craft.png`
- `images/career-navigator.png`
- `images/Internship Easybyts Certificate.pdf`
- `images/StemSage Internship certificate.jpg`
- `images/trainee teacher.jpg`

Place these in the `images` folder to restore the existing project previews and certificate links. The relevant links and markup are preserved.


## Full-page Three.js prismatic shader

The former Canvas 2D cursor trail has been replaced with the Three.js ShaderMaterial background supplied in the reference.

- `shader.js` imports Three.js from jsDelivr as an ES module.
- The shader canvas is fixed to the viewport and stays behind every section as visitors scroll.
- The vertex shader and radial interference fragment-shader formula follow the supplied code.
- The animation pauses while the browser tab is hidden and renders a still frame for reduced-motion preferences.
- If the CDN or WebGL is unavailable, the existing CSS ambient background remains as fallback.

This remains a plain HTML/CSS/JavaScript project: no React, Tailwind, npm install, or build step. Use VS Code Live Server so the browser can load the ES module.


## Full-site Constellation Grid background

The previous Three.js radial shader was replaced with the supplied **ConstellationGrid** interaction, adapted to vanilla JavaScript.

- A fixed canvas remains behind the entire site, from the landing page through Contact.
- Fine points form a connected 55px grid.
- Moving the mouse pushes nearby nodes outward in a velocity-sensitive shockwave.
- Spring forces and damping pull the grid back into position.
- Nearby nodes connect with fine lines.
- Nodes near the pointer glow cyan, pulse with radar rings, and show hexadecimal coordinate labels.
- The canvas is transparent and pointer-events are not captured, so page links and buttons remain usable.
- Connection drawing uses spatial buckets to reduce CPU work on large screens.
- The effect respects `prefers-reduced-motion`, supports pointer devices, and pauses when the tab is hidden.

This is now plain HTML, CSS, and JavaScript. It has no React, TypeScript, Three.js, npm, or CDN dependency. Open `index.html` directly or use VS Code Live Server.
