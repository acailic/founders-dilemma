use serde::{Deserialize, Serialize};
use super::state::{GameState, DifficultyMode};
use super::actions::Action;

/// Represents an unlockable action with its condition and description
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnlockableAction {
    pub action: Action,
    pub unlock_condition: UnlockCondition,
    pub description: String,
}

/// Conditions that must be met to unlock an action
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UnlockCondition {
    ReachWeek(u32),
    AchieveMetric(String, f64), // e.g., ("reputation", 60.0)
    CompleteEvent(String),
    EarnAchievement(String),
}

/// Special milestone events that trigger at key weeks
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MilestoneEvent {
    pub week: u32,
    pub title: String,
    pub description: String,
    pub rewards: Vec<String>, // e.g., ["+10 reputation", "New action unlocked"]
}

/// Temporary challenges that force strategic adaptation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SeasonalChallenge {
    pub week_trigger: u32,
    pub challenge_type: String, // e.g., "Hiring Freeze", "Feature Sprint"
    pub difficulty_modifier: f64, // Multiplier for certain mechanics
}

/// Starting bonuses for new games based on achievements
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StartingBonuses {
    pub bank_bonus: f64,
    pub wau_bonus: u32,
    pub tech_debt_bonus: f64,
    pub morale_bonus: f64,
    pub reputation_bonus: f64,
}

pub fn action_unlock_key(action: &Action) -> String {
    match action {
        Action::RefactorCode { .. } => "RefactorCode".to_string(),
        Action::ContentLaunch { .. } => "ContentLaunch".to_string(),
        Action::Coach { .. } => "Coach".to_string(),
        Action::RunExperiment { .. } => "RunExperiment".to_string(),
        Action::ComplianceWork { .. } => "ComplianceWork".to_string(),
        Action::DevRel { .. } => "DevRel".to_string(),
        Action::PaidAds { .. } => "PaidAds".to_string(),
        Action::ProcessImprovement => "ProcessImprovement".to_string(),
        Action::Fire { .. } => "Fire".to_string(),
        Action::IncidentResponse => "IncidentResponse".to_string(),
        Action::ShipFeature { .. } => "ShipFeature".to_string(),
        Action::FounderLedSales { .. } => "FounderLedSales".to_string(),
        Action::Hire => "Hire".to_string(),
        Action::Fundraise { .. } => "Fundraise".to_string(),
        Action::TakeBreak => "TakeBreak".to_string(),
        // default fallback for other variants
        other => format!("{:?}", other),
    }
}

pub fn action_from_unlock_key(key: &str) -> Option<Action> {
    match key {
        "RefactorCode" => Some(Action::RefactorCode { depth: super::actions::RefactorDepth::Surface }),
        "ContentLaunch" => Some(Action::ContentLaunch { content_type: super::actions::ContentType::BlogPost }),
        "Coach" => Some(Action::Coach { focus: super::actions::CoachingFocus::Skills }),
        "RunExperiment" => Some(Action::RunExperiment { category: super::actions::ExperimentType::Pricing }),
        "ComplianceWork" => Some(Action::ComplianceWork { hours: 8 }),
        "DevRel" => Some(Action::DevRel { event_type: super::actions::DevRelEvent::Conference }),
        "PaidAds" => Some(Action::PaidAds { budget: 20_000.0, channel: super::actions::AdChannel::Google }),
        "ProcessImprovement" => Some(Action::ProcessImprovement),
        "Fire" => Some(Action::Fire { reason: super::actions::FiringReason::Performance }),
        "IncidentResponse" => Some(Action::IncidentResponse),
        "ShipFeature" => Some(Action::ShipFeature { quality: super::actions::Quality::Quick }),
        "FounderLedSales" => Some(Action::FounderLedSales { call_count: 3 }),
        "Hire" => Some(Action::Hire),
        "Fundraise" => Some(Action::Fundraise { target: 250_000.0 }),
        "TakeBreak" => Some(Action::TakeBreak),
        _ => None,
    }
}

/// Check which actions should be unlocked based on current game state
pub fn check_unlocks(state: &GameState) -> Vec<Action> {
    let mut unlocked = Vec::new();

    // Define unlockable actions with their conditions
    let unlockables = vec![
        (Action::RefactorCode { depth: super::actions::RefactorDepth::Surface }, UnlockCondition::ReachWeek(5), "Unlocks basic refactoring to manage tech debt".to_string()),
        (Action::ContentLaunch { content_type: super::actions::ContentType::BlogPost }, UnlockCondition::ReachWeek(5), "Unlocks content marketing to build reputation".to_string()),
        (Action::Coach { focus: super::actions::CoachingFocus::Skills }, UnlockCondition::ReachWeek(5), "Unlocks team coaching to improve skills".to_string()),
        (Action::RunExperiment { category: super::actions::ExperimentType::Pricing }, UnlockCondition::AchieveMetric("wau".to_string(), 500.0), "Unlocks experimentation when you have enough users".to_string()),
        (Action::ComplianceWork { hours: 4 }, UnlockCondition::ReachWeek(9), "Unlocks compliance work for regulated industries".to_string()),
        (Action::DevRel { event_type: super::actions::DevRelEvent::Conference }, UnlockCondition::ReachWeek(13), "Unlocks developer relations events".to_string()),
        (Action::PaidAds { budget: 5000.0, channel: super::actions::AdChannel::Social }, UnlockCondition::ReachWeek(13), "Unlocks paid advertising".to_string()),
        (Action::ProcessImprovement, UnlockCondition::ReachWeek(13), "Unlocks process improvements".to_string()),
        (Action::Fire { reason: super::actions::FiringReason::Performance }, UnlockCondition::AchieveMetric("team_size".to_string(), 1.0), "Unlocks firing after hiring your first employee".to_string()),
        (Action::IncidentResponse, UnlockCondition::AchieveMetric("incident_count".to_string(), 1.0), "Unlocks incident response after first crisis".to_string()),
    ];

    for (action, condition, _desc) in unlockables {
        let key = action_unlock_key(&action);
        if !state.unlocked_actions.contains(&key) {
            let should_unlock = match &condition {
                UnlockCondition::ReachWeek(week) => state.week >= *week,
                UnlockCondition::AchieveMetric(metric, value) => match metric.as_str() {
                    "reputation" => state.reputation >= *value,
                    "wau" => state.wau as f64 >= *value,
                    "mrr" => state.mrr >= *value,
                    "team_size" => state.team_size as f64 >= *value,
                    "incident_count" => state.incident_count as f64 >= *value,
                    _ => false,
                },
                UnlockCondition::CompleteEvent(_event) => false, // Placeholder, implement if needed
                UnlockCondition::EarnAchievement(_achievement) => false, // Placeholder, implement if needed
            };
            if should_unlock {
                unlocked.push(action);
            }
        }
    }

    unlocked
}

/// Get all available actions for the current state (core + unlocked)
pub fn get_available_actions(state: &GameState) -> Vec<Action> {
    use super::actions::{
        AdChannel,
        CoachingFocus,
        ContentType,
        DevRelEvent,
        ExperimentType,
        FiringReason,
        Quality,
        RefactorDepth,
    };

    let mut available = vec![
        Action::ShipFeature { quality: Quality::Quick },
        Action::ShipFeature { quality: Quality::Balanced },
        Action::ShipFeature { quality: Quality::Polish },
        Action::FounderLedSales { call_count: 3 },
        Action::FounderLedSales { call_count: 5 },
        Action::Hire,
        Action::Fundraise { target: 250_000.0 },
        Action::Fundraise { target: 500_000.0 },
        Action::TakeBreak,
    ];

    let mut push_unique = |action: Action| {
        if !available.iter().any(|existing| existing == &action) {
            available.push(action);
        }
    };

    // Add unlocked actions
    for unlocked_str in &state.unlocked_actions {
        match unlocked_str.as_str() {
            "RefactorCode" => {
                push_unique(Action::RefactorCode { depth: RefactorDepth::Surface });
                push_unique(Action::RefactorCode { depth: RefactorDepth::Deep });
            }
            "ContentLaunch" => {
                push_unique(Action::ContentLaunch { content_type: ContentType::BlogPost });
                push_unique(Action::ContentLaunch { content_type: ContentType::Tutorial });
            }
            "Coach" => {
                push_unique(Action::Coach { focus: CoachingFocus::Skills });
            }
            "RunExperiment" => {
                push_unique(Action::RunExperiment { category: ExperimentType::Pricing });
            }
            "ComplianceWork" => {
                push_unique(Action::ComplianceWork { hours: 8 });
            }
            "DevRel" => {
                push_unique(Action::DevRel { event_type: DevRelEvent::Conference });
            }
            "PaidAds" => {
                push_unique(Action::PaidAds { budget: 20_000.0, channel: AdChannel::Google });
            }
            "ProcessImprovement" => {
                push_unique(Action::ProcessImprovement);
            }
            "Fire" => {
                push_unique(Action::Fire { reason: FiringReason::Performance });
            }
            "IncidentResponse" => {
                push_unique(Action::IncidentResponse);
            }
            "Fundraise" => {
                // Already seeded with 250k/500k, skip
            }
            "Hire" | "ShipFeature" | "FounderLedSales" | "TakeBreak" => {
                // Core actions already added above
            }
            other => {
                if let Some(action) = action_from_unlock_key(other) {
                    push_unique(action);
                }
            }
        }
    }

    available
}

/// Check if a milestone event should trigger this week
pub fn check_milestone_events(state: &GameState) -> Option<MilestoneEvent> {
    match state.week {
        12 => Some(MilestoneEvent {
            week: 12,
            title: "Quarter Review".to_string(),
            description: "Investors are checking in. Board pressure is mounting.".to_string(),
            rewards: vec!["+10 reputation".to_string(), "Fundraising bonus".to_string()],
        }),
        26 => Some(MilestoneEvent {
            week: 26,
            title: "Half-Year Milestone".to_string(),
            description: "Major strategic decision point. Time to evaluate your path.".to_string(),
            rewards: vec!["Strategic insight".to_string(), "New action unlocked".to_string()],
        }),
        39 => Some(MilestoneEvent {
            week: 39,
            title: "Scaling Challenges".to_string(),
            description: "New complexity unlocked as you scale.".to_string(),
            rewards: vec!["Process improvements".to_string(), "Team bonuses".to_string()],
        }),
        52 => Some(MilestoneEvent {
            week: 52,
            title: "Year One Complete".to_string(),
            description: "Major achievement! New game+ options available.".to_string(),
            rewards: vec!["Meta progression unlocked".to_string(), "Starting bonuses".to_string()],
        }),
        _ => None,
    }
}

/// Generate a seasonal challenge if applicable
pub fn generate_seasonal_challenge(week: u32, _difficulty: &DifficultyMode) -> Option<SeasonalChallenge> {
    if week > 0 && week % 13 == 0 {
        match week {
            13 => Some(SeasonalChallenge {
                week_trigger: 13,
                challenge_type: "Hiring Freeze".to_string(),
                difficulty_modifier: 1.2, // Harder to manage without hiring
            }),
            26 => Some(SeasonalChallenge {
                week_trigger: 26,
                challenge_type: "Feature Sprint".to_string(),
                difficulty_modifier: 1.5, // Pressure to ship features
            }),
            39 => Some(SeasonalChallenge {
                week_trigger: 39,
                challenge_type: "Fundraising Window".to_string(),
                difficulty_modifier: 0.8, // Easier fundraising but competitive
            }),
            _ => None,
        }
    } else {
        None
    }
}

/// Calculate starting bonuses based on achievements
pub fn calculate_meta_progression_bonuses(achievements: &[String]) -> StartingBonuses {
    let mut bonuses = StartingBonuses {
        bank_bonus: 0.0,
        wau_bonus: 0,
        tech_debt_bonus: 0.0,
        morale_bonus: 0.0,
        reputation_bonus: 0.0,
    };

    for achievement in achievements {
        match achievement.as_str() {
            "Bootstrapper" => bonuses.bank_bonus += 20_000.0,
            "Growth Master" => bonuses.wau_bonus += 100,
            "Engineering Excellence" => bonuses.tech_debt_bonus -= 10.0,
            "Team Builder" => bonuses.morale_bonus += 10.0,
            "Thought Leader" => bonuses.reputation_bonus += 15.0,
            _ => {}
        }
    }

    bonuses
}
