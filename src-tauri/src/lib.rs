// this hides the console for Windows release builds
#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use serde::Serialize;
use std::sync::Mutex;
use tauri::{
  // state is used in Linux
  self,
  Emitter,
  Manager,
};
use tauri_plugin_store;
use tauri_plugin_window_state;

mod tray_icon;
mod utils;
mod game;

use tray_icon::{TrayState, create_tray_icon, tray_update_lang};
use utils::long_running_thread;
use game::{
    GameState, DifficultyMode, Action,
    actions::resolve_action,
    victory::{check_victory, check_defeat, update_escape_velocity_progress},
    economy::{apply_churn, update_nps},
    insights::generate_weekly_insights,
    compounding::{check_compounding_effects, apply_compounding_bonuses},
    warnings::check_failure_warnings,
    events_enhanced::check_for_events,
    synergies::{check_action_synergies, detect_specialization_path, ActionSynergy, SpecializationPath},
    market_conditions::{get_active_conditions, update_market_conditions, generate_market_condition, MarketCondition},
    progression::{get_available_actions, check_milestone_events, check_unlocks, MilestoneEvent},
};

#[derive(Clone, Serialize)]
struct SingleInstancePayload {
  args: Vec<String>,
  cwd: String,
}

#[derive(Debug, Default, Serialize)]
struct Example<'a> {
  #[serde(rename = "Attribute 1")]
  attribute_1: &'a str,
}

#[cfg(target_os = "linux")]
pub struct DbusState(Mutex<Option<dbus::blocking::SyncConnection>>);

#[tauri::command]
fn process_file(filepath: String) -> String {
  println!("Processing file: {}", filepath);
  "Hello from Rust!".into()
}

// ============================================================================
// GAME COMMANDS
// ============================================================================

#[tauri::command]
fn new_game(difficulty: String) -> Result<GameState, String> {
  let diff = match difficulty.as_str() {
    "indie" => DifficultyMode::IndieBootstrap,
    "vc" => DifficultyMode::VCTrack,
    "regulated" => DifficultyMode::RegulatedFintech,
    "infra" => DifficultyMode::InfraDevTool,
    _ => return Err("Invalid difficulty mode".to_string()),
  };

  Ok(GameState::new(diff))
}

#[derive(Clone, Serialize)]
struct TurnResult {
  state: GameState,
  insights: Vec<game::insights::WeeklyInsight>,
  warnings: Vec<game::warnings::FailureWarning>,
  compounding_bonuses: Vec<game::compounding::CompoundingBonus>,
  events: Vec<game::events_enhanced::GameEvent>,
  synergies: Vec<game::synergies::ActionSynergy>,
  market_conditions: Vec<game::market_conditions::MarketCondition>,
  unlocked_actions: Vec<String>,
  milestone_event: Option<game::progression::MilestoneEvent>,
  specialization_bonus: Option<game::synergies::SpecializationPath>,
}

#[tauri::command]
fn take_turn(mut state: GameState, actions: Vec<Action>) -> Result<TurnResult, String> {
  // Before action resolution: Check action unlocks and validate
  let available_actions = get_available_actions(&state);
  for action in &actions {
    if !available_actions.contains(&format!("{:?}", action)) {
      return Err(format!("Action {:?} is not unlocked yet", action));
    }
  }
  let market_modifiers = get_active_conditions(&state);

  // Validate focus cost
  let total_focus: u8 = actions.iter().map(|a| a.focus_cost()).sum();
  if total_focus > state.focus_slots {
    return Err(format!("Not enough focus slots! Required: {}, Available: {}", total_focus, state.focus_slots));
  }

  // Save state before changes for insights comparison
  let prev_state = state.clone();

  // During action resolution: Apply market effectiveness modifiers and track actions
  for action in &actions {
    let modifier = get_action_effectiveness_modifier(action, &market_modifiers);
    // Apply modifier to action resolution (assuming resolve_action can take a modifier; adjust if needed)
    let _result = resolve_action(&mut state, action); // TODO: Integrate modifier into resolve_action
  }
  // Track actions in state.action_history (assuming state has this field; add if not present)
  state.action_history.push((state.week, actions.clone()));

  // After action resolution: Check synergies and apply bonuses
  let synergies = check_action_synergies(&actions);
  // Apply synergy bonuses (assuming apply_synergy_bonuses function exists; integrate here)
  // TODO: Implement apply_synergy_bonuses(&mut state, &synergies);
  let specialization_bonus = detect_specialization_path(&state.history, &actions);
  // Apply specialization bonuses if detected (assuming logic exists; integrate here)
  // TODO: Implement specialization bonus application

  // Check and apply compounding effects (rewards for sustained good practices)
  let compounding_bonuses = check_compounding_effects(&state, 12);
  apply_compounding_bonuses(&mut state, &compounding_bonuses);

  // Apply weekly mechanics
  apply_churn(&mut state);
  update_nps(&mut state);
  update_escape_velocity_progress(&mut state);

  // During week advancement: Update market conditions, check for new ones, milestones, and unlocks
  update_market_conditions(&mut state);
  let new_market_condition = generate_market_condition(&state, state.week);
  if let Some(condition) = new_market_condition {
    // Add to state.active_market_conditions (assuming field exists)
    state.active_market_conditions.push(condition);
  }
  let milestone_event = check_milestone_events(&state);
  let new_unlocks = check_unlocks(&state);
  // Update state.unlocked_actions with new_unlocks (assuming field exists)

  // Advance to next week
  state.advance_week();

  // Update derived metrics
  state.update_derived_metrics();

  // Generate educational insights by comparing before/after
  let insights = generate_weekly_insights(&prev_state, &state);

  // Check for failure warnings
  let warnings = check_failure_warnings(&state);

  // Check for random events
  let events = check_for_events(&state);

  Ok(TurnResult {
    state,
    insights,
    warnings,
    compounding_bonuses,
    events,
    synergies,
    market_conditions: market_modifiers,
    unlocked_actions: new_unlocks,
    milestone_event,
    specialization_bonus,
  })
}

#[tauri::command]
fn apply_event_choice(
  mut state: GameState,
  event_id: String,
  choice_index: usize,
  event: game::events_enhanced::GameEvent,
) -> Result<GameState, String> {
  match event.event_type {
    game::events_enhanced::EnhancedEventType::Dilemma { choices } => {
      if choice_index >= choices.len() {
        return Err("Invalid choice index".to_string());
      }

      let choice = &choices[choice_index];
      game::events_enhanced::apply_event_choice(&mut state, choice);

      Ok(state)
    }
    _ => Err("Event does not require a choice".to_string()),
  }
}

#[tauri::command]
fn get_available_actions(state: GameState) -> Result<Vec<String>, String> {
  let actions = get_available_actions(&state);
  Ok(actions.iter().map(|a| format!("{:?}", a)).collect())
}

#[tauri::command]
fn get_market_status(state: GameState) -> Result<Vec<game::market_conditions::MarketCondition>, String> {
  Ok(get_active_conditions(&state))
}

#[tauri::command]
fn check_game_status(state: GameState) -> Result<String, String> {
  if let Some(_victory) = check_victory(&state) {
    return Ok("victory".to_string());
  }

  if let Some(defeat) = check_defeat(&state) {
    let reason = match defeat {
      game::victory::DefeatCondition::OutOfMoney => "out_of_money",
      game::victory::DefeatCondition::FounderBurnout => "burnout",
      game::victory::DefeatCondition::ReputationDestroyed => "reputation",
    };
    return Ok(format!("defeat:{}", reason));
  }

  Ok("playing".to_string())
}

#[cfg(target_os = "linux")]
fn webkit_hidpi_workaround() {
  // See: https://github.com/spacedriveapp/spacedrive/issues/1512#issuecomment-1758550164
  std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
}

fn main_prelude() {
  #[cfg(target_os = "linux")]
  webkit_hidpi_workaround();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  main_prelude();
  // main window should be invisible to allow either the setup delay or the plugin to show the window
  let mut log_builder = tauri_plugin_log::Builder::new().target(tauri_plugin_log::Target::new(
    tauri_plugin_log::TargetKind::LogDir {
      file_name: Some("logs".to_string()),
    },
  ));
  #[cfg(debug_assertions)]
  {
    log_builder = log_builder.target(tauri_plugin_log::Target::new(
      tauri_plugin_log::TargetKind::Webview,
    ));
  }

  tauri::Builder::default()
    .plugin(log_builder.build())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_store::Builder::new().build())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_fs::init())
    // custom commands
    .invoke_handler(tauri::generate_handler![
      tray_update_lang,
      process_file,
      new_game,
      take_turn,
      apply_event_choice,
      check_game_status,
      get_available_actions,
      get_market_status,
    ])
    // allow only one instance and propagate args and cwd to existing instance
    .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
      app
        .emit("newInstance", SingleInstancePayload { args, cwd })
        .unwrap();
    }))
    // persistent storage with filesystem
    .plugin(tauri_plugin_store::Builder::default().build())
    // save window position and size between sessions
    // if you remove this, make sure to uncomment the mainWebview?.show line in TauriProvider.tsx
    .plugin(tauri_plugin_window_state::Builder::default().build())
    // custom setup code
    .setup(|app| {
      let _ = create_tray_icon(app.handle());
      app.manage(Mutex::new(TrayState::NotPlaying));

      let app_handle = app.handle().clone();
      tauri::async_runtime::spawn(async move { long_running_thread(&app_handle).await });

      #[cfg(target_os = "linux")]
      app.manage(DbusState(Mutex::new(
        dbus::blocking::SyncConnection::new_session().ok(),
      )));

      // TODO: AUTOSTART
      // FOLLOW: https://v2.tauri.app/plugin/autostart/

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

// useful crates
// https://crates.io/crates/directories for getting common directories

// TODO: optimize permissions
// TODO: decorations false and use custom title bar
