use super::state::GameState;
use serde::{Deserialize, Serialize};

/// Victory condition types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VictoryCondition {
    EscapeVelocity {
        weeks_sustained: u8,
    },
}

/// Defeat condition types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DefeatCondition {
    OutOfMoney,
    FounderBurnout,
    ReputationDestroyed,
}

/// Check if player has achieved victory
pub fn check_victory(state: &GameState) -> Option<VictoryCondition> {
    if state.escape_velocity_progress.streak_weeks >= 12 {
        return Some(VictoryCondition::EscapeVelocity {
            weeks_sustained: state.escape_velocity_progress.streak_weeks,
        });
    }
    None
}

/// Check if player has been defeated
pub fn check_defeat(state: &GameState) -> Option<DefeatCondition> {
    // Out of money
    if state.bank <= 0.0 || state.runway_months <= 0.0 {
        return Some(DefeatCondition::OutOfMoney);
    }

    // Founder burnout
    if state.morale <= 0.0 {
        return Some(DefeatCondition::FounderBurnout);
    }

    // Reputation destroyed
    if state.reputation <= 10.0 {
        return Some(DefeatCondition::ReputationDestroyed);
    }

    None
}

/// Update escape velocity progress based on current state
pub fn update_escape_velocity_progress(state: &mut GameState) {
    let progress = &mut state.escape_velocity_progress;

    // Check each condition
    progress.revenue_covers_burn = state.mrr >= state.burn;
    progress.growth_sustained = state.wau_growth_rate >= 10.0;
    progress.customer_love = state.nps >= 30.0;
    progress.founder_healthy = state.morale > 40.0;

    // Update streak
    if progress.all_conditions_met() {
        progress.streak_weeks += 1;
    } else {
        progress.streak_weeks = 0;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game::state::DifficultyMode;

    #[test]
    fn test_victory_detection() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        state.escape_velocity_progress.streak_weeks = 12;

        let victory = check_victory(&state);
        assert!(victory.is_some());
    }

    #[test]
    fn test_defeat_out_of_money() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        state.bank = 0.0;

        let defeat = check_defeat(&state);
        assert!(matches!(defeat, Some(DefeatCondition::OutOfMoney)));
    }

    #[test]
    fn test_defeat_burnout() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        state.morale = 0.0;

        let defeat = check_defeat(&state);
        assert!(matches!(defeat, Some(DefeatCondition::FounderBurnout)));
    }

    #[test]
    fn test_escape_velocity_progress() {
        let mut state = GameState::new(DifficultyMode::VCTrack);

        // Set conditions
        state.mrr = state.burn + 1000.0;
        state.wau_growth_rate = 15.0;
        state.nps = 40.0;
        state.morale = 60.0;

        update_escape_velocity_progress(&mut state);

        assert!(state.escape_velocity_progress.revenue_covers_burn);
        assert!(state.escape_velocity_progress.growth_sustained);
        assert!(state.escape_velocity_progress.customer_love);
        assert!(state.escape_velocity_progress.founder_healthy);
        assert_eq!(state.escape_velocity_progress.streak_weeks, 1);
    }

    #[test]
    fn test_streak_resets_on_failure() {
        let mut state = GameState::new(DifficultyMode::VCTrack);

        // Set good conditions
        state.mrr = state.burn + 1000.0;
        state.wau_growth_rate = 15.0;
        state.nps = 40.0;
        state.morale = 60.0;
        state.escape_velocity_progress.streak_weeks = 5;

        update_escape_velocity_progress(&mut state);
        assert_eq!(state.escape_velocity_progress.streak_weeks, 6);

        // Break one condition
        state.morale = 30.0;
        update_escape_velocity_progress(&mut state);
        assert_eq!(state.escape_velocity_progress.streak_weeks, 0);
    }
}
