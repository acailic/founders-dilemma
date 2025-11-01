// Game module - Founder's Dilemma simulation engine

pub mod state;
pub mod actions;
pub mod events;
pub mod economy;
pub mod victory;
pub mod insights;
pub mod compounding;
pub mod warnings;
pub mod events_enhanced;

// Re-export main types
pub use state::{GameState, DifficultyMode, EscapeVelocityProgress, WeekSnapshot};
pub use actions::{Action, ActionResult};
pub use events::{GameEvent, EventType, Dilemma};
pub use victory::{VictoryCondition, DefeatCondition, check_victory, check_defeat};
pub use insights::{WeeklyInsight, InsightCategory, InsightSeverity, generate_weekly_insights};
pub use compounding::{CompoundingBonus, CompoundingEffect, StatBonus, check_compounding_effects, apply_compounding_bonuses};
pub use warnings::{FailureWarning, WarningSign, WarningSeverity, check_failure_warnings};
pub use events_enhanced::{GameEvent as EnhancedGameEvent, EnhancedEventType, EventChoice, EventEffect, check_for_events, apply_event_choice};
