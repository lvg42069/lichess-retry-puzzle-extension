# Lichess Retry Puzzles (Chrome Extension)

Adds three buttons on the results page of **Puzzle Storm** and **Puzzle Racer** on lichess.org:

- **Open failed** — opens all failed puzzles in new tabs
- **Open slow** — opens all slow (overtime) puzzles in new tabs, this are puzzles defined as taking longer than 5 seconds to solve.
- **Open both** — opens both sets (unique)

## Install (Developer Mode)

1. Clone this repository
git clone https://github.com/lvg42069/lichess-retry-extension.git
2. In Chrome, go to `chrome://extensions` → enable **Developer mode**.
3. Click **Load unpacked** and select the folder.
4. Visit a results page after finishing a Storm/Racer run. You should see the new buttons next to the native filter buttons.

## Notes / Tweaks

- The script first clicks Lichess' own filter buttons to show the right subset, then scans for links to `/training/<id>` inside the puzzle grid.
- If your Lichess DOM differs and links are not found, open DevTools on the results page and look for anchors inside the played list that lead to `/training/12345`. If needed, update the `collectByFilter()` selectors in `content.js`.
- Tabs are opened from the background service worker via `chrome.tabs.create` to avoid popup blocking.

## License

This project is licensed under the MIT License. See the [LICENSE] file for details.

