# Dev Detective 🕵️‍♂️

A client-side "case file" browser for GitHub profiles, built with vanilla HTML/CSS/JS,
the native `fetch` API, and `async/await` — no frameworks, no build step.

## Case Files (Features)

- **Phase 1 — Base MVP**
  - Search a GitHub username and pull their public profile
  - Loading state while the request is in flight
  - Clean "User Not Found" state on a 404
- **Phase 2 — Data Expansion**
  - Second chained request to `repos_url` for the user's repositories
  - Top 5 latest repos rendered as external links
  - ISO timestamps formatted into human-readable dates
- **Phase 3 — Battle Mode**
  - Toggle a dual-username view
  - `Promise.all()` fetches both investigations concurrently
  - Total stars are reduced across each user's repos
  - Winner / loser cards render with a verdict stamp

## Folder Structure

```
dev-detective/
├── index.html          # Markup + layout shell
├── css/
│   └── style.css       # All styling (design tokens as CSS variables)
├── js/
│   ├── api.js          # All fetch() calls to the GitHub REST API
│   ├── utils.js        # Pure helper functions (date formatting, star totals)
│   ├── dom.js           # DOM rendering functions (no fetch logic in here)
│   └── app.js          # Event wiring / orchestration (the "detective" himself)
├── Prompts.md           # AI pair-programming log
└── README.md
```

## Running it

Just open `index.html` file and click the extension option(Open with live server) if you have.

OR

```bash
npx serve .
```

OR

Live link:- https://dev-detective-prodesk-it.netlify.app/



### 1. Single Search — Success State
Search a real username (e.g. `octocat`) and capture the resulting case file:
avatar, bio, join date, and the Top 5 Repositories list.

![Single search result](screenshots/single-search.png)

### 2. Loading State
Capture the brief "Pulling the file..." spinner right after clicking
**Open File** — you may need to throttle your network in DevTools
(Network tab → Throttling → Slow 3G) to catch it on screen.

![Loading state](screenshots/loading-state.png)

### 3. 404 / Not Found State
Search a username that doesn't exist (e.g. `zzzxyz123notreal`) and capture
the "Case Closed" not-found card.

![Not found state](screenshots/not-found.png)

### 4. Battle Mode — Comparison Result
Switch to Battle Mode, compare two real usernames, and capture the
verdict banner plus the winner (green border) / loser (red border) cards.

![Battle mode result](screenshots/battle-mode.png)

---


- Unauthenticated requests are capped at 60/hour per IP. If you hit a
  `403 rate limit exceeded`, wait for the reset or attach a Personal Access
  Token as an `Authorization: Bearer <token>` header in `api.js`.
- All requests are read-only `GET`s against `api.github.com` — no auth is
  required for the base functionality in this repo.

---


-Author
Ankan Pal, IIT PATNA