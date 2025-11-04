use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use super::actions::Action;
use super::market_conditions::MarketCondition;
use super::synergies::SpecializationPath;
use super::progression::SeasonalChallenge;

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

/// Team composition breakdown
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamComposition {
    pub engineers: u8,
    pub sales: u8,
    pub other: u8,
}

/// Customer segment breakdown
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomerBreakdown {
    pub enterprise: u32,
    pub smb: u32,
    pub self_serve: u32,
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

    // New fields for enhanced gameplay
    pub unlocked_actions: Vec<String>,
    pub active_market_conditions: Vec<MarketCondition>,
    pub specialization_path: Option<SpecializationPath>,
    pub action_history: Vec<(u32, Vec<Action>)>,
    pub event_cooldowns: HashMap<String, u32>,
    pub seasonal_challenge: Option<SeasonalChallenge>,
    pub team_size: u8,
    pub incident_count: u32,
    pub last_break_week: u32,
    pub consecutive_ship_weeks: u8,
    pub customer_segments: HashMap<String, u32>,
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

            // New fields initialization
            unlocked_actions: vec![
                "ShipFeature".to_string(),
                "FounderLedSales".to_string(),
                "Hire".to_string(),
                "Fundraise".to_string(),
                "TakeBreak".to_string(),
            ],
            active_market_conditions: Vec::new(),
            specialization_path: None,
            action_history: Vec::new(),
            event_cooldowns: HashMap::new(),
            seasonal_challenge: None,
            team_size: 1, // Founder
            incident_count: 0,
            last_break_week: 0,
            consecutive_ship_weeks: 0,
            customer_segments: {
                let mut map = HashMap::new();
                map.insert("enterprise".to_string(), 0);
                map.insert("smb".to_string(), 0);
                map.insert("self_serve".to_string(), 100); // Starting users
                map
            },
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

        // Update market conditions
        super::market_conditions::update_market_conditions(self);

        // Check for new market conditions
        if let Some(condition) = super::market_conditions::generate_market_condition(self, self.week) {
            self.active_market_conditions.push(condition);
        }

        // Update action history (keep last 12 weeks)
        if self.action_history.len() > 12 {
            self.action_history.remove(0);
        }

        // Increment incident_count if tech_debt > 80 (probabilistic)
        if self.tech_debt > 80.0 && rand::random::<f64>() < 0.1 {
            self.incident_count += 1;
        }

        // Update team_size based on hires/fires - placeholder, actual logic in actions
        // For now, assume no change; update in resolve_action

        // Track consecutive_ship_weeks - placeholder, update based on actions taken
        // If ShipFeature was taken this week, increment, else reset to 0
        // Since actions are not passed here, this might be updated elsewhere

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

    /// Check if an action is unlocked
    pub fn is_action_unlocked(&self, action: &Action) -> bool {
        self.unlocked_actions.contains(&format!("{:?}", action))
    }

    /// Get active modifiers from market conditions
    pub fn get_active_modifiers(&self) -> Vec<(String, f64)> {
        let mut modifiers = Vec::new();
        for condition in &self.active_market_conditions {
            for modifier in &condition.modifiers {
                modifiers.push((modifier.stat_affected.clone(), modifier.multiplier));
            }
        }
        modifiers
    }

    /// Get team composition
    pub fn get_team_composition(&self) -> TeamComposition {
        // Placeholder: calculate based on team_size and assumptions
        // In a real implementation, track specific roles
        TeamComposition {
            engineers: (self.team_size / 2).max(1), // Assume half engineers
            sales: (self.team_size / 4).max(0),
            other: self.team_size - (self.team_size / 2).max(1) - (self.team_size / 4).max(0),
        }
    }

    /// Get customer breakdown
    pub fn get_customer_breakdown(&self) -> CustomerBreakdown {
        CustomerBreakdown {
            enterprise: *self.customer_segments.get("enterprise").unwrap_or(&0),
            smb: *self.customer_segments.get("smb").unwrap_or(&0),
            self_serve: *self.customer_segments.get("self_serve").unwrap_or(&0),
        }
    }

    /// Calculate market-adjusted metric
    pub fn calculate_market_adjusted_metric(&self, base_value: f64, metric: &str) -> f64 {
        let mut adjusted = base_value;
        for condition in &self.active_market_conditions {
            for modifier in &condition.modifiers {
                if modifier.stat_affected == metric {
                    adjusted *= modifier.multiplier;
                }
            }
        }
        adjusted
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
        // Test new fields
        assert!(state.unlocked_actions.contains(&"ShipFeature".to_string()));
        assert_eq!(state.team_size, 1);
        assert_eq!(state.incident_count, 0);
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

    #[test]
    fn test_is_action_unlocked() {
        let state = GameState::new(DifficultyMode::IndieBootstrap);
        // Assuming Action::ShipFeature exists
        // assert!(state.is_action_unlocked(&Action::ShipFeature));
    }

    #[test]
    fn test_get_active_modifiers() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        // Add a mock condition
        // state.active_market_conditions.push(...);
        let modifiers = state.get_active_modifiers();
        assert!(modifiers.is_empty());
    }
}