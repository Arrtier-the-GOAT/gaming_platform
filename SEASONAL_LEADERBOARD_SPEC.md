# Seasonal Leaderboard System Specification

## Overview
The Gaming Platform implements a seasonal leaderboard system where each season lasts 1 week. At the end of each season, leaderboard data is archived and a new season begins with reset leaderboards.

---

## Season Management

### Season Definition
- **Duration:** 1 week (7 days)
- **Start:** Monday 00:00 UTC
- **End:** Sunday 23:59 UTC
- **Automatic Reset:** Every Monday at 00:00 UTC

### Season Lifecycle
1. **Active Season:** Current leaderboard data accumulates
2. **Season End:** Automatic snapshot at week end
3. **Data Archive:** Previous season data stored in snapshots
4. **Reset:** New season starts with cleared leaderboards

---

## Database Schema

### New Tables Required

#### 1. `leaderboardSeasons`
Tracks all seasons and their metadata

```sql
CREATE TABLE leaderboardSeasons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  seasonNumber INT NOT NULL UNIQUE,
  seasonName VARCHAR(255),
  startDate TIMESTAMP NOT NULL,
  endDate TIMESTAMP NOT NULL,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. `seasonalGameLeaderboardSnapshots`
Stores game points leaderboard snapshots for each season

```sql
CREATE TABLE seasonalGameLeaderboardSnapshots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  seasonId INT NOT NULL,
  userId INT NOT NULL,
  rank INT NOT NULL,
  totalPoints INT NOT NULL,
  gamesWon INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seasonId) REFERENCES leaderboardSeasons(id),
  UNIQUE KEY (seasonId, userId)
);
```

#### 3. `seasonalReferrerLeaderboardSnapshots`
Stores referrer leaderboard snapshots for each season

```sql
CREATE TABLE seasonalReferrerLeaderboardSnapshots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  seasonId INT NOT NULL,
  referrerId INT NOT NULL,
  rank INT NOT NULL,
  premiumUserCount INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seasonId) REFERENCES leaderboardSeasons(id),
  UNIQUE KEY (seasonId, referrerId)
);
```

---

## Leaderboard Data Flow

### Current Season (Live Data)
- **Storage:** `leaderboardPoints` table (existing)
- **Updates:** Real-time as users play games
- **Display:** Current leaderboard on Leaderboard page

### Season End Process
1. Query top 100 players from `leaderboardPoints`
2. Query top 100 referrers from referral data
3. Create snapshots in seasonal tables
4. Archive season metadata in `leaderboardSeasons`
5. Reset `leaderboardPoints` to zero
6. Start new season

### Historical Data Access
- Admin can view any past season's leaderboard
- Data retrieved from seasonal snapshot tables
- Immutable historical records

---

## Backend Procedures

### Season Management
- `getCurrentSeason()` - Get active season info
- `getSeasonById(seasonId)` - Get specific season
- `getAllSeasons()` - Get all seasons with pagination
- `createNewSeason()` - Create and activate new season
- `archiveCurrentSeason()` - Archive current season and reset leaderboards

### Leaderboard Queries
- `getGameLeaderboardForSeason(seasonId, limit)` - Get game points for season
- `getReferrerLeaderboardForSeason(seasonId, limit)` - Get referrer data for season
- `getPlayerSeasonStats(userId, seasonId)` - Get specific player's season stats
- `getReferrerSeasonStats(referrerId, seasonId)` - Get specific referrer's season stats

### Admin Functions
- `viewSeasonalLeaderboards(seasonId)` - Admin view any season
- `exportSeasonData(seasonId)` - Export season data
- `manuallyArchiveSeason(seasonId)` - Force archive a season

---

## Frontend Implementation

### Leaderboard Page Updates
1. **Season Selector:** Dropdown to select season
   - "Current Season" (default)
   - "Season 1", "Season 2", etc.
   
2. **Season Info Display:**
   - Season number and name
   - Start and end dates
   - Days remaining (if current season)

3. **Leaderboard Data:**
   - Display data from selected season
   - Show historical rankings
   - Maintain same UI for both current and past seasons

### Admin Dashboard Updates
1. **Season Management Tab:**
   - List all seasons
   - Create new season
   - View/export season data
   - Manual archive option

2. **Season Leaderboard Viewer:**
   - Select season from dropdown
   - View game leaderboard for season
   - View referrer leaderboard for season
   - Export historical data

---

## Automatic Scheduling

### Weekly Archive Job
- **Trigger:** Every Monday 00:00 UTC
- **Action:** Archive current season and create new one
- **Implementation:** Node.js cron job or scheduled task

### Job Steps
1. Get current active season
2. Snapshot game leaderboard
3. Snapshot referrer leaderboard
4. Mark season as inactive
5. Create new season
6. Reset leaderboard points to 0
7. Log completion

---

## Data Integrity

### Constraints
- Each season has unique `seasonNumber`
- Each season has unique `startDate` and `endDate`
- Only one season can be active at a time
- Snapshots are immutable (no updates after creation)

### Backup Strategy
- Archive snapshots before reset
- Keep all historical data
- Enable data export for analytics

---

## User Experience

### Current Season
- Users see live leaderboard
- Rankings update in real-time
- Season countdown timer

### Past Seasons
- Users can view historical rankings
- See how they performed in previous seasons
- Compare season-to-season progress

### Admin Experience
- Full visibility into all seasons
- Export data for analysis
- Manual controls for edge cases

---

## Future Enhancements

1. **Season Rewards:** Distribute rewards at season end
2. **Season Themes:** Custom names/themes per season
3. **Seasonal Events:** Special events tied to seasons
4. **Season Rankings:** User's best season ranking
5. **Season Achievements:** Badges for top finishers
6. **Cross-Season Leaderboards:** All-time rankings
