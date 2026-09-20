// G0atX — shared site behavior: mobile nav, theme toggle, accordions,
// scroll-reveal animation, and form submission.

(function () {
  var root = document.documentElement;

  // Theme defaults to dark unless the visitor's system prefers light.
  function applyPreferredTheme() {
    var prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    root.setAttribute("data-theme", prefersLight ? "light" : "dark");
  }
  applyPreferredTheme();

  document.addEventListener("DOMContentLoaded", function () {
    // Wire up the "Pay Online" button to the real Stripe/Square link in
    // config.js once it's filled in. Until then, it stays disabled so it
    // doesn't look clickable-but-broken to a visitor.
    document.querySelectorAll("[data-live-link='stripe']").forEach(function (el) {
      var url = typeof STRIPE_PAYMENT_LINK !== "undefined" ? STRIPE_PAYMENT_LINK : "";
      if (url) {
        el.href = url;
        el.classList.remove("btn-disabled");
        el.removeAttribute("aria-disabled");
        var badge = el.querySelector(".coming-soon-tag");
        if (badge) badge.remove();
      } else {
        el.href = "#";
        el.classList.add("btn-disabled");
        el.setAttribute("aria-disabled", "true");
        el.addEventListener("click", function (e) {
          e.preventDefault();
        });
      }
    });

    // Theme toggle button
    var toggle = document.querySelector(".theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var current = root.getAttribute("data-theme") === "light" ? "dark" : "light";
        root.setAttribute("data-theme", current);
      });
    }

    // Mobile nav toggle
    var navToggle = document.querySelector(".nav-toggle");
    var navLinks = document.querySelector(".nav-links");
    if (navToggle && navLinks) {
      navToggle.addEventListener("click", function () {
        navLinks.classList.toggle("open");
        var expanded = navLinks.classList.contains("open");
        navToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      });
      navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          navLinks.classList.remove("open");
        });
      });
    }

    // Accordion (policies page)
    document.querySelectorAll(".accordion-trigger").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".accordion-item");
        var panel = item.querySelector(".accordion-panel");
        var isOpen = item.classList.contains("open");

        document.querySelectorAll(".accordion-item.open").forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove("open");
            openItem.querySelector(".accordion-panel").style.maxHeight = null;
            openItem.querySelector(".accordion-trigger").setAttribute("aria-expanded", "false");
          }
        });

        if (isOpen) {
          item.classList.remove("open");
          panel.style.maxHeight = null;
          btn.setAttribute("aria-expanded", "false");
        } else {
          item.classList.add("open");
          panel.style.maxHeight = panel.scrollHeight + "px";
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });

    // Scroll-reveal: fade/rise elements into view the first time they
    // appear, with a light stagger based on position within their group.
    var revealTargets = document.querySelectorAll("[data-reveal]");
    if (revealTargets.length) {
      if ("IntersectionObserver" in window) {
        // Assign a stagger delay based on index among siblings sharing
        // the same parent, capped so long lists don't feel sluggish.
        var parentIndexMap = new Map();
        revealTargets.forEach(function (el) {
          var parent = el.parentElement;
          var count = parentIndexMap.get(parent) || 0;
          var delay = Math.min(count * 90, 360);
          el.style.transitionDelay = delay + "ms";
          parentIndexMap.set(parent, count + 1);
        });

        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

        revealTargets.forEach(function (el) { observer.observe(el); });
      } else {
        // No IntersectionObserver support — just show everything.
        revealTargets.forEach(function (el) { el.classList.add("revealed"); });
      }
    }

    // Form submission uses a plain HTML POST straight to FormSubmit.co
    // (see contact.html / payments.html) — no JavaScript required to
    // actually send the message. The browser handles it natively and
    // lands on thank-you.html, which keeps things working even if
    // scripts are blocked, slow, or fail for any reason. A small nicety:
    // show a "sending..." state on the button so there's feedback while
    // the page navigates away.
    document.querySelectorAll("form[action*='formsubmit.co']").forEach(function (form) {
      form.addEventListener("submit", function () {
        var submitBtn = form.querySelector("button[type='submit']");
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
        }
      });
    });
  });
})();
