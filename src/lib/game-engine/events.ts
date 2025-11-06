import { GameState, GameEvent as UIGameEvent, EventChoice as UIEventChoice, EventEffect } from '../../types/game-systems';

// Port of Rust events system from src-tauri/src/game/events.rs

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  category: 'Market' | 'Competitor' | 'Internal' | 'Regulatory' | 'Economic' | 'Technical';
  probability: number; // Base probability per week (0-100)
  condition: (state: GameState) => boolean;
  choices: EventChoice[];
  duration_weeks: number;
  active: boolean;
  week_started: number;
}

export interface EventChoice {
  id: string;
  text: string;
  effects: EventEffect[];
  description: string;
}

export interface EventEffect {
  stat_name: string;
  delta: number;
  description: string;
}

export interface EventResult {
  event: GameEvent | null;
  choice_made: string | null;
  effects_applied: EventEffect[];
}

export function checkForEvents(state: GameState, activeEvents: GameEvent[]): UIGameEvent | null {
  // Don't trigger new events if there are already active events
  if (activeEvents.length > 0) {
    return null;
  }

  const availableEvents = getAllEvents();

  for (const event of availableEvents) {
    if (event.condition(state) && Math.random() * 100 < event.probability) {
      event.active = true;
      event.week_started = state.week;
      
      // Convert to UI format
      return {
        id: event.id,
        week: state.week,
        title: event.title,
        description: event.description,
        event_type: {
          Dilemma: {
            choices: event.choices.map(choice => ({
              id: choice.id,
              text: choice.text,
              description: choice.description,
              short_term: 'Short term effect',
              long_term: 'Long term effect', 
              wisdom: 'Choose wisely',
              effects: choice.effects
            }))
          }
        }
      };
    }
  }

  return null;
}

export function applyEventChoice(state: GameState, event: UIGameEvent, choiceId: string): GameState {
  if (!('Dilemma' in event.event_type)) {
    throw new Error('Event is not a dilemma');
  }
  
  const choice = event.event_type.Dilemma.choices.find(c => c.id === choiceId);
  if (!choice) {
    throw new Error(`Invalid choice ID: ${choiceId}`);
  }

  // Apply effects
  for (const effect of choice.effects) {
    applyEventEffect(state, effect);
  }

  return state;
}

function applyEventEffect(state: GameState, effect: EventEffect): void {
  switch (effect.stat_name) {
    case 'MRR':
      state.mrr += effect.delta;
      break;
    case 'WAU':
      state.wau = Math.floor(state.wau + effect.delta);
      break;
    case 'Bank':
      state.bank += effect.delta;
      break;
    case 'Burn':
      state.burn += effect.delta;
      break;
    case 'Morale':
      state.morale += effect.delta;
      break;
    case 'Reputation':
      state.reputation += effect.delta;
      break;
    case 'Tech Debt':
      state.tech_debt += effect.delta;
      break;
    case 'Velocity':
      state.velocity += effect.delta;
      break;
    case 'Compliance Risk':
      state.compliance_risk += effect.delta;
      break;
    case 'Churn Rate':
      state.churn_rate += effect.delta;
      break;
    case 'WAU Growth':
      state.wau_growth_rate += effect.delta;
      break;
    case 'Momentum':
      state.momentum += effect.delta;
      break;
    case 'Founder Equity':
      state.founder_equity += effect.delta;
      break;
    default:
      console.warn(`Unknown stat name: ${effect.stat_name}`);
  }
}

function getAllEvents(): GameEvent[] {
  return [
    // Market Events
    {
      id: 'market_boom',
      title: 'Market Boom',
      description: 'Your market segment is experiencing rapid growth. Competitors are raising huge rounds.',
      category: 'Market',
      probability: 8,
      condition: (state) => state.reputation > 40 && state.week > 13,
      choices: [
        {
          id: 'accelerate_hiring',
          text: 'Accelerate hiring to capture market share',
          description: 'Hire aggressively to scale fast',
          effects: [
            { stat_name: 'Burn', delta: 15000, description: 'Increased hiring costs' },
            { stat_name: 'Velocity', delta: 0.2, description: 'Faster development with new team' },
            { stat_name: 'WAU Growth', delta: 5, description: 'Capture market share' },
            { stat_name: 'Morale', delta: -3, description: 'Rapid hiring stress' },
          ],
        },
        {
          id: 'focus_product',
          text: 'Focus on product quality over speed',
          description: 'Build a superior product slowly',
          effects: [
            { stat_name: 'Tech Debt', delta: -5, description: 'Quality focus reduces debt' },
            { stat_name: 'Reputation', delta: 3, description: 'Quality reputation boost' },
            { stat_name: 'WAU Growth', delta: 2, description: 'Slower but sustainable growth' },
          ],
        },
        {
          id: 'raise_funding',
          text: 'Raise funding to fuel growth',
          description: 'Capitalize on market enthusiasm',
          effects: [
            { stat_name: 'Bank', delta: 750000, description: 'Successful funding round' },
            { stat_name: 'Founder Equity', delta: -15, description: 'Equity dilution' },
            { stat_name: 'WAU Growth', delta: 8, description: 'Funded growth acceleration' },
          ],
        },
      ],
      duration_weeks: 1,
      active: false,
      week_started: 0,
    },

    {
      id: 'economic_downturn',
      title: 'Economic Downturn',
      description: 'Broader economic conditions are deteriorating. Funding environment is freezing.',
      category: 'Economic',
      probability: 6,
      condition: (state) => state.week > 26,
      choices: [
        {
          id: 'cut_costs',
          text: 'Implement immediate cost cuts',
          description: 'Reduce burn to extend runway',
          effects: [
            { stat_name: 'Burn', delta: -8000, description: 'Cost reduction' },
            { stat_name: 'Morale', delta: -8, description: 'Layoffs hurt morale' },
            { stat_name: 'Velocity', delta: -0.15, description: 'Reduced team impacts velocity' },
          ],
        },
        {
          id: 'focus_retention',
          text: 'Focus on customer retention',
          description: 'Ride out the downturn with loyal customers',
          effects: [
            { stat_name: 'Churn Rate', delta: -2, description: 'Improved retention' },
            { stat_name: 'MRR', delta: 2000, description: 'Reduced churn saves revenue' },
            { stat_name: 'WAU Growth', delta: -3, description: 'Slower growth in downturn' },
          ],
        },
        {
          id: 'double_down',
          text: 'Double down on growth',
          description: 'Aggressive expansion while others retreat',
          effects: [
            { stat_name: 'Burn', delta: 10000, description: 'Increased marketing spend' },
            { stat_name: 'WAU Growth', delta: 6, description: 'Capture market share' },
            { stat_name: 'Bank', delta: -50000, description: 'Cash burn for growth' },
            { stat_name: 'Reputation', delta: 4, description: 'Bold strategy gains respect' },
          ],
        },
      ],
      duration_weeks: 1,
      active: false,
      week_started: 0,
    },

    // Competitor Events
    {
      id: 'competitor_launch',
      title: 'Competitor Product Launch',
      description: 'A major competitor just launched a similar product with significant marketing budget.',
      category: 'Competitor',
      probability: 12,
      condition: (state) => state.wau > 5000,
      choices: [
        {
          id: 'price_war',
          text: 'Start a price war',
          description: 'Undercut competitor pricing',
          effects: [
            { stat_name: 'MRR', delta: -5000, description: 'Revenue hit from lower prices' },
            { stat_name: 'WAU Growth', delta: 4, description: 'Gain users through pricing' },
            { stat_name: 'Churn Rate', delta: -1, description: 'Lower prices reduce churn' },
          ],
        },
        {
          id: 'differentiate',
          text: 'Emphasize differentiation',
          description: 'Highlight unique features',
          effects: [
            { stat_name: 'Reputation', delta: 3, description: 'Positioning as unique' },
            { stat_name: 'WAU Growth', delta: 1, description: 'Slower growth but higher LTV' },
            { stat_name: 'Tech Debt', delta: 3, description: 'Rushed features add debt' },
          ],
        },
        {
          id: 'acquire_users',
          text: 'Aggressive user acquisition',
          description: 'Spend heavily on marketing',
          effects: [
            { stat_name: 'Bank', delta: -30000, description: 'Marketing spend' },
            { stat_name: 'WAU Growth', delta: 7, description: 'Marketing drives growth' },
            { stat_name: 'Burn', delta: 5000, description: 'Ongoing marketing costs' },
          ],
        },
      ],
      duration_weeks: 1,
      active: false,
      week_started: 0,
    },

    // Internal Events
    {
      id: 'key_employee_quits',
      title: 'Key Employee Departs',
      description: 'A critical team member has resigned and joined a competitor.',
      category: 'Internal',
      probability: 8,
      condition: (state) => state.morale < 60 && state.week > 8,
      choices: [
        {
          id: 'hire_replacement',
          text: 'Hire immediate replacement',
          description: 'Find and onboard someone quickly',
          effects: [
            { stat_name: 'Burn', delta: 12000, description: 'Hiring and onboarding costs' },
            { stat_name: 'Velocity', delta: -0.1, description: 'Temporary productivity loss' },
            { stat_name: 'Morale', delta: -2, description: 'Team uncertainty' },
          ],
        },
        {
          id: 'promote_internal',
          text: 'Promote from within',
          description: 'Give opportunity to existing team member',
          effects: [
            { stat_name: 'Morale', delta: 5, description: 'Internal promotion boosts morale' },
            { stat_name: 'Velocity', delta: -0.05, description: 'Learning curve impact' },
            { stat_name: 'Reputation', delta: 1, description: 'Shows investment in people' },
          ],
        },
        {
          id: 'redistribute_work',
          text: 'Redistribute responsibilities',
          description: 'Spread work across existing team',
          effects: [
            { stat_name: 'Velocity', delta: -0.15, description: 'Overloaded team' },
            { stat_name: 'Morale', delta: -4, description: 'Increased workload stress' },
            { stat_name: 'Burn', delta: -3000, description: 'No hiring costs' },
          ],
        },
      ],
      duration_weeks: 1,
      active: false,
      week_started: 0,
    },

    // Regulatory Events
    {
      id: 'regulatory_scrutiny',
      title: 'Regulatory Investigation',
      description: 'Regulators are investigating your industry for compliance issues.',
      category: 'Regulatory',
      probability: 5,
      condition: (state) => state.compliance_risk > 30,
      choices: [
        {
          id: 'cooperate_fully',
          text: 'Cooperate fully with investigation',
          description: 'Be transparent and helpful',
          effects: [
            { stat_name: 'Compliance Risk', delta: -10, description: 'Cooperation reduces risk' },
            { stat_name: 'Burn', delta: 8000, description: 'Legal and consulting costs' },
            { stat_name: 'Velocity', delta: -0.1, description: 'Time spent on compliance' },
            { stat_name: 'Reputation', delta: 2, description: 'Transparency builds trust' },
          ],
        },
        {
          id: 'minimal_compliance',
          text: 'Minimal compliance effort',
          description: 'Do just enough to pass inspection',
          effects: [
            { stat_name: 'Compliance Risk', delta: 5, description: 'Increased risk of issues' },
            { stat_name: 'Burn', delta: 2000, description: 'Basic compliance costs' },
            { stat_name: 'Reputation', delta: -3, description: 'Perception of cutting corners' },
          ],
        },
        {
          id: 'lobby_influence',
          text: 'Use influence to shape regulation',
          description: 'Work with industry groups',
          effects: [
            { stat_name: 'Burn', delta: 15000, description: 'Lobbying and influence costs' },
            { stat_name: 'Compliance Risk', delta: -15, description: 'Help shape favorable rules' },
            { stat_name: 'Reputation', delta: 4, description: 'Industry leadership position' },
          ],
        },
      ],
      duration_weeks: 1,
      active: false,
      week_started: 0,
    },

    // Technical Events
    {
      id: 'security_breach',
      title: 'Security Incident',
      description: 'A security vulnerability has been exploited, compromising user data.',
      category: 'Technical',
      probability: 4,
      condition: (state) => state.tech_debt > 40,
      choices: [
        {
          id: 'full_disclosure',
          text: 'Full transparency and disclosure',
          description: 'Inform all affected users immediately',
          effects: [
            { stat_name: 'Reputation', delta: -8, description: 'Transparency costs trust' },
            { stat_name: 'Churn Rate', delta: 3, description: 'Some users leave' },
            { stat_name: 'Compliance Risk', delta: -5, description: 'Shows responsibility' },
            { stat_name: 'WAU', delta: -500, description: 'User loss from breach' },
          ],
        },
        {
          id: 'quiet_fix',
          text: 'Fix quietly and hope for the best',
          description: 'Address the issue without publicity',
          effects: [
            { stat_name: 'Tech Debt', delta: -8, description: 'Security improvements' },
            { stat_name: 'Compliance Risk', delta: 10, description: 'Non-disclosure increases risk' },
            { stat_name: 'Reputation', delta: -15, description: 'Discovery would be devastating' },
          ],
        },
        {
          id: 'turn_into_opportunity',
          text: 'Use as opportunity to demonstrate security commitment',
          description: 'Proactive security enhancement program',
          effects: [
            { stat_name: 'Tech Debt', delta: -12, description: 'Comprehensive security overhaul' },
            { stat_name: 'Burn', delta: 12000, description: 'Security investment' },
            { stat_name: 'Reputation', delta: 6, description: 'Security leadership position' },
            { stat_name: 'Compliance Risk', delta: -8, description: 'Strong security posture' },
          ],
        },
      ],
      duration_weeks: 1,
      active: false,
      week_started: 0,
    },
  ];
}

export function getEventSummary(event: GameEvent): string {
  return `${event.title}: ${event.description}`;
}

export function getChoiceSummary(choice: EventChoice): string {
  return `${choice.text} - ${choice.description}`;
}