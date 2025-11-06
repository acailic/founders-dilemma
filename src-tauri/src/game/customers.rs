/**
 * Customer Persona System
 *
 * Transforms abstract customer counts into real people with names, stories, and feedback
 */

use serde::{Deserialize, Serialize};
use rand::prelude::*;
use uuid::Uuid;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CustomerSegment {
    Enterprise,
    SMB,
    SelfServe,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CustomerLifecycle {
    Onboarding,
    Active,
    Champion,
    AtRisk,
    Churned,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FeedbackSentiment {
    Positive,
    Neutral,
    Negative,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomerFeedback {
    pub week: u32,
    pub quote: String,
    pub sentiment: FeedbackSentiment,
    pub context: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Customer {
    pub id: String,
    pub name: String,
    pub company: String,
    pub segment: CustomerSegment,
    pub join_week: u32,
    pub satisfaction: f64,
    pub lifecycle_stage: CustomerLifecycle,
    pub story: String,
    pub feedback_history: Vec<CustomerFeedback>,
    pub mrr_contribution: f64,
    pub is_champion: bool,
}

// ============================================================================
// PERSONA GENERATION FUNCTIONS
// ============================================================================

pub fn generate_customer_persona(segment: CustomerSegment, week: u32, state: &super::state::GameState) -> Customer {
    match segment {
        CustomerSegment::Enterprise => generate_enterprise_customer(week),
        CustomerSegment::SMB => generate_smb_customer(week),
        CustomerSegment::SelfServe => generate_selfserve_customer(week),
    }
}

fn generate_enterprise_customer(week: u32) -> Customer {
    let enterprise_names = vec![
        ("Sarah Chen", "Acme Corp"),
        ("David Martinez", "TechGlobal Inc"),
        ("Jennifer Wu", "Fortune Dynamics"),
        ("Michael Rodriguez", "Global Solutions Ltd"),
        ("Emily Johnson", "Enterprise Systems"),
        ("Robert Kim", "Innovate Corp"),
        ("Lisa Thompson", "DataFlow Enterprises"),
        ("James Wilson", "ScaleTech Solutions"),
        ("Maria Garcia", "NextGen Systems"),
        ("Kevin Brown", "FutureWorks Inc"),
    ];

    let mut rng = thread_rng();
    let (name, company) = enterprise_names.choose(&mut rng).unwrap();

    Customer {
        id: generate_customer_id(),
        name: name.to_string(),
        company: company.to_string(),
        segment: CustomerSegment::Enterprise,
        join_week: week,
        satisfaction: 70.0 + rng.gen::<f64>() * 20.0, // 70-90 initial satisfaction
        lifecycle_stage: CustomerLifecycle::Onboarding,
        story: generate_customer_story(&Customer {
            id: String::new(),
            name: name.to_string(),
            company: company.to_string(),
            segment: CustomerSegment::Enterprise,
            join_week: week,
            satisfaction: 0.0,
            lifecycle_stage: CustomerLifecycle::Onboarding,
            story: String::new(),
            feedback_history: vec![],
            mrr_contribution: 0.0,
            is_champion: false,
        }),
        feedback_history: vec![],
        mrr_contribution: 0.0,
        is_champion: false,
    }
}

fn generate_smb_customer(week: u32) -> Customer {
    let smb_names = vec![
        ("Mike Johnson", "Mike's Coffee Shop"),
        ("Lisa Chen", "Lisa's Design Studio"),
        ("Tom Wilson", "The Local Bakery"),
        ("Sarah Davis", "Green Valley Consulting"),
        ("David Brown", "Brown & Associates"),
        ("Jennifer Lee", "Lee Marketing Agency"),
        ("Robert Taylor", "Taylor Construction"),
        ("Maria Rodriguez", "Rodriguez Realty"),
        ("Kevin Park", "Park Dental Clinic"),
        ("Emily White", "White Photography"),
    ];

    let mut rng = thread_rng();
    let (name, company) = smb_names.choose(&mut rng).unwrap();

    Customer {
        id: generate_customer_id(),
        name: name.to_string(),
        company: company.to_string(),
        segment: CustomerSegment::SMB,
        join_week: week,
        satisfaction: 65.0 + rng.gen::<f64>() * 25.0, // 65-90 initial satisfaction
        lifecycle_stage: CustomerLifecycle::Onboarding,
        story: generate_customer_story(&Customer {
            id: String::new(),
            name: name.to_string(),
            company: company.to_string(),
            segment: CustomerSegment::SMB,
            join_week: week,
            satisfaction: 0.0,
            lifecycle_stage: CustomerLifecycle::Onboarding,
            story: String::new(),
            feedback_history: vec![],
            mrr_contribution: 0.0,
            is_champion: false,
        }),
        feedback_history: vec![],
        mrr_contribution: 0.0,
        is_champion: false,
    }
}

fn generate_selfserve_customer(week: u32) -> Customer {
    let selfserve_names = vec![
        ("Alex Chen", "Alex the indie dev"),
        ("Jordan Taylor", "Jordan (freelance designer)"),
        ("Sam Wilson", "Sam building a side project"),
        ("Taylor Brown", "Taylor the consultant"),
        ("Casey Lee", "Casey (product manager)"),
        ("Morgan Davis", "Morgan the startup founder"),
        ("Riley Johnson", "Riley (data analyst)"),
        ("Avery White", "Avery the engineer"),
        ("Quinn Rodriguez", "Quinn (UX designer)"),
        ("Skyler Park", "Skyler the marketer"),
    ];

    let mut rng = thread_rng();
    let (name, company) = selfserve_names.choose(&mut rng).unwrap();

    Customer {
        id: generate_customer_id(),
        name: name.to_string(),
        company: company.to_string(),
        segment: CustomerSegment::SelfServe,
        join_week: week,
        satisfaction: 60.0 + rng.gen::<f64>() * 30.0, // 60-90 initial satisfaction
        lifecycle_stage: CustomerLifecycle::Onboarding,
        story: generate_customer_story(&Customer {
            id: String::new(),
            name: name.to_string(),
            company: company.to_string(),
            segment: CustomerSegment::SelfServe,
            join_week: week,
            satisfaction: 0.0,
            lifecycle_stage: CustomerLifecycle::Onboarding,
            story: String::new(),
            feedback_history: vec![],
            mrr_contribution: 0.0,
            is_champion: false,
        }),
        feedback_history: vec![],
        mrr_contribution: 0.0,
        is_champion: false,
    }
}

fn generate_customer_story(customer: &Customer) -> String {
    let stories = match customer.segment {
        CustomerSegment::Enterprise => vec![
            format!("{}'s team was drowning in spreadsheets and manual processes. They needed a scalable solution.", customer.name),
            format!("{} leads a growing department at {} and was looking for tools to support their expansion.", customer.name, customer.company),
            format!("{}'s company was evaluating multiple vendors when they discovered your product through a referral.", customer.name),
        ],
        CustomerSegment::SMB => vec![
            format!("{} runs a busy {} and needed better tools to manage their growing business.", customer.name, customer.company),
            format!("{} was recommended your product by a fellow business owner in their network.", customer.name),
            format!("{} had been using outdated tools and was ready for a modern solution.", customer.name),
        ],
        CustomerSegment::SelfServe => vec![
            format!("{} was building a side project and needed reliable tools to get started quickly.", customer.name),
            format!("{} found your product through online research and loved the self-serve onboarding.", customer.name),
            format!("{} was frustrated with enterprise tools that were too complex for their needs.", customer.name),
        ],
    };

    let mut rng = thread_rng();
    stories.choose(&mut rng).unwrap().clone()
}

// ============================================================================
// FEEDBACK GENERATION FUNCTIONS
// ============================================================================

pub fn generate_customer_feedback(customer: &Customer, state: &super::state::GameState) -> CustomerFeedback {
    let mut rng = thread_rng();

    // Determine sentiment based on customer satisfaction and game state
    let sentiment = if customer.satisfaction > 80.0 && state.nps > 30.0 {
        if rng.gen_bool(0.8) { FeedbackSentiment::Positive } else { FeedbackSentiment::Neutral }
    } else if customer.satisfaction > 60.0 {
        FeedbackSentiment::Neutral
    } else if customer.satisfaction > 40.0 {
        if rng.gen_bool(0.7) { FeedbackSentiment::Neutral } else { FeedbackSentiment::Negative }
    } else {
        if rng.gen_bool(0.6) { FeedbackSentiment::Negative } else { FeedbackSentiment::Critical }
    };

    let quote = match sentiment {
        FeedbackSentiment::Positive => generate_positive_feedback(customer, state),
        FeedbackSentiment::Neutral => generate_neutral_feedback(customer),
        FeedbackSentiment::Negative => generate_negative_feedback(customer, state),
        FeedbackSentiment::Critical => generate_negative_feedback(customer, state), // Critical is just stronger negative
    };

    let context = match customer.segment {
        CustomerSegment::Enterprise => "Enterprise customer feedback",
        CustomerSegment::SMB => "SMB customer feedback",
        CustomerSegment::SelfServe => "Self-serve user feedback",
    }.to_string();

    CustomerFeedback {
        week: state.week,
        quote,
        sentiment,
        context,
    }
}

fn generate_positive_feedback(customer: &Customer, state: &super::state::GameState) -> String {
    let feedbacks = vec![
        "This saved us 10 hours/week!",
        "Game-changer for our team",
        "Finally, a tool that just works",
        "The onboarding was surprisingly smooth",
        "Support is incredibly responsive",
        "Features we need, without the bloat",
        "ROI was evident within weeks",
        "Our productivity has doubled",
    ];

    let mut rng = thread_rng();
    feedbacks.choose(&mut rng).unwrap().to_string()
}

fn generate_negative_feedback(customer: &Customer, state: &super::state::GameState) -> String {
    let feedbacks = if state.tech_debt > 60.0 {
        vec![
            "Too many bugs lately",
            "System has been unstable",
            "Recent updates broke our workflow",
            "Performance has degraded significantly",
        ]
    } else if state.velocity < 0.8 {
        vec![
            "Development seems slow",
            "Missing features we were promised",
            "Competitors are catching up",
            "Not seeing the innovation we expected",
        ]
    } else {
        vec![
            "Onboarding was confusing",
            "Documentation could be better",
            "Missing key features we need",
            "Integration was more complex than expected",
        ]
    };

    let mut rng = thread_rng();
    feedbacks.choose(&mut rng).unwrap().to_string()
}

fn generate_neutral_feedback(customer: &Customer) -> String {
    let feedbacks = vec![
        "It's okay, does the job",
        "Still evaluating the full impact",
        "Works as advertised",
        "Neither impressed nor disappointed",
        "Meeting our basic needs",
        "Functional but not exceptional",
    ];

    let mut rng = thread_rng();
    feedbacks.choose(&mut rng).unwrap().to_string()
}

// ============================================================================
// LIFECYCLE MANAGEMENT FUNCTIONS
// ============================================================================

pub fn update_customer_satisfaction(customer: &mut Customer, nps: f64, tech_debt: f64, velocity: f64) {
    let mut rng = thread_rng();

    // Base satisfaction change
    let mut satisfaction_change = (rng.gen::<f64>() - 0.5) * 10.0; // -5 to +5

    // Factors affecting satisfaction
    if nps > 40.0 {
        satisfaction_change += 3.0;
    } else if nps < 20.0 {
        satisfaction_change -= 3.0;
    }

    if tech_debt > 70.0 {
        satisfaction_change -= 2.0;
    }

    if velocity > 1.2 {
        satisfaction_change += 2.0;
    } else if velocity < 0.8 {
        satisfaction_change -= 2.0;
    }

    // Apply change with bounds
    customer.satisfaction = (customer.satisfaction + satisfaction_change).clamp(0.0, 100.0);
}

pub fn update_customer_lifecycle(customer: &mut Customer) {
    match customer.lifecycle_stage {
        CustomerLifecycle::Onboarding => {
            // Move to Active after 2 weeks
            if customer.satisfaction > 50.0 {
                customer.lifecycle_stage = CustomerLifecycle::Active;
            }
        }
        CustomerLifecycle::Active => {
            if customer.satisfaction > 80.0 {
                customer.lifecycle_stage = CustomerLifecycle::Champion;
                customer.is_champion = true;
            } else if customer.satisfaction < 40.0 {
                customer.lifecycle_stage = CustomerLifecycle::AtRisk;
            }
        }
        CustomerLifecycle::Champion => {
            if customer.satisfaction < 60.0 {
                customer.lifecycle_stage = CustomerLifecycle::Active;
                customer.is_champion = false;
            }
        }
        CustomerLifecycle::AtRisk => {
            if customer.satisfaction > 60.0 {
                customer.lifecycle_stage = CustomerLifecycle::Active;
            } else if customer.satisfaction < 30.0 {
                customer.lifecycle_stage = CustomerLifecycle::Churned;
            }
        }
        CustomerLifecycle::Churned => {
            // Once churned, stays churned
        }
    }
}

pub fn check_churn_risk(customer: &Customer) -> bool {
    matches!(customer.lifecycle_stage, CustomerLifecycle::AtRisk) && customer.satisfaction < 30.0
}

pub fn promote_to_champion(customer: &mut Customer) {
    if customer.satisfaction > 85.0 {
        customer.lifecycle_stage = CustomerLifecycle::Champion;
        customer.is_champion = true;
    }
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

pub fn get_customers_by_segment(customers: &[Customer], segment: CustomerSegment) -> Vec<&Customer> {
    customers.iter().filter(|c| std::mem::discriminant(&c.segment) == std::mem::discriminant(&segment)).collect()
}

pub fn get_customers_by_lifecycle(customers: &[Customer], stage: CustomerLifecycle) -> Vec<&Customer> {
    customers.iter().filter(|c| std::mem::discriminant(&c.lifecycle_stage) == std::mem::discriminant(&stage)).collect()
}

pub fn get_champions(customers: &[Customer]) -> Vec<&Customer> {
    customers.iter().filter(|c| c.is_champion).collect()
}

pub fn get_at_risk_customers(customers: &[Customer]) -> Vec<&Customer> {
    get_customers_by_lifecycle(customers, CustomerLifecycle::AtRisk)
}

pub fn get_random_customer(customers: &[Customer], segment: Option<CustomerSegment>) -> Option<&Customer> {
    let filtered: Vec<&Customer> = if let Some(seg) = segment {
        get_customers_by_segment(customers, seg)
    } else {
        customers.iter().collect()
    };

    if filtered.is_empty() {
        None
    } else {
        let mut rng = thread_rng();
        Some(filtered.choose(&mut rng).unwrap())
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

pub fn calculate_segment_from_mrr(mrr: f64) -> CustomerSegment {
    if mrr > 2000.0 {
        CustomerSegment::Enterprise
    } else if mrr > 200.0 {
        CustomerSegment::SMB
    } else {
        CustomerSegment::SelfServe
    }
}

fn generate_customer_id() -> String {
    Uuid::new_v4().to_string()
}