use super::state::GameState;

/// Calculate weekly revenue from MRR
pub fn calculate_weekly_revenue(mrr: f64) -> f64 {
    mrr / 4.0
}

/// Calculate weekly burn from monthly burn
pub fn calculate_weekly_burn(burn: f64) -> f64 {
    burn / 4.0
}

/// Apply churn to MRR
pub fn apply_churn(state: &mut GameState) {
    let monthly_churn = state.churn_rate / 100.0;
    let weekly_churn = monthly_churn / 4.0;

    state.mrr *= 1.0 - weekly_churn;
}

/// Calculate base churn rate based on NPS and incidents
pub fn calculate_churn_rate(nps: f64, incident_count: u32) -> f64 {
    let base_churn = 5.0; // 5% monthly

    // NPS modifier (good NPS reduces churn)
    let nps_modifier = if nps > 50.0 {
        -2.0
    } else if nps > 20.0 {
        -1.0
    } else if nps < -20.0 {
        2.0
    } else {
        0.0
    };

    // Incident modifier
    let incident_modifier = incident_count as f64 * 1.0;

    (base_churn + nps_modifier + incident_modifier).clamp(1.0, 20.0)
}

/// Update NPS based on user satisfaction factors
pub fn update_nps(state: &mut GameState) {
    // Tech debt hurts NPS
    let debt_penalty = if state.tech_debt > 70.0 {
        -10.0
    } else if state.tech_debt > 40.0 {
        -5.0
    } else {
        0.0
    };

    // Velocity helps (shipping features)
    let velocity_bonus = if state.velocity > 1.2 {
        5.0
    } else if state.velocity < 0.8 {
        -5.0
    } else {
        0.0
    };

    // Gradually drift toward balanced value
    let target_nps = 30.0 + velocity_bonus + debt_penalty;
    state.nps = state.nps * 0.9 + target_nps * 0.1;
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game::state::DifficultyMode;

    #[test]
    fn test_weekly_calculations() {
        let mrr = 40_000.0;
        let burn = 20_000.0;

        assert_eq!(calculate_weekly_revenue(mrr), 10_000.0);
        assert_eq!(calculate_weekly_burn(burn), 5_000.0);
    }

    #[test]
    fn test_churn_calculation() {
        let churn = calculate_churn_rate(50.0, 0);
        assert!(churn < 5.0); // Good NPS reduces churn

        let bad_churn = calculate_churn_rate(-30.0, 2);
        assert!(bad_churn > 5.0); // Bad NPS and incidents increase churn
    }

    #[test]
    fn test_apply_churn() {
        let mut state = GameState::new(DifficultyMode::IndieBootstrap);
        state.mrr = 10_000.0;
        state.churn_rate = 8.0; // 8% monthly

        let initial_mrr = state.mrr;
        apply_churn(&mut state);

        assert!(state.mrr < initial_mrr);
    }
}
