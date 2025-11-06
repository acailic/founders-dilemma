use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::game::actions::Action;
use crate::game::state::{GameState, WeekSnapshot};

/// Represents the type of action for synergy detection (ignoring parameters)
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ActionType {
    ShipFeature,
    FounderLedSales,
    Hire,
    Fundraise,
    TakeBreak,
    RefactorCode,
    RunExperiment,
    ContentLaunch,
    DevRel,
    PaidAds,
    Coach,
    Fire,
    ComplianceWork,
    IncidentResponse,
    ProcessImprovement,
}

/// Get the action type from an Action
pub fn get_action_type(action: &Action) -> ActionType {
    match action {
        Action::ShipFeature { .. } => ActionType::ShipFeature,
        Action::FounderLedSales { .. } => ActionType::FounderLedSales,
        Action::Hire => ActionType::Hire,
        Action::Fundraise { .. } => ActionType::Fundraise,
        Action::TakeBreak => ActionType::TakeBreak,
        Action::RefactorCode { .. } => ActionType::RefactorCode,
        Action::RunExperiment { .. } => ActionType::RunExperiment,
        Action::ContentLaunch { .. } => ActionType::ContentLaunch,
        Action::DevRel { .. } => ActionType::DevRel,
        Action::PaidAds { .. } => ActionType::PaidAds,
        Action::Coach { .. } => ActionType::Coach,
        Action::Fire { .. } => ActionType::Fire,
        Action::ComplianceWork { .. } => ActionType::ComplianceWork,
        Action::IncidentResponse => ActionType::IncidentResponse,
        Action::ProcessImprovement => ActionType::ProcessImprovement,
    }
}

/// Bonus effect from a synergy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SynergyBonus {
    pub stat_name: String,
    pub bonus_amount: f64,
    pub is_multiplier: bool,
}

/// Action synergy definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionSynergy {
    pub id: String,
    pub name: String,
    pub description: String,
    pub required_actions: Vec<ActionType>,
    pub bonus_effects: Vec<SynergyBonus>,
}

/// Specialization paths for consistent strategies
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SpecializationPath {
    ProductExcellence,
    GrowthHacking,
    OperationalEfficiency,
    CustomerObsessed,
}

/// Get all possible synergies
pub fn get_all_synergies() -> Vec<ActionSynergy> {
    vec![
        ActionSynergy {
            id: "launch_momentum".to_string(),
            name: "Launch Momentum".to_string(),
            description: "Shipping features with content creates launch momentum".to_string(),
            required_actions: vec![ActionType::ShipFeature, ActionType::ContentLaunch],
            bonus_effects: vec![SynergyBonus {
                stat_name: "WAU".to_string(),
                bonus_amount: 0.15,
                is_multiplier: true,
            }],
        },
        ActionSynergy {
            id: "product_credibility".to_string(),
            name: "Product Credibility".to_string(),
            description: "DevRel amplifies product launches".to_string(),
            required_actions: vec![ActionType::ShipFeature, ActionType::DevRel],
            bonus_effects: vec![
                SynergyBonus {
                    stat_name: "Reputation".to_string(),
                    bonus_amount: 10.0,
                    is_multiplier: false,
                },
                SynergyBonus {
                    stat_name: "WAU".to_string(),
                    bonus_amount: 0.05,
                    is_multiplier: true,
                },
            ],
        },
        ActionSynergy {
            id: "feature_launch".to_string(),
            name: "Feature Launch".to_string(),
            description: "Paid ads boost feature adoption".to_string(),
            required_actions: vec![ActionType::ShipFeature, ActionType::PaidAds],
            bonus_effects: vec![
                SynergyBonus {
                    stat_name: "WAU".to_string(),
                    bonus_amount: 0.20,
                    is_multiplier: true,
                },
                SynergyBonus {
                    stat_name: "Burn".to_string(),
                    bonus_amount: -0.10,
                    is_multiplier: true,
                },
            ],
        },
        ActionSynergy {
            id: "engineering_excellence".to_string(),
            name: "Engineering Excellence".to_string(),
            description: "Refactoring with coaching builds strong engineering".to_string(),
            required_actions: vec![ActionType::RefactorCode, ActionType::Coach],
            bonus_effects: vec![SynergyBonus {
                stat_name: "Velocity".to_string(),
                bonus_amount: 0.2,
                is_multiplier: false,
            }],
        },
        ActionSynergy {
            id: "technical_foundation".to_string(),
            name: "Technical Foundation".to_string(),
            description: "Refactoring and process improvement create solid foundations".to_string(),
            required_actions: vec![ActionType::RefactorCode, ActionType::ProcessImprovement],
            bonus_effects: vec![
                SynergyBonus {
                    stat_name: "Velocity".to_string(),
                    bonus_amount: 0.15,
                    is_multiplier: false,
                },
                SynergyBonus {
                    stat_name: "TechDebt".to_string(),
                    bonus_amount: -10.0,
                    is_multiplier: false,
                },
            ],
        },
        ActionSynergy {
            id: "data_driven_content".to_string(),
            name: "Data-Driven Content".to_string(),
            description: "Experiments inform better content".to_string(),
            required_actions: vec![ActionType::RunExperiment, ActionType::ContentLaunch],
            bonus_effects: vec![SynergyBonus {
                stat_name: "Reputation".to_string(),
                bonus_amount: 0.10,
                is_multiplier: true,
            }],
        },
        ActionSynergy {
            id: "credibility_boost".to_string(),
            name: "Credibility Boost".to_string(),
            description: "Sales calls backed by DevRel build trust".to_string(),
            required_actions: vec![ActionType::FounderLedSales, ActionType::DevRel],
            bonus_effects: vec![SynergyBonus {
                stat_name: "Reputation".to_string(),
                bonus_amount: 10.0,
                is_multiplier: false,
            }],
        },
        ActionSynergy {
            id: "sales_team".to_string(),
            name: "Sales Team".to_string(),
            description: "Coaching improves sales effectiveness".to_string(),
            required_actions: vec![ActionType::FounderLedSales, ActionType::Coach],
            bonus_effects: vec![SynergyBonus {
                stat_name: "MRR".to_string(),
                bonus_amount: 0.10,
                is_multiplier: true,
            }],
        },
        ActionSynergy {
            id: "community_building".to_string(),
            name: "Community Building".to_string(),
            description: "Content and DevRel grow engaged communities".to_string(),
            required_actions: vec![ActionType::ContentLaunch, ActionType::DevRel],
            bonus_effects: vec![
                SynergyBonus {
                    stat_name: "WAU".to_string(),
                    bonus_amount: 0.20,
                    is_multiplier: true,
                },
                SynergyBonus {
                    stat_name: "Reputation".to_string(),
                    bonus_amount: 15.0,
                    is_multiplier: false,
                },
            ],
        },
        ActionSynergy {
            id: "integrated_marketing".to_string(),
            name: "Integrated Marketing".to_string(),
            description: "Content amplifies paid ads".to_string(),
            required_actions: vec![ActionType::ContentLaunch, ActionType::PaidAds],
            bonus_effects: vec![SynergyBonus {
                stat_name: "WAU".to_string(),
                bonus_amount: 0.50,
                is_multiplier: true,
            }],
        },
        ActionSynergy {
            id: "full_funnel".to_string(),
            name: "Full Funnel".to_string(),
            description: "DevRel and ads cover the entire funnel".to_string(),
            required_actions: vec![ActionType::DevRel, ActionType::PaidAds],
            bonus_effects: vec![SynergyBonus {
                stat_name: "WAU".to_string(),
                bonus_amount: 0.25,
                is_multiplier: true,
            }],
        },
        ActionSynergy {
            id: "team_development".to_string(),
            name: "Team Development".to_string(),
            description: "Hiring followed by coaching builds strong teams".to_string(),
            required_actions: vec![ActionType::Hire, ActionType::Coach],
            bonus_effects: vec![
                SynergyBonus {
                    stat_name: "Velocity".to_string(),
                    bonus_amount: 0.15,
                    is_multiplier: false,
                },
                SynergyBonus {
                    stat_name: "Morale".to_string(),
                    bonus_amount: 10.0,
                    is_multiplier: false,
                },
            ],
        },
        ActionSynergy {
            id: "scalable_operations".to_string(),
            name: "Scalable Operations".to_string(),
            description: "Hiring with process improvement enables scaling".to_string(),
            required_actions: vec![ActionType::Hire, ActionType::ProcessImprovement],
            bonus_effects: vec![
                SynergyBonus {
                    stat_name: "Burn".to_string(),
                    bonus_amount: -0.15,
                    is_multiplier: true,
                },
                SynergyBonus {
                    stat_name: "Velocity".to_string(),
                    bonus_amount: 0.1,
                    is_multiplier: false,
                },
            ],
        },
        ActionSynergy {
            id: "regulatory_excellence".to_string(),
            name: "Regulatory Excellence".to_string(),
            description: "Compliance work and processes ensure regulatory compliance".to_string(),
            required_actions: vec![ActionType::ComplianceWork, ActionType::ProcessImprovement],
            bonus_effects: vec![SynergyBonus {
                stat_name: "ComplianceRisk".to_string(),
                bonus_amount: -20.0,
                is_multiplier: false,
            }],
        },
        ActionSynergy {
            id: "incident_prevention".to_string(),
            name: "Incident Prevention".to_string(),
            description: "Responding to incidents with process improvement prevents future issues".to_string(),
            required_actions: vec![ActionType::IncidentResponse, ActionType::ProcessImprovement],
            bonus_effects: vec![SynergyBonus {
                stat_name: "TechDebt".to_string(),
                bonus_amount: -5.0,
                is_multiplier: false,
            }],
        },
        ActionSynergy {
            id: "growth_capital".to_string(),
            name: "Growth Capital".to_string(),
            description: "Fundraising enables better hiring".to_string(),
            required_actions: vec![ActionType::Fundraise, ActionType::Hire],
            bonus_effects: vec![SynergyBonus {
                stat_name: "Velocity".to_string(),
                bonus_amount: 0.20,
                is_multiplier: true,
            }],
        },
        ActionSynergy {
            id: "marketing_budget".to_string(),
            name: "Marketing Budget".to_string(),
            description: "Fundraising boosts marketing effectiveness".to_string(),
            required_actions: vec![ActionType::Fundraise, ActionType::PaidAds],
            bonus_effects: vec![SynergyBonus {
                stat_name: "WAU".to_string(),
                bonus_amount: 0.30,
                is_multiplier: true,
            }],
        },
        ActionSynergy {
            id: "founder_wellness".to_string(),
            name: "Founder Wellness".to_string(),
            description: "Breaks with coaching maintain founder health".to_string(),
            required_actions: vec![ActionType::TakeBreak, ActionType::Coach],
            bonus_effects: vec![
                SynergyBonus {
                    stat_name: "Morale".to_string(),
                    bonus_amount: 20.0,
                    is_multiplier: false,
                },
                SynergyBonus {
                    stat_name: "Reputation".to_string(),
                    bonus_amount: 5.0,
                    is_multiplier: false,
                },
            ],
        },
        ActionSynergy {
            id: "team_restructuring".to_string(),
            name: "Team Restructuring".to_string(),
            description: "Firing and hiring refreshes the team".to_string(),
            required_actions: vec![ActionType::Fire, ActionType::Hire],
            bonus_effects: vec![
                SynergyBonus {
                    stat_name: "Velocity".to_string(),
                    bonus_amount: 0.1,
                    is_multiplier: false,
                },
                SynergyBonus {
                    stat_name: "Morale".to_string(),
                    bonus_amount: -5.0,
                    is_multiplier: false,
                },
            ],
        },
        ActionSynergy {
            id: "optimized_ads".to_string(),
            name: "Optimized Ads".to_string(),
            description: "Experiments optimize ad spend".to_string(),
            required_actions: vec![ActionType::RunExperiment, ActionType::PaidAds],
            bonus_effects: vec![SynergyBonus {
                stat_name: "WAU".to_string(),
                bonus_amount: 0.15,
                is_multiplier: true,
            }],
        },
    ]
}

/// Check for synergies in the selected actions
pub fn check_action_synergies(actions: &[Action]) -> Vec<ActionSynergy> {
    let action_types: std::collections::HashSet<ActionType> = actions.iter().map(get_action_type).collect();
    let all_synergies = get_all_synergies();
    
    all_synergies.into_iter().filter(|synergy| {
        synergy.required_actions.iter().all(|req| action_types.contains(req))
    }).collect()
}

/// Detect specialization path based on action history
pub fn detect_specialization_path(action_history: &[(u32, Vec<Action>)], recent_actions: &[Action]) -> Option<SpecializationPath> {
    // Take last 8 weeks of actions
    let recent_history: Vec<&(u32, Vec<Action>)> = action_history.iter().rev().take(8).collect();
    let mut all_actions = Vec::new();
    
    for (_, actions) in &recent_history {
        all_actions.extend(actions.iter().cloned());
    }
    all_actions.extend(recent_actions.iter().cloned());
    
    if all_actions.is_empty() {
        return None;
    }
    
    let total_actions = all_actions.len() as f64;
    let mut category_counts = HashMap::new();
    
    for action in &all_actions {
        let category = match get_action_type(action) {
            ActionType::ShipFeature | ActionType::RefactorCode | ActionType::RunExperiment => "product",
            ActionType::FounderLedSales | ActionType::ContentLaunch | ActionType::DevRel | ActionType::PaidAds => "growth",
            ActionType::ComplianceWork | ActionType::IncidentResponse | ActionType::ProcessImprovement => "ops",
            ActionType::Hire | ActionType::Coach | ActionType::Fire => "team",
            _ => "other",
        };
        *category_counts.entry(category).or_insert(0.0) += 1.0;
    }
    
    let product_pct = *category_counts.get("product").unwrap_or(&0.0) / total_actions;
    let growth_pct = *category_counts.get("growth").unwrap_or(&0.0) / total_actions;
    let ops_pct = *category_counts.get("ops").unwrap_or(&0.0) / total_actions;
    let team_pct = *category_counts.get("team").unwrap_or(&0.0) / total_actions;
    
    // CustomerObsessed: high growth + some team
    let customer_pct = growth_pct + team_pct * 0.5;
    
    if product_pct >= 0.6 {
        Some(SpecializationPath::ProductExcellence)
    } else if growth_pct >= 0.6 {
        Some(SpecializationPath::GrowthHacking)
    } else if ops_pct >= 0.6 {
        Some(SpecializationPath::OperationalEfficiency)
    } else if customer_pct >= 0.6 {
        Some(SpecializationPath::CustomerObsessed)
    } else {
        None
    }
}

/// Apply synergy bonuses to the game state
pub fn apply_synergy_bonuses(state: &mut GameState, synergies: &[ActionSynergy]) {
    for synergy in synergies {
        for bonus in &synergy.bonus_effects {
            match bonus.stat_name.as_str() {
                "WAU" => {
                    let mut wau = state.wau as f64;
                    apply_bonus(&mut wau, bonus);
                    state.wau = wau.max(0.0).round() as u32;
                }
                "MRR" => {
                    apply_bonus(&mut state.mrr, bonus);
                    state.mrr = state.mrr.max(0.0);
                }
                "Burn" => {
                    apply_bonus(&mut state.burn, bonus);
                    state.burn = state.burn.max(0.0);
                }
                "Velocity" => {
                    apply_bonus(&mut state.velocity, bonus);
                    state.velocity = state.velocity.clamp(0.0, 5.0);
                }
                "Morale" => {
                    apply_bonus(&mut state.morale, bonus);
                    state.morale = state.morale.clamp(0.0, 100.0);
                }
                "Reputation" => {
                    apply_bonus(&mut state.reputation, bonus);
                    state.reputation = state.reputation.clamp(0.0, 100.0);
                }
                "TechDebt" => {
                    apply_bonus(&mut state.tech_debt, bonus);
                    state.tech_debt = state.tech_debt.clamp(0.0, 100.0);
                }
                "ComplianceRisk" => {
                    apply_bonus(&mut state.compliance_risk, bonus);
                    state.compliance_risk = state.compliance_risk.clamp(0.0, 100.0);
                }
                _ => continue,
            }
        }
    }
    state.update_derived_metrics();
}

fn apply_bonus(value: &mut f64, bonus: &SynergyBonus) {
    if bonus.is_multiplier {
        *value *= 1.0 + bonus.bonus_amount;
    } else {
        *value += bonus.bonus_amount;
    }
}

/// Calculate a score for how well actions work together
pub fn calculate_action_combo_score(actions: &[Action]) -> f64 {
    let synergies = check_action_synergies(actions);
    let base_score = synergies.len() as f64 * 0.3;
    let bonus_score: f64 = synergies.iter().map(|s| s.bonus_effects.len() as f64 * 0.1).sum();
    (base_score + bonus_score).min(2.0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game::actions::Action;
    use crate::game::state::DifficultyMode;

    #[test]
    fn test_check_synergies_launch_momentum() {
        let actions = vec![
            Action::ShipFeature { quality: crate::game::actions::Quality::Balanced },
            Action::ContentLaunch { content_type: crate::game::actions::ContentType::BlogPost },
        ];
        let synergies = check_action_synergies(&actions);
        assert!(synergies.iter().any(|s| s.id == "launch_momentum"));
    }

    #[test]
    fn test_detect_product_excellence() {
        let action_history = vec![
            (1, vec![Action::ShipFeature { quality: crate::game::actions::Quality::Balanced }]),
            (2, vec![Action::RefactorCode { depth: crate::game::actions::RefactorDepth::Surface }]),
            (3, vec![Action::RunExperiment { category: crate::game::actions::ExperimentType::Pricing }]),
        ];
        let recent = vec![Action::ShipFeature { quality: crate::game::actions::Quality::Quick }];
        let path = detect_specialization_path(&action_history, &recent);
        assert_eq!(path, Some(SpecializationPath::ProductExcellence));
    }

    #[test]
    fn test_apply_synergy_bonuses() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        let initial_wau = state.wau;
        let synergies = vec![ActionSynergy {
            id: "test".to_string(),
            name: "Test".to_string(),
            description: "Test synergy".to_string(),
            required_actions: vec![],
            bonus_effects: vec![SynergyBonus {
                stat_name: "WAU".to_string(),
                bonus_amount: 10.0,
                is_multiplier: false,
            }],
        }];
        apply_synergy_bonuses(&mut state, &synergies);
        assert_eq!(state.wau, initial_wau + 10);
    }

    #[test]
    fn test_combo_score() {
        let actions = vec![
            Action::ShipFeature { quality: crate::game::actions::Quality::Balanced },
            Action::ContentLaunch { content_type: crate::game::actions::ContentType::BlogPost },
        ];
        let score = calculate_action_combo_score(&actions);
        assert!(score > 0.0);
    }
}
