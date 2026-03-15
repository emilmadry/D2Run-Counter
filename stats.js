const els = {
  sortBy: document.getElementById('sortBy'),
  sortDirection: document.getElementById('sortDirection'),
  statsCards: document.getElementById('statsCards'),
  statsTableBody: document.getElementById('statsTableBody'),
  rushCards: document.getElementById('rushCards'),
  rushTableBody: document.getElementById('rushTableBody'),
  exportJsonButton: document.getElementById('exportJsonButton'),
  importJsonInput: document.getElementById('importJsonInput'),
  tableHead: null,
  tableHeadings: null
};

function cacheTableElements() {
  els.tableHead = document.querySelector('table thead tr');
  els.tableHeadings = els.tableHead ? els.tableHead.querySelectorAll('th') : null;
}

function formatEfficiency(value) {
  return Number.isFinite(value) ? value.toFixed(2) : '0.00';
}

function buildStatsRows() {
  const data = loadData();
  const today = getTodayKey();

  return getAllSpots().map((spot) => {
    const runs = data.runs.filter((run) => run.spotId === spot.id);
    const todayRuns = runs.filter((run) => run.dateKey === today);
    const uniqueCount = runs.reduce((sum, run) => sum + (run.loot?.uniqueCount || (run.loot?.setUnique ? 1 : 0) || 0), 0);
    const setCount = runs.reduce((sum, run) => sum + (run.loot?.setCount || 0), 0);
    const highRuneCount = runs.filter((run) => run.loot?.highRune).length;
    const keyCount = runs.reduce((sum, run) => sum + (run.loot?.keyCount || 0), 0);
    const heraldCount = runs.reduce((sum, run) => sum + (run.loot?.heraldCount || 0), 0);
    const totalRuns = runs.length;
    const totalDurationMs = runs.reduce((sum, run) => sum + (run.durationMs || 0), 0);
    const averageTimeMs = average(runs.map((run) => run.durationMs));
    const supportsKeys = KEY_SPOT_IDS.has(spot.id);
    const supportsHerald = spot.id === TERROR_ZONE_ID;

    const totalValue =
      (uniqueCount * UNIQUE_WEIGHT) +
      (setCount * SET_WEIGHT) +
      (highRuneCount * HIGH_RUNE_WEIGHT) +
      (keyCount * KEY_WEIGHT);

    const totalTimeSeconds = totalDurationMs / 1000;
    const efficiencyPerMinute = totalTimeSeconds > 0 ? (totalValue / totalTimeSeconds) * 60 : 0;

    return {
      spotId: spot.id,
      spotName: spot.name,
      totalRuns,
      todayRuns: todayRuns.length,
      averageTimeMs,
      uniqueCount,
      setCount,
      uniqueRate: totalRuns ? (uniqueCount / totalRuns) * 100 : 0,
      setRate: totalRuns ? (setCount / totalRuns) * 100 : 0,
      highRuneRate: totalRuns ? (highRuneCount / totalRuns) * 100 : 0,
      keyCount,
      keyRate: supportsKeys && totalRuns ? (keyCount / totalRuns) * 100 : null,
      heraldCount: supportsHerald ? heraldCount : null,
      supportsKeys,
      supportsHerald,
      efficiencyPerMinute
    };
  });
}

function buildRushRows() {
  const data = loadData();
  const today = getTodayKey();

  return RUSH_DIFFICULTIES.map((difficulty) => {
    const rushes = data.rushes.filter((rush) => rush.difficulty === difficulty.id);
    const todayRushes = rushes.filter((rush) => rush.dateKey === today);
    const durations = rushes.map((rush) => rush.durationMs || 0).filter((value) => value > 0);
    const todayDurations = todayRushes.map((rush) => rush.durationMs || 0).filter((value) => value > 0);

    return {
      difficultyId: difficulty.id,
      difficultyName: difficulty.name,
      totalRushes: rushes.length,
      todayRushes: todayRushes.length,
      averageTimeMs: average(durations),
      fastestTimeMs: minOrZero(durations),
      todayFastestTimeMs: minOrZero(todayDurations)
    };
  });
}

function sortRows(rows) {
  const sortBy = els.sortBy.value;
  const direction = els.sortDirection.value === 'asc' ? 1 : -1;
  return rows.slice().sort((a, b) => {
    if (sortBy === 'spotName') return a.spotName.localeCompare(b.spotName) * direction;
    const aValue = a[sortBy] == null ? Number.NEGATIVE_INFINITY : a[sortBy];
    const bValue = b[sortBy] == null ? Number.NEGATIVE_INFINITY : b[sortBy];
    return (aValue - bValue) * direction;
  });
}

function getRankClass(index, total) {
  if (!total) return 'neutral';
  if (index === 0) return 'best';
  if (index === total - 1) return 'worst';
  const topCutoff = Math.max(1, Math.ceil(total * 0.15));
  const bottomCutoff = Math.max(1, Math.ceil(total * 0.15));
  if (index < topCutoff) return 'top';
  if (index >= total - bottomCutoff) return 'bottom';
  return 'neutral';
}

function rankCardClass(rank) {
  if (rank === 'best') return 'rank-best';
  if (rank === 'worst') return 'rank-worst';
  if (rank === 'top') return 'rank-top';
  if (rank === 'bottom') return 'rank-bottom';
  return '';
}

function formatKeyValue(row) {
  return row.supportsKeys ? String(row.keyCount) : 'N/A';
}

function formatKeyRatio(row) {
  return row.supportsKeys && row.keyRate != null ? `${row.keyRate.toFixed(1)}%` : 'N/A';
}

function formatHeraldCount(row) {
  return row.supportsHerald && row.heraldCount != null ? String(row.heraldCount) : 'N/A';
}

function renderCards(rows) {
  const rowsWithData = rows.filter((row) => row.totalRuns > 0);

  if (!rowsWithData.length) {
    els.statsCards.innerHTML = '<div class="empty-state">No data yet. Complete some runs first.</div>';
    return;
  }

  els.statsCards.innerHTML = rows.map((row, index) => {
    const rank = getRankClass(index, rows.length);
    let extraStats = `
      <div><span class="mini">Unique</span><strong>${row.uniqueCount}</strong></div>
      <div><span class="mini">Set</span><strong>${row.setCount}</strong></div>
      <div><span class="mini">Unique ratio</span><strong>${row.uniqueRate.toFixed(1)}%</strong></div>
      <div><span class="mini">Set ratio</span><strong>${row.setRate.toFixed(1)}%</strong></div>
      <div><span class="mini">High Rune</span><strong>${row.highRuneRate.toFixed(1)}%</strong></div>`;
    
    if (row.supportsKeys) {
      extraStats += `
      <div><span class="mini"># of Keys</span><strong>${row.keyCount}</strong></div>
      <div><span class="mini">Key ratio</span><strong>${formatKeyRatio(row)}</strong></div>`;
    }
    
    if (row.supportsHerald) {
      extraStats += `
      <div><span class="mini">Heralds Killed</span><strong>${formatHeraldCount(row)}</strong></div>`;
    }
    
    return `
      <article class="stats-card ${rankCardClass(rank)}">
        <div class="stats-card-top">
          <span class="status-chip ${rank}">${rank.toUpperCase()}</span>
          <h3>${row.spotName}</h3>
          <button class="reset-card-btn" data-spot-id="${row.spotId}" title="Reset this spot's stats">🗑</button>
        </div>
        <div class="stats-card-grid">
          <div><span class="mini">Efficiency</span><strong>${formatEfficiency(row.efficiencyPerMinute)}</strong></div>
          <div><span class="mini">Total runs</span><strong>${row.totalRuns}</strong></div>
          <div><span class="mini">Today's runs</span><strong>${row.todayRuns}</strong></div>
          <div><span class="mini">Avg time</span><strong>${formatDuration(row.averageTimeMs)}</strong></div>${extraStats}
        </div>
      </article>
    `;
  }).join('');
  
  // Wire up reset buttons
  document.querySelectorAll('.reset-card-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const spotId = btn.dataset.spotId;
      resetSpotStats(spotId);
    });
  });
}

function renderTable(rows) {
  const hasKeySpots = rows.some((row) => row.supportsKeys);
  const hasHeraldSpots = rows.some((row) => row.supportsHerald);

  els.statsTableBody.innerHTML = rows.map((row, index) => {
    const rank = getRankClass(index, rows.length);
    let cells = `
      <td>${row.spotName}</td>
      <td>${row.totalRuns}</td>
      <td>${row.todayRuns}</td>
      <td>${formatDuration(row.averageTimeMs)}</td>
      <td>${row.uniqueCount}</td>
      <td>${row.setCount}</td>
      <td>${row.uniqueRate.toFixed(1)}%</td>
      <td>${row.setRate.toFixed(1)}%</td>
      <td>${row.highRuneRate.toFixed(1)}%</td>`;

    if (hasKeySpots) {
      cells += `
      <td>${formatKeyValue(row)}</td>
      <td>${formatKeyRatio(row)}</td>`;
    }

    cells += `
      <td>${formatEfficiency(row.efficiencyPerMinute)}</td>`;

    if (hasHeraldSpots) {
      cells += `
      <td>${formatHeraldCount(row)}</td>`;
    }

    return `<tr class="${rankCardClass(rank)}">${cells}</tr>`;
  }).join('');

  cacheTableElements();
  if (els.tableHead && els.tableHeadings) {
    els.tableHeadings[9]?.classList.toggle('hidden-col', !hasKeySpots);
    els.tableHeadings[10]?.classList.toggle('hidden-col', !hasKeySpots);
    els.tableHeadings[12]?.classList.toggle('hidden-col', !hasHeraldSpots);
  }

  if (!hasKeySpots || !hasHeraldSpots) {
    const allRows = document.querySelectorAll('#statsTableBody tr');
    allRows.forEach((tr) => {
      const cells = tr.querySelectorAll('td');
      if (!hasKeySpots) {
        cells[9]?.classList.add('hidden-col');
        cells[10]?.classList.add('hidden-col');
      }
      if (!hasHeraldSpots) {
        cells[12]?.classList.add('hidden-col');
      }
    });
  }
}

function renderRushCards(rows) {
  const hasData = rows.some((row) => row.totalRushes > 0);
  if (!hasData) {
    els.rushCards.innerHTML = '<div class="empty-state">No rush data yet.</div>';
    return;
  }

  els.rushCards.innerHTML = rows.map((row) => `
    <article class="stats-card">
      <div class="stats-card-top">
        <span class="status-chip neutral">RUSH</span>
        <h3>${row.difficultyName}</h3>
        <button class="reset-card-btn" data-rush-difficulty="${row.difficultyId}" title="Reset this rush difficulty stats">🗑</button>
      </div>
      <div class="stats-card-grid">
        <div><span class="mini">Total rushes</span><strong>${row.totalRushes}</strong></div>
        <div><span class="mini">Today's rushes</span><strong>${row.todayRushes}</strong></div>
        <div><span class="mini">Average time</span><strong>${formatDuration(row.averageTimeMs)}</strong></div>
        <div><span class="mini">Fastest time</span><strong>${formatDuration(row.fastestTimeMs)}</strong></div>
      </div>
    </article>
  `).join('');
  
  // Wire up reset buttons
  document.querySelectorAll('.reset-card-btn[data-rush-difficulty]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const difficulty = btn.dataset.rushDifficulty;
      resetRushStats(difficulty);
    });
  });
}

function renderRushTable(rows) {
  els.rushTableBody.innerHTML = rows.map((row) => `
    <tr>
      <td>${row.difficultyName}</td>
      <td>${row.totalRushes}</td>
      <td>${row.todayRushes}</td>
      <td>${formatDuration(row.averageTimeMs)}</td>
      <td>${formatDuration(row.fastestTimeMs)}</td>
    </tr>
  `).join('');
}

function renderAll() {
  const rows = sortRows(buildStatsRows());
  renderCards(rows);
  renderTable(rows);

  const rushRows = buildRushRows();
  renderRushCards(rushRows);
  renderRushTable(rushRows);
}

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

function resetSpotStats(spotId) {
  if (!confirm(`Are you sure you want to delete all stats for this spot? This cannot be undone.`)) {
    return;
  }
  
  const data = loadData();
  data.runs = data.runs.filter((run) => run.spotId !== spotId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  renderAll();
}

function resetRushStats(difficulty) {
  if (!confirm(`Are you sure you want to delete all rushes for ${difficulty}? This cannot be undone.`)) {
    return;
  }
  
  const data = loadData();
  data.rushes = data.rushes.filter((rush) => rush.difficulty !== difficulty);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  renderAll();
}

function exportJson() {
  const payload = JSON.stringify({
    runs: loadData().runs,
    rushes: loadData().rushes,
    customSpots: loadCustomSpots()
  }, null, 2);
  downloadFile(`d2-run-counter-backup-${getTodayKey()}.json`, payload, 'application/json');
}

function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!parsed || !Array.isArray(parsed.runs || []) || !Array.isArray(parsed.rushes || [])) throw new Error('Invalid file');
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        runs: Array.isArray(parsed.runs) ? parsed.runs : [],
        rushes: Array.isArray(parsed.rushes) ? parsed.rushes : []
      }));
      localStorage.setItem(CUSTOM_SPOTS_KEY, JSON.stringify(Array.isArray(parsed.customSpots) ? parsed.customSpots : []));
      renderAll();
      alert('Import complete. Stats refreshed.');
    } catch {
      alert('That file is not a valid run counter backup.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function setupColumnSorting() {
  const columnMap = {
    'Spot': 'spotName',
    'Total Runs': 'totalRuns',
    'Today\'s Runs': 'todayRuns',
    'Avg Time': 'averageTimeMs',
    'Unique': 'uniqueCount',
    'Set': 'setCount',
    'Unique %': 'uniqueRate',
    'Set %': 'setRate',
    'High Rune %': 'highRuneRate',
    '# of Keys': 'keyCount',
    'Key Ratio': 'keyRate',
    'Efficiency Score': 'efficiencyPerMinute',
    'Heralds Killed': 'heraldCount'
  };

  if (!els.tableHead) return;

  // Use event delegation - attach listener once to the header row
  els.tableHead.addEventListener('click', (event) => {
    const th = event.target.closest('th');
    if (!th) return;

    const headerText = th.textContent.trim();
    const sortField = columnMap[headerText];
    
    if (sortField) {
      const currentSort = els.sortBy.value;
      const currentDirection = els.sortDirection.value;
      
      // If clicking the same column, toggle direction; otherwise change sort
      if (currentSort === sortField) {
        els.sortDirection.value = currentDirection === 'desc' ? 'asc' : 'desc';
      } else {
        els.sortBy.value = sortField;
        els.sortDirection.value = 'desc';
      }
      
      renderAll();
    }
  });

  // Style headers to show they're clickable
  if (els.tableHeadings) {
    els.tableHeadings.forEach((th) => {
      const headerText = th.textContent.trim();
      if (columnMap[headerText]) {
        th.style.cursor = 'pointer';
        th.style.userSelect = 'none';
      }
    });
  }
}

function wireEvents() {
  els.sortBy.addEventListener('change', renderAll);
  els.sortDirection.addEventListener('change', renderAll);
  els.exportJsonButton.addEventListener('click', exportJson);
  els.importJsonInput.addEventListener('change', importJson);
}

renderAll();
setupColumnSorting();
wireEvents();
