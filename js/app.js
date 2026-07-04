/**
 * Wires up event listeners and orchestrates calls between api.js and dom.js.
 * This file owns "what happens when", not "how to fetch" or "how to render".
 */

const searchForm = document.getElementById("search-form");
const usernameInput = document.getElementById("username-input");
const singleStatus = document.getElementById("single-status");
const singleResult = document.getElementById("single-result");

/**
 * Handles the single-search form submit: fetch a user + their repos,
 * showing a loading state, then either the case file or a not-found state.
 */
async function handleSingleSearch(event) {
  event.preventDefault();

  const username = usernameInput.value.trim();
  if (!isValidUsername(username)) return;

  singleResult.innerHTML = "";
  renderLoading(singleStatus);

  try {
    const { user, repos } = await fetchFullCaseFile(username);
    clearStatus(singleStatus);
    renderCaseFile(singleResult, user, repos);
  } catch (error) {
    clearStatus(singleStatus);
    if (error instanceof UserNotFoundError) {
      renderNotFound(singleResult, username);
    } else {
      renderError(singleStatus, error.message || "Something went wrong. Try again.");
    }
  }
}

searchForm.addEventListener("submit", handleSingleSearch);

/* Battle Mode toggle */

const battleToggle = document.getElementById("battle-toggle");
const singleModePanel = document.getElementById("single-mode");
const battleModePanel = document.getElementById("battle-mode");

let battleModeActive = false;

function toggleBattleMode() {
  battleModeActive = !battleModeActive;

  singleModePanel.hidden = battleModeActive;
  battleModePanel.hidden = !battleModeActive;
  searchForm.hidden = battleModeActive;

  battleToggle.textContent = battleModeActive
    ? "Back to Single Case"
    : "Switch to Battle Mode";
}

battleToggle.addEventListener("click", toggleBattleMode);

/* Battle Mode search (Promise.all) */

const battleForm = document.getElementById("battle-form");
const battleUsernameA = document.getElementById("battle-username-a");
const battleUsernameB = document.getElementById("battle-username-b");
const battleStatus = document.getElementById("battle-status");
const battleResult = document.getElementById("battle-result");

/**
 * Handles the Battle Mode form submit: fetches both users' full case files
 * concurrently via Promise.all(), then renders a side-by-side comparison.
 */
async function handleBattleSearch(event) {
  event.preventDefault();

  const usernameA = battleUsernameA.value.trim();
  const usernameB = battleUsernameB.value.trim();
  if (!isValidUsername(usernameA) || !isValidUsername(usernameB)) return;

  battleResult.innerHTML = "";
  renderLoading(battleStatus);

  try {
    const [caseA, caseB] = await Promise.all([
      fetchFullCaseFile(usernameA),
      fetchFullCaseFile(usernameB),
    ]);

    clearStatus(battleStatus);
    renderBattleResult(battleResult, caseA, caseB);
  } catch (error) {
    clearStatus(battleStatus);
    if (error instanceof UserNotFoundError) {
      renderError(battleStatus, error.message);
    } else {
      renderError(battleStatus, error.message || "Something went wrong. Try again.");
    }
  }
}

battleForm.addEventListener("submit", handleBattleSearch);
