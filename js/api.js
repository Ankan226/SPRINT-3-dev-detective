/**
 * All network calls to the GitHub REST API live here. Nothing in this file
 * touches the DOM — it only fetches data and throws/returns plain objects.
 */

const GITHUB_API_BASE = "https://api.github.com";

/**
 * Thrown when a GitHub user can't be found (404), so callers can
 * distinguish "no such user" from a network/server failure.
 */
class UserNotFoundError extends Error {
  constructor(username) {
    super(`GitHub user "${username}" was not found.`);
    this.name = "UserNotFoundError";
  }
}

/**
 * Thrown when GitHub responds with a rate-limit block (403).
 */
class RateLimitError extends Error {
  constructor() {
    super("GitHub API rate limit exceeded. Try again later.");
    this.name = "RateLimitError";
  }
}

/**
 * Fetches a single GitHub user's public profile.
 * @param {string} username
 * @returns {Promise<object>} the parsed user JSON
 * @throws {UserNotFoundError | RateLimitError | Error}
 */
async function fetchGitHubUser(username) {
  const response = await fetch(`${GITHUB_API_BASE}/users/${encodeURIComponent(username)}`);

  if (response.status === 404) {
    throw new UserNotFoundError(username);
  }

  if (response.status === 403) {
    throw new RateLimitError();
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetches the public repositories for a user, given their repos_url from
 * the user object (endpoint chaining — no need to rebuild the URL by hand).
 * Sorted by most recently pushed, GitHub returns up to 100 per page by default
 * so we ask for a modest page size here.
 * @param {string} reposUrl - the `repos_url` field from a user object
 * @returns {Promise<Array<object>>}
 */
async function fetchGitHubRepos(reposUrl) {
  const response = await fetch(`${reposUrl}?sort=pushed&per_page=30`);

  if (response.status === 403) {
    throw new RateLimitError();
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Convenience combo: fetch a user's profile AND their repos together.
 * Used by both single-search and Battle Mode.
 * @param {string} username
 * @returns {Promise<{user: object, repos: Array<object>}>}
 */
async function fetchFullCaseFile(username) {
  const user = await fetchGitHubUser(username);
  const repos = await fetchGitHubRepos(user.repos_url);
  return { user, repos };
}