use serde::{Deserialize, Serialize};
use rand::Rng;
use std::collections::HashMap;
use super::state::GameState;
use super::actions::Action;

/// Represents a market condition that affects gameplay
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketCondition {
    pub id: String,
    pub name: String,
    pub description: String,
    pub duration_weeks: u32,
    pub modifiers: Vec<MarketModifier>,
}

/// Individual modifier applied by a market condition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketModifier {
    pub stat_affected: String,
    pub multiplier: f64,
    pub description: String,
}

/// Types of market events that can occur
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MarketEvent {
    BullMarket,
    Recession,
    CompetitorLaunch,
    TechBoom,
    RegulationChange,
    TalentWar,
    ViralTrend,
    SupplyChainDisruption,
    EconomicStimulus,
    IndustryConsolidation,
    TechCrunch,
    DataBreachScare,
}

/// Generate a random market condition with 15% probability
pub fn generate_market_condition(state: &GameState, week: u32) -> Option<MarketCondition> {
    let mut rng = rand::thread_rng();
    if !rng.gen_bool(0.15) {
        return None;
    }

    // Randomly select an event
    let events = vec![
        MarketEvent::BullMarket,
        MarketEvent::Recession,
        MarketEvent::CompetitorLaunch,
        MarketEvent::TechBoom,
        MarketEvent::RegulationChange,
        MarketEvent::TalentWar,
        MarketEvent::ViralTrend,
        MarketEvent::SupplyChainDisruption,
        MarketEvent::EconomicStimulus,
        MarketEvent::IndustryConsolidation,
        MarketEvent::TechCrunch,
        MarketEvent::DataBreachScare,
    ];
    let event = events[rng.gen_range(0..events.len())].clone();

    // Random duration 4-8 weeks
    let duration = 4 + rng.gen_range(0..5);

    let modifiers = get_modifiers_for_event(&event);

    let (name, description) = match event {
        MarketEvent::BullMarket => (
            "Bull Market".to_string(),
            "Investors are bullish, funding is plentiful but expensive.".to_string(),
        ),
        MarketEvent::Recession => (
            "Recession".to_string(),
            "Economic downturn making growth and funding harder.".to_string(),
        ),
        MarketEvent::CompetitorLaunch => (
            "Competitor Launch".to_string(),
            "Major competitor entered the market.".to_string(),
        ),
        MarketEvent::TechBoom => (
            "Tech Boom".to_string(),
            "Tech sector is booming with talent and investment.".to_string(),
        ),
        MarketEvent::RegulationChange => (
            "Regulation Change".to_string(),
            "New regulations affecting your industry.".to_string(),
        ),
        MarketEvent::TalentWar => (
            "Talent War".to_string(),
            "High demand for talent driving up costs.".to_string(),
        ),
        MarketEvent::ViralTrend => (
            "Viral Trend".to_string(),
            "Your product type is going viral.".to_string(),
        ),
        MarketEvent::SupplyChainDisruption => (
            "Supply Chain Disruption".to_string(),
            "Global supply issues affecting operations.".to_string(),
        ),
        MarketEvent::EconomicStimulus => (
            "Economic Stimulus".to_string(),
            "Government stimulus boosting the economy.".to_string(),
        ),
        MarketEvent::IndustryConsolidation => (
            "Industry Consolidation".to_string(),
            "Industry is consolidating with mergers and acquisitions.".to_string(),
        ),
        MarketEvent::TechCrunch => (
            "TechCrunch Coverage".to_string(),
            "Your startup got featured on TechCrunch.".to_string(),
        ),
        MarketEvent::DataBreachScare => (
            "Data Breach Scare".to_string(),
            "Industry-wide data breaches increasing scrutiny.".to_string(),
        ),
    };

    Some(MarketCondition {
        id: format!("{:?}", event),
        name,
        description,
        duration_weeks: duration,
        modifiers,
    })
}

/// Get the modifiers for a specific market event
fn get_modifiers_for_event(event: &MarketEvent) -> Vec<MarketModifier> {
    match event {
        MarketEvent::BullMarket => vec![
            MarketModifier {
                stat_affected: "fundraising_success".to_string(),
                multiplier: 1.3,
                description: "+30% fundraising success".to_string(),
            },
            MarketModifier {
                stat_affected: "wau_growth".to_string(),
                multiplier: 1.2,
                description: "+20% WAU growth".to_string(),
            },
            MarketModifier {
                stat_affected: "burn".to_string(),
                multiplier: 1.15,
                description: "+15% burn (hiring expensive)".to_string(),
            },
        ],
        MarketEvent::Recession => vec![
            MarketModifier {
                stat_affected: "fundraising_success".to_string(),
                multiplier: 0.6,
                description: "-40% fundraising success".to_string(),
            },
            MarketModifier {
                stat_affected: "wau_growth".to_string(),
                multiplier: 0.9,
                description: "-10% WAU growth".to_string(),
            },
            MarketModifier {
                stat_affected: "churn_rate".to_string(),
                multiplier: 1.3,
                description: "+30% churn".to_string(),
            },
            MarketModifier {
                stat_affected: "burn".to_string(),
                multiplier: 0.8,
                description: "-20% burn (talent cheaper)".to_string(),
            },
        ],
        MarketEvent::CompetitorLaunch => vec![
            MarketModifier {
                stat_affected: "wau_growth".to_string(),
                multiplier: 0.85,
                description: "-15% WAU growth".to_string(),
            },
            MarketModifier {
                stat_affected: "reputation".to_string(),
                multiplier: 0.9,
                description: "-10 reputation".to_string(),
            },
            MarketModifier {
                stat_affected: "churn_rate".to_string(),
                multiplier: 1.05,
                description: "+5% churn".to_string(),
            },
        ],
        MarketEvent::TechBoom => vec![
            MarketModifier {
                stat_affected: "hiring_cost".to_string(),
                multiplier: 1.5,
                description: "+50% hiring cost".to_string(),
            },
            MarketModifier {
                stat_affected: "velocity".to_string(),
                multiplier: 1.2,
                description: "+20% velocity (talent available)".to_string(),
            },
            MarketModifier {
                stat_affected: "fundraising_success".to_string(),
                multiplier: 1.25,
                description: "+25% fundraising success".to_string(),
            },
        ],
        MarketEvent::RegulationChange => vec![
            MarketModifier {
                stat_affected: "compliance_risk".to_string(),
                multiplier: 1.4,
                description: "+40% compliance risk".to_string(),
            },
            MarketModifier {
                stat_affected: "velocity".to_string(),
                multiplier: 0.85,
                description: "-15% velocity".to_string(),
            },
        ],
        MarketEvent::TalentWar => vec![
            MarketModifier {
                stat_affected: "hiring_cost".to_string(),
                multiplier: 1.6,
                description: "+60% hiring cost".to_string(),
            },
            MarketModifier {
                stat_affected: "morale".to_string(),
                multiplier: 0.9,
                description: "-10 morale (poaching)".to_string(),
            },
            MarketModifier {
                stat_affected: "hire_velocity_bonus".to_string(),
                multiplier: 1.2,
                description: "+0.2 velocity if you hire".to_string(),
            },
        ],
        MarketEvent::ViralTrend => vec![
            MarketModifier {
                stat_affected: "wau_growth".to_string(),
                multiplier: 1.4,
                description: "+40% WAU growth".to_string(),
            },
            MarketModifier {
                stat_affected: "reputation".to_string(),
                multiplier: 1.1,
                description: "+10 reputation".to_string(),
            },
        ],
        MarketEvent::SupplyChainDisruption => vec![
            MarketModifier {
                stat_affected: "velocity".to_string(),
                multiplier: 0.8,
                description: "-20% velocity".to_string(),
            },
            MarketModifier {
                stat_affected: "burn".to_string(),
                multiplier: 1.1,
                description: "+10% burn".to_string(),
            },
        ],
        MarketEvent::EconomicStimulus => vec![
            MarketModifier {
                stat_affected: "fundraising_success".to_string(),
                multiplier: 1.2,
                description: "+20% fundraising success".to_string(),
            },
            MarketModifier {
                stat_affected: "wau_growth".to_string(),
                multiplier: 1.1,
                description: "+10% WAU growth".to_string(),
            },
        ],
        MarketEvent::IndustryConsolidation => vec![
            MarketModifier {
                stat_affected: "fundraising_success".to_string(),
                multiplier: 1.15,
                description: "+15% fundraising success".to_string(),
            },
            MarketModifier {
                stat_affected: "reputation".to_string(),
                multiplier: 0.95,
                description: "-5 reputation".to_string(),
            },
        ],
        MarketEvent::TechCrunch => vec![
            MarketModifier {
                stat_affected: "reputation".to_string(),
                multiplier: 1.2,
                description: "+20 reputation".to_string(),
            },
            MarketModifier {
                stat_affected: "wau_growth".to_string(),
                multiplier: 1.15,
                description: "+15% WAU growth".to_string(),
            },
        ],
        MarketEvent::DataBreachScare => vec![
            MarketModifier {
                stat_affected: "compliance_risk".to_string(),
                multiplier: 1.3,
                description: "+30% compliance risk".to_string(),
            },
            MarketModifier {
                stat_affected: "reputation".to_string(),
                multiplier: 0.95,
                description: "-5 reputation".to_string(),
            },
        ],
    }
}

/// Apply ongoing effects of active market conditions to the game state
pub fn apply_market_modifiers(state: &mut GameState, conditions: &[MarketCondition]) {
    // Create a map of stat multipliers
    let mut multipliers = HashMap::new();
    for condition in conditions {
        for modifier in &condition.modifiers {
            let entry = multipliers.entry(modifier.stat_affected.clone()).or_insert(1.0);
            *entry *= modifier.multiplier;
        }
    }

    // Apply multipliers to relevant stats
    if let Some(m) = multipliers.get("wau_growth") {
        state.wau_growth_rate *= *m;
    }
    if let Some(m) = multipliers.get("burn") {
        state.burn *= *m;
    }
    if let Some(m) = multipliers.get("churn_rate") {
        state.churn_rate *= *m;
    }
    if let Some(m) = multipliers.get("velocity") {
        state.velocity *= *m;
    }
    if let Some(m) = multipliers.get("morale") {
        state.morale *= *m;
    }
    if let Some(m) = multipliers.get("reputation") {
        state.reputation *= *m;
    }
    if let Some(m) = multipliers.get("compliance_risk") {
        state.compliance_risk *= *m;
    }

    // Note: Other modifiers like fundraising_success, hiring_cost are used in action resolution
}

/// Get the list of active market conditions
pub fn get_active_conditions(state: &GameState) -> Vec<MarketCondition> {
    state.active_market_conditions.clone()
}

/// Update market conditions: decrement durations, remove expired, generate new
pub fn update_market_conditions(state: &mut GameState) {
    // Decrement durations
    for condition in &mut state.active_market_conditions {
        condition.duration_weeks = condition.duration_weeks.saturating_sub(1);
    }

    // Remove expired
    state.active_market_conditions.retain(|c| c.duration_weeks > 0);

    // Generate new condition
    if let Some(new_condition) = generate_market_condition(state, state.week) {
        state.active_market_conditions.push(new_condition);
    }
}

/// Get effectiveness modifier for an action based on active market conditions
pub fn get_action_effectiveness_modifier(action: &Action, conditions: &[MarketCondition]) -> f64 {
    let mut modifier = 1.0;

    for condition in conditions {
        match condition.id.as_str() {
            "BullMarket" => match action {
                Action::Fundraise { .. } => modifier *= 1.5,
                Action::PaidAds { .. } => modifier *= 1.1,
                _ => {}
            },
            "Recession" => match action {
                Action::Fundraise { .. } => modifier *= 0.6,
                Action::Hire => modifier *= 0.8, // cheaper but harder?
                _ => {}
            },
            "CompetitorLaunch" => match action {
                Action::PaidAds { .. } => modifier *= 0.7,
                Action::ContentLaunch { .. } => modifier *= 0.9,
                _ => {}
            },
            "TechBoom" => match action {
                Action::Hire => modifier *= 1.2, // better talent
                Action::Fundraise { .. } => modifier *= 1.25,
                _ => {}
            },
            "RegulationChange" => match action {
                Action::ComplianceWork { .. } => modifier *= 1.2,
                Action::ShipFeature { .. } => modifier *= 0.9,
                _ => {}
            },
            "TalentWar" => match action {
                Action::Hire => modifier *= 0.7, // expensive
                Action::Coach { .. } => modifier *= 1.1, // retain talent
                _ => {}
            },
            "ViralTrend" => match action {
                Action::ContentLaunch { .. } => modifier *= 1.3,
                Action::PaidAds { .. } => modifier *= 1.2,
                _ => {}
            },
            "SupplyChainDisruption" => match action {
                Action::ProcessImprovement => modifier *= 1.1,
                Action::IncidentResponse => modifier *= 0.9,
                _ => {}
            },
            "EconomicStimulus" => match action {
                Action::Fundraise { .. } => modifier *= 1.2,
                Action::FounderLedSales { .. } => modifier *= 1.1,
                _ => {}
            },
            "IndustryConsolidation" => match action {
                Action::Fundraise { .. } => modifier *= 1.15,
                Action::DevRel { .. } => modifier *= 0.95,
                _ => {}
            },
            "TechCrunch" => match action {
                Action::ContentLaunch { .. } => modifier *= 1.2,
                Action::DevRel { .. } => modifier *= 1.1,
                _ => {}
            },
            "DataBreachScare" => match action {
                Action::ComplianceWork { .. } => modifier *= 1.3,
                Action::IncidentResponse => modifier *= 1.1,
                _ => {}
            },
            _ => {}
        }
    }

    modifier.clamp(0.5, 2.0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game::state::DifficultyMode;

    #[test]
    fn test_generate_market_condition() {
        let state = GameState::new(DifficultyMode::IndieBootstrap);
        let condition = generate_market_condition(&state, 1);
        // Since 15% chance, might be None, but if Some, check structure
        if let Some(c) = condition {
            assert!(!c.id.is_empty());
            assert!(!c.name.is_empty());
            assert!(c.duration_weeks >= 4 && c.duration_weeks <= 8);
            assert!(!c.modifiers.is_empty());
        }
    }

    #[test]
    fn test_get_modifiers_for_event() {
        let modifiers = get_modifiers_for_event(&MarketEvent::BullMarket);
        assert!(!modifiers.is_empty());
        assert!(modifiers.iter().any(|m| m.stat_affected == "fundraising_success"));
    }

    #[test]
    fn test_get_action_effectiveness_modifier() {
        let conditions = vec![MarketCondition {
            id: "BullMarket".to_string(),
            name: "Bull Market".to_string(),
            description: "".to_string(),
            duration_weeks: 5,
            modifiers: vec![],
        }];
        let action = Action::Fundraise { target: 100000.0 };
        let modifier = get_action_effectiveness_modifier(&action, &conditions);
        assert_eq!(modifier, 1.5);
    }
}