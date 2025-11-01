use serde::{Deserialize, Serialize};
use super::state::GameState;

/// Compounding effects that reward long-term good practices
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompoundingEffect {
    pub id: String,
    pub name: String,
    pub description: String,
    pub active: bool,
    pub weeks_active: u8,
    pub bonus_multiplier: f64, // Increases the longer it's active
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompoundingBonus {
    pub effect_id: String,
    pub name: String,
    pub message: String,
    pub bonuses: Vec<StatBonus>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatBonus {
    pub stat_name: String,
    pub bonus_amount: f64,
    pub is_multiplier: bool, // true = multiplier (1.2x), false = additive (+20)
}

/// Check and apply compounding effects based on sustained good practices
pub fn check_compounding_effects(state: &GameState, history_weeks: usize) -> Vec<CompoundingBonus> {
    let mut bonuses = Vec::new();

    // 1. Engineering Excellence - Sustained low tech debt + high velocity
    if state.tech_debt < 25.0 && state.velocity > 0.8 {
        let weeks_sustained = count_consecutive_weeks(
            &state.history,
            history_weeks,
            |snapshot| {
                // Estimate velocity from momentum (rough approximation)
                snapshot.momentum > 0.7
            },
        );

        if weeks_sustained >= 4 {
            let bonus_strength = (weeks_sustained as f64 / 4.0).min(2.0); // Caps at 2x
            bonuses.push(CompoundingBonus {
                effect_id: "engineering_excellence".to_string(),
                name: "Engineering Excellence".to_string(),
                message: format!(
                    "Clean codebase pays dividends! {} weeks of disciplined engineering means you ship {}% faster with fewer bugs.",
                    weeks_sustained,
                    (bonus_strength * 10.0) as u32
                ),
                bonuses: vec![
                    StatBonus {
                        stat_name: "Velocity".to_string(),
                        bonus_amount: 0.05 * bonus_strength,
                        is_multiplier: true,
                    },
                    StatBonus {
                        stat_name: "Morale".to_string(),
                        bonus_amount: 5.0 * bonus_strength,
                        is_multiplier: false,
                    },
                ],
            });
        }
    }

    // 2. Customer Love - High NPS sustained
    if state.nps > 60.0 && state.wau > 200 {
        let weeks_sustained = count_consecutive_weeks(
            &state.history,
            history_weeks,
            |snapshot| snapshot.reputation > 60.0,
        );

        if weeks_sustained >= 6 {
            let bonus_strength = (weeks_sustained as f64 / 6.0).min(2.0);
            bonuses.push(CompoundingBonus {
                effect_id: "customer_love".to_string(),
                name: "Customer Love".to_string(),
                message: format!(
                    "Happy customers are your best salespeople! {} weeks of customer love means {}% organic growth from word of mouth.",
                    weeks_sustained,
                    (bonus_strength * 20.0) as u32
                ),
                bonuses: vec![
                    StatBonus {
                        stat_name: "WAU Growth".to_string(),
                        bonus_amount: 3.0 * bonus_strength,
                        is_multiplier: false,
                    },
                    StatBonus {
                        stat_name: "Churn Rate".to_string(),
                        bonus_amount: -2.0 * bonus_strength,
                        is_multiplier: false,
                    },
                ],
            });
        }
    }

    // 3. Strong Culture - Sustained high morale
    if state.morale > 75.0 {
        let weeks_sustained = count_consecutive_weeks(
            &state.history,
            history_weeks,
            |snapshot| snapshot.morale > 75.0,
        );

        if weeks_sustained >= 8 {
            let bonus_strength = (weeks_sustained as f64 / 8.0).min(2.0);
            bonuses.push(CompoundingBonus {
                effect_id: "strong_culture".to_string(),
                name: "Strong Culture".to_string(),
                message: format!(
                    "Culture compounds! {} weeks of high morale means great people attract great people. Productivity +{}%.",
                    weeks_sustained,
                    (bonus_strength * 15.0) as u32
                ),
                bonuses: vec![
                    StatBonus {
                        stat_name: "Velocity".to_string(),
                        bonus_amount: 0.1 * bonus_strength,
                        is_multiplier: true,
                    },
                    StatBonus {
                        stat_name: "Reputation".to_string(),
                        bonus_amount: 5.0 * bonus_strength,
                        is_multiplier: false,
                    },
                ],
            });
        }
    }

    // 4. Financial Discipline - Strong runway sustained
    if state.runway_months > 12.0 {
        let burn_efficiency = if state.burn > 0.0 {
            state.mrr / state.burn
        } else {
            0.0
        };

        if burn_efficiency > 0.5 {
            let weeks_sustained = count_consecutive_weeks(
                &state.history,
                history_weeks,
                |snapshot| snapshot.bank / snapshot.burn > 3.0, // >3 months runway in past
            );

            if weeks_sustained >= 8 {
                let bonus_strength = (weeks_sustained as f64 / 8.0).min(2.0);
                bonuses.push(CompoundingBonus {
                    effect_id: "financial_discipline".to_string(),
                    name: "Financial Discipline".to_string(),
                    message: format!(
                        "Runway is freedom! {} weeks of strong finances means you can make decisions from strength, not desperation. Negotiating power +{}%.",
                        weeks_sustained,
                        (bonus_strength * 25.0) as u32
                    ),
                    bonuses: vec![
                        StatBonus {
                            stat_name: "Reputation".to_string(),
                            bonus_amount: 10.0 * bonus_strength,
                            is_multiplier: false,
                        },
                        StatBonus {
                            stat_name: "Morale".to_string(),
                            bonus_amount: 5.0 * bonus_strength,
                            is_multiplier: false,
                        },
                    ],
                });
            }
        }
    }

    // 5. Momentum Master - Sustained growth
    if state.wau_growth_rate > 8.0 && state.churn_rate < 8.0 {
        let weeks_sustained = count_consecutive_weeks(
            &state.history,
            history_weeks,
            |snapshot| {
                // Check if growth was positive in history
                if let Some(prev_wau) = snapshot.wau.checked_sub(10) {
                    snapshot.wau > prev_wau
                } else {
                    false
                }
            },
        );

        if weeks_sustained >= 6 {
            let bonus_strength = (weeks_sustained as f64 / 6.0).min(2.0);
            bonuses.push(CompoundingBonus {
                effect_id: "momentum_master".to_string(),
                name: "Momentum Master".to_string(),
                message: format!(
                    "Growth begets growth! {} weeks of consistent wins builds unstoppable momentum. Network effects +{}%.",
                    weeks_sustained,
                    (bonus_strength * 20.0) as u32
                ),
                bonuses: vec![
                    StatBonus {
                        stat_name: "WAU Growth".to_string(),
                        bonus_amount: 2.0 * bonus_strength,
                        is_multiplier: false,
                    },
                    StatBonus {
                        stat_name: "Reputation".to_string(),
                        bonus_amount: 8.0 * bonus_strength,
                        is_multiplier: false,
                    },
                ],
            });
        }
    }

    // 6. Sustainable Pace - Avoiding burnout
    if state.morale > 65.0 && state.velocity > 0.7 {
        let weeks_sustained = count_consecutive_weeks(
            &state.history,
            history_weeks,
            |snapshot| snapshot.morale > 60.0,
        );

        if weeks_sustained >= 10 {
            let bonus_strength = (weeks_sustained as f64 / 10.0).min(1.5);
            bonuses.push(CompoundingBonus {
                effect_id: "sustainable_pace".to_string(),
                name: "Sustainable Pace".to_string(),
                message: format!(
                    "Marathon, not sprint! {} weeks of sustainable pace means you're building something lasting. Endurance +{}%.",
                    weeks_sustained,
                    (bonus_strength * 15.0) as u32
                ),
                bonuses: vec![
                    StatBonus {
                        stat_name: "Morale Decay".to_string(),
                        bonus_amount: -0.3 * bonus_strength,
                        is_multiplier: false,
                    },
                    StatBonus {
                        stat_name: "Velocity".to_string(),
                        bonus_amount: 0.05 * bonus_strength,
                        is_multiplier: true,
                    },
                ],
            });
        }
    }

    bonuses
}

/// Count consecutive weeks where a condition was true
fn count_consecutive_weeks<F>(
    history: &[super::state::WeekSnapshot],
    max_lookback: usize,
    condition: F,
) -> u8
where
    F: Fn(&super::state::WeekSnapshot) -> bool,
{
    let lookback = max_lookback.min(history.len());
    let recent_history = &history[history.len().saturating_sub(lookback)..];

    let mut consecutive = 0u8;
    for snapshot in recent_history.iter().rev() {
        if condition(snapshot) {
            consecutive += 1;
        } else {
            break;
        }
    }

    consecutive
}

/// Apply compounding bonuses to game state
pub fn apply_compounding_bonuses(state: &mut GameState, bonuses: &[CompoundingBonus]) {
    for bonus in bonuses {
        for stat_bonus in &bonus.bonuses {
            match stat_bonus.stat_name.as_str() {
                "Velocity" => {
                    if stat_bonus.is_multiplier {
                        state.velocity *= 1.0 + stat_bonus.bonus_amount;
                    } else {
                        state.velocity += stat_bonus.bonus_amount;
                    }
                }
                "Morale" => {
                    state.morale += stat_bonus.bonus_amount;
                }
                "WAU Growth" => {
                    state.wau_growth_rate += stat_bonus.bonus_amount;
                }
                "Churn Rate" => {
                    state.churn_rate += stat_bonus.bonus_amount; // Can be negative (reduction)
                }
                "Reputation" => {
                    state.reputation += stat_bonus.bonus_amount;
                }
                "Morale Decay" => {
                    // This would reduce the natural morale decay in advance_week
                    // For now, apply as morale boost
                    state.morale += stat_bonus.bonus_amount.abs() * 2.0;
                }
                _ => {}
            }
        }
    }

    // Clamp values after applying bonuses
    state.update_derived_metrics();
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game::state::{DifficultyMode, WeekSnapshot};

    #[test]
    fn test_engineering_excellence() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        state.tech_debt = 20.0;
        state.velocity = 0.9;

        // Create history showing sustained good practices
        for i in 0..6 {
            state.history.push(WeekSnapshot {
                week: i,
                bank: 50000.0,
                mrr: 1000.0,
                burn: 8000.0,
                wau: 200,
                morale: 80.0,
                reputation: 70.0,
                momentum: 0.8,
            });
        }

        let bonuses = check_compounding_effects(&state, 10);

        assert!(!bonuses.is_empty());
        assert!(bonuses.iter().any(|b| b.effect_id == "engineering_excellence"));
    }

    #[test]
    fn test_customer_love() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        state.nps = 70.0;
        state.wau = 500;

        // Create history showing sustained high reputation
        for i in 0..8 {
            state.history.push(WeekSnapshot {
                week: i,
                bank: 50000.0,
                mrr: 5000.0,
                burn: 8000.0,
                wau: 400 + (i * 10) as u32,
                morale: 75.0,
                reputation: 70.0,
                momentum: 0.7,
            });
        }

        let bonuses = check_compounding_effects(&state, 10);

        assert!(bonuses.iter().any(|b| b.effect_id == "customer_love"));
    }

    #[test]
    fn test_count_consecutive_weeks() {
        let history = vec![
            WeekSnapshot {
                week: 0,
                bank: 50000.0,
                mrr: 1000.0,
                burn: 8000.0,
                wau: 100,
                morale: 80.0,
                reputation: 60.0,
                momentum: 0.7,
            },
            WeekSnapshot {
                week: 1,
                bank: 50000.0,
                mrr: 1000.0,
                burn: 8000.0,
                wau: 100,
                morale: 85.0,
                reputation: 65.0,
                momentum: 0.7,
            },
            WeekSnapshot {
                week: 2,
                bank: 50000.0,
                mrr: 1000.0,
                burn: 8000.0,
                wau: 100,
                morale: 90.0,
                reputation: 70.0,
                momentum: 0.7,
            },
        ];

        let count = count_consecutive_weeks(&history, 10, |s| s.morale > 75.0);
        assert_eq!(count, 2); // Last 2 weeks had morale > 75
    }

    #[test]
    fn test_apply_bonuses() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        let initial_velocity = state.velocity;
        let initial_morale = state.morale;

        let bonuses = vec![CompoundingBonus {
            effect_id: "test".to_string(),
            name: "Test Bonus".to_string(),
            message: "Testing".to_string(),
            bonuses: vec![
                StatBonus {
                    stat_name: "Velocity".to_string(),
                    bonus_amount: 0.1,
                    is_multiplier: true,
                },
                StatBonus {
                    stat_name: "Morale".to_string(),
                    bonus_amount: 10.0,
                    is_multiplier: false,
                },
            ],
        }];

        apply_compounding_bonuses(&mut state, &bonuses);

        assert!(state.velocity > initial_velocity);
        assert_eq!(state.morale, initial_morale + 10.0);
    }
}
