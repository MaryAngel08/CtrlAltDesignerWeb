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
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  revealItems.forEach((item) => item.classList.add("in-view"));
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
