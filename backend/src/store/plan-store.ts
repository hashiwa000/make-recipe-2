// In-memory Plan store and helpers for shopping list, sharing, and updates
import { Plan, MealSlot, IngredientRef } from '../../../packages/menu-core/src/schema/entities';
import { parseInputText } from '../../../packages/menu-core/src/parsing/parse-input';
import { generatePlanFromText, generateRecipeFromIngredients } from '../../../packages/menu-core/src/planner/plan-generator';

type ShoppingListItem = {
  id: string;
  name: string;
  totalQuantity: number;
  unit: IngredientRef['unit'];
  category: 'others';
  source: 'from-input';
};

class PlanStore {
  private plans = new Map<string, Plan>();
  private shares = new Map<string, { planId: string; expiresAt: string | null }>();

  save(plan: Plan) {
    this.plans.set(plan.id, plan);
  }

  get(planId: string): Plan | undefined {
    return this.plans.get(planId);
  }

  newFromText(text: string): Plan {
    const plan = generatePlanFromText(text);
    this.save(plan);
    return plan;
  }

  lockSlot(planId: string, slotId: string): Plan | undefined {
    const plan = this.get(planId);
    if (!plan) return undefined;
    const slot = plan.slots.find((s) => s.id === slotId);
    if (!slot) return undefined;
    slot.locked = true;
    if (!plan.lockedSlotIds.includes(slotId)) plan.lockedSlotIds.push(slotId);
    plan.updatedAt = new Date().toISOString();
    return plan;
  }

  regenerateSlot(planId: string, slotId: string): Plan | undefined {
    const plan = this.get(planId);
    if (!plan) return undefined;
    const slot = plan.slots.find((s) => s.id === slotId);
    if (!slot) return undefined;
    const base: IngredientRef[] = slot.recipe?.ingredients ?? [];
    const title = `${slot.period === 'evening' ? '夕食' : '食事'} 再生成`;
    slot.recipe = generateRecipeFromIngredients(title, base);
    plan.updatedAt = new Date().toISOString();
    return plan;
  }

  shoppingList(planId: string): { items: ShoppingListItem[] } | undefined {
    const plan = this.get(planId);
    if (!plan) return undefined;
    const map = new Map<string, ShoppingListItem>();
    for (const slot of plan.slots) {
      const ings = slot.recipe?.ingredients ?? [];
      for (const ing of ings) {
        const key = `${ing.name}|${ing.unit}`;
        const cur = map.get(key) ?? {
          id: ing.ingredientId,
          name: ing.name,
          totalQuantity: 0,
          unit: ing.unit,
          category: 'others' as const,
          source: 'from-input' as const,
        };
        cur.totalQuantity += ing.quantity;
        map.set(key, cur);
      }
    }
    return { items: Array.from(map.values()) };
  }

  exportCsv(planId: string): string | undefined {
    const list = this.shoppingList(planId);
    if (!list) return undefined;
    const rows = [
      ['name', 'totalQuantity', 'unit', 'category'],
      ...list.items.map((i) => [i.name, String(i.totalQuantity), i.unit, i.category]),
    ];
    return rows.map((r) => r.map((c) => `${String(c).replace(/"/g, '""')}`).join(',')).join('\n');
  }

  createShare(planId: string): { id: string; planId: string; token: string; expiresAt: string | null } | undefined {
    const plan = this.get(planId);
    if (!plan) return undefined;
    const token = Math.random().toString(36).slice(2, 10);
    const id = `share-${token}`;
    const expiresAt = null;
    this.shares.set(token, { planId, expiresAt });
    return { id, planId, token, expiresAt };
  }

  getShared(token: string): Plan | undefined {
    const s = this.shares.get(token);
    if (!s) return undefined;
    return this.get(s.planId);
  }
}

export const planStore = new PlanStore();

