import { handleBusinessDiscovery } from "./business-discovery.mjs";
import { handleCompanyResearch } from "./company-research.mjs";
import { handleLeadScoring } from "./lead-scoring.mjs";

const registry = new Map();

// Discovery tasks
registry.set("business_discovery", handleBusinessDiscovery);

// Research tasks
registry.set("company_research", handleCompanyResearch);

// Scoring tasks
registry.set("lead_scoring", handleLeadScoring);

export function getHandler(taskType) {
  return registry.get(taskType);
}

export function knownTaskTypes() {
  return Array.from(registry.keys());
}
