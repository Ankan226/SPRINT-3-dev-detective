/**
 * Pure helper functions used across the app. No fetch calls, no DOM access —
 * these should be easy to reason about and reuse anywhere.
 */

/**
 * Formats an ISO 8601 timestamp (e.g. "2023-01-25T12:00:00Z") into a
 * human-readable string (e.g. "25 Jan 2023").
 * @param {string} isoString
 * @returns {string}
 */
function formatJoinDate(isoString) {
  if (!isoString) return "Unknown";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Sums the stargazers_count field across an array of repo objects.
 * @param {Array<{stargazers_count?: number}>} repos
 * @returns {number}
 */
function calculateTotalStars(repos) {
  if (!Array.isArray(repos)) return 0;
  return repos.reduce((total, repo) => total + (repo.stargazers_count || 0), 0);
}

/**
 * Returns the N most recently updated repos, sorted newest first.
 * @param {Array<object>} repos
 * @param {number} count
 * @returns {Array<object>}
 */
function getLatestRepos(repos, count = 5) {
  if (!Array.isArray(repos)) return [];
  return [...repos]
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, count);
}

/**
 * Basic guard against empty/whitespace-only usernames before firing a request.
 * @param {string} username
 * @returns {boolean}
 */
function isValidUsername(username) {
  return typeof username === "string" && username.trim().length > 0;
}
