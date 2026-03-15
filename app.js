function getInitialSelectedSpotId() {
  const saved = localStorage.getItem(SELECTED_SPOT_KEY);
  const fallback = getAllSpots()[0]?.id || '';
  return findSpotById(saved)?.id || fallback;
}

const els = {
  farmSpot: document.getElementById('farmSpot'),
  addSpotButton: document.getElementById('addSpotButton'),
  rushDifficultyWrap: document.getElementById('rushDifficultyWrap'),
  rushDifficulty: document.getElementById('rushDifficulty'),
  spotImage: document.getElementById('spotImage'),
  currentRunLabel: document.getElementById('currentRunLabel'),
  timerLabel: document.getElementById('timerLabel'),
  todayAvgLabel: document.getElementById('todayAvgLabel'),
  lootSection: document.getElementById('lootSection'),
  rushVisualSection: document.getElementById('rushVisualSection'),
  currentRunNumber: document.getElementById('currentRunNumber'),
  runTimer: document.getElementById('runTimer'),
  todayAverage: document.getElementById('todayAverage'),
  newRunButton: document.getElementById('newRunButton'),
  pauseRunButton: document.getElementById('pauseRunButton'),
  completeRunButton: document.getElementById('completeRunButton'),
  lootButtons: Array.from(document.querySelectorAll('.loot-button[data-loot]')),
  uniqueToggleButton: document.getElementById('uniqueToggleButton'),
  uniqueMinusButton: document.getElementById('uniqueMinusButton'),
  uniquePlusButton: document.getElementById('uniquePlusButton'),
  uniqueCountDisplay: document.getElementById('uniqueCountDisplay'),
  setToggleButton: document.getElementById('setToggleButton'),
  setMinusButton: document.getElementById('setMinusButton'),
  setPlusButton: document.getElementById('setPlusButton'),
  setCountDisplay: document.getElementById('setCountDisplay'),
  keyDropControl: document.getElementById('keyDropControl'),
  keyToggleButton: document.getElementById('keyToggleButton'),
  keyMinusButton: document.getElementById('keyMinusButton'),
  keyPlusButton: document.getElementById('keyPlusButton'),
  keyCountDisplay: document.getElementById('keyCountDisplay'),
  summaryHeading: document.getElementById('summaryHeading'),
  farmSummary: document.getElementById('farmSummary'),
  rushSummary: document.getElementById('rushSummary'),
  summaryRunsToday: document.getElementById('summaryRunsToday'),
  summaryUniqueRate: document.getElementById('summaryUniqueRate'),
  summarySetRate: document.getElementById('summarySetRate'),
  summaryHighRuneRate: document.getElementById('summaryHighRuneRate'),
  summaryKeyRate: document.getElementById('summaryKeyRate'),
  summaryKeys: document.getElementById('summaryKeys'),
  summaryTodayAvg: document.getElementById('summaryTodayAvg'),
  summaryHeraldCount: document.getElementById('summaryHeraldCount'),
  summaryHeraldCountCard: document.getElementById('summaryHeraldCountCard'),
  summaryKeyRateCard: document.getElementById('summaryKeyRateCard'),
  summaryKeysCard: document.getElementById('summaryKeysCard'),
  overallRuns: document.getElementById('overallRuns'),
  overallUnique: document.getElementById('overallUnique'),
  overallSet: document.getElementById('overallSet'),
  overallHighRune: document.getElementById('overallHighRune'),
  overallKeys: document.getElementById('overallKeys'),
  overallKeyRate: document.getElementById('overallKeyRate'),
  overallAverage: document.getElementById('overallAverage'),
  overallHeraldCount: document.getElementById('overallHeraldCount'),
  overallHeraldCountCard: document.getElementById('overallHeraldCountCard'),
  overallKeysCard: document.getElementById('overallKeysCard'),
  overallKeyRateCard: document.getElementById('overallKeyRateCard'),
  recentRunsFarm: document.getElementById('recentRunsFarm'),
  recentRunsRush: document.getElementById('recentRunsRush'),
  rushSummaryTodayCount: document.getElementById('rushSummaryTodayCount'),
  rushSummaryTodayAvg: document.getElementById('rushSummaryTodayAvg'),
  rushSummaryTodayFastest: document.getElementById('rushSummaryTodayFastest'),
  rushSummaryOverallCount: document.getElementById('rushSummaryOverallCount'),
  rushSummaryOverallAvg: document.getElementById('rushSummaryOverallAvg'),
  rushSummaryOverallFastest: document.getElementById('rushSummaryOverallFastest'),
  sessionModal: document.getElementById('sessionModal'),
  sessionModalBody: document.getElementById('sessionModalBody'),
  saveSessionButton: document.getElementById('saveSessionButton'),
  discardSessionButton: document.getElementById('discardSessionButton'),
  heraldDropControl: document.getElementById('heraldDropControl'),
  heraldToggleButton: document.getElementById('heraldToggleButton'),
  heraldMinusButton: document.getElementById('heraldMinusButton'),
  heraldPlusButton: document.getElementById('heraldPlusButton'),
  heraldCountDisplay: document.getElementById('heraldCountDisplay'),
};

const state = {
  data: loadData(),
  selectedSpotId: getInitialSelectedSpotId(),
  timerInterval: null,
  startedAt: null,
  elapsedBeforePause: 0,
  isRunning: false,
  loot: {
    uniqueCount: 0,
    setCount: 0,
    highRune: false,
    keyCount: 0,
    heraldCount: 0
  },
  startCooldownTimer: null,
  sessionEntries: [],
  modalSnapshotEntries: null
};

function isRushMode() {
  return state.selectedSpotId === RUSH_CATEGORY_ID;
}

function currentSpotAllowsKeys() {
  return KEY_SPOT_IDS.has(state.selectedSpotId);
}

function currentSpotSupportsHerald() {
  return state.selectedSpotId === TERROR_ZONE_ID;
}

function populateSpotOptions() {
  const spots = getAllSpots();
  els.farmSpot.innerHTML = spots.map((spot) => `<option value="${spot.id}">${spot.name}</option>`).join('');
  state.selectedSpotId = findSpotById(state.selectedSpotId)?.id || spots[0]?.id || '';
  els.farmSpot.value = state.selectedSpotId;
}

function updateModePresentation() {
  const spot = findSpotById(state.selectedSpotId);
  els.spotImage.src = spot.image;
  els.spotImage.alt = spot.name;
  localStorage.setItem(SELECTED_SPOT_KEY, spot.id);

  const rushMode = isRushMode();
  const showHerald = state.selectedSpotId === TERROR_ZONE_ID;
  const showKeys = KEY_SPOT_IDS.has(state.selectedSpotId);

  els.rushDifficultyWrap.classList.toggle('is-hidden', !rushMode);
  els.rushDifficultyWrap.setAttribute('aria-hidden', String(!rushMode));
  els.keyDropControl?.classList.toggle('is-hidden', !showKeys);
  els.keyDropControl?.setAttribute('aria-hidden', String(!showKeys));
  els.heraldDropControl?.classList.toggle('is-hidden', !showHerald);
  els.heraldDropControl?.setAttribute('aria-hidden', String(!showHerald));
  els.summaryKeyRateCard.classList.toggle('is-hidden', !showKeys);
  els.summaryKeysCard.classList.toggle('is-hidden', !showKeys);
  els.overallKeyRateCard.classList.toggle('is-hidden', !showKeys);
  els.overallKeysCard.classList.toggle('is-hidden', !showKeys);
  els.summaryHeraldCountCard.classList.toggle('is-hidden', !showHerald);
  els.overallHeraldCountCard.classList.toggle('is-hidden', !showHerald);

  els.lootSection.classList.toggle('is-hidden', rushMode);
  els.rushVisualSection.classList.toggle('is-hidden', !rushMode);
  els.farmSummary.classList.toggle('is-hidden', rushMode);
  els.rushSummary.classList.toggle('is-hidden', !rushMode);

  els.currentRunLabel.textContent = rushMode ? 'Current rush' : 'Current run';
  els.timerLabel.textContent = rushMode ? 'Rush timer' : 'Run timer';
  els.todayAvgLabel.textContent = rushMode ? "Today's avg rush time" : "Today's avg run time";
  els.summaryHeading.textContent = rushMode ? 'Current rush summary' : 'Current farming summary';
}

function getNextRunNumber() {
  return state.sessionEntries.length + 1;
}

function renderRunNumber() {
  els.currentRunNumber.textContent = String(getNextRunNumber());
}

function getElapsedMs() {
  let elapsed = state.elapsedBeforePause;
  if (state.isRunning && state.startedAt) {
    elapsed += Date.now() - state.startedAt;
  }
  return elapsed;
}

function updateTimerDisplay() {
  els.runTimer.textContent = formatDuration(getElapsedMs());
}

function renderPauseButton() {
  if (state.isRunning) {
    els.pauseRunButton.textContent = 'Pause Run';
    els.pauseRunButton.disabled = false;
    return;
  }
  if (state.elapsedBeforePause > 0) {
    els.pauseRunButton.textContent = 'Resume Run';
    els.pauseRunButton.disabled = false;
    return;
  }
  els.pauseRunButton.textContent = 'Pause Run';
  els.pauseRunButton.disabled = true;
}

function setLootState(nextLoot) {
  state.loot = {
    uniqueCount: Math.max(0, Number(nextLoot.uniqueCount) || 0),
    setCount: Math.max(0, Number(nextLoot.setCount) || 0),
    highRune: Boolean(nextLoot.highRune),
    keyCount: Math.max(0, Number(nextLoot.keyCount) || 0),
    heraldCount: Math.max(0, Number(nextLoot.heraldCount) || 0)
  };

  els.lootButtons.forEach((button) => {
    const type = button.dataset.loot;
    const isActive = type === 'shit'
      ? state.loot.uniqueCount === 0 && state.loot.setCount === 0 && !state.loot.highRune && state.loot.keyCount === 0 && state.loot.heraldCount === 0
      : Boolean(state.loot[type]);
    button.classList.toggle('active', isActive);
  });

  els.uniqueToggleButton?.classList.toggle('active', state.loot.uniqueCount > 0);
  els.setToggleButton?.classList.toggle('active', state.loot.setCount > 0);
  els.keyToggleButton?.classList.toggle('active', state.loot.keyCount > 0);
  els.heraldToggleButton?.classList.toggle('active', state.loot.heraldCount > 0);

  if (els.uniqueCountDisplay) {
    els.uniqueCountDisplay.textContent = String(state.loot.uniqueCount);
  }
  if (els.setCountDisplay) {
    els.setCountDisplay.textContent = String(state.loot.setCount);
  }
  if (els.keyCountDisplay) {
    els.keyCountDisplay.textContent = String(state.loot.keyCount);
  }
  if (els.heraldCountDisplay) {
    els.heraldCountDisplay.textContent = String(state.loot.heraldCount);
  }
}

function resetLootState() {
  setLootState({ uniqueCount: 0, setCount: 0, highRune: false, keyCount: 0, heraldCount: 0 });
}

function beginTimer(resetElapsed = true) {
  state.startedAt = Date.now();
  if (resetElapsed) state.elapsedBeforePause = 0;
  state.isRunning = true;
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(updateTimerDisplay, 100);
  updateTimerDisplay();
  renderPauseButton();
}

function disableStartButtonTemporarily() {
  clearTimeout(state.startCooldownTimer);
  els.newRunButton.disabled = true;
  els.newRunButton.classList.add('is-disabled');
  state.startCooldownTimer = setTimeout(() => {
    els.newRunButton.disabled = false;
    els.newRunButton.classList.remove('is-disabled');
  }, START_BUTTON_COOLDOWN_MS);
}

function pauseRun() {
  if (!state.isRunning) return;
  state.elapsedBeforePause += Date.now() - state.startedAt;
  state.startedAt = null;
  state.isRunning = false;
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  updateTimerDisplay();
  renderPauseButton();
}

function resumeRun() {
  if (state.isRunning || state.elapsedBeforePause <= 0) return;
  beginTimer(false);
}

function togglePauseResume() {
  if (state.isRunning) pauseRun();
  else resumeRun();
}

function buildCurrentEntry(durationMs) {
  if (isRushMode()) {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      dateKey: getTodayKey(),
      timestamp: new Date().toISOString(),
      difficulty: els.rushDifficulty.value,
      durationMs
    };
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    dateKey: getTodayKey(),
    timestamp: new Date().toISOString(),
    spotId: state.selectedSpotId,
    durationMs,
    loot: {
      uniqueCount: state.loot.uniqueCount,
      setCount: state.loot.setCount,
      highRune: state.loot.highRune,
      keyCount: currentSpotAllowsKeys() ? state.loot.keyCount : 0,
      heraldCount: currentSpotSupportsHerald() ? state.loot.heraldCount : 0
    }
  };
}

function persistCurrentEntryToSession() {
  const durationMs = getElapsedMs();
  if (durationMs <= 0) return false;
  state.sessionEntries.push(buildCurrentEntry(durationMs));
  return true;
}

function resetCurrentRunState() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  state.startedAt = null;
  state.elapsedBeforePause = 0;
  state.isRunning = false;
  resetLootState();
  updateTimerDisplay();
  renderPauseButton();
}

function resetSessionState() {
  state.sessionEntries = [];
  state.modalSnapshotEntries = null;
  resetCurrentRunState();
  renderEverything();
}

function startFreshRun() {
  if (state.modalSnapshotEntries) return;

  if (state.isRunning || state.elapsedBeforePause > 0) {
    persistCurrentEntryToSession();
  }

  beginTimer(true);
  resetLootState();
  disableStartButtonTemporarily();
  renderEverything();
}

function buildSessionModalHtml(entries) {
  if (isRushMode()) {
    const summary = buildRushSummary(entries);
    const difficultyName = els.rushDifficulty.options[els.rushDifficulty.selectedIndex].text;
    return `
      <div class="modal-summary-grid">
        <article class="summary-card compact"><span>Mode</span><strong>Rush ${difficultyName}</strong></article>
        <article class="summary-card compact"><span>Rushes</span><strong>${summary.totalRushes}</strong></article>
        <article class="summary-card compact"><span>Avg time</span><strong>${formatDuration(summary.averageTime)}</strong></article>
        <article class="summary-card compact"><span>Fastest time</span><strong>${formatDuration(summary.fastestTime)}</strong></article>
      </div>
    `;
  }

  const summary = buildSpotSummary(entries);
  return `
    <div class="modal-summary-grid">
      <article class="summary-card compact"><span>Runs</span><strong>${summary.totalRuns}</strong></article>
      <article class="summary-card compact"><span>Avg time</span><strong>${formatDuration(summary.averageTime)}</strong></article>
      <article class="summary-card compact"><span>Unique</span><strong>${summary.uniqueCount}</strong></article>
      <article class="summary-card compact"><span>Set</span><strong>${summary.setCount}</strong></article>
      <article class="summary-card compact"><span>High Rune</span><strong>${summary.highRuneRuns}</strong></article>
      ${currentSpotAllowsKeys() ? `<article class="summary-card compact"><span>Keys</span><strong>${summary.keyCount}</strong></article>` : ''}
      ${currentSpotSupportsHerald() ? `<article class="summary-card compact"><span>Heralds killed</span><strong>${summary.heraldCount}</strong></article>` : ''}
    </div>
  `;
}

function openSessionModal() {
  if (!els.sessionModal || !els.sessionModalBody) return;
  els.sessionModalBody.innerHTML = buildSessionModalHtml(state.modalSnapshotEntries || []);
  els.sessionModal.classList.remove('is-hidden');
  els.sessionModal.setAttribute('aria-hidden', 'false');
}

function closeSessionModal() {
  if (!els.sessionModal) return;
  els.sessionModal.classList.add('is-hidden');
  els.sessionModal.setAttribute('aria-hidden', 'true');
  state.modalSnapshotEntries = null;
}

function completeRun() {
  if (state.modalSnapshotEntries) return;

  if (state.isRunning || state.elapsedBeforePause > 0) {
    persistCurrentEntryToSession();
  }

  if (!state.sessionEntries.length) return;

  state.modalSnapshotEntries = state.sessionEntries.map((entry) => JSON.parse(JSON.stringify(entry)));
  resetCurrentRunState();
  renderEverything();
  openSessionModal();
}

function saveSession() {
  if (!state.modalSnapshotEntries || !state.modalSnapshotEntries.length) return;

  if (isRushMode()) {
    state.data.rushes.push(...state.modalSnapshotEntries);
  } else {
    state.data.runs.push(...state.modalSnapshotEntries);
  }

  saveData(state.data);
  closeSessionModal();
  resetSessionState();
}

function discardSession() {
  closeSessionModal();
  resetSessionState();
}

function renderFarmSummary() {
  const overallRuns = getRunsForSpot(state.data, state.selectedSpotId);
  const session = buildSpotSummary(state.sessionEntries);
  const overall = buildSpotSummary(overallRuns);
  const showKeys = currentSpotAllowsKeys();

  els.todayAverage.textContent = formatDuration(session.averageTime);
  els.summaryRunsToday.textContent = String(session.totalRuns);
  els.summaryUniqueRate.textContent = `${session.uniqueRate.toFixed(1)}%`;
  els.summarySetRate.textContent = `${session.setRate.toFixed(1)}%`;
  els.summaryHighRuneRate.textContent = `${session.highRuneRate.toFixed(1)}%`;
  els.summaryKeyRate.textContent = showKeys ? `${session.keyRate.toFixed(1)}%` : 'N/A';
  els.summaryKeys.textContent = showKeys ? String(session.keyCount) : 'N/A';
  els.summaryHeraldCount.textContent = currentSpotSupportsHerald() ? String(session.heraldCount) : 'N/A';
  els.summaryTodayAvg.textContent = formatDuration(session.averageTime);

  els.overallRuns.textContent = String(overall.totalRuns);
  els.overallUnique.textContent = String(overall.uniqueCount);
  els.overallSet.textContent = String(overall.setCount);
  els.overallHighRune.textContent = String(overall.highRuneRuns);
  els.overallKeys.textContent = showKeys ? String(overall.keyCount) : 'N/A';
  els.overallKeyRate.textContent = showKeys ? `${overall.keyRate.toFixed(1)}%` : 'N/A';
  els.overallHeraldCount.textContent = currentSpotSupportsHerald() ? String(overall.heraldCount) : 'N/A';
  els.overallAverage.textContent = formatDuration(overall.averageTime);
}

function renderRushSummary() {
  const difficulty = els.rushDifficulty.value;
  const overallRushes = getRushesForDifficulty(state.data, difficulty);
  const session = buildRushSummary(state.sessionEntries);
  const overall = buildRushSummary(overallRushes);

  els.todayAverage.textContent = formatDuration(session.averageTime);
  els.rushSummaryTodayCount.textContent = String(session.totalRushes);
  els.rushSummaryTodayAvg.textContent = formatDuration(session.averageTime);
  els.rushSummaryTodayFastest.textContent = formatDuration(session.fastestTime);
  els.rushSummaryOverallCount.textContent = String(overall.totalRushes);
  els.rushSummaryOverallAvg.textContent = formatDuration(overall.averageTime);
  els.rushSummaryOverallFastest.textContent = formatDuration(overall.fastestTime);
}

function renderRecentRuns() {
  if (isRushMode()) {
    const difficulty = els.rushDifficulty.value;
    const difficultyName = els.rushDifficulty.options[els.rushDifficulty.selectedIndex].text;
    const allRushes = getRushesForDifficulty(state.data, difficulty)
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 8);

    if (!els.recentRunsRush) return;
    if (!allRushes.length) {
      els.recentRunsRush.className = 'recent-runs empty-state';
      els.recentRunsRush.textContent = 'No completed rushes yet.';
      return;
    }

    els.recentRunsRush.className = 'recent-runs';
    els.recentRunsRush.innerHTML = allRushes.map((rush, index) => `
      <article class="recent-run-item">
        <h4 class="title">Rush #${allRushes.length - index}</h4>
        <div class="recent-run-row">
          <div><span class="mini-label">Difficulty</span><strong>${difficultyName}</strong></div>
          <div><span class="mini-label">Time</span><strong>${formatDuration(rush.durationMs)}</strong></div>
          <div><span class="mini-label">Date</span><strong>${rush.dateKey}</strong></div>
        </div>
      </article>
    `).join('');
    return;
  }

  const allRuns = getRunsForSpot(state.data, state.selectedSpotId)
    .slice()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const recent = allRuns.slice(0, 8);

  if (!els.recentRunsFarm) return;
  if (!recent.length) {
    els.recentRunsFarm.className = 'recent-runs empty-state';
    els.recentRunsFarm.textContent = 'No completed runs yet.';
    return;
  }

  els.recentRunsFarm.className = 'recent-runs';
  els.recentRunsFarm.innerHTML = recent.map((run) => {
    const loot = [];
    if ((run.loot?.uniqueCount || 0) > 0) loot.push(`Unique x${run.loot.uniqueCount}`);
    if ((run.loot?.setCount || 0) > 0) loot.push(`Set x${run.loot.setCount}`);
    if (run.loot?.highRune) loot.push('High Rune');
    if ((run.loot?.keyCount || 0) > 0) loot.push(`Key x${run.loot.keyCount}`);
    if ((run.loot?.heraldCount || 0) > 0) loot.push(`Heralds: ${run.loot.heraldCount}`);
    if (!loot.length) loot.push('Shit');
    const absoluteIndex = allRuns.findIndex((entry) => entry.id === run.id);

    return `
      <article class="recent-run-item">
        <h4 class="title">Run #${allRuns.length - absoluteIndex}</h4>
        <div class="recent-run-row">
          <div><span class="mini-label">Time</span><strong>${formatDuration(run.durationMs)}</strong></div>
          <div><span class="mini-label">Loot</span><strong>${loot.join(' + ')}</strong></div>
          <div><span class="mini-label">Date</span><strong>${run.dateKey}</strong></div>
        </div>
      </article>
    `;
  }).join('');
}

function renderEverything() {
  updateModePresentation();
  renderRunNumber();

  if (isRushMode()) renderRushSummary();
  else renderFarmSummary();

  renderRecentRuns();
  renderPauseButton();
}

function handleLootClick(event) {
  const type = event.currentTarget.dataset.loot;
  if (type === 'shit') {
    resetLootState();
    return;
  }

  const next = { ...state.loot, [type]: !state.loot[type] };
  setLootState(next);
}

function handleUniqueToggle() {
  setLootState({ ...state.loot, uniqueCount: state.loot.uniqueCount > 0 ? 0 : 1 });
}

function handleSetToggle() {
  setLootState({ ...state.loot, setCount: state.loot.setCount > 0 ? 0 : 1 });
}

function handleHeraldToggle() {
  if (!currentSpotSupportsHerald()) return;
  setLootState({ ...state.loot, heraldCount: state.loot.heraldCount > 0 ? 0 : 1 });
}

function handleKeyToggle() {
  if (!currentSpotAllowsKeys()) return;
  setLootState({ ...state.loot, keyCount: state.loot.keyCount > 0 ? 0 : 1 });
}

function changeUniqueCount(delta) {
  setLootState({ ...state.loot, uniqueCount: Math.max(0, state.loot.uniqueCount + delta) });
}

function changeSetCount(delta) {
  setLootState({ ...state.loot, setCount: Math.max(0, state.loot.setCount + delta) });
}

function changeKeyCount(delta) {
  if (!currentSpotAllowsKeys()) return;
  setLootState({ ...state.loot, keyCount: Math.max(0, state.loot.keyCount + delta) });
}

function changeHeraldCount(delta) {
  if (!currentSpotSupportsHerald()) return;
  setLootState({ ...state.loot, heraldCount: Math.max(0, state.loot.heraldCount + delta) });
}

function slugifySpotName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `custom-${Date.now()}`;
}

function addCustomSpot() {
  const name = window.prompt('New farming spot name?');
  if (!name || !name.trim()) return;

  const customSpots = loadCustomSpots();
  const existingIds = new Set(getAllSpots().map((spot) => spot.id));
  let baseId = slugifySpotName(name);
  let nextId = baseId;
  let suffix = 2;

  while (existingIds.has(nextId)) {
    nextId = `${baseId}-${suffix}`;
    suffix += 1;
  }

  customSpots.push({
    id: nextId,
    name: name.trim(),
    image: DEFAULT_CUSTOM_SPOT_IMAGE
  });

  saveCustomSpots(customSpots);
  state.selectedSpotId = nextId;
  populateSpotOptions();
  renderEverything();
}

function confirmResetUnsavedSession() {
  const hasUnsaved = state.sessionEntries.length > 0 || state.isRunning || state.elapsedBeforePause > 0 || state.modalSnapshotEntries;
  if (!hasUnsaved) return true;
  return window.confirm('This will reset the current unsaved session. Continue?');
}

function wireEvents() {
  els.addSpotButton?.addEventListener('click', addCustomSpot);
  els.uniqueToggleButton?.addEventListener('click', handleUniqueToggle);
  els.setToggleButton?.addEventListener('click', handleSetToggle);
  els.heraldToggleButton?.addEventListener('click', handleHeraldToggle);
  els.farmSpot.addEventListener('change', () => {
    if (!confirmResetUnsavedSession()) {
      els.farmSpot.value = state.selectedSpotId;
      return;
    }
    closeSessionModal();
    state.selectedSpotId = els.farmSpot.value;
    resetSessionState();
  });

  els.rushDifficulty.addEventListener('change', () => {
    if (!isRushMode()) return;
    if (!confirmResetUnsavedSession()) return;
    closeSessionModal();
    resetSessionState();
  });

  els.newRunButton.addEventListener('click', startFreshRun);
  els.pauseRunButton.addEventListener('click', togglePauseResume);
  els.completeRunButton.addEventListener('click', completeRun);
  els.lootButtons.forEach((button) => button.addEventListener('click', handleLootClick));
  els.keyToggleButton?.addEventListener('click', handleKeyToggle);
  els.uniqueMinusButton?.addEventListener('click', () => changeUniqueCount(-1));
  els.uniquePlusButton?.addEventListener('click', () => changeUniqueCount(1));
  els.setMinusButton?.addEventListener('click', () => changeSetCount(-1));
  els.setPlusButton?.addEventListener('click', () => changeSetCount(1));
  els.keyMinusButton?.addEventListener('click', () => changeKeyCount(-1));
  els.keyPlusButton?.addEventListener('click', () => changeKeyCount(1));
  els.heraldMinusButton?.addEventListener('click', () => changeHeraldCount(-1));
  els.heraldPlusButton?.addEventListener('click', () => changeHeraldCount(1));
  els.saveSessionButton?.addEventListener('click', saveSession);
  els.discardSessionButton?.addEventListener('click', discardSession);
  els.sessionModal?.querySelector('.modal-backdrop')?.addEventListener('click', closeSessionModal);
}

populateSpotOptions();
resetLootState();
updateTimerDisplay();
renderEverything();
wireEvents();