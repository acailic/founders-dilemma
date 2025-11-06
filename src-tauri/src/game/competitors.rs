use rand::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Competitor {
    pub id: String,
    pub name: String,
    pub tagline: String,
    pub funding_stage: FundingStage,
    pub feature_parity: f64,
    pub pricing_strategy: PricingStrategy,
    pub market_share: f64,
    pub aggressiveness: f64,
    pub last_action_week: u32,
    pub action_history: Vec<CompetitorAction>,
    pub total_funding: f64,
    pub team_size: u32,
    pub is_acquired: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FundingStage {
    Bootstrapped,
    Seed,
    SeriesA,
    SeriesB,
    SeriesC,
    PublicCompany,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PricingStrategy {
    Freemium,
    Undercut,
    Premium,
    Enterprise,
    OpenSource,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompetitorAction {
    pub week: u32,
    pub action_type: CompetitorActionType,
    pub description: String,
    pub impact_on_player: String,
    pub amount: Option<f64>, // For funding rounds and acquisitions
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CompetitorActionType {
    FeatureLaunch,
    PricingChange,
    FundingRound,
    Acquisition,
    ProductPivot,
    MarketingBlitz,
    TalentPoach,
    PartnershipAnnouncement,
}

pub fn generate_competitors(difficulty: &super::DifficultyMode, week: u32) -> Vec<Competitor> {
    let mut rng = rand::thread_rng();
    let count = match difficulty {
        super::DifficultyMode::IndieBootstrap => rng.gen_range(2..=3),
        super::DifficultyMode::VCTrack => rng.gen_range(3..=4),
        super::DifficultyMode::RegulatedFintech => rng.gen_range(2..=3),
        super::DifficultyMode::InfraDevTool => rng.gen_range(3..=4),
    };

    (0..count)
        .map(|_| generate_competitor_persona(difficulty, week))
        .collect()
}

pub fn generate_competitor_name() -> (String, String) {
    let mut rng = rand::thread_rng();
    let names = vec![
        "TechFlow", "DataSync", "CloudPulse", "NexusAI", "StreamLine",
        "VelocityHQ", "PulseMetrics", "FlowState", "SyncWave", "ApexTools",
    ];
    let taglines = vec![
        "The modern solution for teams",
        "Ship faster, together",
        "Enterprise-grade platform",
        "Built for developers",
        "Next-generation productivity",
        "AI-powered insights",
        "Real-time collaboration",
        "Scalable infrastructure",
        "Developer-first tools",
        "Data-driven decisions",
    ];

    let name = names[rng.gen_range(0..names.len())].to_string();
    let tagline = taglines[rng.gen_range(0..taglines.len())].to_string();
    (name, tagline)
}

pub fn generate_competitor_persona(difficulty: &super::DifficultyMode, week: u32) -> Competitor {
    let mut rng = rand::thread_rng();
    let (name, tagline) = generate_competitor_name();

    let funding_stage = determine_funding_stage(difficulty);
    let pricing_strategy = determine_pricing_strategy();
    let total_funding = funding_stage_to_amount(&funding_stage);
    let team_size = calculate_competitor_team_size(total_funding);

    let aggressiveness = match difficulty {
        super::DifficultyMode::IndieBootstrap => rng.gen_range(0.3..=0.6),
        super::DifficultyMode::VCTrack => rng.gen_range(0.5..=0.8),
        super::DifficultyMode::RegulatedFintech => rng.gen_range(0.4..=0.7),
        super::DifficultyMode::InfraDevTool => rng.gen_range(0.6..=0.9),
    };

    Competitor {
        id: generate_competitor_id(),
        name,
        tagline,
        funding_stage,
        feature_parity: rng.gen_range(20.0..=60.0),
        pricing_strategy,
        market_share: 0.0, // Will be calculated later
        aggressiveness,
        last_action_week: week,
        action_history: Vec::new(),
        total_funding,
        team_size,
        is_acquired: false,
    }
}

pub fn determine_funding_stage(difficulty: &super::DifficultyMode) -> FundingStage {
    let mut rng = rand::thread_rng();
    match difficulty {
        super::DifficultyMode::IndieBootstrap => {
            if rng.gen_bool(0.7) { FundingStage::Bootstrapped } else { FundingStage::Seed }
        },
        super::DifficultyMode::VCTrack => {
            match rng.gen_range(0..3) {
                0 => FundingStage::Seed,
                1 => FundingStage::SeriesA,
                _ => FundingStage::SeriesB,
            }
        },
        super::DifficultyMode::RegulatedFintech => {
            match rng.gen_range(0..3) {
                0 => FundingStage::SeriesA,
                1 => FundingStage::SeriesB,
                _ => FundingStage::SeriesC,
            }
        },
        super::DifficultyMode::InfraDevTool => {
            match rng.gen_range(0..3) {
                0 => FundingStage::Seed,
                1 => FundingStage::SeriesA,
                _ => FundingStage::SeriesB,
            }
        },
    }
}

pub fn determine_pricing_strategy() -> PricingStrategy {
    let mut rng = rand::thread_rng();
    let roll = rng.gen_range(0..100);
    match roll {
        0..=39 => PricingStrategy::Freemium,
        40..=59 => PricingStrategy::Undercut,
        60..=79 => PricingStrategy::Premium,
        80..=94 => PricingStrategy::Enterprise,
        _ => PricingStrategy::OpenSource,
    }
}

pub fn generate_competitor_action(competitor: &Competitor, state: &super::GameState) -> Option<CompetitorAction> {
    let mut rng = rand::thread_rng();

    // Probability based on aggressiveness
    if !rng.gen_bool(competitor.aggressiveness * 0.3) {
        return None;
    }

    let action_type = match rng.gen_range(0..8) {
        0 => CompetitorActionType::FeatureLaunch,
        1 => CompetitorActionType::PricingChange,
        2 => CompetitorActionType::FundingRound,
        3 => CompetitorActionType::Acquisition,
        4 => CompetitorActionType::ProductPivot,
        5 => CompetitorActionType::MarketingBlitz,
        6 => CompetitorActionType::TalentPoach,
        _ => CompetitorActionType::PartnershipAnnouncement,
    };

    let (description, impact, amount) = match action_type {
        CompetitorActionType::FeatureLaunch => (generate_feature_launch(competitor, state).0, generate_feature_launch(competitor, state).1, None),
        CompetitorActionType::PricingChange => (generate_pricing_change(competitor, state).0, generate_pricing_change(competitor, state).1, None),
        CompetitorActionType::FundingRound => {
            let (desc, impact) = generate_funding_round(competitor);
            let amount = Some(competitor.total_funding); // Use the competitor's total funding as the round amount
            (desc, impact, amount)
        },
        CompetitorActionType::Acquisition => {
            let (desc, impact) = generate_acquisition_action(competitor);
            let amount = Some(rand::thread_rng().gen_range(50..=200) as f64 * 1_000_000.0); // Random acquisition amount
            (desc, impact, amount)
        },
        CompetitorActionType::ProductPivot => ("Pivoted to a new market segment".to_string(), "Reduced competitive pressure".to_string(), None),
        CompetitorActionType::MarketingBlitz => ("Launched aggressive marketing campaign".to_string(), "Increased brand awareness".to_string(), None),
        CompetitorActionType::TalentPoach => ("Poaching talent from competitors".to_string(), "Building stronger team".to_string(), None),
        CompetitorActionType::PartnershipAnnouncement => ("Announced strategic partnership".to_string(), "Expanded market reach".to_string(), None),
    };

    Some(CompetitorAction {
        week: state.week,
        action_type,
        description,
        impact_on_player: impact,
        amount,
    })
}

pub fn generate_feature_launch(competitor: &Competitor, state: &super::GameState) -> (String, String) {
    let features = vec![
        "advanced analytics", "mobile app", "API integrations", "enterprise SSO",
        "real-time collaboration", "AI-powered insights", "automated workflows",
        "advanced security", "custom dashboards", "integrations marketplace"
    ];
    let mut rng = rand::thread_rng();
    let feature = features[rng.gen_range(0..features.len())];

    let description = format!("Launched {} - a feature you don't have yet", feature);
    let impact = if state.velocity < 1.0 {
        "Gaining competitive advantage in features"
    } else {
        "Keeping pace with market demands"
    }.to_string();

    (description, impact)
}

pub fn generate_pricing_change(competitor: &Competitor, state: &super::GameState) -> (String, String) {
    let description = match competitor.pricing_strategy {
        PricingStrategy::Undercut => "Cut prices by 30% to gain market share".to_string(),
        PricingStrategy::Freemium => "Expanded free tier to attract more users".to_string(),
        _ => "Adjusted pricing strategy".to_string(),
    };

    let impact = "May pressure your pricing and margins".to_string();
    (description, impact)
}

pub fn generate_funding_round(competitor: &Competitor) -> (String, String) {
    let amount = match competitor.funding_stage {
        FundingStage::Seed => rand::thread_rng().gen_range(1..=3),
        FundingStage::SeriesA => rand::thread_rng().gen_range(5..=15),
        FundingStage::SeriesB => rand::thread_rng().gen_range(20..=50),
        _ => rand::thread_rng().gen_range(10..=30),
    };

    let description = format!("Raised ${}M in funding", amount);
    let impact = "Can now outspend you on hiring and marketing".to_string();
    (description, impact)
}

pub fn generate_acquisition_action(competitor: &Competitor) -> (String, String) {
    let acquirers = vec!["BigTech Corp", "Enterprise Solutions Inc", "Global Ventures", "Tech Giant Ltd"];
    let mut rng = rand::thread_rng();
    let acquirer = acquirers[rng.gen_range(0..acquirers.len())];
    let amount = rand::thread_rng().gen_range(50..=200);

    let description = format!("Acquired by {} for ${}M", acquirer, amount);
    let impact = "Market consolidation may affect your positioning".to_string();
    (description, impact)
}

pub fn calculate_feature_parity(competitor: &Competitor, player_velocity: f64) -> f64 {
    // Simplified calculation based on competitor's velocity vs player's
    let competitor_velocity = competitor_velocity(competitor);
    let velocity_ratio = competitor_velocity / player_velocity.max(0.1);

    (competitor.feature_parity + (velocity_ratio - 1.0) * 5.0).max(0.0).min(100.0)
}

pub fn calculate_market_share(competitors: &[Competitor], state: &super::GameState) -> Vec<(String, f64)> {
    let mut shares = Vec::new();
    let active_competitors = competitors.iter().filter(|c| !c.is_acquired).collect::<Vec<_>>();

    if active_competitors.is_empty() {
        return vec![("Player".to_string(), 100.0)];
    }

    // Simplified market share calculation
    let total_competitor_strength: f64 = active_competitors.iter()
        .map(|c| c.feature_parity * c.market_share * c.aggressiveness)
        .sum();

    let player_strength = (state.reputation * state.nps * state.velocity).max(1.0);

    let total_strength = total_competitor_strength + player_strength;

    shares.push(("Player".to_string(), (player_strength / total_strength * 100.0).max(5.0)));

    for competitor in &active_competitors {
        let strength = competitor.feature_parity * competitor.market_share * competitor.aggressiveness;
        let share = (strength / total_strength * 100.0).max(1.0);
        shares.push((competitor.name.clone(), share));
    }

    shares
}

pub fn update_competitor_state(competitor: &mut Competitor, player_velocity: f64, _player_wau: u32, _player_mrr: f64) {
    // Update feature parity based on relative velocity
    competitor.feature_parity = calculate_feature_parity(competitor, player_velocity);

    // Update market share (simplified)
    competitor.market_share = (competitor.feature_parity * competitor.aggressiveness / 100.0).max(1.0);
}

pub fn get_shipping_velocity_ratio(competitor: &Competitor, state: &super::GameState) -> f64 {
    let competitor_velocity = competitor_velocity(competitor);
    (competitor_velocity / state.velocity.max(0.1)).max(0.1)
}

/// Calculate competitor velocity based on team size and funding
pub fn competitor_velocity(competitor: &Competitor) -> f64 {
    (competitor.team_size as f64 * 0.1) + (competitor.total_funding * 0.0001)
}

pub fn get_competitors_by_funding(competitors: &[Competitor], stage: FundingStage) -> Vec<&Competitor> {
    competitors.iter().filter(|c| std::mem::discriminant(&c.funding_stage) == std::mem::discriminant(&stage)).collect()
}

pub fn get_most_threatening_competitor(competitors: &[Competitor]) -> Option<&Competitor> {
    competitors.iter()
        .filter(|c| !c.is_acquired)
        .max_by(|a, b| {
            let a_threat = a.feature_parity * a.market_share * a.aggressiveness;
            let b_threat = b.feature_parity * b.market_share * b.aggressiveness;
            a_threat.partial_cmp(&b_threat).unwrap()
        })
}

pub fn get_recently_funded_competitors(competitors: &[Competitor], current_week: u32, lookback_weeks: u32) -> Vec<&Competitor> {
    competitors.iter()
        .filter(|c| c.action_history.iter().any(|a| matches!(a.action_type, CompetitorActionType::FundingRound) && current_week - a.week <= lookback_weeks))
        .collect()
}

pub fn get_random_competitor(competitors: &[Competitor]) -> Option<&Competitor> {
    let active = competitors.iter().filter(|c| !c.is_acquired).collect::<Vec<_>>();
    if active.is_empty() {
        None
    } else {
        let mut rng = rand::thread_rng();
        Some(active[rng.gen_range(0..active.len())])
    }
}

pub fn generate_competitor_id() -> String {
    Uuid::new_v4().to_string()
}

pub fn funding_stage_to_amount(stage: &FundingStage) -> f64 {
    match stage {
        FundingStage::Bootstrapped => 0.0,
        FundingStage::Seed => rand::thread_rng().gen_range(500_000.0..=2_000_000.0),
        FundingStage::SeriesA => rand::thread_rng().gen_range(5_000_000.0..=15_000_000.0),
        FundingStage::SeriesB => rand::thread_rng().gen_range(20_000_000.0..=50_000_000.0),
        FundingStage::SeriesC => rand::thread_rng().gen_range(50_000_000.0..=100_000_000.0),
        FundingStage::PublicCompany => rand::thread_rng().gen_range(100_000_000.0..=500_000_000.0),
    }
}

pub fn calculate_competitor_team_size(funding: f64) -> u32 {
    // Rough heuristic: $150k per employee
    ((funding / 150_000.0).max(1.0) as u32).min(500)
}