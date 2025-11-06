use serde::{Deserialize, Serialize};
use super::state::GameState;
use super::competitors::{get_most_threatening_competitor, get_shipping_velocity_ratio};

/// Educational insight about player's decisions and game state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WeeklyInsight {
    pub category: InsightCategory,
    pub title: String,
    pub observation: String,
    pub insight: String,
    pub action_suggestion: String,
    pub severity: InsightSeverity,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum InsightCategory {
    Morale,
    TechnicalDebt,
    Runway,
    Growth,
    CustomerSatisfaction,
    Velocity,
    Burnout,
    Competition,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum InsightSeverity {
    Info,      // Educational, no urgency
    Warning,   // Attention needed
    Critical,  // Immediate action required
}

/// Generate insights by comparing previous and current state
pub fn generate_weekly_insights(prev_state: &GameState, curr_state: &GameState) -> Vec<WeeklyInsight> {
    let mut insights = Vec::new();

    // 1. Morale Check
    if curr_state.morale < prev_state.morale - 10.0 {
        insights.push(WeeklyInsight {
            category: InsightCategory::Morale,
            title: "Team Morale Declining".to_string(),
            observation: format!(
                "Morale dropped from {:.0}% to {:.0}% this week",
                prev_state.morale, curr_state.morale
            ),
            insight: "Burned out teams make poor decisions and ship slower. Morale isn't 'soft' - it's a leading indicator of productivity and retention. Low morale leads to key people leaving, taking institutional knowledge with them.".to_string(),
            action_suggestion: "Consider: Take Break action, reduce workload, celebrate wins, or slow down shipping pace".to_string(),
            severity: if curr_state.morale < 40.0 {
                InsightSeverity::Critical
            } else if curr_state.morale < 60.0 {
                InsightSeverity::Warning
            } else {
                InsightSeverity::Info
            },
        });
    }

    // 2. Morale Sustained High
    if curr_state.morale > 75.0 && prev_state.morale > 75.0 {
        insights.push(WeeklyInsight {
            category: InsightCategory::Morale,
            title: "Strong Team Culture".to_string(),
            observation: format!("Team morale has been consistently high at {:.0}%", curr_state.morale),
            insight: "Sustainable pace wins. High morale compounds: happy teams ship better code faster, make better decisions, and attract better talent. This is a competitive advantage.".to_string(),
            action_suggestion: "Keep doing what you're doing. Document what's working so you can maintain it as you scale.".to_string(),
            severity: InsightSeverity::Info,
        });
    }

    // 3. Technical Debt Warning
    if curr_state.tech_debt > 60.0 && prev_state.tech_debt < 60.0 {
        insights.push(WeeklyInsight {
            category: InsightCategory::TechnicalDebt,
            title: "Technical Debt Accumulating".to_string(),
            observation: format!("Tech debt crossed 60% threshold (now at {:.0}%)", curr_state.tech_debt),
            insight: "High tech debt is like driving with the parking brake on. Every feature takes longer. Every change risks breaking something. The 'interest payments' on tech debt compound - it gets exponentially harder to fix the longer you wait.".to_string(),
            action_suggestion: "Ship fewer features this week and focus on quality. Refactor critical paths. Future you will thank present you. Consider 'Polish' quality for next features.".to_string(),
            severity: if curr_state.tech_debt > 80.0 {
                InsightSeverity::Critical
            } else {
                InsightSeverity::Warning
            },
        });
    }

    // 4. Tech Debt Under Control
    if curr_state.tech_debt < 30.0 && curr_state.velocity > 0.8 {
        insights.push(WeeklyInsight {
            category: InsightCategory::TechnicalDebt,
            title: "Engineering Excellence".to_string(),
            observation: format!("Low tech debt ({:.0}%) with strong velocity ({:.1}x)", curr_state.tech_debt, curr_state.velocity),
            insight: "Quality and speed aren't opposites. Clean codebases enable speed. You can ship features faster because you're not fighting technical debt. This is how great engineering teams win.".to_string(),
            action_suggestion: "Maintain this discipline. Make it part of your culture. Every 'quick hack' has a compounding cost.".to_string(),
            severity: InsightSeverity::Info,
        });
    }

    // 5. Runway Warning
    if curr_state.runway_months < 6.0 {
        let urgency_level = if curr_state.runway_months < 3.0 {
            InsightSeverity::Critical
        } else {
            InsightSeverity::Warning
        };

        insights.push(WeeklyInsight {
            category: InsightCategory::Runway,
            title: "Runway Running Low".to_string(),
            observation: format!("Only {:.1} months of runway remaining", curr_state.runway_months),
            insight: "Short runway forces desperate decisions. You need runway to think clearly, negotiate fairly, and build correctly. Desperation is expensive - you'll accept bad deals, cut corners, and make fear-based choices. Runway is optionality.".to_string(),
            action_suggestion: "Either raise money, cut burn significantly, or increase revenue. Start fundraising NOW if that's your path - it takes 3-6 months. Consider hard choices before you're forced to make them.".to_string(),
            severity: urgency_level,
        });
    }

    // 6. Strong Runway
    if curr_state.runway_months > 18.0 && curr_state.burn > 0.0 {
        let burn_efficiency = curr_state.mrr / curr_state.burn;
        if burn_efficiency > 0.5 {
            insights.push(WeeklyInsight {
                category: InsightCategory::Runway,
                title: "Financial Discipline Pays Off".to_string(),
                observation: format!("{:.1} months runway with healthy burn efficiency", curr_state.runway_months),
                insight: "Runway is freedom. Cash gives you the power to make good decisions from strength, not desperation. You can say no to bad deals, wait for the right opportunities, and invest in quality. This is a massive strategic advantage.".to_string(),
                action_suggestion: "Leverage this position. You can afford to be patient and strategic. Consider: quality hiring, deeper customer research, or technical investments that pay long-term dividends.".to_string(),
                severity: InsightSeverity::Info,
            });
        }
    }

    // 7. Growth Stagnation
    if curr_state.wau_growth_rate < 2.0 && curr_state.week > 8 {
        insights.push(WeeklyInsight {
            category: InsightCategory::Growth,
            title: "Growth Stagnating".to_string(),
            observation: format!("WAU growth at only {:.1}% per week", curr_state.wau_growth_rate),
            insight: "Stagnant growth is a signal. Either: (1) You haven't found product-market fit yet, (2) You're not reaching your market effectively, or (3) Churn is eating your growth. Time to diagnose which one.".to_string(),
            action_suggestion: "Talk to customers. What are they getting value from? What would make them tell friends? Consider: better onboarding, key feature improvements, or finding a different channel.".to_string(),
            severity: InsightSeverity::Warning,
        });
    }

    // 8. Strong Growth with High Churn
    if curr_state.wau_growth_rate > 10.0 && curr_state.churn_rate > 10.0 {
        insights.push(WeeklyInsight {
            category: InsightCategory::CustomerSatisfaction,
            title: "Leaky Bucket".to_string(),
            observation: format!("Strong growth ({:.1}%) but high churn ({:.1}%)", curr_state.wau_growth_rate, curr_state.churn_rate),
            insight: "You're acquiring customers but not keeping them - the classic 'leaky bucket'. Every lost customer took resources to acquire and might spread negative word of mouth. Keeping customers happy is always cheaper than acquiring new ones.".to_string(),
            action_suggestion: "Interview churned customers. Find the common pattern. Often it's: onboarding issues, missing key feature, or misaligned expectations. Fix retention before scaling acquisition.".to_string(),
            severity: InsightSeverity::Warning,
        });
    }

    // 9. Velocity Degradation
    if curr_state.velocity < 0.7 && prev_state.velocity >= 0.7 {
        insights.push(WeeklyInsight {
            category: InsightCategory::Velocity,
            title: "Shipping Velocity Declining".to_string(),
            observation: format!("Velocity dropped to {:.1}x (was {:.1}x)", curr_state.velocity, prev_state.velocity),
            insight: "Declining velocity is usually caused by: (1) Tech debt making every change expensive, (2) Team morale/energy issues, or (3) Growing complexity without enough refactoring. The longer you wait, the worse it gets.".to_string(),
            action_suggestion: "Identify the bottleneck. If it's tech debt, allocate time for refactoring. If it's morale, take a break. If it's complexity, simplify ruthlessly. Velocity is a leading indicator of future productivity.".to_string(),
            severity: InsightSeverity::Warning,
        });
    }

    // 10. Burnout Risk (multiple indicators)
    let weeks_since_break = check_weeks_since_break(curr_state);
    if weeks_since_break > 8 && curr_state.morale < 70.0 {
        insights.push(WeeklyInsight {
            category: InsightCategory::Burnout,
            title: "Burnout Risk".to_string(),
            observation: format!("{} weeks without a break, morale at {:.0}%", weeks_since_break, curr_state.morale),
            insight: "Burnout doesn't happen overnight - it accumulates. Warning signs: tired in meetings, declining code quality, cynicism, dread on Monday mornings. Once you're burned out, recovery takes months. Prevention is easier than cure.".to_string(),
            action_suggestion: "Take a proper break this week. Not a weekend - a real vacation. Your business needs you healthy and clear-headed more than it needs you grinding 80-hour weeks.".to_string(),
            severity: InsightSeverity::Critical,
        });
    }

    // 11. Customer Love Achievement
    if curr_state.nps > 70.0 && curr_state.wau > 500 {
        insights.push(WeeklyInsight {
            category: InsightCategory::CustomerSatisfaction,
            title: "Customers Love Your Product".to_string(),
            observation: format!("NPS at {:.0} with {} active users", curr_state.nps, curr_state.wau),
            insight: "High NPS with real usage is the holy grail. These customers become advocates - they sell for you, give feedback, and provide testimonials. This compounds: happy customers tell friends, which brings more customers predisposed to like you.".to_string(),
            action_suggestion: "Double down on what's working. Make it even better. Ask your champions what made them champions. Consider a referral program or case studies.".to_string(),
            severity: InsightSeverity::Info,
        });
    }

    // Competitive Intelligence Insights

    // Competitor Out-Shipping
    if let Some(competitor) = get_most_threatening_competitor(&curr_state.competitors) {
        let velocity_ratio = get_shipping_velocity_ratio(competitor, curr_state);
        if velocity_ratio > 1.5 {
            insights.push(WeeklyInsight {
                category: InsightCategory::Competition,
                title: "Competitor Out-Shipping You".to_string(),
                observation: format!("{} is shipping features {:.1}x faster than you. Their feature parity is at {:.0}% and growing.", competitor.name, velocity_ratio, competitor.feature_parity),
                insight: "Shipping velocity is a competitive weapon. Fast-moving competitors can out-innovate you, steal customers, and attract better talent. Speed compounds - they learn faster, iterate faster, and build momentum. This is how underdogs beat incumbents.".to_string(),
                action_suggestion: format!("Analyze why {} ships faster. Is it team size? Tech debt? Focus? Consider: reduce tech debt, improve velocity, or find a differentiation strategy that doesn't require matching their pace.", competitor.name),
                severity: InsightSeverity::Warning,
            });
        }
    }

    // Funding Gap
    let total_competitor_funding = curr_state.get_total_competitor_funding();
    if total_competitor_funding > curr_state.bank * 5.0 && curr_state.week > 52 {
        insights.push(WeeklyInsight {
            category: InsightCategory::Competition,
            title: "Funding Gap Widening".to_string(),
            observation: format!("Your competitors have raised ${:.0}M combined while you have ${:.0}k in the bank. They can outspend you on hiring, marketing, and sales.", total_competitor_funding / 1_000_000.0, curr_state.bank / 1000.0),
            insight: "Capital is a competitive advantage. Well-funded competitors can afford to lose money acquiring customers, hire faster, and wait out market downturns. You need either: (1) raise money to compete, (2) find an unfair advantage that doesn't require capital, or (3) target a different market segment.".to_string(),
            action_suggestion: "Consider fundraising if you're on the VC track. Or double down on capital efficiency - find channels and strategies that don't require outspending competitors. Bootstrapped companies can win, but not by playing the same game as funded competitors.".to_string(),
            severity: InsightSeverity::Warning,
        });
    }

    // Market Share Declining
    if curr_state.player_market_share < prev_state.player_market_share - 5.0 {
        insights.push(WeeklyInsight {
            category: InsightCategory::Competition,
            title: "Losing Market Share".to_string(),
            observation: format!("Your market share dropped from {:.1}% to {:.1}% this week. Competitors are winning customers you should be winning.", prev_state.player_market_share, curr_state.player_market_share),
            insight: "Market share is a leading indicator. Losing share means: (1) competitors are executing better, (2) your product isn't differentiated enough, or (3) you're being outmarketed. In winner-take-most markets, losing share early can be fatal - network effects and brand recognition compound.".to_string(),
            action_suggestion: "Diagnose why you're losing share. Talk to customers who chose competitors. What did they offer that you don't? Is it features, pricing, brand, or distribution? Fix the root cause, not the symptoms.".to_string(),
            severity: InsightSeverity::Critical,
        });
    }

    // Competitive Advantage
    if curr_state.player_market_share > 60.0 {
        let avg_competitor_parity = curr_state.get_average_competitor_feature_parity();
        if curr_state.velocity > avg_competitor_parity / 10.0 {
            insights.push(WeeklyInsight {
                category: InsightCategory::Competition,
                title: "Competitive Moat Building".to_string(),
                observation: format!("You control {:.1}% market share and ship faster than competitors. You're building a defensible position.", curr_state.player_market_share),
                insight: "Market leadership compounds. High market share → more customers → more feedback → better product → more customers. You're in the virtuous cycle. Now the question is: how do you make this position defensible? Network effects? Switching costs? Brand? Data advantages?".to_string(),
                action_suggestion: "Don't get complacent. Dominant players get disrupted when they stop innovating. Keep shipping, keep listening to customers, and invest in moats that make it hard for competitors to catch up. Consider: platform effects, integrations, or community.".to_string(),
                severity: InsightSeverity::Info,
            });
        }
    }

    // Acquisition Opportunity
    if curr_state.bank > 200_000.0 {
        if let Some(competitor) = curr_state.competitors.iter().find(|c| !c.is_acquired && c.feature_parity < 30.0 && matches!(c.funding_stage, super::competitors::FundingStage::Bootstrapped)) {
            insights.push(WeeklyInsight {
                category: InsightCategory::Competition,
                title: "Acquisition Opportunity".to_string(),
                observation: format!("{} is struggling (feature parity: {:.0}%). They might be open to acquisition. You have the capital.", competitor.name, competitor.feature_parity),
                insight: "Acquiring competitors can be faster than building. You get their customers, team, and technology. But acquisitions are risky - cultural fit matters, integration is hard, and you might overpay. Only acquire if it accelerates your strategy, not just to eliminate competition.".to_string(),
                action_suggestion: format!("Consider reaching out to {}. But be strategic - what would you gain? Their customers? Technology? Team? Make sure the acquisition makes sense beyond just removing a competitor.", competitor.name),
                severity: InsightSeverity::Info,
            });
        }
    }

    // Limit to top 3 most important insights
    insights.sort_by_key(|i| match i.severity {
        InsightSeverity::Critical => 0,
        InsightSeverity::Warning => 1,
        InsightSeverity::Info => 2,
    });
    insights.truncate(3);

    insights
}

/// Check how many weeks since last break (placeholder - would need state tracking)
fn check_weeks_since_break(_state: &GameState) -> u32 {
    // TODO: Track this in game state
    // For now, estimate based on morale trajectory
    8
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game::state::DifficultyMode;

    #[test]
    fn test_morale_declining_insight() {
        let mut prev_state = GameState::new(DifficultyMode::IndieBootstrap);
        prev_state.morale = 80.0;

        let mut curr_state = prev_state.clone();
        curr_state.morale = 60.0;

        let insights = generate_weekly_insights(&prev_state, &curr_state);

        assert!(!insights.is_empty());
        assert!(insights.iter().any(|i| i.category == InsightCategory::Morale));
    }

    #[test]
    fn test_runway_warning() {
        let prev_state = GameState::new(DifficultyMode::IndieBootstrap);

        let mut curr_state = prev_state.clone();
        curr_state.runway_months = 4.0;

        let insights = generate_weekly_insights(&prev_state, &curr_state);

        let runway_insight = insights.iter().find(|i| i.category == InsightCategory::Runway);
        assert!(runway_insight.is_some());
        assert_eq!(runway_insight.unwrap().severity, InsightSeverity::Warning);
    }

    #[test]
    fn test_tech_debt_warning() {
        let prev_state = GameState::new(DifficultyMode::IndieBootstrap);

        let mut curr_state = prev_state.clone();
        curr_state.tech_debt = 65.0;

        let insights = generate_weekly_insights(&prev_state, &curr_state);

        assert!(insights.iter().any(|i| i.category == InsightCategory::TechnicalDebt));
    }

    #[test]
    fn test_insights_prioritization() {
        let prev_state = GameState::new(DifficultyMode::IndieBootstrap);

        let mut curr_state = prev_state.clone();
        curr_state.morale = 30.0; // Critical
        curr_state.tech_debt = 65.0; // Warning
        curr_state.runway_months = 15.0; // Info

        let insights = generate_weekly_insights(&prev_state, &curr_state);

        // Should prioritize critical insights first
        assert!(insights.len() <= 3);
        if !insights.is_empty() {
            assert_eq!(insights[0].severity, InsightSeverity::Critical);
        }
    }
}
