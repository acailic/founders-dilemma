use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Difficulty modes with different starting conditions and modifiers
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DifficultyMode {
    IndieBootstrap,
    VCTrack,
    RegulatedFintech,
    InfraDevTool,
}

impl DifficultyMode {
    pub fn starting_bank(&self) -> f64 {
        match self {
            DifficultyMode::IndieBootstrap => 50_000.0,
            DifficultyMode::VCTrack => 1_000_000.0,
            DifficultyMode::RegulatedFintech => 500_000.0,
            DifficultyMode::InfraDevTool => 300_000.0,
        }
    }

    pub fn starting_burn(&self) -> f64 {
        match self {
            DifficultyMode::IndieBootstrap => 8_000.0,
            DifficultyMode::VCTrack => 80_000.0,
            DifficultyMode::RegulatedFintech => 40_000.0,
            DifficultyMode::InfraDevTool => 25_000.0,
        }
    }

    pub fn burn_modifier(&self) -> f64 {
        match self {
            DifficultyMode::IndieBootstrap => 0.5,
            DifficultyMode::VCTrack => 2.0,
            DifficultyMode::RegulatedFintech => 1.0,
            DifficultyMode::InfraDevTool => 0.8,
        }
    }

    pub fn growth_modifier(&self) -> f64 {
        match self {
            DifficultyMode::IndieBootstrap => 0.8,
            DifficultyMode::VCTrack => 1.5,
            DifficultyMode::RegulatedFintech => 1.0,
            DifficultyMode::InfraDevTool => 1.0,
        }
    }

    pub fn compliance_burden(&self) -> f64 {
        match self {
            DifficultyMode::IndieBootstrap => 0.3,
            DifficultyMode::VCTrack => 0.5,
            DifficultyMode::RegulatedFintech => 2.0,
            DifficultyMode::InfraDevTool => 0.7,
        }
    }
}

/// Snapshot of game state at a specific week
#[derive(Debug, Clone, Serialize, Deserialize)]
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

/// Tracks progress toward escape velocity win condition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EscapeVelocityProgress {
    pub revenue_covers_burn: bool,     // MRR >= Burn
    pub growth_sustained: bool,         // WAU growth >= 10% for 3 months
    pub customer_love: bool,            // NPS >= 30
    pub founder_healthy: bool,          // Morale > 40
    pub streak_weeks: u8,               // Consecutive weeks all 4 true
}

impl EscapeVelocityProgress {
    pub fn new() -> Self {
        Self {
            revenue_covers_burn: false,
            growth_sustained: false,
            customer_love: false,
            founder_healthy: false,
            streak_weeks: 0,
        }
    }

    /// Check if all conditions are met
    pub fn all_conditions_met(&self) -> bool {
        self.revenue_covers_burn
            && self.growth_sustained
            && self.customer_love
            && self.founder_healthy
    }
}

impl Default for EscapeVelocityProgress {
    fn default() -> Self {
        Self::new()
    }
}

/// Main game state - single source of truth
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameState {
    // Meta
    pub game_id: String,
    pub week: u32,
    pub difficulty: DifficultyMode,
    pub started_at: i64,

    // Resources (Primary Constraints)
    pub bank: f64,              // Cash in bank ($)
    pub burn: f64,              // Monthly burn rate ($)
    pub runway_months: f64,     // Calculated: bank / burn
    pub focus_slots: u8,        // Actions available this week

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

    // History
    pub history: Vec<WeekSnapshot>,
}

impl GameState {
    /// Create a new game with specified difficulty
    pub fn new(difficulty: DifficultyMode) -> Self {
        let bank = difficulty.starting_bank();
        let burn = difficulty.starting_burn();
        let runway_months = bank / burn;

        let mut state = Self {
            game_id: Uuid::new_v4().to_string(),
            week: 0,
            difficulty,
            started_at: chrono::Utc::now().timestamp(),

            // Resources
            bank,
            burn,
            runway_months,
            focus_slots: 3,

            // Revenue & Growth
            mrr: 0.0,
            wau: 100,
            wau_growth_rate: 0.0,
            churn_rate: 5.0,

            // Health Metrics
            morale: 80.0,
            reputation: 50.0,
            nps: 0.0,

            // Technical
            tech_debt: 10.0,
            compliance_risk: 20.0,
            velocity: 1.0,

            // Equity
            founder_equity: 100.0,
            option_pool: 0.0,

            // Derived
            momentum: 0.0,
            escape_velocity_progress: EscapeVelocityProgress::new(),

            // History
            history: Vec::new(),
        };

        state.update_derived_metrics();
        state.save_snapshot();
        state
    }

    /// Update calculated/derived metrics
    pub fn update_derived_metrics(&mut self) {
        // Update runway
        if self.burn > 0.0 {
            self.runway_months = self.bank / self.burn;
        } else {
            self.runway_months = f64::INFINITY;
        }

        // Update momentum (compound score)
        self.momentum = (self.wau_growth_rate / 100.0 + 1.0)
            * self.velocity
            * (self.morale / 100.0);

        // Clamp values to valid ranges
        self.morale = self.morale.clamp(0.0, 100.0);
        self.reputation = self.reputation.clamp(0.0, 100.0);
        self.nps = self.nps.clamp(-100.0, 100.0);
        self.tech_debt = self.tech_debt.clamp(0.0, 100.0);
        self.compliance_risk = self.compliance_risk.clamp(0.0, 100.0);
        self.velocity = self.velocity.clamp(0.1, 3.0);
        self.churn_rate = self.churn_rate.clamp(0.0, 100.0);
    }

    /// Save current state to history
    pub fn save_snapshot(&mut self) {
        let snapshot = WeekSnapshot {
            week: self.week,
            bank: self.bank,
            mrr: self.mrr,
            burn: self.burn,
            wau: self.wau,
            morale: self.morale,
            reputation: self.reputation,
            momentum: self.momentum,
        };
        self.history.push(snapshot);

        // Keep only last 52 weeks (1 year) in history
        if self.history.len() > 52 {
            self.history.remove(0);
        }
    }

    /// Advance to next week
    pub fn advance_week(&mut self) {
        self.week += 1;

        // Apply weekly costs
        let weekly_burn = self.burn / 4.0; // Convert monthly to weekly
        self.bank -= weekly_burn;

        // Apply weekly revenue
        let weekly_mrr = self.mrr / 4.0;
        self.bank += weekly_mrr;

        // Apply growth
        let prev_wau = self.wau;
        self.wau = (self.wau as f64 * (1.0 + self.wau_growth_rate / 100.0)) as u32;

        // Calculate actual growth rate
        if prev_wau > 0 {
            self.wau_growth_rate = ((self.wau as f64 - prev_wau as f64) / prev_wau as f64) * 100.0;
        }

        // Natural morale decay (tiny)
        self.morale -= 0.5;

        // Tech debt slightly increases if velocity is high
        if self.velocity > 1.2 {
            self.tech_debt += 0.5;
        }

        // Update derived metrics
        self.update_derived_metrics();

        // Save snapshot
        self.save_snapshot();
    }

    /// Check if game is over (win or loss)
    pub fn is_game_over(&self) -> bool {
        // Loss conditions
        if self.runway_months <= 0.0 || self.bank <= 0.0 {
            return true;
        }
        if self.morale <= 0.0 {
            return true;
        }
        if self.reputation <= 10.0 {
            return true;
        }

        // Win condition
        if self.escape_velocity_progress.streak_weeks >= 12 {
            return true;
        }

        false
    }

    /// Check if player won
    pub fn has_won(&self) -> bool {
        self.escape_velocity_progress.streak_weeks >= 12
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_game_indie() {
        let state = GameState::new(DifficultyMode::IndieBootstrap);
        assert_eq!(state.week, 0);
        assert_eq!(state.bank, 50_000.0);
        assert_eq!(state.burn, 8_000.0);
        assert!(state.runway_months > 6.0);
        assert_eq!(state.focus_slots, 3);
    }

    #[test]
    fn test_new_game_vc() {
        let state = GameState::new(DifficultyMode::VCTrack);
        assert_eq!(state.bank, 1_000_000.0);
        assert_eq!(state.burn, 80_000.0);
    }

    #[test]
    fn test_runway_calculation() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        state.bank = 100_000.0;
        state.burn = 10_000.0;
        state.update_derived_metrics();
        assert_eq!(state.runway_months, 10.0);
    }

    #[test]
    fn test_advance_week() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        let initial_bank = state.bank;
        let initial_week = state.week;

        state.advance_week();

        assert_eq!(state.week, initial_week + 1);
        assert!(state.bank < initial_bank); // Should have spent money
        assert_eq!(state.history.len(), 2); // Initial + week 1
    }

    #[test]
    fn test_morale_clamp() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        state.morale = 150.0;
        state.update_derived_metrics();
        assert_eq!(state.morale, 100.0);

        state.morale = -10.0;
        state.update_derived_metrics();
        assert_eq!(state.morale, 0.0);
    }
}
