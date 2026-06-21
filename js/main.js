// ---------- Scroll-following background blobs ----------
const goldBlob = document.querySelector(".blob-gold");
const blueBlob = document.querySelector(".blob-blue");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (goldBlob && blueBlob && !prefersReducedMotion) {
  let ticking = false;

  function updateBlobs() {
    const y = window.scrollY;
    goldBlob.style.transform = `translate3d(${y * 0.08}px, ${y * 0.18}px, 0)`;
    blueBlob.style.transform = `translate3d(${y * -0.06}px, ${y * -0.14}px, 0)`;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(updateBlobs);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateBlobs();
}

// ---------- Footer copyright year (always current) ----------
document.querySelectorAll(".copyright-year").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// ---------- Per-room Book Now: Stripe-ready ----------
// To enable real online payment for a room, set its Payment Link URL in the
// data-stripe-link attribute on the matching .book-now-btn element in the HTML.
// Until a link is set, the button falls back to the contact/inquiry form.
document.querySelectorAll(".book-now-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const stripeLink = btn.getAttribute("data-stripe-link");
    if (stripeLink && stripeLink.trim().startsWith("http")) {
      e.preventDefault();
      window.location.href = stripeLink.trim();
    }
    // else: let the default href (contact form) handle it
  });
});

// ---------- AOS init ----------
if (window.AOS) {
  AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
}

// ---------- Navbar shrink on scroll ----------
const navbar = document.getElementById("navbar");

function handleNavScroll() {
  if (!navbar) return;
  if (window.scrollY > 40) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", handleNavScroll, { passive: true });
handleNavScroll();

// ---------- Hamburger menu toggle ----------
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    mobileMenu.classList.toggle("open");
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      mobileMenu.classList.remove("open");
    });
  });
}

// ---------- Smooth scroll for in-page anchors ----------
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const targetId = anchor.getAttribute("href");
    if (targetId.length < 2) return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ---------- Gallery Lightbox ----------
const galleryImgs = Array.from(document.querySelectorAll(".gallery-img"));
const lightbox = document.getElementById("lightbox");

if (galleryImgs.length && lightbox) {
  const lightboxImg = document.getElementById("lightboxImg");
  let lbIndex = 0;

  function showLightbox(i) {
    lbIndex = (i + galleryImgs.length) % galleryImgs.length;
    lightboxImg.src = galleryImgs[lbIndex].src;
    lightboxImg.alt = galleryImgs[lbIndex].alt;
    lightbox.classList.add("open");
  }

  galleryImgs.forEach((img, i) => img.addEventListener("click", () => showLightbox(i)));
  document.getElementById("lightboxClose").addEventListener("click", () => lightbox.classList.remove("open"));
  document.getElementById("lightboxPrev").addEventListener("click", () => showLightbox(lbIndex - 1));
  document.getElementById("lightboxNext").addEventListener("click", () => showLightbox(lbIndex + 1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.classList.remove("open"); });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") lightbox.classList.remove("open");
    if (e.key === "ArrowLeft") showLightbox(lbIndex - 1);
    if (e.key === "ArrowRight") showLightbox(lbIndex + 1);
  });
}

// ---------- Date range picker ----------
const dateRangeBtn = document.getElementById("dateRangeBtn");
const dpPop = document.getElementById("datePickerCalendar");

if (dateRangeBtn && dpPop) {
  const checkinInput = document.getElementById("checkin");
  const checkoutInput = document.getElementById("checkout");
  const dateRangeText = document.getElementById("dateRangeText");
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DOW = ["S","M","T","W","T","F","S"];

  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let rangeStart = null;
  let rangeEnd = null;

  function fmt(d) {
    return d.toISOString().slice(0, 10);
  }

  function renderCalendar() {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    let html = `<div class="dp-header">
      <button type="button" id="dpPrev"><i class="fa-solid fa-chevron-left"></i></button>
      <span class="font-display text-sm text-[var(--blue)]">${MONTHS[viewMonth]} ${viewYear}</span>
      <button type="button" id="dpNext"><i class="fa-solid fa-chevron-right"></i></button>
    </div><div class="dp-grid">`;

    DOW.forEach((d) => (html += `<span class="dp-dow">${d}</span>`));
    for (let i = 0; i < firstDay; i++) html += `<span></span>`;

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(viewYear, viewMonth, day);
      const disabled = d < todayMid;
      let cls = "dp-day";
      if (rangeStart && d.getTime() === rangeStart.getTime()) cls += " dp-selected";
      if (rangeEnd && d.getTime() === rangeEnd.getTime()) cls += " dp-selected";
      if (rangeStart && rangeEnd && d > rangeStart && d < rangeEnd) cls += " dp-in-range";
      if (disabled) cls += " dp-disabled";
      html += `<span class="${cls}" data-date="${fmt(d)}">${day}</span>`;
    }

    html += `</div>`;
    dpPop.innerHTML = html;

    dpPop.querySelector("#dpPrev").addEventListener("click", (e) => {
      e.stopPropagation();
      viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      renderCalendar();
    });
    dpPop.querySelector("#dpNext").addEventListener("click", (e) => {
      e.stopPropagation();
      viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      renderCalendar();
    });
    dpPop.querySelectorAll(".dp-day:not(.dp-disabled)").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const picked = new Date(el.dataset.date);
        if (!rangeStart || (rangeStart && rangeEnd)) {
          rangeStart = picked;
          rangeEnd = null;
        } else if (picked < rangeStart) {
          rangeEnd = rangeStart;
          rangeStart = picked;
        } else {
          rangeEnd = picked;
        }
        updateText();
        renderCalendar();
        if (rangeStart && rangeEnd) dpPop.classList.remove("open");
      });
    });
  }

  function updateText() {
    if (rangeStart) checkinInput.value = fmt(rangeStart);
    if (rangeEnd) checkoutInput.value = fmt(rangeEnd);
    if (rangeStart && rangeEnd) {
      dateRangeText.textContent = `${fmt(rangeStart)} → ${fmt(rangeEnd)}`;
    } else if (rangeStart) {
      dateRangeText.textContent = `${fmt(rangeStart)} → Select check-out`;
    }
  }

  dateRangeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dpPop.classList.toggle("open");
  });
  document.addEventListener("click", (e) => {
    if (!dpPop.contains(e.target) && e.target !== dateRangeBtn) dpPop.classList.remove("open");
  });

  renderCalendar();
}

// ---------- GSAP hero timeline (index.html only) ----------
if (window.gsap && document.querySelector(".hero-stagger")) {
  gsap.timeline({ defaults: { ease: "power3.out" } })
    .fromTo(".hero-badge", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
    .fromTo(".hero-title", { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, "-=0.4")
    .fromTo(".hero-sub", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.5")
    .fromTo(".hero-actions", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.4");
}
