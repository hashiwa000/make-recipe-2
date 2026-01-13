// Entry point for menu-core library
// NOTE: Will be expanded to export parser/planner modules per tasks.

export function coreReady(): string {
  return 'menu-core:ok';
}

// Placeholder exports for upcoming tasks
export * from './schema/entities';
export * from './schema/constraints';
export * from './parsing/parse-input';
export * from './planner/plan-generator';
