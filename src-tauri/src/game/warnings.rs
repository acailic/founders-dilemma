use serde::{Deserialize, Serialize};
use super::state::GameState;

/// Warning about impending failure if patterns continue
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FailureWarning {
    pub risk_id: String,
    pub title: String,
    pub current_status: String,
    pub warning_signs: Vec<WarningSign>,
    pub projected_outcome: String,
    pub lesson: String,
    pub weeks_until_critical: Option<u8>,
    pub severity: WarningSeverity,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WarningSign {
    pub week: u32,
    pub observation: String,
    pub indicator_level: f64, // 0-100, how bad it is
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum WarningSeverity {
    Watch,      // Early indicator
    Caution,    // Problem developing
    Danger,     // Immediate risk
    Critical,   // Failure imminent
}

/// Check for failure patterns and generate warnings
pub fn check_failure_warnings(state: &GameState) -> Vec<FailureWarning> {
    let mut warnings = Vec::new();

    // 1. Death March - Sustained low morale leading to team exodus
    if state.morale < 50.0 {
        let morale_trend = analyze_morale_trend(&state.history);
        let weeks_declining = count_declining_weeks(&state.history, |s| s.morale);

        if weeks_declining >= 3 {
            let severity = if state.morale < 30.0 {
                WarningSeverity::Critical
            } else if state.morale < 40.0 {
                WarningSeverity::Danger
            } else {
                WarningSeverity::Caution
            };

            let warning_signs = generate_morale_warning_signs(&state.history);

            warnings.push(FailureWarning {
                risk_id: "death_march".to_string(),
                title: "Death March".to_string(),
                current_status: format!(
                    "Morale at {:.0}%, declining for {} weeks",
                    state.morale, weeks_declining
                ),
                warning_signs,
                projected_outcome: "If this continues: Key people will quit, taking institutional knowledge. Velocity will collapse. Quality will suffer. The remaining team will be demoralized and less productive.".to_string(),
                lesson: "Burnout doesn't happen overnight. The warning signs are there - tired teams, declining quality, cynicism. Act early before you lose your best people. Prevention is always easier than recovery.".to_string(),
                weeks_until_critical: Some(estimate_weeks_until_morale_critical(state.morale, morale_trend)),
                severity,
            });
        }
    }

    // 2. Technical Bankruptcy - Tech debt making progress impossible
    if state.tech_debt > 70.0 {
        let debt_trend = analyze_tech_debt_trend(&state.history);
        let velocity_impact = 1.0 - state.velocity;

        let severity = if state.tech_debt > 90.0 {
            WarningSeverity::Critical
        } else if state.tech_debt > 80.0 {
            WarningSeverity::Danger
        } else {
            WarningSeverity::Caution
        };

        warnings.push(FailureWarning {
            risk_id: "technical_bankruptcy".to_string(),
            title: "Technical Bankruptcy".to_string(),
            current_status: format!(
                "Tech debt at {:.0}%, velocity reduced by {:.0}%",
                state.tech_debt,
                velocity_impact * 100.0
            ),
            warning_signs: vec![
                WarningSign {
                    week: state.week.saturating_sub(4),
                    observation: "Velocity declining each week".to_string(),
                    indicator_level: 60.0,
                },
                WarningSign {
                    week: state.week.saturating_sub(2),
                    observation: "More time debugging than building".to_string(),
                    indicator_level: 75.0,
                },
                WarningSign {
                    week: state.week,
                    observation: "Fear of changing anything".to_string(),
                    indicator_level: state.tech_debt,
                },
            ],
            projected_outcome: "If this continues: Complete rewrite will be needed. Until then, almost nothing can ship. Outages will increase. Customer churn will spike. Competitors will out-ship you.".to_string(),
            lesson: "Tech debt is like credit card debt - the interest compounds fast. Every hack today creates tomorrow's crisis. The 'we'll fix it later' mentality is a trap. Later never comes, and the cost keeps growing.".to_string(),
            weeks_until_critical: Some(estimate_weeks_until_debt_critical(state.tech_debt, debt_trend)),
            severity,
        });
    }

    // 3. Customer Exodus - High churn destroying growth
    if state.churn_rate > 12.0 && state.wau > 100 {
        let churn_weeks = count_high_churn_weeks(&state.history);

        let severity = if state.churn_rate > 20.0 {
            WarningSeverity::Critical
        } else if state.churn_rate > 15.0 {
            WarningSeverity::Danger
        } else {
            WarningSeverity::Caution
        };

        warnings.push(FailureWarning {
            risk_id: "customer_exodus".to_string(),
            title: "Customer Exodus".to_string(),
            current_status: format!(
                "Churn rate at {:.1}% per month, sustained for {} weeks",
                state.churn_rate, churn_weeks
            ),
            warning_signs: vec![
                WarningSign {
                    week: state.week.saturating_sub(3),
                    observation: "Support tickets increasing".to_string(),
                    indicator_level: 50.0,
                },
                WarningSign {
                    week: state.week.saturating_sub(2),
                    observation: "Feature requests being ignored".to_string(),
                    indicator_level: 65.0,
                },
                WarningSign {
                    week: state.week,
                    observation: "Champions stopping advocacy".to_string(),
                    indicator_level: state.churn_rate * 4.0,
                },
            ],
            projected_outcome: "If this continues: Negative reviews will go viral. Reputation will tank. New customer acquisition will become much harder and more expensive. Revenue will decline.".to_string(),
            lesson: "Losing customers is expensive in multiple ways: lost revenue, negative word of mouth, and the opportunity cost of acquisition spending. Keeping customers happy is always cheaper than acquiring new ones.".to_string(),
            weeks_until_critical: Some(estimate_weeks_until_reputation_critical(state.reputation, state.churn_rate)),
            severity,
        });
    }

    // 4. Cash Crunch - Runway running out
    if state.runway_months < 6.0 {
        let burn_trend = analyze_burn_trend(&state.history);
        let revenue_trend = analyze_revenue_trend(&state.history);

        let severity = if state.runway_months < 2.0 {
            WarningSeverity::Critical
        } else if state.runway_months < 3.0 {
            WarningSeverity::Danger
        } else {
            WarningSeverity::Caution
        };

        warnings.push(FailureWarning {
            risk_id: "cash_crunch".to_string(),
            title: "Cash Crunch".to_string(),
            current_status: format!(
                "{:.1} months runway, burn ${:.0}/mo, MRR ${:.0}/mo",
                state.runway_months,
                state.burn,
                state.mrr
            ),
            warning_signs: vec![
                WarningSign {
                    week: state.week.saturating_sub(4),
                    observation: "Burn increasing without proportional revenue growth".to_string(),
                    indicator_level: 40.0,
                },
                WarningSign {
                    week: state.week.saturating_sub(2),
                    observation: "Runway calculation becoming weekly concern".to_string(),
                    indicator_level: 60.0,
                },
                WarningSign {
                    week: state.week,
                    observation: "Making decisions based on what's cheapest, not what's right".to_string(),
                    indicator_level: (6.0 - state.runway_months) * 20.0,
                },
            ],
            projected_outcome: "If this continues: You'll be forced to accept bad deals out of desperation. Layoffs will destroy morale and velocity. Death spiral: cuts lead to less progress, less progress makes fundraising harder, making more cuts necessary.".to_string(),
            lesson: "Runway isn't just a number - it's optionality. Short runway forces desperate decisions. You need time to think clearly, build correctly, and negotiate fairly. Start fixing this NOW while you still have options.".to_string(),
            weeks_until_critical: Some(((state.runway_months - 1.0) * 4.0).max(0.0) as u8),
            severity,
        });
    }

    // 5. Velocity Collapse - Can't ship anything
    if state.velocity < 0.6 {
        let velocity_weeks = count_low_velocity_weeks(&state.history);

        let severity = if state.velocity < 0.4 {
            WarningSeverity::Critical
        } else if state.velocity < 0.5 {
            WarningSeverity::Danger
        } else {
            WarningSeverity::Caution
        };

        warnings.push(FailureWarning {
            risk_id: "velocity_collapse".to_string(),
            title: "Velocity Collapse".to_string(),
            current_status: format!(
                "Velocity at {:.1}x (shipping {:.0}% slower), sustained for {} weeks",
                state.velocity,
                (1.0 - state.velocity) * 100.0,
                velocity_weeks
            ),
            warning_signs: vec![
                WarningSign {
                    week: state.week.saturating_sub(3),
                    observation: "Simple features taking twice as long".to_string(),
                    indicator_level: 50.0,
                },
                WarningSign {
                    week: state.week.saturating_sub(2),
                    observation: "Team afraid to make changes".to_string(),
                    indicator_level: 65.0,
                },
                WarningSign {
                    week: state.week,
                    observation: "Competitors out-shipping you 3:1".to_string(),
                    indicator_level: (1.0 - state.velocity) * 150.0,
                },
            ],
            projected_outcome: "If this continues: You'll fall further behind competitors. Unable to respond to market feedback. Team will become demoralized seeing competitors win. The gap will widen exponentially.".to_string(),
            lesson: "Velocity collapse is usually caused by tech debt, low morale, or poor process. The longer you wait, the worse it gets. This is a compound problem - low velocity makes it harder to fix the things causing low velocity.".to_string(),
            weeks_until_critical: Some(estimate_weeks_until_velocity_critical(state.velocity)),
            severity,
        });
    }

    // 6. Reputation Crisis - Brand damage
    if state.reputation < 40.0 {
        let severity = if state.reputation < 25.0 {
            WarningSeverity::Critical
        } else if state.reputation < 30.0 {
            WarningSeverity::Danger
        } else {
            WarningSeverity::Caution
        };

        warnings.push(FailureWarning {
            risk_id: "reputation_crisis".to_string(),
            title: "Reputation Crisis".to_string(),
            current_status: format!("Reputation at {:.0}/100", state.reputation),
            warning_signs: vec![
                WarningSign {
                    week: state.week.saturating_sub(2),
                    observation: "Negative social media mentions increasing".to_string(),
                    indicator_level: 55.0,
                },
                WarningSign {
                    week: state.week,
                    observation: "Difficulty closing deals, prospects cite concerns".to_string(),
                    indicator_level: (50.0 - state.reputation) * 2.0,
                },
            ],
            projected_outcome: "If this continues: Viral negative reviews. Investors will pass. Talent won't join. Customers will churn faster. Recovery is expensive and slow - reputation is hard to rebuild.".to_string(),
            lesson: "Reputation is built slowly and destroyed quickly. Once lost, it's exponentially harder to regain. Every interaction is a reputation moment. Act with integrity even when no one is watching.".to_string(),
            weeks_until_critical: Some(estimate_weeks_until_reputation_failure(state.reputation)),
            severity,
        });
    }

    // Sort by severity
    warnings.sort_by_key(|w| w.severity.clone());
    warnings.reverse(); // Most severe first

    warnings
}

// Helper functions for trend analysis

fn analyze_morale_trend(history: &[super::state::WeekSnapshot]) -> f64 {
    if history.len() < 2 {
        return 0.0;
    }
    let recent = &history[history.len().saturating_sub(4)..];
    if recent.is_empty() {
        return 0.0;
    }
    let first = recent.first().unwrap().morale;
    let last = recent.last().unwrap().morale;
    last - first
}

fn analyze_tech_debt_trend(_history: &[super::state::WeekSnapshot]) -> f64 {
    // Simplified - in real implementation, track this in history
    2.0 // Assume increasing 2% per week if high
}

fn analyze_burn_trend(history: &[super::state::WeekSnapshot]) -> f64 {
    if history.len() < 2 {
        return 0.0;
    }
    let recent = &history[history.len().saturating_sub(4)..];
    if recent.len() < 2 {
        return 0.0;
    }
    let first = recent.first().unwrap().burn;
    let last = recent.last().unwrap().burn;
    ((last - first) / first) * 100.0
}

fn analyze_revenue_trend(history: &[super::state::WeekSnapshot]) -> f64 {
    if history.len() < 2 {
        return 0.0;
    }
    let recent = &history[history.len().saturating_sub(4)..];
    if recent.len() < 2 {
        return 0.0;
    }
    let first = recent.first().unwrap().mrr;
    let last = recent.last().unwrap().mrr;
    if first > 0.0 {
        ((last - first) / first) * 100.0
    } else {
        0.0
    }
}

fn count_declining_weeks<F>(history: &[super::state::WeekSnapshot], metric: F) -> u8
where
    F: Fn(&super::state::WeekSnapshot) -> f64,
{
    let mut count = 0u8;
    let recent = &history[history.len().saturating_sub(8)..];

    for window in recent.windows(2) {
        if metric(&window[1]) < metric(&window[0]) {
            count += 1;
        }
    }

    count
}

fn count_high_churn_weeks(_history: &[super::state::WeekSnapshot]) -> u8 {
    // Simplified - would need churn in history
    3
}

fn count_low_velocity_weeks(_history: &[super::state::WeekSnapshot]) -> u8 {
    // Simplified - would need velocity in history
    4
}

fn generate_morale_warning_signs(history: &[super::state::WeekSnapshot]) -> Vec<WarningSign> {
    let mut signs = Vec::new();
    let recent = &history[history.len().saturating_sub(4)..];

    for snapshot in recent {
        if snapshot.morale < 70.0 {
            signs.push(WarningSign {
                week: snapshot.week,
                observation: format!("Morale dropped to {:.0}%", snapshot.morale),
                indicator_level: 100.0 - snapshot.morale,
            });
        }
    }

    signs
}

// Estimation functions

fn estimate_weeks_until_morale_critical(current: f64, trend: f64) -> u8 {
    if trend >= 0.0 {
        return 99; // Not declining
    }
    let weeks = (current - 20.0) / trend.abs();
    weeks.max(1.0).min(20.0) as u8
}

fn estimate_weeks_until_debt_critical(current: f64, trend: f64) -> u8 {
    if trend <= 0.0 {
        return 99; // Not increasing
    }
    let weeks = (95.0 - current) / trend;
    weeks.max(1.0).min(20.0) as u8
}

fn estimate_weeks_until_reputation_critical(current: f64, churn: f64) -> u8 {
    let decline_rate = churn * 0.5; // Rough estimate
    if decline_rate <= 0.0 {
        return 99;
    }
    let weeks = (current - 15.0) / decline_rate;
    weeks.max(1.0).min(20.0) as u8
}

fn estimate_weeks_until_velocity_critical(current: f64) -> u8 {
    let weeks_estimate = ((current - 0.3) / 0.05) * 4.0; // Rough estimate
    weeks_estimate.max(2.0).min(20.0) as u8
}

fn estimate_weeks_until_reputation_failure(current: f64) -> u8 {
    let decline_rate = 2.0; // Assume 2 points per week
    let weeks = (current - 10.0) / decline_rate;
    weeks.max(1.0).min(15.0) as u8
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game::state::DifficultyMode;

    #[test]
    fn test_death_march_warning() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        state.morale = 35.0;

        // Add declining morale history
        for i in 0..5 {
            let mut snapshot = state.history[0].clone();
            snapshot.week = i;
            snapshot.morale = 60.0 - (i as f64 * 5.0);
            state.history.push(snapshot);
        }

        let warnings = check_failure_warnings(&state);

        assert!(warnings.iter().any(|w| w.risk_id == "death_march"));
        let death_march = warnings.iter().find(|w| w.risk_id == "death_march").unwrap();
        assert_eq!(death_march.severity, WarningSeverity::Critical);
    }

    #[test]
    fn test_technical_bankruptcy_warning() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        state.tech_debt = 85.0;
        state.velocity = 0.4;

        let warnings = check_failure_warnings(&state);

        assert!(warnings.iter().any(|w| w.risk_id == "technical_bankruptcy"));
    }

    #[test]
    fn test_cash_crunch_warning() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        state.runway_months = 4.5;

        let warnings = check_failure_warnings(&state);

        assert!(warnings.iter().any(|w| w.risk_id == "cash_crunch"));
    }

    #[test]
    fn test_warning_severity_ordering() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        state.morale = 25.0; // Critical
        state.tech_debt = 75.0; // Caution
        state.runway_months = 4.0; // Caution

        let warnings = check_failure_warnings(&state);

        // Most severe should be first
        assert!(warnings[0].severity == WarningSeverity::Critical);
    }
}
