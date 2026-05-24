export type PlanTier = 'free' | 'pro' | 'team';

export interface FeatureAccess {
  plan: PlanTier;
  aiAssist: boolean;
  aiConfig: boolean;
  aiAnalysis: boolean;
  reason?: string;
}

const PLAN_STORAGE_KEY = 'subscription_plan';
const AI_PAYWALL_STORAGE_KEY = 'ai_paywall_enabled';

const PAID_PLANS = new Set<PlanTier>(['pro', 'team']);

function normalizePlan(value: string | null): PlanTier {
  if (value === 'pro' || value === 'team') {
    return value;
  }
  return 'free';
}

function isAIPaywallEnabled(): boolean {
  const value = localStorage.getItem(AI_PAYWALL_STORAGE_KEY);
  return value === null ? false : value !== 'false';
}

export function getPlanTier(): PlanTier {
  return normalizePlan(localStorage.getItem(PLAN_STORAGE_KEY));
}

export function setPlanTier(plan: PlanTier): void {
  localStorage.setItem(PLAN_STORAGE_KEY, plan);
}

export function setAIPaywallEnabled(enabled: boolean): void {
  localStorage.setItem(AI_PAYWALL_STORAGE_KEY, String(enabled));
}

export function getFeatureAccess(): FeatureAccess {
  const plan = getPlanTier();
  const paywallEnabled = isAIPaywallEnabled();
  const hasPaidAI = !paywallEnabled || PAID_PLANS.has(plan);

  return {
    plan,
    aiAssist: hasPaidAI,
    aiConfig: hasPaidAI,
    aiAnalysis: hasPaidAI,
    reason: hasPaidAI ? undefined : 'AI 辅助是付费功能，请升级后使用。',
  };
}

export function canUseAIAssist(): boolean {
  return getFeatureAccess().aiAssist;
}
