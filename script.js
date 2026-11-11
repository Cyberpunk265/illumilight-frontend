const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

// Mobile navigation
menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "✕" : "☰";
});

// Close the mobile menu after selecting a link
navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
    });
});

// Automatically update the copyright year
document.getElementById("year").textContent =
    new Date().getFullYear();

// Reveal the page content as it enters the screen
const revealElements = document.querySelectorAll(
    ".feature-card, .dodis-panel, .membership-content"
);

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    revealElements.forEach((element) => {
        element.classList.add("reveal");
        observer.observe(element);
    });
}

document.querySelectorAll(".feature-card").forEach(card => {
    card.addEventListener("click", () => {
        document.querySelectorAll(".feature-card").forEach(item => {
            item.classList.remove("selected");
        });

        card.classList.add("selected");
    });
});

// Golden click ripple effect
document.querySelectorAll(".feature-card").forEach(card => {
    card.addEventListener("click", (event) => {
        const rect = card.getBoundingClientRect();

        const ripple = document.createElement("span");
        ripple.classList.add("ripple-effect");

        const size = Math.max(rect.width, rect.height) * 2;

        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;

        ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

        card.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 700);
    });
});

// 3D mouse-follow card tilt
document.querySelectorAll(".feature-card").forEach(card => {
    card.addEventListener("mousemove", event => {
        const rect = card.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateY = ((x - centerX) / centerX) * 6;
        const rotateX = ((centerY - y) / centerY) * 6;

        card.style.transform =
            `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "";
    });
});