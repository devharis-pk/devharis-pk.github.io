(function () {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const themeBtn = document.querySelector(".theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  function syncTheme(theme) {
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    const dark = root.getAttribute("data-theme") === "dark";
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", String(dark));
      themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    }
    if (themeMeta) themeMeta.setAttribute("content", dark ? "#121016" : "#f6f1e8");
  }
  syncTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");
  themeBtn?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    try { localStorage.setItem("haris-theme", next); } catch (err) { /* storage may be blocked */ }
    syncTheme(next);
  });

  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav");
  function closeMenu() {
    nav?.classList.remove("is-open");
    menuBtn?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }
  menuBtn?.addEventListener("click", () => {
    const open = !nav?.classList.contains("is-open");
    nav?.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
  });
  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", (event) => {
    if (!nav?.classList.contains("is-open")) return;
    const target = event.target;
    if (target instanceof Node && !nav.contains(target) && !menuBtn?.contains(target)) closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) closeMenu();
  });

  const header = document.querySelector(".site-header");
  const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const visual = document.querySelector(".typed-visual");
  if (visual && root.classList.contains("anim-type")) {
    const lead = "I turn messy business operations into ";
    const accent = "software teams can trust.";
    const caret = visual.querySelector(".caret");
    const leadNode = document.createElement("span");
    const em = document.createElement("em");
    visual.insertBefore(leadNode, caret);
    visual.insertBefore(em, caret);
    let i = 0;
    const total = lead.length + accent.length;
    const step = () => {
      if (i <= lead.length) leadNode.textContent = lead.slice(0, i);
      else {
        leadNode.textContent = lead;
        em.textContent = accent.slice(0, i - lead.length);
      }
      i += 1;
      if (i <= total) window.setTimeout(step, 26);
      else caret?.classList.add("is-done");
    };
    window.setTimeout(step, 240);
  }

  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const run = (el) => {
      const target = Number(el.getAttribute("data-count"));
      const suffix = el.getAttribute("data-suffix") || "";
      if (reduce || !Number.isFinite(target)) {
        el.textContent = String(target) + suffix;
        return;
      }
      const start = performance.now();
      const duration = 1100;
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(target * eased)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ("IntersectionObserver" in window && !reduce) {
      const seen = new WeakSet();
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || seen.has(entry.target)) return;
          seen.add(entry.target);
          run(entry.target);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.6 });
      counters.forEach((el) => {
        el.textContent = "0" + (el.getAttribute("data-suffix") || "");
        observer.observe(el);
      });
    }
  }

  if (!reduce && finePointer) {
    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
        const rotateY = (x - 0.5) * 8;
        const rotateX = (0.5 - y) * 8;
        card.style.transform = "perspective(900px) rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg)";
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.getAttribute("data-copy");
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
        const label = button.querySelector(".copy-label");
        const previous = label ? label.textContent : "";
        if (label) label.textContent = "Copied";
        window.setTimeout(() => { if (label) label.textContent = previous; }, 1600);
      } catch (err) { /* mailto remains available */ }
    });
  });

  const sliderRoot = document.querySelector(".product-swiper");
  const pauseBtn = document.querySelector(".js-pause");
  if (sliderRoot && window.Swiper) {
    const autoplay = reduce ? false : {
      delay: 4200,
      disableOnInteraction: false,
      pauseOnMouseEnter: true
    };
    const swiper = new window.Swiper(sliderRoot, {
      slidesPerView: 1.08,
      spaceBetween: 16,
      loop: true,
      speed: reduce ? 0 : 650,
      grabCursor: true,
      watchOverflow: true,
      autoplay,
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".js-next", prevEl: ".js-prev" },
      keyboard: { enabled: true, onlyInViewport: true },
      a11y: {
        enabled: true,
        prevSlideMessage: "Previous product",
        nextSlideMessage: "Next product"
      },
      breakpoints: {
        720: { slidesPerView: 1.35, spaceBetween: 18 },
        1080: { slidesPerView: 2.05, spaceBetween: 22 }
      }
    });
    if (pauseBtn) {
      if (!autoplay) {
        pauseBtn.hidden = true;
      } else {
        pauseBtn.addEventListener("click", () => {
          const paused = pauseBtn.classList.toggle("is-paused");
          if (paused) swiper.autoplay.stop();
          else swiper.autoplay.start();
          pauseBtn.setAttribute("aria-pressed", String(paused));
          pauseBtn.setAttribute("aria-label", paused ? "Play product slideshow" : "Pause product slideshow");
        });
      }
    }
  } else if (sliderRoot) {
    const scroller = sliderRoot.querySelector(".swiper-wrapper");
    const scrollByCard = (direction) => {
      scroller?.scrollBy({
        left: direction * Math.max(280, scroller.clientWidth * 0.86),
        behavior: reduce ? "auto" : "smooth"
      });
    };
    document.querySelector(".js-next")?.addEventListener("click", () => scrollByCard(1));
    document.querySelector(".js-prev")?.addEventListener("click", () => scrollByCard(-1));
    if (pauseBtn) pauseBtn.hidden = true;
  }

  if (!reduce && window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.utils.toArray("[data-reveal]").forEach((el) => {
      window.gsap.from(el, {
        y: 28,
        opacity: 0,
        duration: 0.75,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true }
      });
    });
    if (window.matchMedia("(min-width: 981px)").matches) {
      window.gsap.fromTo(".shot-a", { y: 0, rotation: 2.4 }, {
        y: -36, rotation: 2.4, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
      window.gsap.fromTo(".shot-b", { y: 0, rotation: -6 }, {
        y: 28, rotation: -6, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
  }
})();
