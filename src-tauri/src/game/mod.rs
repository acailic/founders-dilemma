// Game module - Founder's Dilemma simulation engine

// Core game state and simulation
pub mod state;
// Action definitions and resolution
pub mod actions;
// Event system and dilemmas
pub mod events;
// Economic calculations and metrics
pub mod economy;
// Victory and defeat conditions
pub mod victory;
// Weekly insights and analysis
pub mod insights;
// Compounding bonus effects
pub mod compounding;
// Failure warnings and risk detection
pub mod warnings;
// Enhanced event system with more variety
pub mod events_enhanced;
// Market condition modifiers
pub mod market_conditions;
// Progression and unlock systems
pub mod progression;
// Action synergy and specialization systems
pub mod synergies;
// Customer persona system
pub mod customers;
// Competitor tracking system
pub mod competitors;

// Re-export main types
pub use state::{GameState, DifficultyMode, EscapeVelocityProgress, WeekSnapshot};
pub use actions::{Action, ActionResult};
pub use events::{GameEvent, EventType, Dilemma};
pub use victory::{VictoryCondition, DefeatCondition, check_victory, check_defeat};
pub use insights::{WeeklyInsight, InsightCategory, InsightSeverity, generate_weekly_insights};
pub use compounding::{CompoundingBonus, CompoundingEffect, StatBonus, check_compounding_effects, apply_compounding_bonuses};
pub use warnings::{FailureWarning, WarningSign, WarningSeverity, check_failure_warnings};
pub use events_enhanced::{GameEvent as EnhancedGameEvent, EnhancedEventType, EventChoice, EventEffect, check_for_events, apply_event_choice};
pub use synergies::{ActionSynergy, SynergyBonus, SpecializationPath, check_action_synergies, detect_specialization_path};
pub use market_conditions::{MarketCondition, MarketModifier, MarketEvent, generate_market_condition, apply_market_modifiers, get_action_effectiveness_modifier, get_active_conditions, update_market_conditions};
pub use progression::{UnlockableAction, UnlockCondition, MilestoneEvent, check_unlocks, get_available_actions, check_milestone_events};
pub use customers::{Customer, CustomerSegment, CustomerLifecycle, CustomerFeedback, FeedbackSentiment, generate_customer_persona, generate_customer_feedback, get_champions, get_at_risk_customers};
pub use competitors::{Competitor, FundingStage, PricingStrategy, CompetitorAction, CompetitorActionType, generate_competitors, generate_competitor_action, get_most_threatening_competitor, calculate_market_share};
