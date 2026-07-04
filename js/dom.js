/**
 * All DOM rendering lives here. These functions take data in and produce
 * markup — no fetch calls, so they're easy to test and reuse.
 */

/**
 * Renders a loading indicator into a status element.
 * @param {HTMLElement} statusEl
 */
function renderLoading(statusEl) {
  statusEl.hidden = false;
  statusEl.className = "status status--loading";
  statusEl.textContent = "Pulling the file...";
}

/**
 * Renders an error message into a status element.
 * @param {HTMLElement} statusEl
 * @param {string} message
 */
function renderError(statusEl, message) {
  statusEl.hidden = false;
  statusEl.className = "status status--error";
  statusEl.textContent = message;
}

/**
 * Clears/hides a status element.
 * @param {HTMLElement} statusEl
 */
function clearStatus(statusEl) {
  statusEl.hidden = true;
  statusEl.textContent = "";
  statusEl.className = "status";
}

/**
 * Renders the "User Not Found" state into a result container.
 * @param {HTMLElement} containerEl
 * @param {string} username
 */
function renderNotFound(containerEl, username) {
  containerEl.innerHTML = `
    <div class="case-file not-found">
      <p class="not-found__stamp">Case Closed</p>
      <p class="not-found__copy">No record of a GitHub user named "${escapeHtml(username)}".</p>
    </div>
  `;
}

/**
 * Builds the inner markup for a single case-file card (profile + repos).
 * Shared by single-search mode and battle mode.
 * @param {object} user - GitHub user object
 * @param {Array<object>} repos - GitHub repo objects
 * @returns {string} HTML string
 */
function buildCaseFileMarkup(user, repos) {
  const latestRepos = getLatestRepos(repos, 5);

  const repoItems = latestRepos.length
    ? latestRepos
        .map(
          (repo) => `
            <li class="repo-item">
              <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo.name)}</a>
              <span class="repo-item__stars">★ ${repo.stargazers_count}</span>
            </li>`
        )
        .join("")
    : `<li class="repo-item">No public repositories on file.</li>`;

  return `
    <div class="case-file__header">
      <img class="case-file__avatar" src="${user.avatar_url}" alt="${escapeHtml(user.login)}'s avatar" />
      <div>
        <p class="case-file__name">${escapeHtml(user.name || user.login)}</p>
        <p class="case-file__handle">@${escapeHtml(user.login)}</p>
      </div>
      <span class="case-file__stamp">On File</span>
    </div>

    ${user.bio ? `<p class="case-file__bio">${escapeHtml(user.bio)}</p>` : ""}

    <ul class="case-file__meta">
      <li><strong>Joined:</strong> ${formatJoinDate(user.created_at)}</li>
      <li><strong>Portfolio:</strong> ${
        user.blog
          ? `<a href="${normalizeUrl(user.blog)}" target="_blank" rel="noopener noreferrer">${escapeHtml(user.blog)}</a>`
          : "Not listed"
      }</li>
    </ul>

    <p class="repo-list__title">Top ${latestRepos.length} Latest Repositories</p>
    <ul class="repo-list">${repoItems}</ul>
  `;
}

/**
 * Renders a full case-file card into a result container (single mode).
 * @param {HTMLElement} containerEl
 * @param {object} user
 * @param {Array<object>} repos
 */
function renderCaseFile(containerEl, user, repos) {
  containerEl.innerHTML = `<div class="case-file">${buildCaseFileMarkup(user, repos)}</div>`;
}

/** Escapes a string for safe insertion into innerHTML. */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = String(str ?? "");
  return div.innerHTML;
}

/** Prefixes protocol-less blog URLs so they don't resolve as relative links. */
function normalizeUrl(url) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/**
 * Renders two case files side by side in Battle Mode, marking the one with
 * more total stars as the winner.
 * @param {HTMLElement} containerEl
 * @param {{user: object, repos: Array<object>}} caseA
 * @param {{user: object, repos: Array<object>}} caseB
 */
function renderBattleResult(containerEl, caseA, caseB) {
  const starsA = calculateTotalStars(caseA.repos);
  const starsB = calculateTotalStars(caseB.repos);

  const aIsWinner = starsA > starsB;
  const bIsWinner = starsB > starsA;
  const isTie = starsA === starsB;

  const verdict = isTie
    ? `It's a tie — ${starsA} stars each.`
    : aIsWinner
    ? `@${escapeHtml(caseA.user.login)} takes it, ${starsA} to ${starsB} stars.`
    : `@${escapeHtml(caseB.user.login)} takes it, ${starsB} to ${starsA} stars.`;

  const cardClass = (isWinner, isLoser) =>
    ["case-file", isWinner ? "case-file--winner" : "", isLoser ? "case-file--loser" : ""]
      .filter(Boolean)
      .join(" ");

  containerEl.innerHTML = `
    <p class="verdict-banner">${verdict}</p>
    <div class="${cardClass(aIsWinner, bIsWinner)}">
      ${buildCaseFileMarkup(caseA.user, caseA.repos).replace(
        "On File",
        `${starsA}★ total`
      )}
    </div>
    <div class="${cardClass(bIsWinner, aIsWinner)}">
      ${buildCaseFileMarkup(caseB.user, caseB.repos).replace(
        "On File",
        `${starsB}★ total`
      )}
    </div>
  `;
}
