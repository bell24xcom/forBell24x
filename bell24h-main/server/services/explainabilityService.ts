// explainabilityService.ts
// Mock SHAP/LIME explainability for model predictions

interface Explanation {
  feature: string;
  importance: number;
}

/**
 * Generate a mock SHAP/LIME explanation for a prediction
 * @param model - The model name
 * @param prediction - The prediction object
 */
export function getExplanation(model: string, prediction: Record<string, unknown>): Explanation[] {
  // Mock: assign random importance to each feature
  if (!prediction) return [];
  return Object.keys(prediction).map((feature) => ({
    feature,
    importance: Math.round(Math.random() * 100) / 100 // random value for demo
  }));
}
