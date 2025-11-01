# Founder's Dilemma - Game Design Document

## Architecture Overview

### Tech Stack
- **Backend**: Rust (game engine, state machine, all business logic)
- **Frontend**: React + Mantine UI (presentation only)
- **Bridge**: Tauri commands (Rust → TypeScript API)
- **Persistence**: Tauri Store plugin (JSON key-value)

### Design Philosophy
- **Pure state machine**: All game logic in Rust, deterministic
- **No business logic in UI**: React only displays state and sends actions
- **Serious simulation**: Realistic probabilities and interconnected systems
- **Gamified presentation**: Clear feedback, tooltips, engaging visuals
- **Strategy game depth**: Multiple valid approaches, meaningful choices

---

## Core Data Model

### GameState (Rust)

```rust
pub struct GameState {
    // Meta
    pub week: u32,
    pub difficulty: DifficultyMode,
    pub game_id: String,
    pub started_at: i64,

    // Resources (Primary Constraints)
    pub bank: f64,              // Cash in bank ($)
    pub burn: f64,              // Monthly burn rate ($)
    pub runway_months: f64,     // Calculated: bank / burn
    pub focus_slots: u8,        // Actions available this week (default: 3)

    // Revenue & Growth
    pub mrr: f64,               // Monthly recurring revenue ($)
    pub wau: u32,               // Weekly active users
    pub wau_growth_rate: f64,   // % growth week-over-week
    pub churn_rate: f64,        // Monthly churn % (0-100)

    // Health Metrics
    pub morale: f64,            // Founder morale (0-100)
    pub reputation: f64,        // Brand/investor trust (0-100)
    pub nps: f64,               // Net Promoter Score (-100 to 100)

    // Technical Systems
    pub tech_debt: f64,         // Accumulated debt (0-100)
    pub compliance_risk: f64,   // Regulatory risk (0-100)
    pub velocity: f64,          // Shipping speed multiplier (0.5-2.0)

    // Equity
    pub founder_equity: f64,    // Founder equity % (0-100)
    pub option_pool: f64,       // Employee option pool % (0-20)

    // Derived Metrics
    pub momentum: f64,          // Compound score: wau_growth × velocity × morale
    pub escape_velocity_progress: EscapeVelocityProgress,

    // History & Events
    pub history: Vec<WeekSnapshot>,
    pub event_log: Vec<GameEvent>,
    pub pending_dilemmas: Vec<Dilemma>,
}

pub struct WeekSnapshot {
    pub week: u32,
    pub bank: f64,
    pub mrr: f64,
    pub burn: f64,
    pub wau: u32,
    pub morale: f64,
    pub reputation: f64,
    pub momentum: f64,
}

pub struct EscapeVelocityProgress {
    pub revenue_covers_burn: bool,      // MRR ≥ Burn
    pub growth_sustained: bool,         // WAU growth ≥ 10% for 3 months
    pub customer_love: bool,            // NPS ≥ 30
    pub founder_healthy: bool,          // Morale > 40
    pub streak_weeks: u8,               // Consecutive weeks all 4 true
}
```

### DifficultyMode

```rust
pub enum DifficultyMode {
    IndieBootstrap {
        starting_bank: f64,         // $50k
        burn_modifier: f64,         // 0.5x (low burn)
        growth_modifier: f64,       // 0.8x (slower growth)
        compliance_burden: f64,     // 0.3x (minimal)
    },
    VCTrack {
        starting_bank: f64,         // $1M
        burn_modifier: f64,         // 2.0x (high burn)
        growth_targets: f64,        // 1.5x (aggressive)
        board_pressure: bool,       // Morale drains faster
    },
    RegulatedFintech {
        starting_bank: f64,         // $500k
        compliance_burden: f64,     // 2.0x (heavy)
        incident_severity: f64,     // 1.5x (worse consequences)
        barrier_to_entry: f64,      // 1.3x (competitors slower)
    },
    InfraDevTool {
        sales_cycle_length: u8,     // 12 weeks avg
        logo_impact: f64,           // 2.0x (big logos matter more)
        devrel_importance: f64,     // 1.5x (content multiplier)
    },
}
```

---

## Actions

### Action Definition

```rust
pub enum Action {
    // PRODUCT (Focus: 1-2 slots)
    ShipFeature {
        quality: Quality,           // Quick | Balanced | Polish
    },
    RefactorCode {
        depth: RefactorDepth,       // Surface | Medium | Deep
    },
    RunExperiment {
        category: ExperimentType,   // Pricing | Onboarding | Channel
    },

    // SALES & GROWTH (Focus: 1-2 slots)
    FounderLedSales {
        call_count: u8,             // 3, 5, or 10 calls
    },
    ContentLaunch {
        content_type: ContentType,  // BlogPost | Tutorial | CaseStudy
    },
    DevRel {
        event_type: DevRelEvent,    // Conference | Podcast | OpenSource
    },
    PaidAds {
        budget: f64,                // $ to spend this week
    },

    // TEAM (Focus: 1-2 slots)
    Hire {
        role: Role,                 // Engineer | Sales | Designer | Ops
        seniority: Seniority,       // Junior | Mid | Senior
    },
    Coach {
        focus: CoachingFocus,       // Skills | Morale | Alignment
    },
    Fire {
        reason: FiringReason,       // Performance | Culture | Budget
    },

    // CAPITAL (Focus: 1-2 slots)
    Fundraise {
        target: f64,                // Amount seeking
        expected_dilution: f64,     // % equity to give up
    },
    ApplyToAccelerator,
    NegotiateContractTerms,

    // OPS & COMPLIANCE (Focus: 1 slot)
    ComplianceWork {
        hours: u8,                  // 5, 10, 20 hours
    },
    IncidentResponse,               // React to security/outage
    ProcessImprovement,

    // RECOVERY (Focus: 0.5-1 slot)
    TakeBreak,                      // Restore morale, lose momentum
    FamilyTime,                     // Restore morale, slight productivity hit
    SelfCare,                       // Restore morale, maintain productivity
}

pub enum Quality {
    Quick,      // Ship fast, +momentum, +tech_debt
    Balanced,   // Normal trade-off
    Polish,     // Ship slow, +reputation, -tech_debt
}

pub enum ExperimentType {
    Pricing,        // Test price points
    Onboarding,     // Improve activation
    Channel,        // New acquisition channel
}

pub enum ContentType {
    BlogPost,       // Quick, moderate reach
    Tutorial,       // Slow, high conversion
    CaseStudy,      // Slow, enterprise appeal
}
```

### Action Resolution

Each action:
1. **Consumes focus slots** (some actions take more than 1)
2. **Modifies multiple stats** with variance (±10-20%)
3. **May trigger events** (success/failure outcomes)
4. **Shows expected ranges** before selection (transparency)

Example: `ShipFeature { quality: Quick }`
- **Cost**: 1 focus slot
- **Base Effects**:
  - WAU: +5% ± 3%
  - Momentum: +10 ± 5
  - Tech Debt: +8 ± 3
  - Velocity: -0.05 (compounds over time)
- **Event Triggers**:
  - 10% chance: "Feature goes viral" (+20% WAU, +15 reputation)
  - 5% chance: "Critical bug shipped" (-10 reputation, incident)

---

## Events

### Event System

```rust
pub struct GameEvent {
    pub week: u32,
    pub event_type: EventType,
    pub description: String,
    pub impacts: Vec<StatDelta>,
    pub requires_response: bool,
}

pub enum EventType {
    // POSITIVE
    ViralMoment,                // +30% WAU, +20 reputation
    BigLogoSigns,               // +$5k-50k MRR, +10 reputation
    PressFeature,               // +15 reputation, +10% WAU
    KeyHireJoins,               // +velocity, +morale
    InvestorInbound,            // Fundraise opportunity

    // NEGATIVE
    CloudOutage,                // -10 reputation, churn spike
    KeyHireChurns,              // -velocity, -morale
    CompetitorLaunch,           // WAU growth slows 20%
    RegulatoryAudit,            // Must do compliance work or risk fine
    SecurityIncident,           // -20 reputation, requires response
    BigLogoChurns,              // -MRR, -reputation
    UnexpectedBill,             // -bank

    // DILEMMAS (player must choose)
    CustomDealOffer {
        client_name: String,
        mrr_gain: f64,          // +MRR if accept
        tech_debt_cost: f64,    // +tech_debt if accept
        reputation_loss: f64,   // If decline
    },
    AcquisitionOffer {
        amount: f64,            // Buyout price
        equity_required: f64,   // % they want
    },
    StarEmployeeCounterOffer {
        retention_cost: f64,    // +burn
        velocity_loss: f64,     // If they leave
    },
}

pub struct Dilemma {
    pub id: String,
    pub title: String,
    pub description: String,
    pub options: Vec<DilemmaOption>,
}

pub struct DilemmaOption {
    pub label: String,
    pub description: String,
    pub effects: Vec<StatDelta>,
}
```

### Event Probability

Events are triggered by:
1. **Random roll each week** (5-15% base chance)
2. **State-dependent triggers**:
   - High tech debt → More incidents
   - High momentum → More press/viral moments
   - Low morale → Hire churn risk
   - High reputation → Investor inbound
3. **Action outcomes** (some actions can trigger events)

---

## Economy Model

### Revenue & Burn

```rust
// Revenue (simplified)
mrr = sum(customers_by_plan × plan_price) - churn_loss + expansion

// Burn (detailed)
burn = salaries + infrastructure + tools + marketing + misc

// Salaries = team_size × avg_salary
// Infrastructure = WAU × cost_per_user (scales with users)
// Tools = base_tooling_cost
// Marketing = ad_spend (optional)

// Runway
runway_months = bank / burn

// Cash lag (sales cycle)
// Booked MRR doesn't become cash immediately
// Enterprise: 90-day payment terms
// SMB: 30-day
// Self-serve: Immediate
```

### Growth Model

```rust
// WAU Growth (week-over-week)
new_wau = wau × (1 + growth_rate)

// Growth rate influenced by:
// - Content launches (+5-15%)
// - Viral moments (+20-40%)
// - Word of mouth (NPS-based)
// - Paid ads ($ → growth)
// - Competitor actions (-growth)

// Churn
monthly_churn = base_churn × (1 + nps_modifier) × (1 + incident_modifier)

// Base churn: 3-7% monthly (depends on segment)
// High NPS reduces churn
// Incidents/poor support increase churn
```

---

## Victory & Defeat

### Escape Velocity (Win Condition)

Must maintain **ALL FOUR** for **12 consecutive weeks** (3 months):

1. **Revenue covers burn**: `MRR ≥ Burn`
2. **Sustained growth**: `WAU growth ≥ 10% per week`
3. **Customer love**: `NPS ≥ 30`
4. **Founder health**: `Morale > 40`

### Failure Conditions

**Immediate game over**:
- Runway ≤ 0 (out of cash)
- Morale ≤ 0 (founder burnout)
- Reputation ≤ 10 after major incident (trust destroyed)

**Soft failure** (zombie startup):
- Runway stable but < 6 months
- MRR growth < 5% for 12 weeks
- No path to profitability visible

---

## Game Loop

### Weekly Cycle

```
1. Display current state (all metrics, charts)
2. Show available actions (focus slots)
3. Player selects N actions (up to focus_slots)
4. Resolve actions:
   - Apply base effects with variance
   - Trigger action-based events
   - Update derived metrics
5. Roll for random events
6. Present dilemmas (if any)
7. Calculate victory progress
8. Save state
9. Advance to next week
```

### Turn Duration

- **Fast mode**: 1 week per turn (~2-3 min per turn)
- **Game length**: 52-104 weeks (1-2 years in-game)
- **Session length**: 30-60 minutes typical

---

## UI Components

### Main Dashboard
- **Stats Panel**: Current week, runway, MRR, burn, WAU, morale, reputation, NPS
- **Action Selection**: Card-based UI, shows focus cost and expected impacts
- **Event Log**: Recent events, scrollable history
- **Charts**: Time series for runway/MRR/morale (last 12 weeks visible)
- **Victory Progress**: Visual indicator for escape velocity streak

### Action Cards
- **Title & Icon**
- **Focus Cost** (🎯 x1, x2, etc.)
- **Expected Impact** (ranges shown):
  - WAU: +5% ± 3%
  - Tech Debt: +8 ± 3
  - Morale: -2 ± 1
- **Tooltips**: Explain mechanics
- **Disabled state**: If insufficient focus or prerequisites not met

### Event Modal
- **Animated entrance** for major events
- **Description** with context
- **Impact preview**: What stats will change
- **Dilemma options** (if applicable)

### Victory Screen
- **Founder Score**: Compound metric
  - Momentum × User Love × Reputation / (Dilution × Incidents)
- **Quality of Revenue**: % from ICP, gross margin, churn
- **Stats summary**: Final state
- **Replay button**

---

## Balancing Parameters

### Difficulty Calibration

**Target Win Rate**: 40% for experienced players on Normal mode

**Key Multipliers** (Normal difficulty):
- Starting bank: $100k
- Starting burn: $15k/month (6.6 months runway)
- Starting focus: 3 slots/week
- Tech debt → incident probability: `debt/100 × 0.05` per week
- Morale → velocity: `morale/100` (50 morale = 0.5x velocity)
- Reputation → conversion: `reputation/100 × base_conversion`

### Testing Scenarios

1. **Baseline**: Can player survive 12 weeks with default start?
2. **Growth path**: Can player 2x WAU in 26 weeks?
3. **Survival mode**: Can player recover from 2 months runway?
4. **Dilemma chains**: Are trade-offs meaningful?

---

## Implementation Phases

### Phase 1: Core Engine (Week 1)
- GameState struct and default initialization
- Action enum and basic resolution
- State persistence (load/save)
- Victory/defeat detection
- 5 essential actions (ship, sell, hire, raise, rest)

### Phase 2: UI Foundation (Week 1)
- GameDashboard view
- Stats display panel
- Action card selection UI
- Basic turn advancement
- Load/save game buttons

### Phase 3: Economy & Events (Week 2)
- Full economy model (revenue, burn, growth)
- Random event system
- Event modal UI
- 10+ event types
- Dilemma system

### Phase 4: Depth & Balance (Week 2)
- All 15+ actions implemented
- Charts and visualizations
- Victory progress indicator
- Difficulty modes
- Tutorial/onboarding

### Phase 5: Polish & Tuning (Week 3)
- Balance playtesting
- Animations and polish
- Sound effects (optional)
- Achievements/unlocks
- Replay value features

---

## Technical Notes

### State Management
- Rust owns the canonical state
- React never mutates state
- All state changes via Tauri commands
- Store snapshots every 5 weeks for undo/replay

### Persistence Format
```json
{
  "game_id": "uuid",
  "current_state": { GameState },
  "autosave": true,
  "last_played": timestamp
}
```

### Tauri Commands

```rust
#[tauri::command]
fn new_game(difficulty: DifficultyMode) -> GameState

#[tauri::command]
fn load_game(game_id: String) -> Result<GameState, String>

#[tauri::command]
fn save_game(state: GameState) -> Result<(), String>

#[tauri::command]
fn take_actions(state: GameState, actions: Vec<Action>) -> GameState

#[tauri::command]
fn resolve_dilemma(state: GameState, dilemma_id: String, choice: usize) -> GameState
```

---

## Next Steps

1. Create Rust module structure (`src-tauri/src/game/`)
2. Implement GameState and Action types
3. Build action resolution engine
4. Add Tauri commands
5. Create React GameDashboard view
6. Wire up action → backend → state update loop
7. Add event system
8. Build charts
9. Playtest and balance

---

**Status**: Design complete, ready for implementation
**Target**: MVP playable in 2 weeks, polished in 3 weeks
