import { supportedTasks as discoveryTasks, handleBusinessDiscovery } from "./business-discovery.mjs";
import { supportedTasks as researchTasks, handleCompanyResearch } from "./company-research.mjs";

const registry = new Map();

discoveryTasks.forEach((taskType) => {
  registry.set(taskType, handleBusinessDiscovery);
});

researchTasks.forEach((taskType) => {
  registry.set(taskType, handleCompanyResearch);
});

export function getHandler(taskType) {
  return registry.get(taskType);
}

export function knownTaskTypes() {
  return Array.from(registry.keys());
}
