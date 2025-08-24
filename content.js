// Lichess Retry Puzzles — content script (v1.5)
// Classifies tiles itself: failed via <bad>, slow via <good> with seconds >= threshold.
(function() {
  const log = (...args) => console.log("[Lichess Retry]", ...args);
  const SLOW_THRESHOLD_SECS = 5;

  function $(sel, root=document){ return root.querySelector(sel); }
  function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  function isResults() {
    return document.querySelector(".puz-history__round") != null;
  }

  function createBtn(label) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.style.padding = "10px 16px";
    btn.style.borderRadius = "10px";
    btn.style.border = "none";
    btn.style.fontWeight = "700";
    btn.style.cursor = "pointer";
    // blue to match lichess filter buttons
    btn.style.background = "#3ea5ff";
    btn.style.color = "#fff";
    btn.style.boxShadow = "0 2px 0 rgba(0,0,0,.15)";
    return btn;
  }

  function insertUI() {
    if (document.getElementById("lichess-retry-actions")) return;
    if (!isResults()) return;

    const container = document.createElement("div");
    container.id = "lichess-retry-actions";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.gap = "12px";
    container.style.margin = "8px 0 14px";

    const label = document.createElement("span");
    label.textContent = "Retry helper:";
    label.style.fontWeight = "700";
    label.style.opacity = "0.9";

    const bFailed = createBtn("Retry Failed");
    const bSlow = createBtn("Retry Slow");
    const bBoth = createBtn("Retry Both");

    container.append(label, bFailed, bSlow, bBoth);

    // Place next to the native filter buttons if present
    const filters = $all("button, a").find(el =>
      /mislukte puzzels|trage puzzels|failed puzzles|slow puzzles/i.test(el.textContent || "")
    );
    if (filters && filters.parentElement) filters.parentElement.appendChild(container);
    else {
      const rounds = $(".puz-history__rounds")?.parentElement || document.body;
      rounds.prepend(container);
    }

    bFailed.addEventListener("click", () => openUrls(collect("failed")));
    bSlow.addEventListener("click", () => openUrls(collect("slow")));
    bBoth.addEventListener("click", () => {
      const a = collect("failed");
      const b = collect("slow");
      const uniq = Array.from(new Set([...a, ...b]));
      openUrls(uniq);
    });

    log("UI inserted");
  }

  function parseSecs(str) {
    const m = (str || "").match(/(\d+)\s*s/);
    return m ? parseInt(m[1], 10) : null;
  }

  function classifyRound(roundEl) {
    const result = $(".puz-history__round__result", roundEl);
    if (!result) return "unknown";
    const bad = $("bad", result);
    if (bad) return "failed";
    const good = $("good", result);
    if (good) {
      const secs = parseSecs(good.textContent);
      if (secs != null && secs >= SLOW_THRESHOLD_SECS) return "slow";
      return "correct-fast";
    }
    return "unknown";
  }

  function urlFromRound(roundEl) {
    const a = $('a.puz-history__round__puzzle[href*="/training/"]', roundEl);
    if (!a) return null;
    const href = a.getAttribute("href");
    return href?.startsWith("http") ? href : (location.origin + href);
  }

  function collect(kind) {
    const urls = new Set();
    $all(".puz-history__round").forEach(round => {
      const cls = classifyRound(round);
      if (kind === "failed" && cls !== "failed") return;
      if (kind === "slow" && cls !== "slow") return;
      const url = urlFromRound(round);
      if (url) urls.add(url);
    });
    log("collect", kind, urls.size);
    return Array.from(urls);
  }

  function openUrls(urls) {
    if (!urls.length) {
      alert("No puzzles found to open.");
      return;
    }
    chrome.runtime.sendMessage({type: "openTabs", urls});
  }

  function start() {
    const obs = new MutationObserver(() => {
      if (isResults()) { insertUI(); obs.disconnect(); }
    });
    obs.observe(document.documentElement, {childList:true, subtree:true});
    if (isResults()) insertUI();
  }

  if (document.readyState === "complete" || document.readyState === "interactive") start();
  else window.addEventListener("DOMContentLoaded", start);
})();