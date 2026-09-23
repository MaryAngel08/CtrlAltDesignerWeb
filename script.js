const navToggle = document.getElementById("nav-toggle");

document.querySelectorAll(".main-nav a, .cta-button, .logo, .footer-nav a, .footer-brand").forEach((el) => {
  el.addEventListener("click", () => {
    if (navToggle) navToggle.checked = false;
  });
});

const heroPortrait = document.querySelector(".hero-portrait");
if (heroPortrait && heroPortrait.tagName === "VIDEO") {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    heroPortrait.pause();
  } else {
    heroPortrait.playbackRate = 0.65;
  }
}

const revealItems = document.querySelectorAll(".reveal");
const touchFigure = document.querySelector(".touch-figure");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (prefersReducedMotion) {
  revealItems.forEach((item) => item.classList.add("in-view"));
  if (touchFigure) touchFigure.classList.add("in-view");
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  revealItems.forEach((item) => io.observe(item));

  if (touchFigure) {
    const contactSection = document.getElementById("contact") || touchFigure;
    const cursorIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          touchFigure.classList.add("in-view");
          cursorIo.disconnect();
        }
      });
    }, { threshold: 0.18 });
    cursorIo.observe(contactSection);
  }
}

const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)");
if (motionOk.matches) {
  const portrait = document.querySelector(".hero-portrait");
  const hero = document.querySelector(".hero");
  const heroText = document.querySelectorAll(".hero-heading, .hero-blurb, .hero-tags");
  const marqueeTrack = document.querySelector(".marquee-track");
  const scrollProgress = document.querySelector(".scroll-progress");
  const navLinks = [...document.querySelectorAll(".main-nav a[href^='#']")].filter(
    (a) => a.getAttribute("href") !== "#top" && !a.classList.contains("nav-cta")
  );
  const sectionIds = navLinks
    .map((a) => a.getAttribute("href").slice(1))
    .filter(Boolean);
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  let lastScrollY = window.scrollY;
  let lastTime = performance.now();
  let marqueeRate = 1;
  let marqueeDir = 1;
  let ticking = false;

  const applyMarqueeRate = () => {
    if (!marqueeTrack) return;
    const animations = marqueeTrack.getAnimations();
    const rate = marqueeRate * marqueeDir;
    if (animations.length) {
      animations.forEach((anim) => {
        anim.playbackRate = rate;
      });
    } else {
      marqueeTrack.style.animationDuration = `${32 / Math.max(0.001, Math.abs(rate))}s`;
      marqueeTrack.style.animationDirection = rate < 0 ? "reverse" : "normal";
    }
  };

  const updateScrollLinked = (now) => {
    const y = window.scrollY;
    const dt = Math.max(16, now - lastTime);
    const dy = y - lastScrollY;

    if (hero && portrait) {
      const heroH = Math.max(1, hero.offsetHeight);
      const p = Math.min(1, Math.max(0, y / heroH));
      const scale = 1 + 0.08 * p;
      const blur = 6 * p;
      portrait.style.transform = `scale(${scale})`;
      portrait.style.filter = `blur(${blur}px)`;
      heroText.forEach((el) => {
        el.style.opacity = String(1 - p);
        el.style.transform = `translateY(${-40 * p}px)`;
      });
    }

    const velocity = Math.abs(dy) / dt;
    let targetRate = Math.min(3, 1 + velocity * 8);
    if (Math.abs(dy) < 0.4) {
      targetRate = 1;
    } else if (dy < 0) {
      marqueeDir = -1;
    } else {
      marqueeDir = 1;
    }
    marqueeRate += (targetRate - marqueeRate) * (Math.abs(dy) < 0.4 ? 0.08 : 0.2);
    applyMarqueeRate();

    if (scrollProgress) {
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, y / maxScroll));
      scrollProgress.style.transform = `scaleX(${progress})`;
    }

    let activeId = sectionIds[0];
    const marker = y + window.innerHeight * 0.35;
    for (const section of sections) {
      if (section.offsetTop <= marker) activeId = section.id;
    }
    navLinks.forEach((link) => {
      const id = link.getAttribute("href").slice(1);
      link.classList.toggle("is-active", id === activeId);
    });

    lastScrollY = y;
    lastTime = now;
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollLinked);
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  requestAnimationFrame(updateScrollLinked);

  const onceVisible = (el, threshold, onShow) => {
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onShow();
            obs.disconnect();
          }
        });
      },
      { threshold }
    );
    obs.observe(el);
  };

  const about = document.getElementById("about");
  onceVisible(about, 0.3, () => about.classList.add("is-visible"));

  const serviceRow = document.querySelector("#services .service-row");
  onceVisible(serviceRow, 0.2, () => serviceRow.classList.add("is-visible"));

  const workGrid = document.querySelector("#work .process-grid");
  onceVisible(workGrid, 0.2, () => workGrid.classList.add("is-visible"));
}

const touchForm = document.getElementById("touch-form");
if (touchForm) {
  touchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!touchForm.reportValidity()) return;
    const data = new FormData(touchForm);
    const first = String(data.get("first") || "").trim();
    const last = String(data.get("last") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    const name = [first, last].filter(Boolean).join(" ");
    const subject = encodeURIComponent(name ? `Project inquiry from ${name}` : "Project inquiry");
    const body = encodeURIComponent(
      `${name ? `Name: ${name}\n` : ""}Email: ${email}\n\n${message}`
    );
    window.location.href = `mailto:ctrlaltdesigner@outlook.com?subject=${subject}&body=${body}`;
  });
}
