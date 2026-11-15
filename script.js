const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "✕" : "☰";
  });
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    });
  });
}

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Single loop for all card interactions
document.querySelectorAll(".feature-card").forEach(card => {
  card.addEventListener("click", (e) => {
    document.querySelectorAll(".feature-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");

    const rect = card.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ripple-effect";
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
    ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });

  // Tilt only on desktop with rAF throttle
  if (window.matchMedia("(pointer:fine)").matches) {
    let ticking = false;
    card.addEventListener("mousemove", e => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-3px)`;
        ticking = false;
      });
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  }
});

// Reveal on scroll
const revealEls = document.querySelectorAll(".feature-card, .dodis-panel, .membership-content");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("revealed"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => { el.classList.add("reveal"); io.observe(el); });
}