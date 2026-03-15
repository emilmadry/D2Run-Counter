// === STORAGE & DATA KEYS ===
const STORAGE_KEY = 'd2-run-counter-data-v1';
const SELECTED_SPOT_KEY = 'd2-run-counter-selected-spot';
const CUSTOM_SPOTS_KEY = 'd2-run-counter-custom-spots-v1';

// === SPOT & CATEGORY IDS ===
const KEY_SPOT_IDS = new Set(['countess', 'nihlathak', 'summoner']);
const TERROR_ZONE_ID = 'terror-zone';
const RUSH_CATEGORY_ID = 'rush';

// === LOOT & EFFICIENCY CALCULATIONS ===
const UNIQUE_WEIGHT = 1;
const SET_WEIGHT = 1;
const KEY_WEIGHT = 1.5;
const HIGH_RUNE_WEIGHT = 5;

// === UI CONSTANTS ===
const START_BUTTON_COOLDOWN_MS = 3000;
const DEFAULT_CUSTOM_SPOT_IMAGE = 'assets/spots/custom.png';

const BASE_SPOTS = [
  { id: 'andariel', name: 'Andariel', image: 'assets/spots/andariel.png' },
  { id: 'mephisto', name: 'Mephisto', image: 'assets/spots/mephisto.jpg' },
  { id: 'diablo-chaos', name: 'Diablo / Chaos', image: 'assets/spots/diablo.jpg' },
  { id: 'baal', name: 'Baal', image: 'assets/spots/baal.jpg' },
  { id: 'pindleskin', name: 'Pindleskin', image: 'assets/spots/pindleskin.jpg' },
  { id: 'lower-kurast', name: 'Lower Kurast', image: 'assets/spots/lower-kurast.png' },
  { id: 'travincal', name: 'Travincal', image: 'assets/spots/travincal.png' },
  { id: 'countess', name: 'Countess', image: 'assets/spots/countess.jpg' },
  { id: 'nihlathak', name: 'Nihlathak', image: 'assets/spots/nihlathak.webp' },
  { id: 'summoner', name: 'Summoner / Demonolog', image: 'assets/spots/summoner.webp' },
  { id: 'the-pit', name: 'The Pit', image: 'assets/spots/the-pit.png' },
  { id: 'cow-level', name: 'Cow Level', image: 'assets/spots/cow.webp' },
  { id: TERROR_ZONE_ID, name: 'Terror Zone', image: 'assets/spots/terror.jpg' },
  { id: RUSH_CATEGORY_ID, name: 'Rush', image: 'assets/spots/rush.jpg' }
];

const RUSH_DIFFICULTIES = [
  { id: 'normal', name: 'Normal' },
  { id: 'nightmare', name: 'Nightmare' },
  { id: 'hell', name: 'Hell' }
];


/**
 * Load custom farming spots from localStorage
 * @returns {Array} Array of custom spot objects
 */
function loadCustomSpots() {
  try {
    const raw = localStorage.getItem(CUSTOM_SPOTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save custom farming spots to localStorage
 * @param {Array} spots - Array of custom spot objects to save
 */
function saveCustomSpots(spots) {
  localStorage.setItem(CUSTOM_SPOTS_KEY, JSON.stringify(spots));
}

/**
 * Load all run and rush data from localStorage
 * @returns {Object} Object with runs and rushes arrays
 */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { runs: [], rushes: [] };
    const parsed = JSON.parse(raw);
    return {
      runs: Array.isArray(parsed?.runs) ? parsed.runs : [],
      rushes: Array.isArray(parsed?.rushes) ? parsed.rushes : []
    };
  } catch {
    return { runs: [], rushes: [] };
  }
}

/**
 * Save all run and rush data to localStorage
 * @param {Object} data - Object containing runs and rushes arrays
 */
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Get all farming spots (base + custom)
 * @returns {Array} Combined array of all spots
 */
function getAllSpots() {
  return [...BASE_SPOTS, ...loadCustomSpots()];
}

/**
 * Find a spot by ID
 * @param {string} spotId - The spot ID to search for
 * @returns {Object} The spot object, or first spot if not found
 */
function findSpotById(spotId) {
  return getAllSpots().find((entry) => entry.id === spotId) || getAllSpots()[0];
}

/**
 * Get all runs for a specific farming spot
 * @param {Object} data - The data object containing runs
 * @param {string} spotId - The spot ID to filter by
 * @returns {Array} Array of runs for the spot
 */
function getRunsForSpot(data, spotId) {
  return data.runs.filter((run) => run.spotId === spotId);
}

/**
 * Get all rushes for a specific difficulty
 * @param {Object} data - The data object containing rushes
 * @param {string} difficulty - The rush difficulty to filter by
 * @returns {Array} Array of rushes for the difficulty
 */
function getRushesForDifficulty(data, difficulty) {
  return data.rushes.filter((rush) => rush.difficulty === difficulty);
}

/**
 * Get today's date as a formatted string (YYYY-MM-DD)
 * @returns {string} Today's date in YYYY-MM-DD format
 */
function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format milliseconds as a duration string (MM:SS.T)
 * @param {number} ms - Milliseconds to format
 * @returns {string} Formatted duration (e.g., "02:34.7")
 */
function formatDuration(ms) {
  if (!ms || ms < 0) return '00:00.0';
  const totalTenths = Math.floor(ms / 100);
  const minutes = Math.floor(totalTenths / 600);
  const seconds = Math.floor((totalTenths % 600) / 10);
  const tenths = totalTenths % 10;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

/**
 * Calculate the average of an array of numbers
 * @param {Array<number>} numbers - Array of numbers
 * @returns {number} Average value, or 0 if empty
 */
function average(numbers) {
  return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : 0;
}

/**
 * Get the minimum value from an array, or 0 if empty
 * @param {Array<number>} numbers - Array of numbers
 * @returns {number} Minimum value or 0
 */
function minOrZero(numbers) {
  return numbers.length ? Math.min(...numbers) : 0;
}

/**
 * Get the maximum value from an array, or 0 if empty
 * @param {Array<number>} numbers - Array of numbers
 * @returns {number} Maximum value or 0
 */
function maxOrZero(numbers) {
  return numbers.length ? Math.max(...numbers) : 0;
}

/**
 * Format a numeric efficiency value with 2 decimal places
 * @param {number} value - The efficiency value
 * @returns {string} Formatted efficiency (e.g., "12.34")
 */
function formatEfficiency(value) {
  return Number.isFinite(value) ? value.toFixed(2) : '0.00';
}

/**
 * Build a summary object from an array of farm runs
 * @param {Array} runs - Array of run objects
 * @returns {Object} Summary with statistics
 */
function buildSpotSummary(runs) {
  const totalRuns = runs.length;
  const uniqueCount = runs.reduce((sum, run) => sum + (run.loot?.uniqueCount || (run.loot?.setUnique ? 1 : 0) || 0), 0);
  const setCount = runs.reduce((sum, run) => sum + (run.loot?.setCount || 0), 0);
  const highRuneRuns = runs.filter((run) => run.loot?.highRune).length;
  const keyCount = runs.reduce((sum, run) => sum + (run.loot?.keyCount || 0), 0);
  const heraldCount = runs.reduce((sum, run) => sum + (run.loot?.heraldCount || 0), 0);
  const averageTime = average(runs.map((run) => run.durationMs));

  return {
    totalRuns,
    uniqueCount,
    setCount,
    highRuneRuns,
    keyCount,
    heraldCount,
    uniqueRate: totalRuns ? (uniqueCount / totalRuns) * 100 : 0,
    setRate: totalRuns ? (setCount / totalRuns) * 100 : 0,
    highRuneRate: totalRuns ? (highRuneRuns / totalRuns) * 100 : 0,
    keyRate: totalRuns ? (keyCount / totalRuns) * 100 : 0,
    averageTime
  };
}

/**
 * Build a summary object from an array of rush runs
 * @param {Array} rushes - Array of rush objects
 * @returns {Object} Summary with statistics
 */
function buildRushSummary(rushes) {
  const totalRushes = rushes.length;
  const durations = rushes.map((rush) => rush.durationMs || 0).filter((value) => value > 0);
  return {
    totalRushes,
    averageTime: average(durations),
    fastestTime: minOrZero(durations)
  };
}
/**
 * Download a file to the user's computer
 * @param {string} filename - The filename for the download
 * @param {string} content - The file content as a string
 * @param {string} type - The MIME type of the file
 */
function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderSharedFooter() {
  const footer = document.querySelector('[data-shared-footer]');
  if (!footer) return;
  footer.innerHTML = `
    <p>Made by RedVarg91. Diablo II and related trademarks are the property of Blizzard Entertainment. This project is not associated with or endorsed by Blizzard. Graphics belong to their respective owners. Free tool, no ads. Source on GitHub: <a href="https://github.com/emilmadry/D2Run-Counter" target="_blank" rel="noopener noreferrer">github.com/emilmadry/D2Run-Counter</a>.</p>
  `;
}

renderSharedFooter();
