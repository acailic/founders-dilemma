# Founder's Dilemma - Implementation Plan

## Overview

This is a **3-week implementation roadmap** to build a playable, polished simulation game from the existing Tauri + React template.

**Target**: Week 1 = MVP playable, Week 2 = Feature complete, Week 3 = Polished & balanced

---

## Week 1: Core Engine + Basic UI (MVP)

**Goal**: Playable game loop - player can take actions, see state change, win/lose

### Day 1-2: Rust Game Engine Foundation

**Create module structure** in `src-tauri/src/game/`:
```
src-tauri/src/game/
├── mod.rs          # Module exports
├── state.rs        # GameState struct and initialization
├── actions.rs      # Action enum and resolution logic
├── events.rs       # Event system (basic)
├── economy.rs      # Revenue/burn calculations
└── victory.rs      # Win/loss conditions
```

**Tasks**:
1. Define `GameState` struct in `state.rs` with all metrics from design doc
2. Implement `new_game(difficulty)` function with proper initialization
3. Create `Action` enum in `actions.rs` with 5 essential actions:
   - ShipFeature
   - FounderLedSales
   - Hire
   - Fundraise
   - TakeBreak
4. Build `resolve_action()` function with base effects + variance
5. Implement victory/defeat detection in `victory.rs`

**Rust Dependencies to Add**:
```toml
[dependencies]
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
rand = "0.8"  # For variance in action outcomes
uuid = { version = "1.0", features = ["v4", "serde"] }
```

**Success Criteria**: Can create new game, apply actions, detect victory/defeat in Rust

---

### Day 3-4: Tauri Commands & State Persistence

**Add Tauri commands** in `src-tauri/src/lib.rs`:

```rust
#[tauri::command]
fn new_game(difficulty: String) -> Result<GameState, String>

#[tauri::command]
fn load_game(game_id: String) -> Result<GameState, String>

#[tauri::command]
fn save_game(state: GameState) -> Result<(), String>

#[tauri::command]
fn take_turn(state: GameState, actions: Vec<Action>) -> Result<GameState, String>
```

**Implement persistence using Tauri Store**:
- Save current state to JSON
- Autosave every turn
- Load most recent save on app start

**Tasks**:
1. Wire up commands to game engine functions
2. Add error handling for invalid states/actions
3. Implement save/load with Tauri Store plugin
4. Add auto-save logic in `take_turn()`

**Success Criteria**: Frontend can call Rust commands, state persists across app restarts

---

### Day 5-6: React UI - Game Dashboard

**Create new view**: `src/views/GameView.tsx`

**Components to build**:
```
src/components/game/
├── GameDashboard.tsx      # Main container
├── StatsPanel.tsx         # Display all metrics
├── ActionCard.tsx         # Single action card
├── ActionSelector.tsx     # Grid of action cards
├── TurnButton.tsx         # "End Week" button
└── GameOver.tsx           # Victory/defeat modal
```

**StatsPanel** displays (using Mantine components):
- Week number
- Runway (months) - color-coded (green > 6, yellow 3-6, red < 3)
- MRR / Burn
- WAU + growth %
- Morale / Reputation / NPS bars
- Tech Debt / Compliance Risk

**ActionSelector** shows:
- Action cards in grid (2-3 columns)
- Each card shows:
  - Icon + Title
  - Focus cost (🎯 x1, x2, etc.)
  - Expected impact ranges (+WAU: 5% ± 3%)
  - Disabled state if insufficient focus
- Selected actions highlighted
- Focus slots remaining counter

**Turn flow**:
1. Player selects up to `focus_slots` actions
2. Clicks "End Week"
3. Frontend calls `take_turn(state, actions)`
4. Backend returns new state
5. UI updates with new state
6. Check for victory/defeat → show modal if game over

**Tasks**:
1. Create GameDashboard component structure
2. Build StatsPanel with all metrics
3. Create ActionCard component (static for now)
4. Wire up state management (use React state + Tauri commands)
5. Implement turn advancement flow
6. Add GameOver modal with win/loss messages

**Success Criteria**: Can play full game from UI - select actions, see state change, reach victory/defeat

---

## Week 2: Full Feature Set

**Goal**: All actions, events, dilemmas, difficulty modes, charts

### Day 7-8: Complete Action Set

**Expand actions.rs** to include all 15+ actions from design:
- Product: ShipFeature, RefactorCode, RunExperiment
- Sales: FounderLedSales, ContentLaunch, DevRel, PaidAds
- Team: Hire, Coach, Fire
- Capital: Fundraise, ApplyToAccelerator
- Ops: ComplianceWork, IncidentResponse
- Recovery: TakeBreak, FamilyTime, SelfCare

**For each action**:
1. Define parameters (enums for quality/type/etc.)
2. Implement resolution logic with base effects
3. Add variance (±10-20%)
4. Add conditional effects (tech debt → incidents, etc.)

**Tasks**:
1. Complete Action enum with all variants
2. Implement `resolve_action()` for each
3. Add parameter validation
4. Tune effect magnitudes for balance
5. Update ActionCard UI to handle new actions

**Success Criteria**: All actions work, have appropriate effects

---

### Day 9-10: Event System

**Implement events.rs**:
- Random event generator (5-15% chance per week)
- State-dependent event triggers (high debt → incidents)
- Action outcome events (feature goes viral)
- Dilemma system

**Event types to implement**:
- Positive: ViralMoment, BigLogoSigns, PressFeature
- Negative: CloudOutage, KeyHireChurns, CompetitorLaunch, SecurityIncident
- Dilemmas: CustomDealOffer, AcquisitionOffer

**UI components**:
```
src/components/game/
├── EventModal.tsx         # Shows events/dilemmas
├── DilemmaChoice.tsx      # Dilemma option card
└── EventLog.tsx           # Recent events list
```

**Tasks**:
1. Build event probability calculator
2. Implement random event selection
3. Create dilemma resolution logic
4. Build EventModal component
5. Wire up event display in turn flow

**Success Criteria**: Events trigger, dilemmas presented, player can choose, effects applied

---

### Day 11-12: Economy Model & Difficulty Modes

**Enhance economy.rs**:
- Detailed burn calculation (salaries + infra + tools)
- Revenue model with churn
- Sales cycle lag (booked vs. collected)
- Growth calculations with multipliers

**Add difficulty modes** in `state.rs`:
- `DifficultyMode` enum with 4 variants
- Mode-specific starting conditions
- Mode-specific multipliers
- Board pressure mechanics for VC mode
- Compliance burden for Regulated mode

**UI**:
```
src/components/game/
├── NewGameModal.tsx       # Difficulty selection
└── DifficultyCard.tsx     # Shows mode details
```

**Tasks**:
1. Implement full economy calculations
2. Add difficulty mode data structures
3. Apply mode modifiers to action outcomes
4. Create NewGameModal with difficulty selection
5. Show mode-specific win conditions

**Success Criteria**: Different difficulties play differently, economy feels realistic

---

### Day 13-14: Charts & Visualization

**Add charting library**:
```bash
cd ai_working/founders-dilemma
pnpm add recharts
```

**Create chart components**:
```
src/components/game/charts/
├── RunwayChart.tsx        # Line chart: runway over time
├── RevenueChart.tsx       # Line chart: MRR vs Burn
├── MoraleChart.tsx        # Line chart: morale/reputation
└── MetricsHistory.tsx     # Container for all charts
```

**Charts to show** (last 12 weeks):
- Runway (months) - with danger zone shading (< 3 months)
- MRR vs Burn - with breakeven line
- Morale + Reputation dual line
- WAU growth - with target growth line

**Tasks**:
1. Install Recharts
2. Update GameState to track history snapshots
3. Build chart components with Recharts
4. Add charts tab/section to GameDashboard
5. Style charts to match Mantine theme

**Success Criteria**: Charts show historical data, update each turn, visually informative

---

## Week 3: Polish & Balance

**Goal**: Game feels good to play, looks professional, is balanced

### Day 15-16: UI/UX Polish

**Visual improvements**:
- Icon library for actions (React Icons)
- Color-coded metrics (green/yellow/red thresholds)
- Animations for events (Mantine Modal transitions)
- Tooltips explaining mechanics (Mantine Tooltip)
- Loading states for turn processing

**Components to enhance**:
```
src/components/game/
├── VictoryProgress.tsx    # Visual escape velocity indicator
├── MetricCard.tsx         # Polished stat display
└── TurnSummary.tsx        # Shows what happened this turn
```

**Tasks**:
1. Add icons to all actions
2. Implement color coding for all metrics
3. Add tooltips with explanations
4. Create VictoryProgress component (4 checkmarks)
5. Build TurnSummary to show action outcomes
6. Add smooth transitions/animations

**Success Criteria**: Game looks polished, UI is intuitive, feedback is clear

---

### Day 17-18: Balance & Playtesting

**Create test scenarios**:
```
src-tauri/src/game/tests/
├── test_scenarios.rs      # Unit tests for game scenarios
└── balance_tests.rs       # Balance verification tests
```

**Balance targets**:
- Win rate on Normal: 40-50% for skilled players
- Average game length: 52-78 weeks (1-1.5 years)
- Runway should feel tight but not impossible
- All 4 victory conditions achievable
- No single dominant strategy

**Tasks**:
1. Write automated test scenarios:
   - Baseline survival (12 weeks with defaults)
   - Growth path (2x WAU in 26 weeks)
   - Recovery (survive from 2 months runway)
2. Run 100 simulated games with random actions
3. Analyze win/loss rates
4. Tune action effects to hit balance targets
5. Manual playtesting:
   - Play 5 full games on each difficulty
   - Document broken strategies
   - Adjust multipliers
6. Friend playtesting:
   - Get 3 people to play
   - Watch for confusion points
   - Note what feels unfair vs. challenging

**Success Criteria**: 40-50% win rate, no obvious exploits, feels fair

---

### Day 19-20: Final Features

**Add missing features**:
1. **Tutorial/Onboarding**:
   - First-time player guide
   - Tooltips explaining each metric
   - Example turn walkthrough

2. **Game Stats**:
   - Founder Score calculation
   - Quality of Revenue metrics
   - Stats summary on victory screen

3. **Quality of Life**:
   - Undo last turn (keep 1 snapshot)
   - Speed controls (1x, 2x turn animation)
   - Keyboard shortcuts (1-9 for actions, Enter for end turn)

**Components**:
```
src/components/game/
├── Tutorial.tsx           # First-time guide
├── VictoryStats.tsx       # End-game stats screen
└── QuickActions.tsx       # Keyboard shortcut hints
```

**Tasks**:
1. Build Tutorial component with step-by-step guide
2. Implement Founder Score calculation
3. Create VictoryStats screen with detailed breakdown
4. Add undo functionality
5. Implement keyboard shortcuts
6. Add settings panel (speed, sound effects)

**Success Criteria**: New players can learn quickly, veterans can play efficiently

---

### Day 21: Bug Fixes & Release Prep

**Final checklist**:
- [ ] All Tauri commands tested
- [ ] State persistence works reliably
- [ ] No crashes on edge cases (0 runway, negative morale)
- [ ] All victory/defeat conditions trigger correctly
- [ ] Charts render properly on all window sizes
- [ ] Events don't break game state
- [ ] Dilemmas are balanced
- [ ] Tutorial makes sense
- [ ] Keyboard shortcuts work
- [ ] Undo doesn't break state

**Tasks**:
1. Fix all known bugs
2. Test on different screen sizes
3. Test all difficulty modes
4. Verify save/load doesn't corrupt state
5. Check for memory leaks (long game sessions)
6. Update README with game instructions
7. Create release build (`pnpm tauri build`)
8. Test release build on clean machine

**Success Criteria**: Game is stable, playable, ready to share

---

## Technical Decisions

### State Management
- **Rust owns state**: GameState is the single source of truth
- **React displays state**: No business logic in UI
- **Commands are synchronous**: Turn resolution happens in Rust, returns new state
- **Autosave on every turn**: Use Tauri Store for persistence

### Action Resolution
- **Deterministic with variance**: Same action + RNG seed = same result
- **Compound effects**: Actions modify multiple stats
- **Event triggers**: Actions can spawn events based on probability

### Event System
- **Two-phase**: Random events + action outcome events
- **Dilemmas block turn**: Must resolve before continuing
- **Event log**: Show last 10 events in UI

### Balance Philosophy
- **Tight but fair**: Runway should feel scarce
- **Multiple viable strategies**: No single "correct" path
- **Compound mechanics**: Early decisions affect late game
- **Comeback possible**: Not dead until runway = 0

---

## File Structure (Final)

```
ai_working/founders-dilemma/
├── src-tauri/
│   └── src/
│       ├── game/
│       │   ├── mod.rs
│       │   ├── state.rs        # GameState, DifficultyMode
│       │   ├── actions.rs      # Action enum + resolution
│       │   ├── events.rs       # Event system
│       │   ├── economy.rs      # Revenue/burn model
│       │   ├── victory.rs      # Win/loss detection
│       │   └── tests/
│       │       ├── test_scenarios.rs
│       │       └── balance_tests.rs
│       ├── lib.rs              # Tauri commands
│       └── main.rs
├── src/
│   ├── views/
│   │   └── GameView.tsx        # Main game view
│   ├── components/
│   │   └── game/
│       │   ├── GameDashboard.tsx
│       │   ├── StatsPanel.tsx
│       │   ├── ActionCard.tsx
│       │   ├── ActionSelector.tsx
│       │   ├── EventModal.tsx
│       │   ├── DilemmaChoice.tsx
│       │   ├── EventLog.tsx
│       │   ├── TurnButton.tsx
│       │   ├── GameOver.tsx
│       │   ├── VictoryProgress.tsx
│       │   ├── Tutorial.tsx
│       │   ├── VictoryStats.tsx
│       │   └── charts/
│       │       ├── RunwayChart.tsx
│       │       ├── RevenueChart.tsx
│       │       ├── MoraleChart.tsx
│       │       └── MetricsHistory.tsx
│   └── App.tsx                 # Add GameView to routes
├── GAME_DESIGN.md
├── IMPLEMENTATION_PLAN.md
└── README.md
```

---

## Dependencies to Add

### Rust (`src-tauri/Cargo.toml`):
```toml
rand = "0.8"
uuid = { version = "1.0", features = ["v4", "serde"] }
```

### TypeScript (`package.json`):
```json
"recharts": "^2.10.0"
```

---

## Testing Strategy

### Unit Tests (Rust)
- Test action resolution logic
- Test economy calculations
- Test victory detection
- Test event probability

### Integration Tests (TypeScript)
- Test Tauri command calls
- Test state persistence
- Test UI flows (action selection → turn advancement)

### Manual Testing
- Playthrough each difficulty mode
- Test all actions
- Trigger all events
- Verify charts update
- Test save/load
- Test undo
- Test keyboard shortcuts

---

## Known Challenges & Solutions

### Challenge: Balancing difficulty
**Solution**: Run 100 simulated games, track win rates, adjust multipliers iteratively

### Challenge: Action effects feel arbitrary
**Solution**: Show expected ranges in UI, add tooltips explaining why effects happen

### Challenge: Events feel random/unfair
**Solution**: Make event probability visible (tech debt % = incident chance), let player see risks

### Challenge: Victory condition too hard/easy
**Solution**: Playtest extensively, adjust "escape velocity" thresholds based on data

### Challenge: UI complexity
**Solution**: Progressive disclosure - start simple (stats + actions), reveal charts/logs later

---

## Success Metrics

**MVP Complete (End of Week 1)**:
- Can start new game
- Can select actions
- State changes correctly
- Can win or lose
- State persists

**Feature Complete (End of Week 2)**:
- All 15+ actions work
- Events trigger and affect state
- Dilemmas presented and resolved
- All 4 difficulty modes playable
- Charts show history

**Polished (End of Week 3)**:
- Win rate is 40-50% on Normal
- Game looks professional
- Tutorial exists
- No known critical bugs
- Ready to share

---

## Next Immediate Steps

1. Run `cd ai_working/founders-dilemma`
2. Update `src-tauri/Cargo.toml` with dependencies
3. Create `src-tauri/src/game/` directory
4. Start with `state.rs` - define GameState struct
5. Implement basic action resolution
6. Add Tauri commands
7. Build minimal React UI to test
8. Iterate!

---

**Status**: Implementation plan complete, ready to code
**Estimated completion**: 3 weeks (21 days)
**Risk level**: Low - clear scope, proven tech stack, incremental approach
