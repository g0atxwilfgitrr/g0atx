// G0atX Assistant — a lightweight, typo-tolerant FAQ chatbot.
// Runs entirely in the browser: no external API calls, no keys.
// It matches visitor questions against a knowledge base using fuzzy
// (Levenshtein-distance) word matching, so misspellings like
// "chatbott", "pricees", or "paymnet" still resolve correctly.

(function () {
  // ---------------------------------------------------------------------
  // Knowledge base — edit this to teach the assistant new answers.
  // `keywords` are the words/phrases it listens for (typo-tolerant).
  // ---------------------------------------------------------------------
  var KB = [
    {
      id: "greeting",
      keywords: ["hi", "hello", "hey", "yo", "sup"],
      answer: "Hey! I'm the G0atX assistant. Ask me about pricing, the chatbot, payments, timelines, or how to get started."
    },
    {
      id: "pricing",
      keywords: ["price", "prices", "pricing", "cost", "costs", "how much", "rate", "rates", "fee", "fees"],
      answer: "Here's our current pricing: <strong>Branded Website Build</strong> — $300. <strong>Advanced Chatbot</strong> — $80. <strong>Full System Setup</strong> (site + chatbot + contact flows + policies) — $500. Visit the <a href=\"services.html\">Services page</a> for full details."
    },
    {
      id: "website-build",
      keywords: ["website", "site", "web design", "build", "webpage", "pages"],
      answer: "A Branded Website Build is a multi-page, responsive site — red/black theme, clean navigation, and a content structure built around your business. It's $300. Check the <a href=\"services.html\">Services page</a> for what's included."
    },
    {
      id: "chatbot",
      keywords: ["chatbot", "bot", "assistant", "chat bot", "chatbott"],
      answer: "The Advanced Chatbot ($80) is a custom assistant tuned to your services and FAQs — brand voice, typo-tolerant (like the one you're talking to right now), and built to actually answer visitor questions instead of just collecting emails."
    },
    {
      id: "full-system",
      keywords: ["full system", "everything", "package", "bundle", "all in one", "complete"],
      answer: "The Full System Setup ($500) bundles the branded website, the advanced chatbot, contact flows, policy pages, and payment-ready pages into one build. It's the option most new clients choose."
    },
    {
      id: "payments",
      keywords: ["payment", "pay", "paying", "venmo", "cashapp", "cash app", "check", "cash", "card", "online payment", "paymnet"],
      answer: "We don't take payment online. Once you're ready to move forward, we meet in person at your shop — you review the finished site with us, sign off, and then pay by check, cash, Cash App, or Venmo on the spot. Full details are on the <a href=\"payments.html\">Payments page</a>."
    },
    {
      id: "contact",
      keywords: ["contact", "reach", "email", "call", "get in touch", "talk", "message"],
      answer: "Easiest way is the form on our <a href=\"contact.html\">Contact page</a> — tell us about your project and budget, and we'll follow up with next steps."
    },
    {
      id: "start",
      keywords: ["start", "begin", "get started", "hire", "sign up", "book", "reserve", "slot"],
      answer: "To get started, send us your project details through the <a href=\"contact.html\">Contact page</a>. Once we've scoped the work, we'll set up an in-person meeting to finalize everything and reserve your build slot."
    },
    {
      id: "portfolio",
      keywords: ["portfolio", "examples", "work", "past projects", "samples"],
      answer: "You can see example builds — a consulting studio site, a creative agency brand, and a local business hub — on the <a href=\"portfolio.html\">Portfolio page</a>."
    },
    {
      id: "policies",
      keywords: ["policy", "policies", "refund", "terms", "privacy", "cancel", "cancellation"],
      answer: "Our privacy, terms, and refund policies are all laid out on the <a href=\"policies.html\">Policies page</a>. Short version: deposits reserve our time and are generally non-refundable once work begins, but we make it right if something falls through on our end."
    },
    {
      id: "timeline",
      keywords: ["timeline", "how long", "turnaround", "time", "duration", "when done"],
      answer: "Turnaround depends on scope and how quickly we get feedback from you — most Branded Website Builds move fast when project details and content are ready upfront. We'll give you a clear timeline after your project details come in."
    },
    {
      id: "typo-tolerant",
      keywords: ["typo", "misspell", "spelling", "understand"],
      answer: "Yep — I'm built to understand messages even with typos or misspellings, so don't worry about spelling things perfectly."
    },
    {
      id: "human",
      keywords: ["human", "real person", "talk to someone", "representative"],
      answer: "For a real person, use the <a href=\"contact.html\">Contact page</a> and we'll respond directly."
    }
  ];

  var FALLBACK = "I'm not totally sure about that one. Try asking about pricing, the chatbot, payments, timelines, or use the <a href=\"contact.html\">Contact page</a> and we'll get you a straight answer.";

  var STOPWORDS = ["the","a","an","is","are","do","does","can","i","you","your","my","for","of","to","in","on","and","or","what","how","much","it","this","that"];

  // ---------------------------------------------------------------------
  // Fuzzy matching
  // ---------------------------------------------------------------------
  function levenshtein(a, b) {
    if (a === b) return 0;
    var al = a.length, bl = b.length;
    if (al === 0) return bl;
    if (bl === 0) return al;
    var prev = new Array(bl + 1);
    for (var j = 0; j <= bl; j++) prev[j] = j;
    for (var i = 1; i <= al; i++) {
      var cur = [i];
      for (j = 1; j <= bl; j++) {
        var cost = a[i - 1] === b[j - 1] ? 0 : 1;
        cur[j] = Math.min(
          prev[j] + 1,
          cur[j - 1] + 1,
          prev[j - 1] + cost
        );
      }
      prev = cur;
    }
    return prev[bl];
  }

  function tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(function (w) { return w.length > 1 && STOPWORDS.indexOf(w) === -1; });
  }

  // How tolerant we are of typos, scaled to word length.
  function maxDistanceFor(word) {
    if (word.length <= 3) return 0;
    if (word.length <= 5) return 1;
    if (word.length <= 8) return 2;
    return 3;
  }

  function wordsMatch(a, b) {
    if (a === b) return true;
    if (a.indexOf(b) !== -1 || b.indexOf(a) !== -1) {
      if (Math.min(a.length, b.length) >= 3) return true;
    }
    var dist = levenshtein(a, b);
    return dist <= maxDistanceFor(Math.max(a.length, b.length));
  }

  function scoreEntry(userWords, entry) {
    var score = 0;
    entry.keywords.forEach(function (phrase) {
      var phraseWords = tokenize(phrase);
      var allFound = phraseWords.every(function (pw) {
        return userWords.some(function (uw) { return wordsMatch(uw, pw); });
      });
      if (allFound && phraseWords.length) {
        score += phraseWords.length >= 2 ? 3 : 1.2;
      }
    });
    return score;
  }

  function findAnswer(userText) {
    var userWords = tokenize(userText);
    if (!userWords.length) return FALLBACK;
    var best = null, bestScore = 0;
    KB.forEach(function (entry) {
      var s = scoreEntry(userWords, entry);
      if (s > bestScore) { bestScore = s; best = entry; }
    });
    return best && bestScore > 0 ? best.answer : FALLBACK;
  }

  // ---------------------------------------------------------------------
  // Widget UI
  // ---------------------------------------------------------------------
  function buildWidget() {
    var wrap = document.createElement("div");
    wrap.innerHTML =
      '<button class="chat-launcher" id="chatLauncher" aria-label="Open chat assistant" aria-expanded="false">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
      '</button>' +
      '<div class="chat-window" id="chatWindow" role="dialog" aria-label="G0atX chat assistant">' +
        '<div class="chat-head">' +
          '<div><strong>G0atX Assistant</strong><span>Ask about pricing, builds, payments</span></div>' +
          '<button class="chat-close" id="chatClose" aria-label="Close chat">✕</button>' +
        '</div>' +
        '<div class="chat-body" id="chatBody"></div>' +
        '<div class="chat-suggestions" id="chatSuggestions">' +
          '<button class="chat-suggestion-btn" type="button">Pricing</button>' +
          '<button class="chat-suggestion-btn" type="button">How do I pay?</button>' +
          '<button class="chat-suggestion-btn" type="button">Full system setup</button>' +
          '<button class="chat-suggestion-btn" type="button">How do I start?</button>' +
        '</div>' +
        '<form class="chat-input-row" id="chatForm">' +
          '<input type="text" id="chatInput" placeholder="Type your question..." autocomplete="off" aria-label="Type your question" />' +
          '<button class="chat-send" type="submit" aria-label="Send">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
          '</button>' +
        '</form>' +
      '</div>';
    document.body.appendChild(wrap);

    var launcher = document.getElementById("chatLauncher");
    var win = document.getElementById("chatWindow");
    var closeBtn = document.getElementById("chatClose");
    var body = document.getElementById("chatBody");
    var form = document.getElementById("chatForm");
    var input = document.getElementById("chatInput");
    var suggestions = document.getElementById("chatSuggestions");

    function addMsg(text, who) {
      var msg = document.createElement("div");
      msg.className = "chat-msg " + who;
      msg.innerHTML = text;
      body.appendChild(msg);
      body.scrollTop = body.scrollHeight;
    }

    function openChat() {
      win.classList.add("open");
      launcher.setAttribute("aria-expanded", "true");
      if (!body.childElementCount) {
        addMsg("Hey there! I'm the G0atX assistant — ask me anything about pricing, the chatbot, payments, or how to get started. Typos are fine.", "bot");
      }
      input.focus();
    }
    function closeChat() {
      win.classList.remove("open");
      launcher.setAttribute("aria-expanded", "false");
    }

    launcher.addEventListener("click", function () {
      win.classList.contains("open") ? closeChat() : openChat();
    });
    closeBtn.addEventListener("click", closeChat);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      addMsg(escapeHtml(text), "user");
      input.value = "";
      setTimeout(function () {
        addMsg(findAnswer(text), "bot");
      }, 350);
    });

    suggestions.querySelectorAll(".chat-suggestion-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.textContent;
        addMsg(escapeHtml(text), "user");
        setTimeout(function () {
          addMsg(findAnswer(text), "bot");
        }, 300);
      });
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  document.addEventListener("DOMContentLoaded", buildWidget);
})();
