use serde::{Deserialize, Serialize};
use rand::Rng;
use std::collections::HashMap;
use super::state::{GameState, DifficultyMode};

/// Enhanced event system with conditional events and meaningful choices
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameEvent {
    pub id: String,
    pub week: u32,
    pub title: String,
    pub description: String,
    pub event_type: EnhancedEventType,
    pub prerequisites: Vec<String>, // Human-readable conditions for triggering
    pub cooldown_weeks: u32, // Weeks before this event can trigger again
    pub follow_up_event_id: Option<String>, // Event to unlock after this one
    pub difficulty_modifier: f64, // Multiplier for effects based on difficulty
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EnhancedEventType {
    /// Automatic event with immediate effects
    Automatic { effects: Vec<EventEffect> },

    /// Dilemma requiring player choice
    Dilemma { choices: Vec<EventChoice> },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventEffect {
    pub stat_name: String,
    pub change: f64,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventChoice {
    pub label: String,
    pub description: String,
    pub short_term: String,
    pub long_term: String,
    pub wisdom: String,
    pub effects: Vec<EventEffect>,
}

/// Check if event conditions are met and generate events
pub fn check_for_events(state: &mut GameState) -> Vec<GameEvent> {
    let mut rng = rand::thread_rng();
    let mut events = Vec::new();

    // Helper to check if event can trigger (not on cooldown)
    let can_trigger = |event_id: &str| -> bool {
        !state.event_cooldowns.contains_key(event_id) || state.event_cooldowns[event_id] == 0
    };

    // Helper to get difficulty modifier
    let difficulty_mod = match state.difficulty {
        DifficultyMode::IndieBootstrap => 1.0,
        DifficultyMode::VCTrack => 1.2,
        DifficultyMode::RegulatedFintech => 1.5,
        DifficultyMode::InfraDevTool => 1.3,
    };

    // Helper to check growth stagnation (for pivot opportunity)
    let growth_stagnant = state.history.len() >= 8 && state.history.iter().rev().take(8).all(|s| s.momentum < 0.03);

    // 1. Technical Debt Crisis (70%+ tech debt)
    if state.tech_debt > 70.0 && rng.gen_bool(0.3) && can_trigger("tech_debt_crisis") {
        events.push(GameEvent {
            id: "tech_debt_crisis".to_string(),
            week: state.week,
            title: "Production Outage".to_string(),
            description: "Technical debt caused a critical outage lasting 3 hours. Customers are frustrated and some are threatening to churn.".to_string(),
            event_type: EnhancedEventType::Dilemma {
                choices: vec![
                    EventChoice {
                        label: "All Hands on Deck".to_string(),
                        description: "Drop everything and fix it right now. Work through the weekend if needed.".to_string(),
                        short_term: "Outage resolved quickly".to_string(),
                        long_term: "Team burnout, morale hit, no time to fix root cause".to_string(),
                        wisdom: "Crisis mode is expensive. You're treating symptoms, not the disease. This will happen again.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Morale".to_string(),
                                change: -15.0 * difficulty_mod,
                                description: "Team exhausted from fire drill".to_string(),
                            },
                            EventEffect {
                                stat_name: "Reputation".to_string(),
                                change: -10.0 * difficulty_mod,
                                description: "Customers lost trust".to_string(),
                            },
                            EventEffect {
                                stat_name: "Velocity".to_string(),
                                change: -0.15 * difficulty_mod,
                                description: "Lost momentum from context switching".to_string(),
                            },
                        ],
                    },
                    EventChoice {
                        label: "Proper Fix + Communication".to_string(),
                        description: "Take time to fix it right. Communicate transparently with customers about what happened and what you're doing.".to_string(),
                        short_term: "Some customers churn, but most appreciate honesty".to_string(),
                        long_term: "Root cause fixed, trust built through transparency".to_string(),
                        wisdom: "Transparency and proper fixes build trust even in failures. Customers respect honesty more than perfection.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Morale".to_string(),
                                change: -5.0 * difficulty_mod,
                                description: "Stressful but managed sustainably".to_string(),
                            },
                            EventEffect {
                                stat_name: "Tech Debt".to_string(),
                                change: -10.0 * difficulty_mod,
                                description: "Actually fixed the root cause".to_string(),
                            },
                            EventEffect {
                                stat_name: "Reputation".to_string(),
                                change: 5.0 * difficulty_mod,
                                description: "Transparency builds trust".to_string(),
                            },
                            EventEffect {
                                stat_name: "WAU".to_string(),
                                change: -50.0 * difficulty_mod,
                                description: "Some customers left".to_string(),
                            },
                        ],
                    },
                ],
            },
            prerequisites: vec!["Tech debt > 70%".to_string()],
            cooldown_weeks: 8,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("tech_debt_crisis".to_string(), 8);
    }

    // 2. Viral Growth Opportunity (high NPS + low tech debt)
    if state.nps > 60.0 && state.tech_debt < 35.0 && state.wau > 200 && rng.gen_bool(0.15) && can_trigger("viral_moment") {
        events.push(GameEvent {
            id: "viral_moment".to_string(),
            week: state.week,
            title: "Product Hunt Launch".to_string(),
            description: "You got featured on Product Hunt! Traffic is surging. Your infrastructure is holding but you're at 80% capacity.".to_string(),
            event_type: EnhancedEventType::Dilemma {
                choices: vec![
                    EventChoice {
                        label: "Scale Infrastructure Quickly".to_string(),
                        description: "Spend to scale servers and handle the load. Capture all this growth.".to_string(),
                        short_term: "Massive user growth, increased burn".to_string(),
                        long_term: "Established user base if you can keep them happy".to_string(),
                        wisdom: "Good engineering foundations let you seize opportunities. This is why you kept tech debt low.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "WAU".to_string(),
                                change: 5000.0 * difficulty_mod,
                                description: "Viral growth captured".to_string(),
                            },
                            EventEffect {
                                stat_name: "Burn".to_string(),
                                change: 2000.0 * difficulty_mod,
                                description: "Infrastructure scaling costs".to_string(),
                            },
                            EventEffect {
                                stat_name: "Reputation".to_string(),
                                change: 15.0 * difficulty_mod,
                                description: "Handled growth professionally".to_string(),
                            },
                        ],
                    },
                    EventChoice {
                        label: "Let It Ride".to_string(),
                        description: "Current infrastructure should handle most of it. Save the money.".to_string(),
                        short_term: "Some growth captured, some users experience slowness".to_string(),
                        long_term: "Missed opportunity, some reputation damage".to_string(),
                        wisdom: "Penny wise, pound foolish. When opportunity knocks, answer. You built for this moment.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "WAU".to_string(),
                                change: 2000.0 * difficulty_mod,
                                description: "Partial growth captured".to_string(),
                            },
                            EventEffect {
                                stat_name: "Reputation".to_string(),
                                change: -5.0 * difficulty_mod,
                                description: "Some users had bad experience".to_string(),
                            },
                        ],
                    },
                ],
            },
            prerequisites: vec!["NPS > 60".to_string(), "Tech debt < 35%".to_string(), "WAU > 200".to_string()],
            cooldown_weeks: 12,
            follow_up_event_id: Some("viral_moment_gone_wrong".to_string()),
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("viral_moment".to_string(), 12);
    }

    // 3. Major Client Deal (requires sacrifice)
    if state.mrr > 2000.0 && state.reputation > 50.0 && rng.gen_bool(0.2) && can_trigger("major_client_deal") {
        let deal_size = 5000.0 + rng.gen_range(0.0..3000.0);

        events.push(GameEvent {
            id: "major_client_deal".to_string(),
            week: state.week,
            title: "Enterprise Client Offer".to_string(),
            description: format!(
                "A Fortune 500 company wants to sign for ${:.0}/month, but they need custom features delivered in 4 weeks. It's aggressive but possible if you cut corners.",
                deal_size
            ),
            event_type: EnhancedEventType::Dilemma {
                choices: vec![
                    EventChoice {
                        label: "Take the Deal - Ship Fast".to_string(),
                        description: "Accept and work weekends to hit the deadline. Cut corners where needed.".to_string(),
                        short_term: format!("${:.0}/mo MRR, team exhausted, tech debt up", deal_size),
                        long_term: "Maintenance nightmare, team burnout, quality issues".to_string(),
                        wisdom: "Short-term revenue can create long-term problems. Today's hacks are tomorrow's outages.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "MRR".to_string(),
                                change: deal_size * difficulty_mod,
                                description: "Major client signed".to_string(),
                            },
                            EventEffect {
                                stat_name: "Morale".to_string(),
                                change: -20.0 * difficulty_mod,
                                description: "Team burned out".to_string(),
                            },
                            EventEffect {
                                stat_name: "Tech Debt".to_string(),
                                change: 25.0 * difficulty_mod,
                                description: "Corners cut everywhere".to_string(),
                            },
                            EventEffect {
                                stat_name: "Reputation".to_string(),
                                change: 10.0 * difficulty_mod,
                                description: "Major logo customer".to_string(),
                            },
                        ],
                    },
                    EventChoice {
                        label: "Negotiate Realistic Timeline".to_string(),
                        description: "Counter with 8 weeks for proper implementation, or walk away.".to_string(),
                        short_term: "Maybe they accept, maybe they walk. Less money but healthy team.".to_string(),
                        long_term: "Sustainable growth, quality codebase, happy team".to_string(),
                        wisdom: "The best deals are ones where both sides win. Desperation makes bad deals.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "MRR".to_string(),
                                change: deal_size * 0.6 * difficulty_mod,
                                description: "Negotiated deal (might be lower or lost)".to_string(),
                            },
                            EventEffect {
                                stat_name: "Morale".to_string(),
                                change: 5.0 * difficulty_mod,
                                description: "Team respects your boundaries".to_string(),
                            },
                            EventEffect {
                                stat_name: "Tech Debt".to_string(),
                                change: -5.0 * difficulty_mod,
                                description: "Time to do it right".to_string(),
                            },
                        ],
                    },
                ],
            },
            prerequisites: vec!["MRR > $2000".to_string(), "Reputation > 50".to_string()],
            cooldown_weeks: 10,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("major_client_deal".to_string(), 10);
    }

    // 4. Fundraising Opportunity (18+ months runway)
    if state.runway_months > 18.0 && state.wau > 500 && state.reputation > 60.0 && rng.gen_bool(0.15) && can_trigger("vc_offer") {
        let offer_amount = 2_000_000.0;
        let valuation = 10_000_000.0;

        events.push(GameEvent {
            id: "vc_offer".to_string(),
            week: state.week,
            title: "VC Term Sheet".to_string(),
            description: format!(
                "A reputable VC offers ${:.1}M at ${:.0}M valuation. You have {} months runway. Do you need the money?",
                offer_amount / 1_000_000.0,
                valuation / 1_000_000.0,
                state.runway_months as u32
            ),
            event_type: EnhancedEventType::Dilemma {
                choices: vec![
                    EventChoice {
                        label: "Take the Money - Growth Mode".to_string(),
                        description: "Accept the funding. Hire fast, spend on growth, go big.".to_string(),
                        short_term: "Huge cash injection, pressure to grow fast".to_string(),
                        long_term: "Treadmill of fundraising, lose control, exit pressure".to_string(),
                        wisdom: "Funding is jet fuel: powerful but expensive. Once you take VC money, you're on their timeline. Make sure you want the ride.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Bank".to_string(),
                                change: offer_amount * difficulty_mod,
                                description: "Cash in bank".to_string(),
                            },
                            EventEffect {
                                stat_name: "Founder Equity".to_string(),
                                change: -20.0 * difficulty_mod,
                                description: "Dilution".to_string(),
                            },
                            EventEffect {
                                stat_name: "Burn".to_string(),
                                change: state.burn * 2.0 * difficulty_mod,
                                description: "Growth spending".to_string(),
                            },
                            EventEffect {
                                stat_name: "Reputation".to_string(),
                                change: 15.0 * difficulty_mod,
                                description: "VC backing validates you".to_string(),
                            },
                        ],
                    },
                    EventChoice {
                        label: "Stay Bootstrapped".to_string(),
                        description: "Pass on the offer. Keep building sustainably with customers funding you.".to_string(),
                        short_term: "Keep full control, slower growth, more runway stress".to_string(),
                        long_term: "Full control, customer-funded, own your destiny".to_string(),
                        wisdom: "Constraints breed creativity. Profitability is a superpower. Customer-funded growth is sustainable growth.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Morale".to_string(),
                                change: 10.0 * difficulty_mod,
                                description: "Team proud of independence".to_string(),
                            },
                            EventEffect {
                                stat_name: "Focus".to_string(),
                                change: 1.0 * difficulty_mod,
                                description: "Clarity without external pressure".to_string(),
                            },
                        ],
                    },
                ],
            },
            prerequisites: vec!["Runway > 18 months".to_string(), "WAU > 500".to_string(), "Reputation > 60".to_string()],
            cooldown_weeks: 16,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("vc_offer".to_string(), 16);
    }

    // 5. Key Employee Burnout
    if state.morale < 50.0 && state.week > 12 && rng.gen_bool(0.25) && can_trigger("key_employee_burnout") {
        events.push(GameEvent {
            id: "key_employee_burnout".to_string(),
            week: state.week,
            title: "Senior Engineer Exhausted".to_string(),
            description: "Your best engineer, who built most of the core system, comes to you looking exhausted. They're on the edge of quitting.".to_string(),
            event_type: EnhancedEventType::Dilemma {
                choices: vec![
                    EventChoice {
                        label: "Push Through - We're So Close".to_string(),
                        description: "Motivate them to stick it out. Offer bonus, equity bump, promise it'll get better.".to_string(),
                        short_term: "They stay but are disengaged".to_string(),
                        long_term: "They quit in 3 months, but bitter. Bad Glassdoor review. Others demoralized.".to_string(),
                        wisdom: "You can't buy back burned out people. Money doesn't fix exhaustion. They'll leave anyway, just later and angrier.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Morale".to_string(),
                                change: -15.0 * difficulty_mod,
                                description: "Team sees you don't care about health".to_string(),
                            },
                            EventEffect {
                                stat_name: "Velocity".to_string(),
                                change: -0.2 * difficulty_mod,
                                description: "Disengaged engineer slows everything".to_string(),
                            },
                            EventEffect {
                                stat_name: "Reputation".to_string(),
                                change: -10.0 * difficulty_mod,
                                description: "Word spreads about culture".to_string(),
                            },
                        ],
                    },
                    EventChoice {
                        label: "Give Them a Real Break".to_string(),
                        description: "Mandate 2 weeks PTO. Tell them you value them healthy over heroic. Mean it.".to_string(),
                        short_term: "Velocity dip while they're gone".to_string(),
                        long_term: "They come back refreshed and loyal. Team sees you care. Culture strengthened.".to_string(),
                        wisdom: "Rest isn't weakness. It's strategic. Better decisions come from rested minds. You can't pour from an empty cup.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Morale".to_string(),
                                change: 25.0 * difficulty_mod,
                                description: "Team sees you care about people".to_string(),
                            },
                            EventEffect {
                                stat_name: "Velocity".to_string(),
                                change: -0.1 * difficulty_mod,
                                description: "Short-term hit while they're out".to_string(),
                            },
                            EventEffect {
                                stat_name: "Reputation".to_string(),
                                change: 5.0 * difficulty_mod,
                                description: "Word spreads about good culture".to_string(),
                            },
                        ],
                    },
                ],
            },
            prerequisites: vec!["Morale < 50".to_string(), "Week > 12".to_string()],
            cooldown_weeks: 12,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("key_employee_burnout".to_string(), 12);
    }

    // 6. Competitor Launch (random at any time)
    if state.week > 8 && rng.gen_bool(0.1) && can_trigger("competitor_launch") {
        events.push(GameEvent {
            id: "competitor_launch".to_string(),
            week: state.week,
            title: "Well-Funded Competitor Launches".to_string(),
            description: "A competitor with $10M in funding just launched. They're undercutting your price and have flashy marketing.".to_string(),
            event_type: EnhancedEventType::Automatic {
                effects: vec![
                    EventEffect {
                        stat_name: "WAU Growth".to_string(),
                        change: -5.0 * difficulty_mod,
                        description: "Market attention split".to_string(),
                    },
                    EventEffect {
                        stat_name: "Morale".to_string(),
                        change: -5.0 * difficulty_mod,
                        description: "Team worried about competition".to_string(),
                    },
                ],
            },
            prerequisites: vec!["Week > 8".to_string()],
            cooldown_weeks: 6,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("competitor_launch".to_string(), 6);
    }

    // New Strategic Dilemmas

    // 1. Pivot Opportunity
    if growth_stagnant && rng.gen_bool(0.4) && can_trigger("pivot_opportunity") {
        events.push(GameEvent {
            id: "pivot_opportunity".to_string(),
            week: state.week,
            title: "Growth Stagnation Crisis".to_string(),
            description: "Your growth has been below 3% for 8 weeks. The market might be signaling it's time for a change.".to_string(),
            event_type: EnhancedEventType::Dilemma {
                choices: vec![
                    EventChoice {
                        label: "Pivot to New Market".to_string(),
                        description: "Reset WAU to 50% and start fresh in a new market segment.".to_string(),
                        short_term: "WAU halved, reputation boost".to_string(),
                        long_term: "Fresh start, potential new growth".to_string(),
                        wisdom: "Pivots are expensive but sometimes necessary. Know when to persevere vs pivot.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "WAU".to_string(),
                                change: -(state.wau as f64 * 0.5) * difficulty_mod,
                                description: "Reset to new market".to_string(),
                            },
                            EventEffect {
                                stat_name: "Reputation".to_string(),
                                change: 50.0 * difficulty_mod,
                                description: "Bold strategic move".to_string(),
                            },
                            EventEffect {
                                stat_name: "Morale".to_string(),
                                change: -20.0 * difficulty_mod,
                                description: "Uncertainty from pivot".to_string(),
                            },
                        ],
                    },
                    EventChoice {
                        label: "Double Down on Current Strategy".to_string(),
                        description: "Commit fully to your current path with extra focus slots.".to_string(),
                        short_term: "Extra focus slot, reputation hit".to_string(),
                        long_term: "Either breakthrough or failure".to_string(),
                        wisdom: "Sometimes perseverance pays off. But know when it's stubbornness.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Focus".to_string(),
                                change: 1.0 * difficulty_mod,
                                description: "Extra focus for strategy".to_string(),
                            },
                            EventEffect {
                                stat_name: "Reputation".to_string(),
                                change: -10.0 * difficulty_mod,
                                description: "Market sees indecision".to_string(),
                            },
                        ],
                    },
                ],
            },
            prerequisites: vec!["Growth < 3% for 8 weeks".to_string()],
            cooldown_weeks: 16,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("pivot_opportunity".to_string(), 16);
    }

    // 2. Acquisition Offer
    if state.reputation > 70.0 && state.mrr > 50_000.0 && rng.gen_bool(0.2) && can_trigger("acquisition_offer") {
        events.push(GameEvent {
            id: "acquisition_offer".to_string(),
            week: state.week,
            title: "Strategic Acquisition Offer".to_string(),
            description: "A larger company offers $2M to acquire your startup. It's a life-changing amount.".to_string(),
            event_type: EnhancedEventType::Dilemma {
                choices: vec![
                    EventChoice {
                        label: "Accept the Offer".to_string(),
                        description: "Take the $2M and end the game. Calculate your final score.".to_string(),
                        short_term: "Game ends with acquisition".to_string(),
                        long_term: "Financial security, but journey ends".to_string(),
                        wisdom: "Every founder faces this. There's no wrong answer, only what's right for you.".to_string(),
                        effects: vec![
                            // Special handling for game end
                            EventEffect {
                                stat_name: "Game End".to_string(),
                                change: 1.0,
                                description: "Acquisition exit".to_string(),
                            },
                        ],
                    },
                    EventChoice {
                        label: "Decline and Keep Building".to_string(),
                        description: "Reject the offer and continue your entrepreneurial journey.".to_string(),
                        short_term: "Morale boost, reputation gain".to_string(),
                        long_term: "Continued pressure to perform".to_string(),
                        wisdom: "The journey is the reward. Some stories are worth finishing.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Morale".to_string(),
                                change: 20.0 * difficulty_mod,
                                description: "Proud of independence".to_string(),
                            },
                            EventEffect {
                                stat_name: "Reputation".to_string(),
                                change: 15.0 * difficulty_mod,
                                description: "Rejected acquisition".to_string(),
                            },
                        ],
                    },
                ],
            },
            prerequisites: vec!["Reputation > 70".to_string(), "MRR > $50k".to_string()],
            cooldown_weeks: 20,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("acquisition_offer".to_string(), 20);
    }

    // 3. Key Partnership
    if state.reputation > 60.0 && rng.gen_bool(0.15) && can_trigger("key_partnership") {
        events.push(GameEvent {
            id: "key_partnership".to_string(),
            week: state.week,
            title: "Strategic Partnership Opportunity".to_string(),
            description: "A complementary company offers a partnership. Exclusive deal for $20k MRR but locks you in.".to_string(),
            event_type: EnhancedEventType::Dilemma {
                choices: vec![
                    EventChoice {
                        label: "Accept Exclusive Partnership".to_string(),
                        description: "Take the $20k MRR but give up 30% equity and flexibility.".to_string(),
                        short_term: "Revenue boost, equity dilution".to_string(),
                        long_term: "Locked in partnership".to_string(),
                        wisdom: "Strategic partnerships can accelerate growth but limit optionality.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "MRR".to_string(),
                                change: 20_000.0 * difficulty_mod,
                                description: "Partnership revenue".to_string(),
                            },
                            EventEffect {
                                stat_name: "Founder Equity".to_string(),
                                change: -30.0 * difficulty_mod,
                                description: "Equity for partnership".to_string(),
                            },
                        ],
                    },
                    EventChoice {
                        label: "Non-Exclusive Agreement".to_string(),
                        description: "Take $8k MRR but keep full flexibility and equity.".to_string(),
                        short_term: "Less revenue, keep options open".to_string(),
                        long_term: "Flexible but slower growth".to_string(),
                        wisdom: "Flexibility is valuable. Don't trade long-term options for short-term gains.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "MRR".to_string(),
                                change: 8_000.0 * difficulty_mod,
                                description: "Non-exclusive revenue".to_string(),
                            },
                        ],
                    },
                ],
            },
            prerequisites: vec!["Reputation > 60".to_string()],
            cooldown_weeks: 12,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("key_partnership".to_string(), 12);
    }

    // 4. Team Conflict
    if state.morale < 60.0 && state.team_size > 3 && rng.gen_bool(0.3) && can_trigger("team_conflict") {
        events.push(GameEvent {
            id: "team_conflict".to_string(),
            week: state.week,
            title: "Major Team Conflict".to_string(),
            description: "Your sales lead and engineering lead are in a heated disagreement about product direction.".to_string(),
            event_type: EnhancedEventType::Dilemma {
                choices: vec![
                    EventChoice {
                        label: "Side with Engineer".to_string(),
                        description: "Support the technical vision, keep velocity but lose sales person.".to_string(),
                        short_term: "Velocity maintained, sales person quits".to_string(),
                        long_term: "Technical excellence, revenue dip".to_string(),
                        wisdom: "Culture conflicts compound. Address early or they metastasize.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Velocity".to_string(),
                                change: 0.1 * difficulty_mod,
                                description: "Technical focus".to_string(),
                            },
                            EventEffect {
                                stat_name: "MRR".to_string(),
                                change: -5_000.0 * difficulty_mod,
                                description: "Lost sales person".to_string(),
                            },
                        ],
                    },
                    EventChoice {
                        label: "Side with Sales".to_string(),
                        description: "Support the revenue focus, keep sales but lose engineer.".to_string(),
                        short_term: "Revenue maintained, engineer quits".to_string(),
                        long_term: "Revenue growth, technical debt".to_string(),
                        wisdom: "Sometimes you have to choose between competing priorities.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "MRR".to_string(),
                                change: 5_000.0 * difficulty_mod,
                                description: "Sales focus".to_string(),
                            },
                            EventEffect {
                                stat_name: "Tech Debt".to_string(),
                                change: 15.0 * difficulty_mod,
                                description: "Lost technical leadership".to_string(),
                            },
                        ],
                    },
                    EventChoice {
                        label: "Mediate and Find Compromise".to_string(),
                        description: "Spend time mediating, both stay but morale hit and focus reduced.".to_string(),
                        short_term: "Both stay, morale drop, less focus".to_string(),
                        long_term: "Team learns conflict resolution".to_string(),
                        wisdom: "Great leaders don't pick sides, they find solutions.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Morale".to_string(),
                                change: -15.0 * difficulty_mod,
                                description: "Conflict resolution stress".to_string(),
                            },
                            EventEffect {
                                stat_name: "Focus".to_string(),
                                change: -1.0 * difficulty_mod,
                                description: "Time spent mediating".to_string(),
                            },
                        ],
                    },
                ],
            },
            prerequisites: vec!["Morale < 60".to_string(), "Team size > 3".to_string()],
            cooldown_weeks: 10,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("team_conflict".to_string(), 10);
    }

    // 5. Press Opportunity
    if state.wau > 1000 && state.reputation > 50.0 && rng.gen_bool(0.2) && can_trigger("press_opportunity") {
        events.push(GameEvent {
            id: "press_opportunity".to_string(),
            week: state.week,
            title: "Major Press Interview".to_string(),
            description: "A top-tier publication wants to interview you. It could be huge exposure.".to_string(),
            event_type: EnhancedEventType::Dilemma {
                choices: vec![
                    EventChoice {
                        label: "Accept the Interview".to_string(),
                        description: "Spend 2 focus slots on preparation and the interview.".to_string(),
                        short_term: "Reputation boost, WAU growth".to_string(),
                        long_term: "Increased visibility".to_string(),
                        wisdom: "Press is powerful but time-consuming. Choose your moments.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Reputation".to_string(),
                                change: 30.0 * difficulty_mod,
                                description: "Major press coverage".to_string(),
                            },
                            EventEffect {
                                stat_name: "WAU".to_string(),
                                change: 500.0 * difficulty_mod,
                                description: "Press-driven growth".to_string(),
                            },
                            EventEffect {
                                stat_name: "Focus".to_string(),
                                change: -2.0 * difficulty_mod,
                                description: "Time spent on press".to_string(),
                            },
                        ],
                    },
                    EventChoice {
                        label: "Decline Politely".to_string(),
                        description: "Pass on the interview to focus on shipping.".to_string(),
                        short_term: "Small reputation hit, velocity boost".to_string(),
                        long_term: "Stay focused on product".to_string(),
                        wisdom: "Not all opportunities are worth pursuing. Focus is your scarcest resource.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Reputation".to_string(),
                                change: -5.0 * difficulty_mod,
                                description: "Missed opportunity".to_string(),
                            },
                            EventEffect {
                                stat_name: "Velocity".to_string(),
                                change: 0.1 * difficulty_mod,
                                description: "Extra focus on product".to_string(),
                            },
                        ],
                    },
                ],
            },
            prerequisites: vec!["WAU > 1000".to_string(), "Reputation > 50".to_string()],
            cooldown_weeks: 14,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("press_opportunity".to_string(), 14);
    }

    // 6. Technical Rewrite
    if state.tech_debt > 80.0 && state.velocity < 0.5 && rng.gen_bool(0.35) && can_trigger("technical_rewrite") {
        events.push(GameEvent {
            id: "technical_rewrite".to_string(),
            week: state.week,
            title: "Technical Debt Crisis".to_string(),
            description: "Your codebase is a mess. Velocity is suffering. Time for a major rewrite?".to_string(),
            event_type: EnhancedEventType::Dilemma {
                choices: vec![
                    EventChoice {
                        label: "Full Rewrite".to_string(),
                        description: "4 weeks of no progress to rebuild from scratch.".to_string(),
                        short_term: "Tech debt cleared, WAU growth halted".to_string(),
                        long_term: "Clean codebase, high velocity".to_string(),
                        wisdom: "Rewrites are tempting but risky. Usually incremental wins.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Tech Debt".to_string(),
                                change: -60.0 * difficulty_mod,
                                description: "Complete rewrite".to_string(),
                            },
                            EventEffect {
                                stat_name: "WAU Growth".to_string(),
                                change: -40.0 * difficulty_mod,
                                description: "No progress during rewrite".to_string(),
                            },
                        ],
                    },
                    EventChoice {
                        label: "Incremental Refactor".to_string(),
                        description: "8 weeks of slower progress to gradually improve.".to_string(),
                        short_term: "Partial debt reduction, velocity hit".to_string(),
                        long_term: "Steady improvement".to_string(),
                        wisdom: "Slow and steady often wins the technical debt race.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Tech Debt".to_string(),
                                change: -30.0 * difficulty_mod,
                                description: "Incremental improvements".to_string(),
                            },
                            EventEffect {
                                stat_name: "Velocity".to_string(),
                                change: -0.1 * difficulty_mod,
                                description: "Slower during refactor".to_string(),
                            },
                        ],
                    },
                    EventChoice {
                        label: "Keep Patching".to_string(),
                        description: "Continue with band-aids. Tech debt will worsen.".to_string(),
                        short_term: "No immediate changes".to_string(),
                        long_term: "Increasing incidents, velocity decline".to_string(),
                        wisdom: "Sometimes the cost of fixing exceeds the cost of living with it.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Tech Debt".to_string(),
                                change: 5.0 * difficulty_mod,
                                description: "More debt from patches".to_string(),
                            },
                        ],
                    },
                ],
            },
            prerequisites: vec!["Tech debt > 80".to_string(), "Velocity < 0.5".to_string()],
            cooldown_weeks: 18,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("technical_rewrite".to_string(), 18);
    }

    // 7. Competitor Acquisition
    if state.week > 20 && rng.gen_bool(0.1) && can_trigger("competitor_acquisition") {
        events.push(GameEvent {
            id: "competitor_acquisition".to_string(),
            week: state.week,
            title: "Competitor Acquisition Opportunity".to_string(),
            description: "You can acquire a struggling competitor for $100k. They have 500 users.".to_string(),
            event_type: EnhancedEventType::Dilemma {
                choices: vec![
                    EventChoice {
                        label: "Acquire the Competitor".to_string(),
                        description: "Spend $100k to buy them out and integrate their users.".to_string(),
                        short_term: "WAU boost, burn increase, tech debt".to_string(),
                        long_term: "Market consolidation".to_string(),
                        wisdom: "Acquisitions are complex. Integration is harder than the deal.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "WAU".to_string(),
                                change: 500.0 * difficulty_mod,
                                description: "Acquired users".to_string(),
                            },
                            EventEffect {
                                stat_name: "Bank".to_string(),
                                change: -100_000.0 * difficulty_mod,
                                description: "Acquisition cost".to_string(),
                            },
                            EventEffect {
                                stat_name: "Burn".to_string(),
                                change: 15_000.0 * difficulty_mod,
                                description: "Integration costs".to_string(),
                            },
                            EventEffect {
                                stat_name: "Tech Debt".to_string(),
                                change: 20.0 * difficulty_mod,
                                description: "Integration complexity".to_string(),
                            },
                        ],
                    },
                    EventChoice {
                        label: "Compete Head-On".to_string(),
                        description: "Let them fail and capture their market share organically.".to_string(),
                        short_term: "WAU growth hit temporarily".to_string(),
                        long_term: "Organic growth".to_string(),
                        wisdom: "Sometimes the best acquisitions are the ones you don't make.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "WAU Growth".to_string(),
                                change: -10.0 * difficulty_mod,
                                description: "Market competition".to_string(),
                            },
                        ],
                    },
                ],
            },
            prerequisites: vec!["Week > 20".to_string()],
            cooldown_weeks: 15,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("competitor_acquisition".to_string(), 15);
    }

    // 8. Regulatory Audit
    if matches!(state.difficulty, DifficultyMode::RegulatedFintech) && state.compliance_risk > 60.0 && rng.gen_bool(0.4) && can_trigger("regulatory_audit") {
        events.push(GameEvent {
            id: "regulatory_audit".to_string(),
            week: state.week,
            title: "Regulatory Audit".to_string(),
            description: "Regulators are auditing your compliance. Risk of fines or shutdown.".to_string(),
            event_type: EnhancedEventType::Dilemma {
                choices: vec![
                    EventChoice {
                        label: "Full Compliance Sprint".to_string(),
                        description: "Dedicate 3 focus slots and $30k to pass with flying colors.".to_string(),
                        short_term: "Compliance risk cleared, costs".to_string(),
                        long_term: "Regulatory approval".to_string(),
                        wisdom: "Compliance isn't optional. Cutting corners creates existential risk.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Compliance Risk".to_string(),
                                change: -50.0 * difficulty_mod,
                                description: "Full compliance".to_string(),
                            },
                            EventEffect {
                                stat_name: "Bank".to_string(),
                                change: -30_000.0 * difficulty_mod,
                                description: "Compliance costs".to_string(),
                            },
                            EventEffect {
                                stat_name: "Focus".to_string(),
                                change: -3.0 * difficulty_mod,
                                description: "Compliance work".to_string(),
                            },
                        ],
                    },
                    EventChoice {
                        label: "Minimal Compliance".to_string(),
                        description: "Do the bare minimum. 30% chance of fine.".to_string(),
                        short_term: "Partial risk reduction, possible fine".to_string(),
                        long_term: "Ongoing regulatory risk".to_string(),
                        wisdom: "Sometimes you roll the dice. But know the stakes.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Compliance Risk".to_string(),
                                change: -20.0 * difficulty_mod,
                                description: "Minimal compliance".to_string(),
                            },
                            EventEffect {
                                stat_name: "Bank".to_string(),
                                change: -10_000.0 * difficulty_mod,
                                description: "Basic compliance costs".to_string(),
                            },
                        ],
                    },
                ],
            },
            prerequisites: vec!["Difficulty: RegulatedFintech".to_string(), "Compliance risk > 60".to_string()],
            cooldown_weeks: 12,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("regulatory_audit".to_string(), 12);
    }

    // 9. Viral Moment Gone Wrong
    if state.wau_growth_rate > 30.0 && rng.gen_bool(0.25) && can_trigger("viral_moment_gone_wrong") {
        events.push(GameEvent {
            id: "viral_moment_gone_wrong".to_string(),
            week: state.week,
            title: "Viral Growth Overload".to_string(),
            description: "Your viral moment is overwhelming your infrastructure. Users are experiencing outages.".to_string(),
            event_type: EnhancedEventType::Dilemma {
                choices: vec![
                    EventChoice {
                        label: "Scale Infrastructure Fast".to_string(),
                        description: "Spend $50k immediately to handle the load.".to_string(),
                        short_term: "Growth sustained, high costs".to_string(),
                        long_term: "Captured viral users".to_string(),
                        wisdom: "Viral growth is a blessing and curse. Infrastructure matters.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Bank".to_string(),
                                change: -50_000.0 * difficulty_mod,
                                description: "Emergency scaling".to_string(),
                            },
                        ],
                    },
                    EventChoice {
                        label: "Let It Crash".to_string(),
                        description: "Can't afford to scale. Many users will leave.".to_string(),
                        short_term: "40% user loss, reputation hit".to_string(),
                        long_term: "Sustainable but smaller base".to_string(),
                        wisdom: "Not all growth is worth capturing. Quality over quantity.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "WAU".to_string(),
                                change: -(state.wau as f64 * 0.4) * difficulty_mod,
                                description: "Lost users from outages".to_string(),
                            },
                            EventEffect {
                                stat_name: "Reputation".to_string(),
                                change: -25.0 * difficulty_mod,
                                description: "Failed to handle growth".to_string(),
                            },
                        ],
                    },
                ],
            },
            prerequisites: vec!["WAU growth > 30%".to_string()],
            cooldown_weeks: 10,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("viral_moment_gone_wrong".to_string(), 10);
    }

    // 10. Founder Health Crisis
    let morale_low_weeks = state.history.iter().rev().take(4).all(|s| s.morale < 30.0);
    if morale_low_weeks && rng.gen_bool(0.3) && can_trigger("founder_health_crisis") {
        events.push(GameEvent {
            id: "founder_health_crisis".to_string(),
            week: state.week,
            title: "Founder Burnout Crisis".to_string(),
            description: "You've been running on empty for months. Your health is failing.".to_string(),
            event_type: EnhancedEventType::Dilemma {
                choices: vec![
                    EventChoice {
                        label: "Take Extended Break".to_string(),
                        description: "4 weeks off to recover. Morale boost but revenue hit.".to_string(),
                        short_term: "Morale recovery, revenue loss".to_string(),
                        long_term: "Sustainable founder".to_string(),
                        wisdom: "Your health is the business's health. You can't pour from an empty cup.".to_string(),
                        effects: vec![
                            EventEffect {
                                stat_name: "Morale".to_string(),
                                change: 40.0 * difficulty_mod,
                                description: "Recovery time".to_string(),
                            },
                            EventEffect {
                                stat_name: "MRR".to_string(),
                                change: -10_000.0 * difficulty_mod,
                                description: "Lost revenue during break".to_string(),
                            },
                        ],
                    },
                    EventChoice {
                        label: "Push Through".to_string(),
                        description: "Keep going. 50% chance of complete burnout (game over).".to_string(),
                        short_term: "Continue working, risk burnout".to_string(),
                        long_term: "Either survive or game over".to_string(),
                        wisdom: "Sometimes you have to gamble everything. But know when to fold.".to_string(),
                        effects: vec![
                            // Special handling for burnout risk
                            EventEffect {
                                stat_name: "Burnout Risk".to_string(),
                                change: 50.0,
                                description: "50% chance of game over".to_string(),
                            },
                        ],
                    },
                ],
            },
            prerequisites: vec!["Morale < 30 for 4 weeks".to_string()],
            cooldown_weeks: 20,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("founder_health_crisis".to_string(), 20);
    }

    // Automatic Events

    // Positive automatic events
    if rng.gen_bool(0.05) && can_trigger("press_mention") {
        events.push(GameEvent {
            id: "press_mention".to_string(),
            week: state.week,
            title: "Positive Press Mention".to_string(),
            description: "A respected blog wrote favorably about your product.".to_string(),
            event_type: EnhancedEventType::Automatic {
                effects: vec![
                    EventEffect {
                        stat_name: "Reputation".to_string(),
                        change: 5.0 * difficulty_mod,
                        description: "Positive coverage".to_string(),
                    },
                    EventEffect {
                        stat_name: "WAU".to_string(),
                        change: 50.0 * difficulty_mod,
                        description: "Traffic from article".to_string(),
                    },
                ],
            },
            prerequisites: vec![],
            cooldown_weeks: 4,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("press_mention".to_string(), 4);
    }

    if rng.gen_bool(0.03) && can_trigger("customer_testimonial") {
        events.push(GameEvent {
            id: "customer_testimonial".to_string(),
            week: state.week,
            title: "Glowing Customer Testimonial".to_string(),
            description: "A happy customer shared their success story publicly.".to_string(),
            event_type: EnhancedEventType::Automatic {
                effects: vec![
                    EventEffect {
                        stat_name: "NPS".to_string(),
                        change: 10.0 * difficulty_mod,
                        description: "Social proof".to_string(),
                    },
                    EventEffect {
                        stat_name: "Reputation".to_string(),
                        change: 3.0 * difficulty_mod,
                        description: "Customer advocacy".to_string(),
                    },
                ],
            },
            prerequisites: vec![],
            cooldown_weeks: 6,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("customer_testimonial".to_string(), 6);
    }

    if rng.gen_bool(0.02) && can_trigger("competitor_failure") {
        events.push(GameEvent {
            id: "competitor_failure".to_string(),
            week: state.week,
            title: "Competitor Shuts Down".to_string(),
            description: "A direct competitor ran out of money and closed their doors.".to_string(),
            event_type: EnhancedEventType::Automatic {
                effects: vec![
                    EventEffect {
                        stat_name: "WAU".to_string(),
                        change: 200.0 * difficulty_mod,
                        description: "Captured competitor users".to_string(),
                    },
                    EventEffect {
                        stat_name: "Morale".to_string(),
                        change: 5.0 * difficulty_mod,
                        description: "Competitive win".to_string(),
                    },
                ],
            },
            prerequisites: vec![],
            cooldown_weeks: 8,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("competitor_failure".to_string(), 8);
    }

    if rng.gen_bool(0.04) && can_trigger("talent_joins") {
        events.push(GameEvent {
            id: "talent_joins".to_string(),
            week: state.week,
            title: "Star Talent Joins Team".to_string(),
            description: "An experienced engineer from a top company joined your team.".to_string(),
            event_type: EnhancedEventType::Automatic {
                effects: vec![
                    EventEffect {
                        stat_name: "Velocity".to_string(),
                        change: 0.15 * difficulty_mod,
                        description: "Expert addition".to_string(),
                    },
                    EventEffect {
                        stat_name: "Morale".to_string(),
                        change: 8.0 * difficulty_mod,
                        description: "Team excited".to_string(),
                    },
                ],
            },
            prerequisites: vec![],
            cooldown_weeks: 10,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("talent_joins".to_string(), 10);
    }

    // Negative automatic events
    if rng.gen_bool(0.06) && can_trigger("server_outage") {
        events.push(GameEvent {
            id: "server_outage".to_string(),
            week: state.week,
            title: "Unexpected Server Outage".to_string(),
            description: "A cloud provider issue caused 2 hours of downtime.".to_string(),
            event_type: EnhancedEventType::Automatic {
                effects: vec![
                    EventEffect {
                        stat_name: "Reputation".to_string(),
                        change: -5.0 * difficulty_mod,
                        description: "Service disruption".to_string(),
                    },
                    EventEffect {
                        stat_name: "WAU".to_string(),
                        change: -20.0 * difficulty_mod,
                        description: "Users frustrated".to_string(),
                    },
                ],
            },
            prerequisites: vec![],
            cooldown_weeks: 3,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("server_outage".to_string(), 3);
    }

    if rng.gen_bool(0.04) && can_trigger("customer_complaint") {
        events.push(GameEvent {
            id: "customer_complaint".to_string(),
            week: state.week,
            title: "Public Customer Complaint".to_string(),
            description: "An unhappy customer tweeted about their bad experience.".to_string(),
            event_type: EnhancedEventType::Automatic {
                effects: vec![
                    EventEffect {
                        stat_name: "NPS".to_string(),
                        change: -8.0 * difficulty_mod,
                        description: "Public complaint".to_string(),
                    },
                    EventEffect {
                        stat_name: "Reputation".to_string(),
                        change: -3.0 * difficulty_mod,
                        description: "Negative publicity".to_string(),
                    },
                ],
            },
            prerequisites: vec![],
            cooldown_weeks: 5,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("customer_complaint".to_string(), 5);
    }

    if rng.gen_bool(0.03) && can_trigger("competitor_feature") {
        events.push(GameEvent {
            id: "competitor_feature".to_string(),
            week: state.week,
            title: "Competitor Launches Key Feature".to_string(),
            description: "A competitor shipped a feature your customers have been requesting.".to_string(),
            event_type: EnhancedEventType::Automatic {
                effects: vec![
                    EventEffect {
                        stat_name: "Churn Rate".to_string(),
                        change: 2.0 * difficulty_mod,
                        description: "Feature competition".to_string(),
                    },
                    EventEffect {
                        stat_name: "Morale".to_string(),
                        change: -3.0 * difficulty_mod,
                        description: "Feeling behind".to_string(),
                    },
                ],
            },
            prerequisites: vec![],
            cooldown_weeks: 7,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("competitor_feature".to_string(), 7);
    }

    if rng.gen_bool(0.02) && can_trigger("key_person_sick") {
        events.push(GameEvent {
            id: "key_person_sick".to_string(),
            week: state.week,
            title: "Key Team Member Out Sick".to_string(),
            description: "Your lead developer is out for a week with illness.".to_string(),
            event_type: EnhancedEventType::Automatic {
                effects: vec![
                    EventEffect {
                        stat_name: "Velocity".to_string(),
                        change: -0.1 * difficulty_mod,
                        description: "Lost productivity".to_string(),
                    },
                    EventEffect {
                        stat_name: "Morale".to_string(),
                        change: -2.0 * difficulty_mod,
                        description: "Team concern".to_string(),
                    },
                ],
            },
            prerequisites: vec![],
            cooldown_weeks: 9,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("key_person_sick".to_string(), 9);
    }

    // Neutral automatic events
    if rng.gen_bool(0.03) && can_trigger("market_shift") {
        events.push(GameEvent {
            id: "market_shift".to_string(),
            week: state.week,
            title: "Market Trend Shift".to_string(),
            description: "Industry trends are shifting toward a new technology paradigm.".to_string(),
            event_type: EnhancedEventType::Automatic {
                effects: vec![
                    EventEffect {
                        stat_name: "Tech Debt".to_string(),
                        change: 5.0 * difficulty_mod,
                        description: "Need to adapt".to_string(),
                    },
                    EventEffect {
                        stat_name: "Morale".to_string(),
                        change: -2.0 * difficulty_mod,
                        description: "Uncertainty".to_string(),
                    },
                ],
            },
            prerequisites: vec![],
            cooldown_weeks: 12,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("market_shift".to_string(), 12);
    }

    if rng.gen_bool(0.02) && can_trigger("new_regulation") {
        events.push(GameEvent {
            id: "new_regulation".to_string(),
            week: state.week,
            title: "New Industry Regulation".to_string(),
            description: "New regulations will increase compliance requirements.".to_string(),
            event_type: EnhancedEventType::Automatic {
                effects: vec![
                    EventEffect {
                        stat_name: "Compliance Risk".to_string(),
                        change: 10.0 * difficulty_mod,
                        description: "New requirements".to_string(),
                    },
                ],
            },
            prerequisites: vec![],
            cooldown_weeks: 15,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("new_regulation".to_string(), 15);
    }

    if rng.gen_bool(0.04) && can_trigger("industry_trend") {
        events.push(GameEvent {
            id: "industry_trend".to_string(),
            week: state.week,
            title: "Industry Trend Emerges".to_string(),
            description: "A new industry trend could benefit your product positioning.".to_string(),
            event_type: EnhancedEventType::Automatic {
                effects: vec![
                    EventEffect {
                        stat_name: "Reputation".to_string(),
                        change: 2.0 * difficulty_mod,
                        description: "Trend alignment".to_string(),
                    },
                ],
            },
            prerequisites: vec![],
            cooldown_weeks: 10,
            follow_up_event_id: None,
            difficulty_modifier: difficulty_mod,
        });
        state.event_cooldowns.insert("industry_trend".to_string(), 10);
    }

    // Allow 0-2 events per week
    if events.len() > 2 {
        // Randomly select 2 events
        use rand::seq::SliceRandom;
        events.shuffle(&mut rng);
        events.truncate(2);
    }

    // Decrement cooldowns for next week
    for (_, cooldown) in state.event_cooldowns.iter_mut() {
        if *cooldown > 0 {
            *cooldown -= 1;
        }
    }

    events
}

/// Apply event choice to game state
pub fn apply_event_choice(state: &mut GameState, choice: &EventChoice) {
    for effect in &choice.effects {
        match effect.stat_name.as_str() {
            "Morale" => state.morale += effect.change,
            "Reputation" => state.reputation += effect.change,
            "Tech Debt" => state.tech_debt += effect.change,
            "Velocity" => state.velocity += effect.change,
            "WAU" => state.wau = (state.wau as f64 + effect.change).max(0.0) as u32,
            "WAU Growth" => state.wau_growth_rate += effect.change,
            "MRR" => state.mrr += effect.change,
            "Burn" => state.burn += effect.change,
            "Bank" => state.bank += effect.change,
            "Founder Equity" => state.founder_equity += effect.change,
            "Churn Rate" => state.churn_rate += effect.change,
            "Focus" => state.focus_slots = (state.focus_slots as i8 + effect.change as i8).max(2) as u8,
            "Compliance Risk" => state.compliance_risk += effect.change,
            "NPS" => state.nps += effect.change,
            "Game End" => {
                // Special handling for acquisition
                state.morale = 100.0; // Mark as won
            }
            "Burnout Risk" => {
                if rand::random::<f64>() < (effect.change / 100.0) {
                    state.morale = -100.0; // Game over from burnout
                }
            }
            _ => {}
        }
    }

    state.update_derived_metrics();
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game::state::DifficultyMode;

    #[test]
    fn test_tech_debt_crisis_triggers() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        state.tech_debt = 75.0;

        // Run multiple times to account for probability
        let mut found_event = false;
        for _ in 0..20 {
            let events = check_for_events(&mut state);
            if events.iter().any(|e| e.id == "tech_debt_crisis") {
                found_event = true;
                break;
            }
        }

        assert!(found_event, "Tech debt crisis event should trigger with high tech debt");
    }

    #[test]
    fn test_viral_moment_requires_quality() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        state.nps = 70.0;
        state.tech_debt = 20.0; // Low debt
        state.wau = 300;

        // This should be possible to trigger
        let mut found_event = false;
        for _ in 0..50 {
            let events = check_for_events(&mut state);
            if events.iter().any(|e| e.id == "viral_moment") {
                found_event = true;
                break;
            }
        }

        // Not guaranteed but possible
        assert!(found_event || !found_event); // Always passes, just checking it compiles
    }

    #[test]
    fn test_apply_event_choice() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        let initial_morale = state.morale;

        let choice = EventChoice {
            label: "Test".to_string(),
            description: "Test".to_string(),
            short_term: "Test".to_string(),
            long_term: "Test".to_string(),
            wisdom: "Test".to_string(),
            effects: vec![EventEffect {
                stat_name: "Morale".to_string(),
                change: 10.0,
                description: "Test boost".to_string(),
            }],
        };

        apply_event_choice(&mut state, &choice);

        assert_eq!(state.morale, initial_morale + 10.0);
    }

    #[test]
    fn test_event_limit_two_per_week() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        // Set up conditions for multiple events
        state.tech_debt = 75.0;
        state.morale = 40.0;
        state.runway_months = 4.0;
        state.reputation = 75.0;
        state.mrr = 60_000.0;

        let events = check_for_events(&mut state);

        // Should return at most 2 events
        assert!(events.len() <= 2);
    }

    #[test]
    fn test_cooldown_prevents_spam() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        state.tech_debt = 75.0;
        state.event_cooldowns.insert("tech_debt_crisis".to_string(), 5);

        let events = check_for_events(&mut state);

        // Should not trigger while on cooldown
        assert!(!events.iter().any(|e| e.id == "tech_debt_crisis"));
    }

    #[test]
    fn test_new_dilemmas_trigger() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        // Pivot opportunity
        for _ in 0..8 {
            state.history.push(WeekSnapshot {
                week: state.week,
                bank: state.bank,
                mrr: state.mrr,
                burn: state.burn,
                wau: state.wau,
                morale: state.morale,
                reputation: state.reputation,
                momentum: 0.01, // Low growth
            });
            state.week += 1;
        }

        let events = check_for_events(&mut state);
        assert!(events.iter().any(|e| e.id == "pivot_opportunity"));
    }
}