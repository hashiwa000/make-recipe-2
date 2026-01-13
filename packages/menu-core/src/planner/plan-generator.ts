import { Plan, Recipe, IngredientRef, MealSlot } from '../schema/entities';
import { parseInputText } from '../parsing/parse-input';

function nextMondayISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = (8 - (day || 7)) % 7; // days to next Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

// Exported simple recipe generator for reuse (e.g., slot regeneration)
export function generateRecipeFromIngredients(title: string, inputs: IngredientRef[]): Recipe {
  return {
    id: `${title}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    summary: 'Auto generated placeholder',
    ingredients: inputs.length ? inputs.slice(0, 3) : [],
    steps: ['材料を下ごしらえする', '調理する', '盛り付ける'],
    estimatedTimeMin: 30,
    nutrition: null,
    source: 'llm',
  };
}

export function generatePlanFromText(text: string): Plan {
  const weekStart = nextMondayISO();
  const slots: MealSlot[] = [];
  // Use the ingredient parser to ensure names/units are normalized
  const baseIngredients: IngredientRef[] = parseInputText(text).slice(0, 3);

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const iso = date.toISOString().slice(0, 10);
    const recipe = generateRecipeFromIngredients(`夕食 ${i + 1}`, baseIngredients);
    slots.push({
      id: `slot-${i + 1}`,
      date: iso,
      period: 'evening',
      recipe,
      notes: null,
      locked: false,
    });
  }

  return {
    id: `plan-${Math.random().toString(36).slice(2, 8)}`,
    weekStartDate: weekStart,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    slots,
    lockedSlotIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerProfileId: null,
  };
}
