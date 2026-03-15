# Diablo II Run Counter

A web-based farming tracker for Diablo II that helps you monitor your runs, track loot drops, and analyze farming efficiency across different farming spots and raid rushes.
Best used on second monitor

## Features

### Run Tracking
- Track individual farming runs with timing
- Record loot drops (uniques, sets, high runes, keys)
- Pause and resume runs as needed
- Real-time timer display with today's average run time
- Support for multiple farming spots
- Create custom farming spots for farming locations not in the default list

### Rush Tracking
- Separate tracking mode for rush runs
- Support for Normal, Nightmare, and Hell difficulties
- Individual rush timing and statistics

### Loot Tracking - since we have chronicle now, no need for item specific
- Unique items counter and toggle
- Set items counter and toggle
- High rune detection
- Key drops for Countess, Nihlathak, and Summoner runs
- Heralds kill number tracking for TZ

### Data Management
- All data stored locally in browser (localStorage)
- Export data as JSON for backup and sharing
- Import saved JSON backups to restore data
- Reset individual farming spot statistics as needed

## Quick Start

1. **Open the tracker**
   - Open `index.html` in your web browser

2. **Select a farming spot**
   - Choose from the dropdown menu or create a custom spot

3. **Start a run**
   - Click "Start / New Run" to begin timing

4. **Record loot**
   - Click loot buttons as items drop during the run
   - Use +/- buttons to adjust counts for uniques, sets, and keys

5. **Complete the run**
   - Click "Pause Run" if you need to step away
   - Click "Complete" when finished to save the run (that includes last active run)
   - Click "Discard" if there's issue with your data (e.g. you left timer running overnight)

6. **View statistics**
   - Click "All Stats" tab to see comprehensive statistics
   - Sort by efficiency, run count, average time, and more
   - Export data or import a previous backup

## File Structure

- `index.html` - Main run tracker interface
- `stats.html` - Statistics and analytics page
- `app.js` - Core tracker logic and UI logic
- `stats.js` - Statistics processing and analytics features
- `shared.js` - Shared utilities, data storage, and API
- `styles.css` - Complete styling with dark theme
- `assets/` - Placeholder graphics (can be customized)
  - `spots/` - Farming spot images
  - `ui/` - UI assets

## Storage & Data

- **Local Storage**: All run data persists in your browser's localStorage
- **JSON Export**: Download a complete backup of all runs, rushes, and custom spots
- **JSON Import**: Restore from a previously exported backup (replaces all current data)
- **No Cloud, No Cookies**: Page doesn't store anything about you and doesn't sell your info

## Customization

### Add Custom Farming Spots
- Click "Add new farming spot" in the tracker to create custom locations
- Custom spots appear in the dropdown for all future sessions

## Statistics Features

### Spot Comparison
- **Efficiency Score**: Based on loot weights (high runes worth more than uniques)
- **Drop Rates**: View unique rate, set rate, and high rune rate percentages
- **Ranking**: Visual indicators for top and bottom performing spots
- **Time Analysis**: Average run time, fastest time for rushes

## Tips

- **Efficiency Score**: The weighted calculation gives higher value to high rune drops and keys when applicable
- **Key Spots**: Countess, Nihlathak, and Summoner runs include key tracking
- **Terror Zone**: Best used for sessions with Shards
- **Data Backup**: Regularly export your data to protect against data loss

## Issues and ideas

- Dunno, contact me or something