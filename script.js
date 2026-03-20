// Theme toggle with readable light mode
(function () {
  const html = document.documentElement;
  const toggle = document.getElementById("themeToggle");

  function setTheme(theme) {
    html.setAttribute("data-theme", theme);
    if (toggle) {
      toggle.textContent = theme === "dark" ? "☀" : "🌙";
    }
    try {
      localStorage.setItem("g0atx-theme", theme);
    } catch (e) {}
  }

  // Load saved theme
  let saved = null;
  try {
    saved = localStorage.getItem("g0atx-theme");
  } catch (e) {}
  if (saved === "light" || saved === "dark") {
    setTheme(saved);
  } else {
    setTheme("dark");
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      const current = html.getAttribute("data-theme") === "dark" ? "dark" : "light";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }
})();

// Footer year
(function () {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
})();

// Chatbot
(function () {
  const toggleBtn = document.getElementById("chatbotToggle");
  const chatbot = document.getElementById("chatbot");
  const closeBtn = document.getElementById("chatbotClose");
  const form = document.getElementById("chatbotForm");
  const input = document.getElementById("chatbotInput");
  const messages = document.getElementById("chatbotMessages");

  if (!toggleBtn || !chatbot || !form || !input || !messages) return;

  function openChat() {
    chatbot.style.display = "flex";
    input.focus();
  }

  function closeChat() {
    chatbot.style.display = "none";
  }

  toggleBtn.addEventListener("click", () => {
    if (chatbot.style.display === "flex") {
      closeChat();
    } else {
      openChat();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeChat);
  }

  function addMessage(text, from = "bot") {
    const div = document.createElement("div");
    div.className = `chatbot-message ${from}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function normalize(text) {
    return text.toLowerCase().trim();
  }

  function getBotReply(raw) {
    const text = normalize(raw);

    // Simple typo‑tolerant checks
    if (text.includes("service") || text.includes("servic") || text.includes("offer")) {
      return "We offer branded multi‑page websites, advanced chatbots, and full system builds. Check the Services page for details.";
    }
    if (text.includes("price") || text.includes("cost") || text.includes("pricing")) {
      return "Most projects start around $1,200 for a site and $2,000 for a full system. Exact pricing depends on scope.";
    }
    if (text.includes("pay") || text.includes("payment") || text.includes("deposit")) {
      return "You can reserve a slot on the Payments page. For real processing, we’d connect to a provider like Stripe.";
    }
    if (text.includes("contact") || text.includes("email") || text.includes("reach")) {
      return "Use the Contact page form to share your project details and we’ll respond with next steps.";
    }
    if (text.includes("policy") || text.includes("privacy") || text.includes("terms") || text.includes("refund")) {
      return "Our Privacy, Terms, and Refund policies are on the Policies page. I can summarize them if you’d like.";
    }
    if (text.includes("portfolio") || text.includes("work") || text.includes("example")) {
      return "You can see sample projects on the Portfolio page. We can adapt that style to your brand.";
    }

    // Keep it business‑only
    return "I’m focused on G0atX only—services, pricing, process, and policies. Try asking about one of those.";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    addMessage(value, "user");
    const reply = getBotReply(value);
    setTimeout(() => addMessage(reply, "bot"), 300);
    input.value = "";
  });
})();

// Fake payment handler (front‑end demo only)
function fakePay() {
  alert(
    "Demo payment only.\n\nIn a real deployment, this button would redirect to a secure Stripe or PayPal checkout."
  );
}
