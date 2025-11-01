use serde::{Deserialize, Serialize};

/// Types of events that can occur during gameplay
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventType {
    // Positive events
    ViralMoment,
    BigLogoSigns,
    PressFeature,
    KeyHireJoins,
    InvestorInbound,

    // Negative events
    CloudOutage,
    KeyHireChurns,
    CompetitorLaunch,
    RegulatoryAudit,
    SecurityIncident,
    BigLogoChurns,
    UnexpectedBill,

    // Dilemmas (require player choice)
    CustomDealOffer {
        client_name: String,
        mrr_gain: f64,
        tech_debt_cost: f64,
    },
}

/// A game event that occurred
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameEvent {
    pub week: u32,
    pub event_type: EventType,
    pub description: String,
    pub impact_description: String,
}

/// A dilemma requiring player choice
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dilemma {
    pub id: String,
    pub title: String,
    pub description: String,
    pub options: Vec<DilemmaOption>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DilemmaOption {
    pub label: String,
    pub description: String,
    pub effects_description: String,
}

impl GameEvent {
    pub fn new(week: u32, event_type: EventType) -> Self {
        let (description, impact) = match &event_type {
            EventType::ViralMoment => (
                "Your product went viral on social media!",
                "+30% WAU, +20 reputation",
            ),
            EventType::BigLogoSigns => (
                "A major enterprise customer signed up!",
                "+$5,000 MRR, +10 reputation",
            ),
            EventType::PressFeature => (
                "Featured in a major tech publication!",
                "+15 reputation, +10% WAU",
            ),
            EventType::KeyHireJoins => (
                "An experienced engineer joined your team!",
                "+velocity, +morale",
            ),
            EventType::InvestorInbound => (
                "An investor reached out with interest",
                "Fundraising opportunity unlocked",
            ),
            EventType::CloudOutage => (
                "Cloud infrastructure went down for 2 hours",
                "-10 reputation, churn spike",
            ),
            EventType::KeyHireChurns => (
                "A key team member left the company",
                "-velocity, -morale",
            ),
            EventType::CompetitorLaunch => (
                "A well-funded competitor launched",
                "WAU growth slows 20%",
            ),
            EventType::RegulatoryAudit => (
                "Received a compliance audit notice",
                "Must address or risk fines",
            ),
            EventType::SecurityIncident => (
                "Security vulnerability discovered",
                "-20 reputation, requires response",
            ),
            EventType::BigLogoChurns => (
                "Major customer churned",
                "-MRR, -reputation",
            ),
            EventType::UnexpectedBill => (
                "Unexpected infrastructure cost spike",
                "-$5,000 from bank",
            ),
            EventType::CustomDealOffer { client_name, mrr_gain, .. } => {
                let desc = format!("{} wants a custom feature for ${}/month", client_name, mrr_gain);
                (Box::leak(desc.into_boxed_str()) as &str, "Cash now vs product focus")
            },
        };

        Self {
            week,
            event_type,
            description: description.to_string(),
            impact_description: impact.to_string(),
        }
    }
}

// Event generation will be implemented here in future
// For MVP, we keep it simple
