use serde::{Deserialize, Serialize};
use rand::Rng;
use super::state::GameState;
use super::customers::{generate_customer_persona, calculate_segment_from_mrr};

/// Quality level for features
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Quality {
    Quick,      // Ship fast, +momentum, +tech_debt
    Balanced,   // Normal trade-off
    Polish,     // Ship slow, +reputation, -tech_debt
}

/// Depth of code refactoring
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum RefactorDepth {
    Surface,    // Quick wins, minimal impact
    Medium,     // Balanced effort and results
    Deep,       // Major overhaul, high impact
}

/// Types of experiments to run
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ExperimentType {
    Pricing,    // Test pricing strategies
    Onboarding, // Improve user onboarding
    Channel,    // Test distribution channels
}

/// Types of content to launch
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ContentType {
    BlogPost,   // Educational article
    Tutorial,   // Step-by-step guide
    CaseStudy,  // Customer success story
    Video,      // Video content
}

/// Developer relations events
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DevRelEvent {
    Conference, // Speak at conference
    Podcast,    // Podcast appearance
    OpenSource, // Contribute to open source
    Workshop,   // Host workshop
}

/// Advertising channels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum AdChannel {
    Google,     // Search ads
    Social,     // Social media ads
    Display,    // Banner/display ads
    Influencer, // Influencer partnerships
}

/// Coaching focus areas
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CoachingFocus {
    Skills,     // Technical skills
    Morale,     // Team morale
    Alignment,  // Strategic alignment
    Performance,// Overall performance
}

/// Reasons for firing
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum FiringReason {
    Performance, // Underperforming
    Culture,     // Culture fit issues
    Budget,      // Cost reduction
}

/// Player actions available each turn
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Action {
    // PRODUCT (Focus: 1-2 slots)
    ShipFeature { quality: Quality },
    RefactorCode { depth: RefactorDepth },
    RunExperiment { category: ExperimentType },

    // SALES & GROWTH (Focus: 1 slot)
    FounderLedSales { call_count: u8 },
    ContentLaunch { content_type: ContentType },
    DevRel { event_type: DevRelEvent },
    PaidAds { budget: f64, channel: AdChannel },

    // TEAM (Focus: 1-2 slots)
    Hire,
    Coach { focus: CoachingFocus },
    Fire { reason: FiringReason },

    // OPERATIONS (Focus: 1-2 slots)
    ComplianceWork { hours: u8 },
    IncidentResponse,
    ProcessImprovement,

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
            Action::RefactorCode { depth } => match depth {
                RefactorDepth::Surface => 1,
                RefactorDepth::Medium => 1,
                RefactorDepth::Deep => 2,
            },
            Action::RunExperiment { .. } => 1,
            Action::FounderLedSales { .. } => 1,
            Action::ContentLaunch { .. } => 1,
            Action::DevRel { .. } => 2,
            Action::PaidAds { .. } => 1,
            Action::Hire => 2,
            Action::Coach { .. } => 1,
            Action::Fire { .. } => 1,
            Action::ComplianceWork { .. } => 1,
            Action::IncidentResponse => 2,
            Action::ProcessImprovement => 1,
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

/// Result of an experiment
#[derive(Debug, Clone)]
pub struct ExperimentResult {
    pub success: bool,
    pub insight: String,
    pub effects: Vec<StatEffect>,
}

/// Calculate refactor impact based on depth and current debt
pub fn calculate_refactor_impact(depth: &RefactorDepth, current_debt: f64) -> (f64, f64) {
    let base_reduction = match depth {
        RefactorDepth::Surface => 10.0,
        RefactorDepth::Medium => 20.0,
        RefactorDepth::Deep => 35.0,
    };
    // More effective when debt is high
    let debt_modifier = if current_debt > 50.0 { 1.2 } else { 1.0 };
    let debt_reduction = base_reduction * debt_modifier * (0.8 + rand::random::<f64>() * 0.4); // ±20% variance

    let velocity_gain = match depth {
        RefactorDepth::Surface => 0.05,
        RefactorDepth::Medium => 0.12,
        RefactorDepth::Deep => 0.2,
    } * (0.9 + rand::random::<f64>() * 0.2); // ±10% variance

    (debt_reduction, velocity_gain)
}

/// Calculate experiment outcome
pub fn calculate_experiment_outcome(category: &ExperimentType, state: &GameState) -> ExperimentResult {
    let mut rng = rand::thread_rng();
    let success = rng.gen_bool(0.6); // 60% success rate

    let (insight, effects) = if success {
        match category {
            ExperimentType::Pricing => {
                let mrr_boost = state.mrr * 0.05 * (0.8 + rng.gen_range(0.0..0.4));
                let insight = "Found optimal pricing tier - increased conversion".to_string();
                let mut effects = Vec::new();
                effects.push(StatEffect {
                    stat_name: "MRR".to_string(),
                    old_value: state.mrr,
                    new_value: state.mrr + mrr_boost,
                    delta: mrr_boost,
                });
                (insight, effects)
            }
            ExperimentType::Onboarding => {
                let wau_boost = (state.wau as f64 * 0.03) * (0.8 + rng.gen_range(0.0..0.4));
                let insight = "Streamlined onboarding - reduced churn".to_string();
                let mut effects = Vec::new();
                effects.push(StatEffect {
                    stat_name: "WAU".to_string(),
                    old_value: state.wau as f64,
                    new_value: state.wau as f64 + wau_boost,
                    delta: wau_boost,
                });
                effects.push(StatEffect {
                    stat_name: "Churn Rate".to_string(),
                    old_value: state.churn_rate,
                    new_value: state.churn_rate * 0.95,
                    delta: state.churn_rate * -0.05,
                });
                (insight, effects)
            }
            ExperimentType::Channel => {
                let rep_boost = 5.0 * (0.8 + rng.gen_range(0.0..0.4));
                let insight = "Discovered high-converting channel".to_string();
                let mut effects = Vec::new();
                effects.push(StatEffect {
                    stat_name: "Reputation".to_string(),
                    old_value: state.reputation,
                    new_value: state.reputation + rep_boost,
                    delta: rep_boost,
                });
                (insight, effects)
            }
        }
    } else {
        let insight = "Experiment failed - learned what not to do".to_string();
        let mut effects = Vec::new();
        effects.push(StatEffect {
            stat_name: "Morale".to_string(),
            old_value: state.morale,
            new_value: state.morale - 2.0,
            delta: -2.0,
        });
        (insight, effects)
    };

    ExperimentResult { success, insight, effects }
}

/// Calculate content reach
pub fn calculate_content_reach(content_type: &ContentType, reputation: f64) -> (f64, f64) {
    let base_wau = match content_type {
        ContentType::BlogPost => 2.0,
        ContentType::Tutorial => 4.0,
        ContentType::CaseStudy => 3.0,
        ContentType::Video => 5.0,
    };
    let rep_modifier = reputation / 100.0;
    let wau_gain = base_wau * (0.8 + rep_modifier) * (0.8 + rand::random::<f64>() * 0.4); // ±20% variance

    let rep_gain = match content_type {
        ContentType::BlogPost => 2.0,
        ContentType::Tutorial => 3.0,
        ContentType::CaseStudy => 4.0,
        ContentType::Video => 5.0,
    } * (0.9 + rand::random::<f64>() * 0.2); // ±10% variance

    (wau_gain, rep_gain)
}

/// Calculate ad effectiveness
pub fn calculate_ad_effectiveness(channel: &AdChannel, budget: f64, market_saturation: f64) -> f64 {
    let base_effectiveness = match channel {
        AdChannel::Google => 0.8,
        AdChannel::Social => 1.0,
        AdChannel::Display => 0.6,
        AdChannel::Influencer => 1.2,
    };
    let saturation_penalty = market_saturation / 100.0; // Assume market_saturation is 0-100
    let effectiveness = base_effectiveness * (1.0 - saturation_penalty) * (0.8 + rand::random::<f64>() * 0.4); // ±20% variance
    effectiveness * budget / 10000.0 // Scale by budget
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

            // Create new self-serve customers if WAU growth is significant
            let wau_growth_percent = ((state.wau as f64 - old_wau as f64) / old_wau as f64) * 100.0;
            if wau_growth_percent > 5.0 {
                let new_customer_count = (wau_growth_percent / 10.0).ceil() as usize;
                for _ in 0..new_customer_count.min(3) {
                    let customer = generate_customer_persona(super::customers::CustomerSegment::SelfServe, state.week, state);
                    state.add_customer(customer);
                }
            }

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
            let mut new_customers = Vec::new();

            for _ in 0..*call_count {
                if rng.gen_bool(conversion_rate) {
                    let deal_size = base_deal_size * (0.8 + rng.gen_range(0.0..0.4));
                    new_mrr += deal_size;

                    // Create customer persona
                    let segment = calculate_segment_from_mrr(deal_size);
                    let mut customer = generate_customer_persona(segment, state.week, state);
                    customer.mrr_contribution = deal_size;
                    new_customers.push(customer);
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

            // Add new customers to state
            for customer in new_customers {
                state.add_customer(customer);
            }

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

            let success_message = if new_mrr > 0.0 {
                if let Some(customer) = state.customers.last() {
                    format!("Closed deal with {}! ${:.0}/mo", customer.name, new_mrr)
                } else {
                    format!("Closed deals worth ${:.0}/mo!", new_mrr)
                }
            } else {
                message
            };

            ActionResult {
                success: new_mrr > 0.0,
                message: success_message,
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

        Action::RefactorCode { depth } => {
            let message = match depth {
                RefactorDepth::Surface => "Did surface-level refactoring",
                RefactorDepth::Medium => "Conducted medium-depth refactoring",
                RefactorDepth::Deep => "Performed deep code refactoring",
            };

            let (debt_reduction, velocity_gain) = calculate_refactor_impact(depth, state.tech_debt);

            let old_debt = state.tech_debt;
            state.tech_debt -= debt_reduction;
            effects.push(StatEffect {
                stat_name: "Tech Debt".to_string(),
                old_value: old_debt,
                new_value: state.tech_debt,
                delta: -debt_reduction,
            });

            let old_velocity = state.velocity;
            state.velocity += velocity_gain;
            effects.push(StatEffect {
                stat_name: "Velocity".to_string(),
                old_value: old_velocity,
                new_value: state.velocity,
                delta: velocity_gain,
            });

            // Morale cost for refactoring effort
            let morale_cost = match depth {
                RefactorDepth::Surface => 2.0,
                RefactorDepth::Medium => 5.0,
                RefactorDepth::Deep => 10.0,
            } * (0.9 + rand::random::<f64>() * 0.2);
            let old_morale = state.morale;
            state.morale -= morale_cost;
            effects.push(StatEffect {
                stat_name: "Morale".to_string(),
                old_value: old_morale,
                new_value: state.morale,
                delta: -morale_cost,
            });

            ActionResult {
                success: true,
                message: message.to_string(),
                effects,
            }
        }

        Action::RunExperiment { category } => {
            let result = calculate_experiment_outcome(category, state);
            let message = format!("Ran {} experiment: {}", format!("{:?}", category).to_lowercase(), result.insight);

            for effect in result.effects {
                match effect.stat_name.as_str() {
                    "MRR" => state.mrr = effect.new_value,
                    "WAU" => state.wau = effect.new_value as u32,
                    "Churn Rate" => state.churn_rate = effect.new_value,
                    "Morale" => state.morale = effect.new_value,
                    "Reputation" => state.reputation = effect.new_value,
                    _ => {}
                }
                effects.push(effect);
            }

            ActionResult {
                success: result.success,
                message,
                effects,
            }
        }

        Action::ContentLaunch { content_type } => {
            let message = format!("Launched {} content", format!("{:?}", content_type).to_lowercase().replace('_', " "));

            let (wau_gain, rep_gain) = calculate_content_reach(content_type, state.reputation);

            let old_wau = state.wau;
            state.wau = (state.wau as f64 + wau_gain) as u32;
            effects.push(StatEffect {
                stat_name: "WAU".to_string(),
                old_value: old_wau as f64,
                new_value: state.wau as f64,
                delta: wau_gain,
            });

            let old_rep = state.reputation;
            state.reputation += rep_gain;
            effects.push(StatEffect {
                stat_name: "Reputation".to_string(),
                old_value: old_rep,
                new_value: state.reputation,
                delta: rep_gain,
            });

            // Create new self-serve customers based on WAU gain
            let new_customer_count = (wau_gain / 5.0).ceil() as usize;
            for _ in 0..new_customer_count {
                let customer = generate_customer_persona(super::customers::CustomerSegment::SelfServe, state.week, state);
                state.add_customer(customer);
            }

            ActionResult {
                success: true,
                message: message.to_string(),
                effects,
            }
        }

        Action::DevRel { event_type } => {
            let message = format!("Participated in {} event", format!("{:?}", event_type).to_lowercase());

            let rep_gain = match event_type {
                DevRelEvent::Conference => 12.0,
                DevRelEvent::Podcast => 8.0,
                DevRelEvent::OpenSource => 6.0,
                DevRelEvent::Workshop => 10.0,
            } * (0.9 + rand::random::<f64>() * 0.2);

            let wau_gain = rep_gain * 0.5 * (0.8 + rand::random::<f64>() * 0.4);

            let old_rep = state.reputation;
            state.reputation += rep_gain;
            effects.push(StatEffect {
                stat_name: "Reputation".to_string(),
                old_value: old_rep,
                new_value: state.reputation,
                delta: rep_gain,
            });

            let old_wau = state.wau;
            state.wau = (state.wau as f64 + wau_gain) as u32;
            effects.push(StatEffect {
                stat_name: "WAU".to_string(),
                old_value: old_wau as f64,
                new_value: state.wau as f64,
                delta: wau_gain,
            });

            let morale_boost = 5.0 * (0.9 + rand::random::<f64>() * 0.2);
            let old_morale = state.morale;
            state.morale += morale_boost;
            effects.push(StatEffect {
                stat_name: "Morale".to_string(),
                old_value: old_morale,
                new_value: state.morale,
                delta: morale_boost,
            });

            // Create new developer customers based on reputation gain
            let new_customer_count = (rep_gain / 3.0).ceil() as usize;
            for _ in 0..new_customer_count {
                let customer = generate_customer_persona(super::customers::CustomerSegment::SelfServe, state.week, state);
                state.add_customer(customer);
            }

            ActionResult {
                success: true,
                message: message.to_string(),
                effects,
            }
        }

        Action::PaidAds { budget, channel } => {
            let message = format!("Ran ads on {} with ${:.0} budget", format!("{:?}", channel).to_lowercase(), budget);

            let market_saturation = 20.0; // Placeholder, could be calculated from state
            let wau_gain = calculate_ad_effectiveness(channel, *budget, market_saturation);

            let old_wau = state.wau;
            state.wau = (state.wau as f64 + wau_gain) as u32;
            effects.push(StatEffect {
                stat_name: "WAU".to_string(),
                old_value: old_wau as f64,
                new_value: state.wau as f64,
                delta: wau_gain,
            });

            let old_bank = state.bank;
            state.bank -= budget;
            effects.push(StatEffect {
                stat_name: "Bank".to_string(),
                old_value: old_bank,
                new_value: state.bank,
                delta: -budget,
            });

            // Create new customers based on ad channel and WAU gain
            let (selfserve_ratio, smb_ratio) = match channel {
                AdChannel::Google | AdChannel::Display => (0.8, 0.2),
                AdChannel::Social => (0.9, 0.1),
                AdChannel::Influencer => (0.7, 0.3),
            };

            let new_customer_count = (wau_gain / 10.0).ceil() as usize;
            for _ in 0..new_customer_count {
                let segment = if rng.gen_bool(selfserve_ratio) {
                    super::customers::CustomerSegment::SelfServe
                } else {
                    super::customers::CustomerSegment::SMB
                };
                let customer = generate_customer_persona(segment, state.week, state);
                state.add_customer(customer);
            }

            ActionResult {
                success: wau_gain > 0.0,
                message,
                effects,
            }
        }

        Action::Coach { focus } => {
            let message = format!("Coached team on {}", format!("{:?}", focus).to_lowercase());

            let (velocity_boost, morale_boost) = match focus {
                CoachingFocus::Skills => (0.08, 2.0),
                CoachingFocus::Morale => (0.02, 8.0),
                CoachingFocus::Alignment => (0.05, 4.0),
                CoachingFocus::Performance => (0.1, 3.0),
            };

            let velocity_gain = velocity_boost * (0.9 + rand::random::<f64>() * 0.2);
            let old_velocity = state.velocity;
            state.velocity += velocity_gain;
            effects.push(StatEffect {
                stat_name: "Velocity".to_string(),
                old_value: old_velocity,
                new_value: state.velocity,
                delta: velocity_gain,
            });

            let morale_gain = morale_boost * (0.9 + rand::random::<f64>() * 0.2);
            let old_morale = state.morale;
            state.morale += morale_gain;
            effects.push(StatEffect {
                stat_name: "Morale".to_string(),
                old_value: old_morale,
                new_value: state.morale,
                delta: morale_gain,
            });

            ActionResult {
                success: true,
                message: message.to_string(),
                effects,
            }
        }

        Action::Fire { reason } => {
            let message = format!("Fired employee for {}", format!("{:?}", reason).to_lowercase());

            let burn_reduction = 8000.0 * (0.8 + rand::random::<f64>() * 0.4); // Assume average salary
            let old_burn = state.burn;
            state.burn -= burn_reduction;
            effects.push(StatEffect {
                stat_name: "Monthly Burn".to_string(),
                old_value: old_burn,
                new_value: state.burn,
                delta: -burn_reduction,
            });

            let (morale_hit, velocity_hit): (f64, f64) = match reason {
                FiringReason::Performance => (-8.0, -0.05),
                FiringReason::Culture => (-12.0, -0.08),
                FiringReason::Budget => (-5.0, -0.02),
            };

            let old_morale = state.morale;
            state.morale += morale_hit;
            effects.push(StatEffect {
                stat_name: "Morale".to_string(),
                old_value: old_morale,
                new_value: state.morale,
                delta: morale_hit,
            });

            let old_velocity = state.velocity;
            state.velocity += velocity_hit;
            effects.push(StatEffect {
                stat_name: "Velocity".to_string(),
                old_value: old_velocity,
                new_value: state.velocity,
                delta: velocity_hit,
            });

            ActionResult {
                success: true,
                message: message.to_string(),
                effects,
            }
        }

        Action::ComplianceWork { hours } => {
            let message = format!("Spent {} hours on compliance work", hours);

            let risk_reduction = (*hours as f64) * 2.0 * (0.9 + rand::random::<f64>() * 0.2);
            let old_risk = state.compliance_risk;
            state.compliance_risk -= risk_reduction;
            effects.push(StatEffect {
                stat_name: "Compliance Risk".to_string(),
                old_value: old_risk,
                new_value: state.compliance_risk,
                delta: -risk_reduction,
            });

            let morale_cost = (*hours as f64) * 0.3 * (0.9 + rand::random::<f64>() * 0.2);
            let old_morale = state.morale;
            state.morale -= morale_cost;
            effects.push(StatEffect {
                stat_name: "Morale".to_string(),
                old_value: old_morale,
                new_value: state.morale,
                delta: -morale_cost,
            });

            ActionResult {
                success: true,
                message: message.to_string(),
                effects,
            }
        }

        Action::IncidentResponse => {
            let message = "Responded to incident - contained damage";

            let rep_loss = 5.0 * (0.8 + rand::random::<f64>() * 0.4); // Mitigated loss
            let old_rep = state.reputation;
            state.reputation -= rep_loss;
            effects.push(StatEffect {
                stat_name: "Reputation".to_string(),
                old_value: old_rep,
                new_value: state.reputation,
                delta: -rep_loss,
            });

            let morale_cost = 15.0 * (0.9 + rand::random::<f64>() * 0.2);
            let old_morale = state.morale;
            state.morale -= morale_cost;
            effects.push(StatEffect {
                stat_name: "Morale".to_string(),
                old_value: old_morale,
                new_value: state.morale,
                delta: -morale_cost,
            });

            ActionResult {
                success: true,
                message: message.to_string(),
                effects,
            }
        }

        Action::ProcessImprovement => {
            let message = "Implemented process improvements";

            let velocity_boost = 0.08 * (0.9 + rand::random::<f64>() * 0.2);
            let old_velocity = state.velocity;
            state.velocity += velocity_boost;
            effects.push(StatEffect {
                stat_name: "Velocity".to_string(),
                old_value: old_velocity,
                new_value: state.velocity,
                delta: velocity_boost,
            });

            // Reduce future incident probability (not directly modeled, but morale boost)
            let morale_boost = 3.0 * (0.9 + rand::random::<f64>() * 0.2);
            let old_morale = state.morale;
            state.morale += morale_boost;
            effects.push(StatEffect {
                stat_name: "Morale".to_string(),
                old_value: old_morale,
                new_value: state.morale,
                delta: morale_boost,
            });

            ActionResult {
                success: true,
                message: message.to_string(),
                effects,
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
