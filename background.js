// Lichess Retry Puzzles — background service worker
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "openTabs" && Array.isArray(msg.urls)) {
    // Open up to 15 tabs, then continue in small batches to avoid being blocked.
    const urls = msg.urls.slice();
    let delay = 0;
    urls.forEach((url, idx) => {
      setTimeout(() => {
        chrome.tabs.create({ url });
      }, delay);
      delay += 120; // stagger tab creation
    });
    sendResponse({ok: true, opened: urls.length});
  }
});