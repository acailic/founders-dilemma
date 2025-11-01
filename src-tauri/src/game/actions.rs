use serde::{Deserialize, Serialize};
use rand::Rng;
use super::state::GameState;

/// Quality level for features
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Quality {
    Quick,      // Ship fast, +momentum, +tech_debt
    Balanced,   // Normal trade-off
    Polish,     // Ship slow, +reputation, -tech_debt
}

/// Player actions available each turn
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Action {
    // PRODUCT (Focus: 1-2 slots)
    ShipFeature { quality: Quality },

    // SALES & GROWTH (Focus: 1 slot)
    FounderLedSales { call_count: u8 },

    // TEAM (Focus: 1-2 slots)
    Hire,

    // CAPITAL (Focus: 2 slots)
    Fundraise { target: f64 },

    // RECOVERY (Focus: 0.5 slots)
    TakeBreak,
}

impl Action {
    /// Get focus cost for this action
    pub fn focus_cost(&self) -> u8 {
        match self {
            Action::ShipFeature { .. } => 1,
            Action::FounderLedSales { .. } => 1,
            Action::Hire => 2,
            Action::Fundraise { .. } => 2,
            Action::TakeBreak => 1,
        }
    }
}

/// Result of applying an action
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionResult {
    pub success: bool,
    pub message: String,
    pub effects: Vec<StatEffect>,
}

/// Individual stat change from an action
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatEffect {
    pub stat_name: String,
    pub old_value: f64,
    pub new_value: f64,
    pub delta: f64,
}

/// Apply an action to the game state
pub fn resolve_action(state: &mut GameState, action: &Action) -> ActionResult {
    let mut rng = rand::thread_rng();
    let mut effects = Vec::new();

    match action {
        Action::ShipFeature { quality } => {
            let message = match quality {
                Quality::Quick => "Shipped feature quickly - gained momentum but added tech debt",
                Quality::Balanced => "Shipped feature with balanced approach",
                Quality::Polish => "Polished feature launch - high quality, slower delivery",
            };

            // Base effects with variance
            let (wau_boost, debt_change, _momentum_change, morale_change) = match quality {
                Quality::Quick => {
                    let wau = 3.0 + rng.gen_range(-1.5..1.5);
                    let debt = 6.0 + rng.gen_range(-2.0..2.0);
                    let momentum = 8.0 + rng.gen_range(-3.0..3.0);
                    let morale = -1.0 + rng.gen_range(-0.5..0.5);
                    (wau, debt, momentum, morale)
                }
                Quality::Balanced => {
                    let wau = 4.0 + rng.gen_range(-1.5..1.5);
                    let debt = 2.0 + rng.gen_range(-1.0..1.0);
                    let momentum = 5.0 + rng.gen_range(-2.0..2.0);
                    let morale = 1.0 + rng.gen_range(-0.5..0.5);
                    (wau, debt, momentum, morale)
                }
                Quality::Polish => {
                    let wau = 2.0 + rng.gen_range(-1.0..1.0);
                    let debt = -3.0 + rng.gen_range(-1.0..1.0);
                    let momentum = 2.0 + rng.gen_range(-1.0..1.0);
                    let morale = 3.0 + rng.gen_range(-1.0..1.0);
                    (wau, debt, momentum, morale)
                }
            };

            // Apply effects
            let old_wau = state.wau;
            state.wau = (state.wau as f64 * (1.0 + wau_boost / 100.0)) as u32;
            effects.push(StatEffect {
                stat_name: "WAU".to_string(),
                old_value: old_wau as f64,
                new_value: state.wau as f64,
                delta: (state.wau - old_wau) as f64,
            });

            let old_debt = state.tech_debt;
            state.tech_debt += debt_change;
            effects.push(StatEffect {
                stat_name: "Tech Debt".to_string(),
                old_value: old_debt,
                new_value: state.tech_debt,
                delta: debt_change,
            });

            let old_morale = state.morale;
            state.morale += morale_change;
            effects.push(StatEffect {
                stat_name: "Morale".to_string(),
                old_value: old_morale,
                new_value: state.morale,
                delta: morale_change,
            });

            // Update velocity based on tech debt
            let old_velocity = state.velocity;
            state.velocity = 1.0 - (state.tech_debt / 200.0);
            effects.push(StatEffect {
                stat_name: "Velocity".to_string(),
                old_value: old_velocity,
                new_value: state.velocity,
                delta: state.velocity - old_velocity,
            });

            ActionResult {
                success: true,
                message: message.to_string(),
                effects,
            }
        }

        Action::FounderLedSales { call_count } => {
            let message = format!("Made {} sales calls this week", call_count);

            // Each call has a chance to convert
            let conversion_rate = 0.05 + (state.reputation / 200.0);
            let base_deal_size = 500.0;

            let mut new_mrr = 0.0;
            for _ in 0..*call_count {
                if rng.gen_bool(conversion_rate) {
                    new_mrr += base_deal_size * (0.8 + rng.gen_range(0.0..0.4));
                }
            }

            let old_mrr = state.mrr;
            state.mrr += new_mrr;
            effects.push(StatEffect {
                stat_name: "MRR".to_string(),
                old_value: old_mrr,
                new_value: state.mrr,
                delta: new_mrr,
            });

            // Sales takes energy
            let morale_cost = (*call_count as f64) * 0.5;
            let old_morale = state.morale;
            state.morale -= morale_cost;
            effects.push(StatEffect {
                stat_name: "Morale".to_string(),
                old_value: old_morale,
                new_value: state.morale,
                delta: -morale_cost,
            });

            // Small reputation gain
            let old_rep = state.reputation;
            state.reputation += 1.0;
            effects.push(StatEffect {
                stat_name: "Reputation".to_string(),
                old_value: old_rep,
                new_value: state.reputation,
                delta: 1.0,
            });

            ActionResult {
                success: new_mrr > 0.0,
                message,
                effects,
            }
        }

        Action::Hire => {
            let message = "Hired a new team member";

            // Hiring costs
            let salary = 10_000.0;
            let old_burn = state.burn;
            state.burn += salary;
            effects.push(StatEffect {
                stat_name: "Monthly Burn".to_string(),
                old_value: old_burn,
                new_value: state.burn,
                delta: salary,
            });

            // Velocity boost (takes time to ramp)
            let old_velocity = state.velocity;
            state.velocity += 0.1;
            effects.push(StatEffect {
                stat_name: "Velocity".to_string(),
                old_value: old_velocity,
                new_value: state.velocity,
                delta: 0.1,
            });

            // Morale boost (team growth)
            let old_morale = state.morale;
            state.morale += 5.0;
            effects.push(StatEffect {
                stat_name: "Morale".to_string(),
                old_value: old_morale,
                new_value: state.morale,
                delta: 5.0,
            });

            ActionResult {
                success: true,
                message: message.to_string(),
                effects,
            }
        }

        Action::Fundraise { target } => {
            // Simplified fundraising
            let success_chance = 0.3 + (state.reputation / 200.0) + (state.momentum / 100.0);
            let success = rng.gen_bool(success_chance.clamp(0.0, 0.8));

            if success {
                let dilution = (target / 5_000_000.0) * 20.0; // Rough dilution calc

                let old_bank = state.bank;
                state.bank += target;
                effects.push(StatEffect {
                    stat_name: "Bank".to_string(),
                    old_value: old_bank,
                    new_value: state.bank,
                    delta: *target,
                });

                let old_equity = state.founder_equity;
                state.founder_equity -= dilution;
                effects.push(StatEffect {
                    stat_name: "Founder Equity".to_string(),
                    old_value: old_equity,
                    new_value: state.founder_equity,
                    delta: -dilution,
                });

                ActionResult {
                    success: true,
                    message: format!("Raised ${:.0}! Dilution: {:.1}%", target, dilution),
                    effects,
                }
            } else {
                // Morale hit from failed fundraise
                let old_morale = state.morale;
                state.morale -= 10.0;
                effects.push(StatEffect {
                    stat_name: "Morale".to_string(),
                    old_value: old_morale,
                    new_value: state.morale,
                    delta: -10.0,
                });

                ActionResult {
                    success: false,
                    message: "Fundraising failed - investors passed".to_string(),
                    effects,
                }
            }
        }

        Action::TakeBreak => {
            let message = "Took a break to recharge";

            // Restore morale
            let old_morale = state.morale;
            state.morale += 15.0;
            effects.push(StatEffect {
                stat_name: "Morale".to_string(),
                old_value: old_morale,
                new_value: state.morale,
                delta: 15.0,
            });

            // Slight momentum loss
            let momentum_loss = 2.0;
            let old_wau_growth = state.wau_growth_rate;
            state.wau_growth_rate -= momentum_loss;
            effects.push(StatEffect {
                stat_name: "WAU Growth".to_string(),
                old_value: old_wau_growth,
                new_value: state.wau_growth_rate,
                delta: -momentum_loss,
            });

            ActionResult {
                success: true,
                message: message.to_string(),
                effects,
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game::state::DifficultyMode;

    #[test]
    fn test_ship_feature_quick() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        let initial_wau = state.wau;
        let initial_debt = state.tech_debt;

        let action = Action::ShipFeature { quality: Quality::Quick };
        let result = resolve_action(&mut state, &action);

        assert!(result.success);
        assert!(state.wau > initial_wau);
        assert!(state.tech_debt > initial_debt);
    }

    #[test]
    fn test_founder_led_sales() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        let initial_mrr = state.mrr;

        let action = Action::FounderLedSales { call_count: 5 };
        let result = resolve_action(&mut state, &action);

        // MRR might increase (probabilistic)
        assert!(state.mrr >= initial_mrr);
        assert!(!result.effects.is_empty());
    }

    #[test]
    fn test_hire() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        let initial_burn = state.burn;
        let initial_velocity = state.velocity;

        let action = Action::Hire;
        let result = resolve_action(&mut state, &action);

        assert!(result.success);
        assert!(state.burn > initial_burn);
        assert!(state.velocity > initial_velocity);
    }

    #[test]
    fn test_take_break() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        state.morale = 50.0;

        let action = Action::TakeBreak;
        let result = resolve_action(&mut state, &action);

        assert!(result.success);
        assert!(state.morale > 50.0);
    }

    #[test]
    fn test_focus_costs() {
        assert_eq!(Action::ShipFeature { quality: Quality::Quick }.focus_cost(), 1);
        assert_eq!(Action::Hire.focus_cost(), 2);
        assert_eq!(Action::TakeBreak.focus_cost(), 1);
    }
}
