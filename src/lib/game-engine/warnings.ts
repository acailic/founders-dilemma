import { GameState } from '../../types/game-systems';

// Port of Rust warnings system from src-tauri/src/game/warnings.rs

export interface FailureWarning {
  id: string;
  category: 'Finance' | 'Team' | 'Technical' | 'Compliance' | 'Market' | 'Operations';
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  probability: number; // 0-100
  time_to_failure: number; // weeks
  triggers: string[];
  mitigation_actions: string[];
  consequences: string[];
}

export interface WarningResult {
  warnings: FailureWarning[];
  risk_score: number;
  critical_count: number;
}

export function generateWarnings(state: GameState): WarningResult {
  const warnings: FailureWarning[] = [];

  // Financial warnings
  warnings.push(...generateFinancialWarnings(state));

  // Team warnings
  warnings.push(...generateTeamWarnings(state));

  // Technical warnings
  warnings.push(...generateTechnicalWarnings(state));

  // Compliance warnings
  warnings.push(...generateComplianceWarnings(state));

  // Market warnings
  warnings.push(...generateMarketWarnings(state));

  // Operations warnings
  warnings.push(...generateOperationsWarnings(state));

  const criticalCount = warnings.filter(w => w.severity === 'Critical').length;
  const riskScore = calculateRiskScore(warnings, state);

  return {
    warnings,
    risk_score: riskScore,
    critical_count: criticalCount,
  };
}

function generateFinancialWarnings(state: GameState): FailureWarning[] {
  const warnings: FailureWarning[] = [];

  // Cash runway warning
  const monthsOfRunway = state.bank / state.burn;
  if (monthsOfRunway < 3) {
    const severity: 'Low' | 'Medium' | 'High' | 'Critical' =
      monthsOfRunway < 1 ? 'Critical' :
      monthsOfRunway < 2 ? 'High' : 'Medium';

    warnings.push({
      id: 'cash_runway_critical',
      category: 'Finance',
      title: 'Critical Cash Runway',
      description: `Only ${monthsOfRunway.toFixed(1)} months of cash runway remaining`,
      severity,
      probability: Math.max(20, 100 - monthsOfRunway * 25),
      time_to_failure: Math.floor(monthsOfRunway * 4),
      triggers: [
        'Monthly burn exceeds revenue',
        'Failed fundraising attempts',
        'Unexpected expenses',
      ],
      mitigation_actions: [
        'Cut non-essential expenses',
        'Accelerate revenue growth',
        'Secure emergency funding',
        'Negotiate payment terms with vendors',
      ],
      consequences: [
        'Company bankruptcy',
        'Forced layoffs',
        'Asset liquidation',
        'Loss of key team members',
      ],
    });
  }

  // Revenue concentration warning
  if (state.mrr > 0) {
    const largestCustomerPercentage = 15; // Simplified - would track actual customer data
    if (largestCustomerPercentage > 20) {
      warnings.push({
        id: 'revenue_concentration',
        category: 'Finance',
        title: 'Revenue Concentration Risk',
        description: `${largestCustomerPercentage}% of revenue from single customer`,
        severity: 'Medium',
        probability: 30,
        time_to_failure: 26,
        triggers: [
          'Loss of major customer',
          'Customer bankruptcy',
          'Contract termination',
        ],
        mitigation_actions: [
          'Diversify customer base',
          'Develop enterprise sales',
          'Build recurring revenue streams',
        ],
        consequences: [
          'Sudden revenue drop',
          'Cash flow crisis',
          'Reduced valuation',
        ],
      });
    }
  }

  // Burn rate vs growth mismatch
  if (state.burn > state.mrr * 1.5 && state.wau_growth_rate < 10) {
    warnings.push({
      id: 'burn_growth_mismatch',
      category: 'Finance',
      title: 'Burn Rate Mismatch',
      description: 'High burn rate with slow growth creates funding pressure',
      severity: 'High',
      probability: 60,
      time_to_failure: Math.floor((state.bank / state.burn) * 4),
      triggers: [
        'Slow user acquisition',
        'High operational costs',
        'Inefficient spending',
      ],
      mitigation_actions: [
        'Optimize unit economics',
        'Reduce customer acquisition cost',
        'Implement cost controls',
        'Accelerate product-market fit',
      ],
      consequences: [
        'Funding difficulties',
        'Reduced runway',
        'Forced cost cutting',
      ],
    });
  }

  return warnings;
}

function generateTeamWarnings(state: GameState): FailureWarning[] {
  const warnings: FailureWarning[] = [];

  // Morale collapse warning
  if (state.morale < 30) {
    const severity: 'Low' | 'Medium' | 'High' | 'Critical' =
      state.morale < 10 ? 'Critical' :
      state.morale < 20 ? 'High' : 'Medium';

    warnings.push({
      id: 'morale_collapse',
      category: 'Team',
      title: 'Team Morale Crisis',
      description: `Team morale at ${state.morale.toFixed(1)} - risk of mass exodus`,
      severity,
      probability: Math.max(15, 50 - state.morale),
      time_to_failure: Math.floor(state.morale / 5),
      triggers: [
        'Excessive overtime',
        'Lack of work-life balance',
        'Poor management',
        'Unclear direction',
      ],
      mitigation_actions: [
        'Implement work-life balance policies',
        'Provide coaching and support',
        'Clarify company vision',
        'Consider team restructuring',
      ],
      consequences: [
        'Key employee departures',
        'Reduced productivity',
        'Knowledge loss',
        'Recruiting difficulties',
      ],
    });
  }

  // Burnout warning
  if (state.morale < 50 && state.velocity < 0.7) {
    warnings.push({
      id: 'team_burnout',
      category: 'Team',
      title: 'Team Burnout',
      description: 'Low morale combined with low velocity indicates burnout',
      severity: 'High',
      probability: 45,
      time_to_failure: 8,
      triggers: [
        'Sustained high pressure',
        'Lack of breaks',
        'Unrealistic deadlines',
      ],
      mitigation_actions: [
        'Mandate time off',
        'Reduce workload',
        'Hire additional staff',
        'Implement sustainable processes',
      ],
      consequences: [
        'Increased turnover',
        'Quality issues',
        'Delayed delivery',
        'Health problems',
      ],
    });
  }

  return warnings;
}

function generateTechnicalWarnings(state: GameState): FailureWarning[] {
  const warnings: FailureWarning[] = [];

  // Technical debt crisis
  if (state.tech_debt > 70) {
    const severity: 'Low' | 'Medium' | 'High' | 'Critical' =
      state.tech_debt > 90 ? 'Critical' :
      state.tech_debt > 80 ? 'High' : 'Medium';

    warnings.push({
      id: 'tech_debt_crisis',
      category: 'Technical',
      title: 'Technical Debt Crisis',
      description: `Technical debt at ${state.tech_debt.toFixed(1)} - severely impacting development`,
      severity,
      probability: Math.min(80, state.tech_debt - 20),
      time_to_failure: Math.floor((100 - state.tech_debt) / 10),
      triggers: [
        'Rapid feature development',
        'Lack of refactoring',
        'Inexperienced team',
        'Tight deadlines',
      ],
      mitigation_actions: [
        'Dedicate time for refactoring',
        'Hire senior engineers',
        'Implement code quality standards',
        'Slow feature development pace',
      ],
      consequences: [
        'Development slowdown',
        'Increased bug rate',
        'Team frustration',
        'Scaling difficulties',
      ],
    });
  }

  // Incident response warning
  if (state.tech_debt > 60 && state.reputation > 60) {
    warnings.push({
      id: 'incident_risk',
      category: 'Technical',
      title: 'High Incident Risk',
      description: 'Technical debt increases likelihood of service outages',
      severity: 'Medium',
      probability: Math.min(60, state.tech_debt / 2),
      time_to_failure: 4,
      triggers: [
        'Complex code changes',
        'High traffic periods',
        'Infrastructure issues',
      ],
      mitigation_actions: [
        'Improve monitoring',
        'Implement gradual deployments',
        'Build incident response team',
        'Reduce technical debt',
      ],
      consequences: [
        'Service outages',
        'Customer dissatisfaction',
        'Reputation damage',
        'Revenue loss',
      ],
    });
  }

  return warnings;
}

function generateComplianceWarnings(state: GameState): FailureWarning[] {
  const warnings: FailureWarning[] = [];

  // Compliance failure risk
  if (state.compliance_risk > 60) {
    const severity: 'Low' | 'Medium' | 'High' | 'Critical' =
      state.compliance_risk > 80 ? 'Critical' :
      state.compliance_risk > 70 ? 'High' : 'Medium';

    warnings.push({
      id: 'compliance_failure',
      category: 'Compliance',
      title: 'Compliance Failure Risk',
      description: `Compliance risk at ${state.compliance_risk.toFixed(1)}% - regulatory action possible`,
      severity,
      probability: Math.min(70, state.compliance_risk),
      time_to_failure: Math.floor((100 - state.compliance_risk) / 5),
      triggers: [
        'Regulatory changes',
        'Data breaches',
        'Inadequate processes',
        'Lack of legal oversight',
      ],
      mitigation_actions: [
        'Hire compliance officer',
        'Implement compliance processes',
        'Conduct regular audits',
        'Legal counsel review',
      ],
      consequences: [
        'Regulatory fines',
        'Business shutdown',
        'Legal action',
        'Reputation damage',
      ],
    });
  }

  return warnings;
}

function generateMarketWarnings(state: GameState): FailureWarning[] {
  const warnings: FailureWarning[] = [];

  // Competitive response warning
  if (state.reputation > 70 && state.wau > 20000) {
    warnings.push({
      id: 'competitive_response',
      category: 'Market',
      title: 'Competitive Response',
      description: 'Market success attracts competitor attention',
      severity: 'Medium',
      probability: 40,
      time_to_failure: 12,
      triggers: [
        'Market share growth',
        'High profile success',
        'Competitor funding rounds',
      ],
      mitigation_actions: [
        'Build moats (network effects, data)',
        'Accelerate product development',
        'Secure intellectual property',
        'Build customer loyalty',
      ],
      consequences: [
        'Loss of market share',
        'Increased competition',
        'Price pressure',
        'Talent acquisition challenges',
      ],
    });
  }

  // Churn crisis
  if (state.churn_rate > 12) {
    warnings.push({
      id: 'churn_crisis',
      category: 'Market',
      title: 'Customer Churn Crisis',
      description: `Monthly churn rate at ${state.churn_rate.toFixed(1)}% - unsustainable`,
      severity: 'High',
      probability: 55,
      time_to_failure: Math.floor(12 / state.churn_rate),
      triggers: [
        'Poor product quality',
        'Better competitor offerings',
        'Pricing issues',
        'Customer support problems',
      ],
      mitigation_actions: [
        'Improve product quality',
        'Enhance customer support',
        'Run retention experiments',
        'Competitive analysis',
      ],
      consequences: [
        'Revenue decline',
        'Growth stall',
        'Negative word of mouth',
        'Reduced valuation',
      ],
    });
  }

  return warnings;
}

function generateOperationsWarnings(state: GameState): FailureWarning[] {
  const warnings: FailureWarning[] = [];

  // Scaling issues
  if (state.wau > 50000 && state.velocity < 0.8) {
    warnings.push({
      id: 'scaling_issues',
      category: 'Operations',
      title: 'Scaling Challenges',
      description: 'User growth outpacing operational capacity',
      severity: 'High',
      probability: 50,
      time_to_failure: 6,
      triggers: [
        'Rapid user growth',
        'Inadequate infrastructure',
        'Process bottlenecks',
      ],
      mitigation_actions: [
        'Scale infrastructure',
        'Hire operations staff',
        'Implement scalable processes',
        'Automate manual processes',
      ],
      consequences: [
        'Service degradation',
        'Customer dissatisfaction',
        'Team burnout',
        'Revenue loss',
      ],
    });
  }

  return warnings;
}

function calculateRiskScore(warnings: FailureWarning[], state: GameState): number {
  let totalRisk = 0;

  // Base risk from warnings
  for (const warning of warnings) {
    const severityMultiplier =
      warning.severity === 'Critical' ? 4 :
      warning.severity === 'High' ? 3 :
      warning.severity === 'Medium' ? 2 : 1;

    totalRisk += (warning.probability / 100) * severityMultiplier * 10;
  }

  // State-based risk modifiers
  if (state.bank < state.burn * 2) totalRisk += 20;
  if (state.morale < 40) totalRisk += 15;
  if (state.tech_debt > 60) totalRisk += 15;
  if (state.compliance_risk > 50) totalRisk += 20;
  if (state.churn_rate > 10) totalRisk += 10;

  return Math.min(100, Math.max(0, totalRisk));
}