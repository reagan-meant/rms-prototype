// Returns the route to resume a risk at its furthest completed step.
// Step 1 (Identify) is done if the risk exists.
// Step 2 (Analyze) is done if controlEffectiveness is set.
// Step 3 (Evaluate) is done if evaluationDecision is set.
// Step 4 (Treat) — submitted if treatmentSubmitted is true.
export function resumeRoute(risk) {
  if (!risk) return '/register';
  if (risk.evaluationDecision) return `/risks/${risk.id}/treat`;
  if (risk.controlEffectiveness) return `/risks/${risk.id}/evaluate`;
  return `/risks/${risk.id}/analyze`;
}

export function isSubmitted(risk) {
  return !!risk.treatmentSubmitted;
}
