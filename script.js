    /* Header scroll state */
    const header = document.getElementById("header");
    window.addEventListener("scroll", () => {
      header.classList.toggle("scrolled", window.scrollY > 40);
    });

    /* Mobile menu handlers */
    const mobileNav = document.getElementById("mobileNav");
    document.getElementById("menuBtn").addEventListener("click", () => {
      mobileNav.classList.add("open");
      document.body.classList.add("menu-open");
    });
    document.getElementById("closeMenu").addEventListener("click", closeMenu);
    mobileNav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
    function closeMenu() {
      mobileNav.classList.remove("open");
      document.body.classList.remove("menu-open");
    }

    /* Scroll reveal observer */
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

    /* Active navigation tracker */
    const navLinks = document.querySelectorAll(".nav a");
    const sections = document.querySelectorAll("main section[id]");
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach(s => navObserver.observe(s));

    /* Accessible horizontal project carousel */
    (() => {
      const viewport = document.getElementById("projectViewport"), track = document.getElementById("projectTrack");
      if (!viewport || !track) return;
      const slides = [...track.querySelectorAll(".project-slide")], prev = document.getElementById("projectPrev"), next = document.getElementById("projectNext");
      const count = document.getElementById("projectCount"), progress = document.getElementById("projectProgress");
      let index = 0, startX = 0, dragging = false;
      function go(n) {
        index = (n + slides.length) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`;
        count.textContent = `${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
        progress.style.width = `${((index + 1) / slides.length) * 100}%`;
        prev.disabled = false;
        next.disabled = false;
      }
      prev.addEventListener("click", () => go(index - 1));
      next.addEventListener("click", () => go(index + 1));
      viewport.addEventListener("keydown", e => {
        if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
      });
      viewport.addEventListener("pointerdown", e => {
        if (e.target.closest("a, button")) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        startX = e.clientX;
        dragging = true;
        // viewport.setPointerCapture?.(e.pointerId);
      });
      viewport.addEventListener("pointerup", e => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        dragging = false;
        if (Math.abs(dx) > 55) go(index + (dx < 0 ? 1 : -1));
      });
      viewport.addEventListener("pointercancel", () => dragging = false);
      window.addEventListener("resize", () => go(index));
      go(0);
    })();
/* Contact form submission simulation */
    document.getElementById("contactForm").addEventListener("submit", e => {
      e.preventDefault();
      const btn = e.currentTarget.querySelector(".send");
      const old = btn.textContent;
      btn.textContent = "Message ready ✓";
      btn.style.background = "var(--accent)";
      btn.style.borderColor = "var(--accent)";
      setTimeout(() => {
        btn.textContent = old;
        btn.style.background = "";
        btn.style.borderColor = "";
        e.currentTarget.reset();
      }, 2200);
    });
  