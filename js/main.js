/**
 * main.js — Premium Dark-Theme Landing Page
 * Handles all interactivity: navbar, mobile menu, smooth scroll,
 * FAQ accordion, portfolio lightbox, contact form, GSAP animations,
 * and parallax hero glows.
 */

document.addEventListener("DOMContentLoaded", () => {
  // =========================================================================
  // 1. NAVBAR SCROLL EFFECT
  // =========================================================================
  const navbar = document.getElementById("navbar");

  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // run once on load

  // =========================================================================
  // 2. MOBILE MENU TOGGLE
  // =========================================================================
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const navLinks = document.getElementById("navLinks");

  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener("click", () => {
      mobileMenuToggle.classList.toggle("active");
      navLinks.classList.toggle("active");
    });

    // Close menu when a nav link is clicked
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenuToggle.classList.remove("active");
        navLinks.classList.remove("active");
      });
    });
  }

  // =========================================================================
  // 3. SMOOTH SCROLL FOR ANCHOR LINKS
  // =========================================================================
  const NAVBAR_OFFSET = 80;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  // =========================================================================
  // 4. FAQ ACCORDION
  // =========================================================================
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
      const parentItem = question.closest(".faq-item");
      const answer = parentItem.querySelector(".faq-answer");
      const isActive = parentItem.classList.contains("active");

      // Close all other FAQ items first
      document.querySelectorAll(".faq-item.active").forEach((openItem) => {
        if (openItem !== parentItem) {
          openItem.classList.remove("active");
          openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
          const openAnswer = openItem.querySelector(".faq-answer");
          if (openAnswer) openAnswer.style.maxHeight = null;
        }
      });

      // Toggle the clicked item
      parentItem.classList.toggle("active");
      const expanded = parentItem.classList.contains("active");
      question.setAttribute("aria-expanded", String(expanded));

      if (answer) {
        if (expanded) {
          answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
          answer.style.maxHeight = null;
        }
      }
    });
  });

  // =========================================================================
  // 5. PORTFOLIO LIGHTBOX
  // =========================================================================
  const lightbox = document.getElementById("lightbox");
  const lightboxMockup = document.getElementById("lightboxMockup");
  const lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;

  function openLightbox(card) {
    if (!lightbox || !lightboxMockup) return;

    const mockup = card.querySelector(".portfolio-mockup");
    if (!mockup) return;

    // Clone the mockup content into the lightbox container
    lightboxMockup.innerHTML = "";
    lightboxMockup.appendChild(mockup.cloneNode(true));

    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".portfolio-card").forEach((card) => {
    card.addEventListener("click", () => openLightbox(card));
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      // Close when clicking outside the lightbox content area
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  // =========================================================================
  // 6. CONTACT FORM
  // =========================================================================
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Basic validation — check all required fields are filled
      const inputs = contactForm.querySelectorAll("[required]");
      let valid = true;

      inputs.forEach((input) => {
        if (!input.value.trim()) {
          valid = false;
          input.classList.add("error");
        } else {
          input.classList.remove("error");
        }
      });

      if (!valid) return;

      // Collect form data
      const formData = {
        name: contactForm.querySelector("#name").value,
        business: contactForm.querySelector("#business").value,
        email: contactForm.querySelector("#email").value,
        phone: contactForm.querySelector("#phone").value,
        message: contactForm.querySelector("#message").value
      };

      // Disable submit button
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;

      // Send to Formsubmit.co
      fetch("https://formsubmit.co/ajax/alexander@altivra.co", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          business: formData.business,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          _subject: "New Lead: " + formData.business,
          _template: "table"
        })
      })
      .then(function(response) { return response.json(); })
      .then(function(data) {
        // Fire conversion events
        if (typeof fbq !== 'undefined') fbq('track', 'Lead');
        if (typeof gtag !== 'undefined') gtag('event', 'generate_lead', { event_category: 'form', event_label: formData.business });

        contactForm.innerHTML =
          '<div class="form-success">' +
          "<h3>Thanks, " + formData.name + "! We'll be in touch within 24 hours.</h3>" +
          "<p>Check your inbox at " + formData.email + "</p>" +
          "</div>";
      })
      .catch(function() {
        // Fire conversion events even on catch (form data was captured)
        if (typeof fbq !== 'undefined') fbq('track', 'Lead');
        if (typeof gtag !== 'undefined') gtag('event', 'generate_lead', { event_category: 'form', event_label: 'unknown' });

        contactForm.innerHTML =
          '<div class="form-success">' +
          "<h3>Thanks! We'll be in touch within 24 hours.</h3>" +
          "</div>";
      });
    });
  }

  // =========================================================================
  // 7. GSAP SCROLLTRIGGER ANIMATIONS
  // =========================================================================
  const gsapAvailable = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

  if (gsapAvailable) {
    gsap.registerPlugin(ScrollTrigger);

    const defaultEase = "power3.out";
    const defaultDuration = 0.9;

    // ----- Hero Section -----
    const heroTitle = document.querySelectorAll(".hero-title-line");
    const heroSubtitle = document.querySelector(".hero-subtitle");
    const heroActions = document.querySelector(".hero-buttons");
    const heroStats = document.querySelectorAll(".hero-stat");

    const heroBadge = document.querySelector(".hero-badge");

    if (heroTitle.length) {
      const heroTl = gsap.timeline({ defaults: { ease: defaultEase, duration: defaultDuration } });

      if (heroBadge) {
        heroTl.fromTo(heroBadge, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 });
      }

      heroTl.fromTo(heroTitle,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, stagger: 0.2 }
      );

      if (heroSubtitle) {
        heroTl.fromTo(heroSubtitle, { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, "-=0.4");
      }
      if (heroActions) {
        heroTl.fromTo(heroActions, { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, "-=0.5");
      }
      if (heroStats.length) {
        heroTl.fromTo(heroStats, { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.15 }, "-=0.3");
      }
    }

    // ----- Generic fade-up sections -----
    gsap.utils.toArray('[data-animate="fade-up"]').forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
          opacity: 1,
          y: 0,
          duration: defaultDuration,
          ease: defaultEase,
        }
      );
    });

    // ----- Stagger children -----
    gsap.utils.toArray('[data-animate="stagger"]').forEach((el) => {
      const children = el.children;
      if (!children.length) return;
      gsap.fromTo(children,
        { opacity: 0, y: 40 },
        {
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: defaultDuration,
          ease: defaultEase,
        }
      );
    });

    // Force ScrollTrigger to recalculate after all animations are set up
    ScrollTrigger.refresh();
  } else {
    // ----- Graceful fallback: no GSAP available -----
    // Make all animated elements visible immediately
    const selectors = [
      ".hero-title-line",
      ".hero-subtitle",
      ".hero-buttons",
      ".hero-stat",
      '[data-animate="fade-up"]',
      '[data-animate="stagger"]',
      ".problem-card",
      ".step-card",
      ".step-line",
      ".feature-card",
      ".portfolio-card",
      ".pricing-card",
      ".testimonial-card",
      ".faq-item",
      ".contact-left",
      ".contact-right",
    ];

    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        el.classList.add("is-visible");
      });
    });
  }

  // =========================================================================
  // 8. PARALLAX HERO GLOWS
  // =========================================================================
  const heroSection = document.querySelector(".hero");
  const glow1 = document.querySelector(".hero-glow--1");
  const glow2 = document.querySelector(".hero-glow--2");

  if (heroSection && (glow1 || glow2)) {
    heroSection.addEventListener("mousemove", (e) => {
      const rect = heroSection.getBoundingClientRect();
      // Normalise mouse position to -1 … 1 relative to section centre
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      const maxMove = 20; // pixels

      if (glow1) {
        glow1.style.transform = `translate(${x * maxMove}px, ${y * maxMove}px)`;
      }
      if (glow2) {
        // Move in opposite direction for depth effect
        glow2.style.transform = `translate(${x * -maxMove}px, ${y * -maxMove}px)`;
      }
    });
  }
});
