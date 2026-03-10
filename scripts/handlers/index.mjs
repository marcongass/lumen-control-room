import { handleBusinessDiscovery } from "./business-discovery.mjs";
import { handleCompanyResearch } from "./company-research.mjs";
import { handleLeadScoring } from "./lead-scoring.mjs";
import { handleGenerateReport } from "./generate-report.mjs";

const registry = new Map();

// Discovery tasks
registry.set("business_discovery", handleBusinessDiscovery);

// Research tasks
registry.set("company_research", handleCompanyResearch);

// Scoring tasks
registry.set("lead_scoring", handleLeadScoring);

// Report tasks
registry.set("generate_report", handleGenerateReport);

export function getHandler(taskType) {
  return registry.get(taskType);
}

export function knownTaskTypes() {
  return Array.from(registry.keys());
}
