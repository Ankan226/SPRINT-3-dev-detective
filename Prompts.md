# Prompts.md — AI Pair-Programming Log

This file tracks how AI assistance was used while building Dev Detective,
per the sprint's QA requirement to document (not hide) AI-assisted work.

## Design & Architecture
- Asked for a folder structure that separates concerns cleanly:
  `api.js` (network only), `dom.js` (rendering only), `utils.js` (pure
  helpers), `app.js` (event wiring/orchestration). This made it possible to
  reason about each layer independently and reuse `buildCaseFileMarkup` for
  both single-search and Battle Mode.

## Async/Await & Promises
- Confirmed the correct pattern for chaining two dependent requests
  (`fetchGitHubUser` → `fetchGitHubRepos` using `repos_url` from the first
  response) inside a single `async` function with one `try/catch`.
- Confirmed `Promise.all()` is the right tool for the Battle Mode dual
  lookup since the two user lookups are independent of each other and can
  run concurrently instead of sequentially.

## Error Handling
- Discussed distinguishing a `404` (user doesn't exist — a normal, expected
  outcome) from a `403` (rate limit) or other network failure, so each can
  get its own UI treatment instead of one generic "error" state. Implemented
  as custom `UserNotFoundError` / `RateLimitError` classes checked with
  `instanceof` in the catch blocks.

## Data Formatting
- Verified the approach for turning an ISO timestamp into `"25 Jan 2023"`
  using native `Date` methods, no date library needed for this scope.

## What I wrote myself
- All markup, styling decisions (the noir "case file" visual direction),
  and the final wiring in `app.js` were written and tested by hand against
  the GitHub API using my own account and a few public usernames
  (`octocat`, `torvalds`) to confirm the loading/error/success states.