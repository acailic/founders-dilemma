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
- **Synergies encourage strategic thinking**: Combining actions rewards planning and experimentation, teaching players about complementary strategies (e.g., product + marketing boosts) without overwhelming complexity.
- **Market conditions add replayability**: Random external modifiers force adaptation, simulating real startup unpredictability and encouraging diverse playthroughs.
- **Progression system for engagement**: Unlocking actions and milestones provides a sense of growth, maintaining long-term interest while keeping early game accessible.
- **Balance between complexity and accessibility**: New systems layer on core mechanics gradually, with clear feedback and educational tooltips to avoid overwhelming new players.

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
        depth: RefactorDepth,       // Surface | Medium | Deep (Unlock: Week 5+ or Tech Debt > 50)
    },
    RunExperiment {
        category: ExperimentType,   // Pricing | Onboarding | Channel (Unlock: WAU > 500)
    },

    // SALES & GROWTH (Focus: 1-2 slots)
    FounderLedSales {
        call_count: u8,             // 3, 5, or 10 calls
    },
    ContentLaunch {
        content_type: ContentType,  // BlogPost | Tutorial | CaseStudy (Unlock: Week 5+)
    },
    DevRel {
        event_type: DevRelEvent,    // Conference | Podcast | OpenSource (Unlock: Week 13+ or Reputation > 60)
    },
    PaidAds {
        budget: f64,                // $ to spend this week (Unlock: Week 13+)
    },

    // TEAM (Focus: 1-2 slots)
    Hire {
        role: Role,                 // Engineer | Sales | Designer | Ops
        seniority: Seniority,       // Junior | Mid | Senior
    },
    Coach {
        focus: CoachingFocus,       // Skills | Morale | Alignment (Unlock: Week 5+)
    },
    Fire {
        reason: FiringReason,       // Performance | Culture | Budget (Unlock: After first hire)
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
        hours: u8,                  // 5, 10, 20 hours (Unlock: Week 9+)
    },
    IncidentResponse,               // React to security/outage (Unlock: After first tech debt crisis)
    ProcessImprovement,             // (Unlock: Week 13+ or After 3 incidents)

    // RECOVERY (Focus: 0.5-1 slot)
    TakeBreak,                      // Restore morale, lose momentum
    FamilyTime,                     // Restore morale, slight productivity hit
    SelfCare,                       // Restore morale, maintain productivity
}

pub enum RefactorDepth {
    Surface,    // 1 slot, -10-15 tech debt, +0.05 velocity, -5 morale
    Medium,     // 1 slot, -20-25 tech debt, +0.1 velocity, -10 morale
    Deep,       // 2 slots, -30-40 tech debt, +0.2 velocity, -15 morale, -10% WAU growth
}

pub enum ExperimentType {
    Pricing,        // Test price points, probabilistic insight (+5-15% MRR or churn change)
    Onboarding,     // Improve activation, +10-20% WAU growth if successful
    Channel,        // New acquisition channel, +5-15% WAU or -5% burn
}

pub enum ContentType {
    BlogPost,       // 1 slot, +3-8% WAU, +5 reputation, +2 NPS
    Tutorial,       // 1 slot, +5-12% WAU, +8 reputation, +5 NPS, higher conversion
    CaseStudy,      // 1 slot, +2-6% WAU, +10 reputation, +3 NPS, enterprise appeal
}

pub enum DevRelEvent {
    Conference,     // 2 slots, +15-25% WAU, +15 reputation, +10 morale, -$5k
    Podcast,        // 2 slots, +10-20% WAU, +10 reputation, +5 morale
    OpenSource,     // 2 slots, +5-15% WAU, +20 reputation, +5 morale, long-term velocity boost
}

pub enum CoachingFocus {
    Skills,         // +10 morale, +0.1 velocity
    Morale,         // +15 morale, +5 reputation
    Alignment,      // +5 morale, +0.05 velocity, +10 NPS
}

pub enum FiringReason {
    Performance,    // -$10k burn, -15 morale, -0.1 velocity
    Culture,        // -$8k burn, -10 morale, +5 reputation
    Budget,         // -$12k burn, -5 morale, no velocity hit
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
5. **Checks unlock conditions** (new actions locked until milestones)
6. **Applies market condition modifiers** (e.g., PaidAds less effective in recession)
7. **Detects synergies** (bonus effects for complementary actions)

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

Example: `RefactorCode { depth: Surface }` (Synergy: +0.1 velocity with Coach)
- **Cost**: 1 focus slot
- **Base Effects**:
  - Tech Debt: -10-15 ± 2
  - Velocity: +0.05 ± 0.01
  - Morale: -5 ± 1
- **Unlock**: Week 5+ or Tech Debt > 50

---

## Action Synergies

### Synergy System Overview
Action synergies reward players for selecting complementary actions in the same turn, encouraging strategic thinking and experimentation. Synergies activate automatically when specific action combinations are chosen, providing bonus effects and educational feedback. They are designed to be discoverable, with clear explanations to teach startup strategy.

### Synergy Combinations (15-20 Examples)
- **Launch Momentum**: ShipFeature + ContentLaunch → +15% WAU boost, +5 reputation
- **Engineering Excellence**: RefactorCode + Coach → +0.2 velocity, -5 tech debt
- **Credibility Boost**: FounderLedSales + DevRel → +10 reputation, +5% MRR growth
- **Integrated Marketing**: PaidAds + ContentLaunch → 50% more effective ads, +10 NPS
- **Operational Resilience**: ProcessImprovement + IncidentResponse → -20% future incident probability, +0.1 velocity
- **Growth Hacking**: RunExperiment + PaidAds → +20% experiment success rate, +10% WAU
- **Team Alignment**: Hire + Coach → +15 morale, +0.05 velocity for new hire
- **Compliance Efficiency**: ComplianceWork + ProcessImprovement → -30% compliance risk, +5 reputation
- **Pivot Recovery**: Fire + RunExperiment → +10 morale after firing, +15% experiment outcome
- **Capital Synergy**: Fundraise + DevRel → +20% fundraising success, -5% dilution
- **Product-Market Fit**: ShipFeature + FounderLedSales → +10% WAU, +5 NPS
- **Scaling Prep**: Hire + ProcessImprovement → -10% burn scaling penalty, +0.1 velocity
- **Content Amplification**: ContentLaunch + DevRel → +25% content reach, +10 reputation
- **Risk Mitigation**: IncidentResponse + ComplianceWork → -15 reputation damage, +10 morale
- **Experiment Iteration**: RunExperiment + RefactorCode → +25% experiment success, +0.05 velocity

### Specialization Paths
Players can specialize by focusing 60%+ of actions on a strategy over 8+ weeks, unlocking persistent bonuses:
- **Product Excellence**: Focus on product actions → +0.3 velocity, -10 tech debt cap
- **Growth Hacking**: Focus on growth actions → +5% WAU growth, +10 reputation
- **Operational Efficiency**: Focus on ops actions → -20% burn, -15 compliance risk
- **Customer Obsessed**: Focus on customer actions → +15 NPS, -5% churn

### Strategic Examples
- Early game: Combine ShipFeature + ContentLaunch for "Launch Momentum" to accelerate growth without heavy marketing spend.
- Mid-game: Use RefactorCode + Coach for "Engineering Excellence" to maintain velocity as tech debt builds.
- Late-game: Specialize in Growth Hacking by mixing PaidAds + RunExperiment to scale efficiently.

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
    // NEW STRATEGIC DILEMMAS
    PivotOpportunity,           // Trigger: Growth < 3% for 8 weeks; Choice A: Pivot (reset WAU, +50 reputation, -20 morale); Choice B: Double down (+focus slot, -10 reputation)
    AcquisitionOfferAdvanced,   // Trigger: Reputation > 70, MRR > $50k; Choice A: Accept $2M (game ends); Choice B: Decline (+morale, +reputation, pressure)
    KeyPartnership,             // Trigger: Reputation > 60; Choice A: Exclusive (+$20k MRR, -30% equity); Choice B: Non-exclusive (+$8k MRR, flexibility)
    TeamConflict,               // Trigger: Morale < 60, team > 3; Choice A: Side with engineer (+velocity, lose sales); Choice B: Side with sales (+revenue, lose velocity); Choice C: Mediate (-15 morale, -1 focus)
    PressOpportunity,           // Trigger: WAU > 1000, reputation > 50; Choice A: Accept (2 focus, +30 reputation, +20% WAU); Choice B: Decline (-5 reputation, +0.1 velocity)
    TechnicalRewrite,           // Trigger: Tech debt > 80, velocity < 0.5; Choice A: Full rewrite (4 weeks, -60 tech debt, -40% WAU); Choice B: Incremental (-30 tech debt, -10% velocity); Choice C: Patch (-5/week tech debt, incidents++)
    CompetitorAcquisition,      // Trigger: Random after week 20; Choice A: Acquire (+500 WAU, +20 tech debt, +$15k burn); Choice B: Compete (-10% WAU growth)
    RegulatoryAuditAdvanced,    // Trigger: Compliance risk > 60; Choice A: Sprint (3 focus, -50 risk, -$30k); Choice B: Minimal (-$10k, -20 risk, 30% fine chance)
    ViralMomentGoneWrong,       // Trigger: WAU growth > 30% in week; Choice A: Scale infra (-$50k, handle); Choice B: Crash (lose 40% new users, -25 reputation)
    FounderHealthCrisis,        // Trigger: Morale < 30 for 4 weeks; Choice A: Take break (morale +40, -20% WAU, -$20k); Choice B: Push through (50% burnout = game over)
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

### Event Probability & Triggering

Events are triggered by:
1. **Random roll each week** (5-15% base chance, up to 2 events/week)
2. **State-dependent triggers**:
   - High tech debt → More incidents
   - High momentum → More press/viral moments
   - Low morale → Hire churn risk
   - High reputation → Investor inbound
3. **Action outcomes** (some actions can trigger events)
4. **Event chains**: Some dilemmas unlock follow-ups (e.g., TeamConflict → FounderHealthCrisis)
5. **Cooldowns**: Same event can't trigger within 8 weeks to prevent spam
6. **Prerequisites**: Dilemmas check specific conditions (e.g., WAU > 1000 for PressOpportunity)

---

## Market Conditions

### Market Condition System Overview
Market conditions introduce random external modifiers that affect gameplay, simulating real-world startup unpredictability. They last 4-8 weeks and modify action effectiveness, stat growth, and strategic decisions, encouraging adaptation and replayability.

### Market Conditions & Effects
- **Bull Market** (15% chance): +30% fundraising success, +20% WAU growth, +15% burn (hiring expensive); Duration: 6 weeks
- **Recession** (15% chance): -40% fundraising success, -10% WAU growth, +30% churn, -20% burn (talent cheaper); Duration: 8 weeks
- **Competitor Launch** (10% chance): -15% WAU growth, -10 reputation, +5% churn; Duration: 4 weeks
- **Tech Boom** (10% chance): +50% hiring cost, +20% velocity (talent available), +25% fundraising success; Duration: 5 weeks
- **Regulation Change** (5% chance): +40% compliance risk, -15% velocity (for regulated industries); Duration: 6 weeks
- **Talent War** (5% chance): +60% hiring cost, -10 morale (poaching), +0.2 velocity if hire; Duration: 4 weeks

### Triggering Probabilities
- 15% base chance per week to trigger any condition
- Conditions are mutually exclusive (only one active at a time)
- No condition during first 4 weeks (tutorial phase)
- Severity scales with game week (more extreme later)

### Strategic Implications
- During Bull Market: Prioritize fundraising and aggressive growth; avoid over-hiring.
- During Recession: Focus on cost control and retention; hiring becomes cheaper but riskier.
- Conditions force strategy shifts, teaching adaptability (e.g., pivot from growth to ops in downturns).

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

## Progression Systems

### Action Unlock System
Actions unlock based on milestones to provide a sense of progression and prevent early-game overwhelm. Core actions (ShipFeature, FounderLedSales, Hire, Fundraise, TakeBreak) are always available.

### Unlock Conditions
- **RefactorCode**: Week 5+ or Tech Debt > 50
- **ContentLaunch**: Week 5+
- **Coach**: Week 5+
- **RunExperiment**: WAU > 500
- **ComplianceWork**: Week 9+
- **DevRel**: Week 13+ or Reputation > 60
- **PaidAds**: Week 13+
- **ProcessImprovement**: Week 13+ or After 3 incidents
- **Fire**: After first hire
- **IncidentResponse**: After first tech debt crisis

### Milestone Events
Triggered at key weeks for narrative and strategic impact:
- **Week 12: Quarter Review** - Investor check-in, board pressure (+burn or -morale)
- **Week 26: Half-Year Milestone** - Major strategic decision (pivot or double down)
- **Week 39: Scaling Challenges** - New complexity unlocked (+tech debt or +WAU)
- **Week 52: Year One Complete** - Achievement, unlocks game+ mode

### Seasonal Challenges
Every 13 weeks, temporary challenges force adaptation:
- **Weeks 13-16: Hiring Freeze** - Can't hire, optimize existing team (+velocity or -burn)
- **Weeks 26-29: Feature Sprint** - Ship 3 features or lose momentum (-WAU growth)
- **Weeks 39-42: Fundraising Window** - Optimal time to raise (+success rate, competitive)

### Meta-Progression Bonuses
Achievements from completed games unlock starting bonuses:
- **Bootstrapper**: Start with +$20k bank
- **Growth Master**: Start with +100 WAU
- **Engineering Excellence**: Start with -10 tech debt
- **Operational Wizard**: Start with -15% burn

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
1. Display current state (all metrics, charts, market conditions)
2. Check unlocks and show new actions
3. Show available actions (focus slots, synergies preview)
4. Player selects N actions (up to focus_slots)
5. Resolve actions:
   - Apply market condition modifiers
   - Apply base effects with variance
   - Detect and apply synergies
   - Trigger action-based events
   - Update derived metrics
6. Update market conditions (decrement durations, generate new)
7. Roll for random events (with cooldowns and chains)
8. Present dilemmas (if any)
9. Check milestone events
10. Calculate victory progress and specialization
11. Save state
12. Advance to next week
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

### Synergy Bonus Values
- Action synergies: +10-20% boost (e.g., +15% WAU for Launch Momentum)
- Specialization bonuses: +0.3 velocity (Product), +5% WAU (Growth), -20% burn (Ops), +15 NPS (Customer)
- Combo score multiplier: 0.0-2.0x for educational feedback

### Market Condition Multipliers
- Bull Market: Fundraising 1.3x, WAU growth 1.2x, Burn 1.15x
- Recession: Fundraising 0.6x, WAU growth 0.9x, Churn 1.3x, Burn 0.8x
- Competitor Launch: WAU growth 0.85x, Reputation -10
- Tech Boom: Hiring cost 1.5x, Velocity 1.2x, Fundraising 1.25x
- Regulation Change: Compliance risk +40, Velocity 0.85x
- Talent War: Hiring cost 1.6x, Morale -10, Velocity +0.2 if hire

### Unlock Thresholds
- Week-based: RefactorCode (5), ContentLaunch (5), Coach (5), RunExperiment (9), DevRel (13), PaidAds (13), ProcessImprovement (13)
- Metric-based: Reputation > 60 (DevRel), WAU > 500 (RunExperiment), Tech Debt > 50 (RefactorCode), After hire (Fire), After crisis (IncidentResponse)

### Testing Scenarios

1. **Baseline**: Can player survive 12 weeks with default start?
2. **Growth path**: Can player 2x WAU in 26 weeks?
3. **Survival mode**: Can player recover from 2 months runway?
4. **Dilemma chains**: Are trade-offs meaningful?

---

## Strategic Depth

### System Interactions
New systems interconnect to create emergent complexity: Market conditions modify action effectiveness (e.g., PaidAds in Recession), synergies reward strategic combos (e.g., RefactorCode + Coach), and progression unlocks enable specialization paths. Events trigger based on state (e.g., high tech debt causes incidents), while unlocks prevent overload.

### Example Strategies
- **Bootstrap Path**: Early unlocks (RefactorCode, ContentLaunch) + Product Excellence specialization → Sustainable growth without dilution.
- **VC Path**: Fundraise + Hire + DevRel → Scale fast with external capital, but manage burn and morale.
- **Ops-Focused**: ComplianceWork + ProcessImprovement + Operational Efficiency → Low-risk, steady progress in regulated spaces.
- **Growth Hack**: RunExperiment + PaidAds + Growth Hacking → Viral scaling through experimentation.

### Viable Paths to Victory
- **Product-Led**: ShipFeature + RefactorCode + synergies → High velocity, escape via momentum.
- **Sales-Led**: FounderLedSales + DevRel + ContentLaunch → Reputation-driven MRR growth.
- **Ops-Led**: ProcessImprovement + ComplianceWork → Low incident risk, steady runway extension.
- All paths require balancing morale, reputation, and momentum for escape velocity.

### Risk/Reward Trade-Offs
- High-risk actions (PaidAds, Fire) offer big rewards but variance; low-risk (Coach, ComplianceWork) provide steady gains.
- Synergies amplify rewards for planning but require focus slot investment.
- Market conditions introduce random risk, rewarding adaptability over rigid strategies.

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
