// Zod schemas approximating OpenAPI components for response validation.
// Loosely validates (allows additional properties) to tolerate implementation details.
import { z } from 'zod';

export const IngredientRefSchema = z.object({
  ingredientId: z.string(),
  name: z.string(),
  quantity: z.number(),
  unit: z.enum(['g', 'ml', '個', '大さじ', '小さじ', '枚', '本', '杯']),
}).passthrough();

export const RecipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  ingredients: z.array(IngredientRefSchema),
  steps: z.array(z.string()),
  estimatedTimeMin: z.number(),
  // OpenAPI shows object; implementation returns null — accept both for now.
  nutrition: z
    .object({
      calories: z.number().optional(),
      protein_g: z.number().optional(),
      fat_g: z.number().optional(),
      carbs_g: z.number().optional(),
    })
    .passthrough()
    .nullable(),
  source: z.enum(['llm', 'user']).optional(),
}).passthrough();

export const MealSlotSchema = z
  .object({
    id: z.string(),
    date: z.string(),
    period: z.enum(['morning', 'evening']),
    recipe: RecipeSchema.optional(),
    notes: z.string().optional().nullable(),
    locked: z.boolean(),
  })
  .passthrough();

export const PlanSchema = z
  .object({
    id: z.string(),
    weekStartDate: z.string(),
    timezone: z.string(),
    slots: z.array(MealSlotSchema),
    lockedSlotIds: z.array(z.string()),
  })
  .passthrough();

export const IngredientParseResultSchema = z
  .object({
    items: z.array(IngredientRefSchema),
  })
  .passthrough();

export const ShoppingListSchema = z
  .object({
    items: z.array(
      z
        .object({
          id: z.string(),
          name: z.string(),
          totalQuantity: z.number(),
          unit: z.enum(['g', 'ml', '個', '大さじ', '小さじ', '枚', '本', '杯']),
          category: z.string(),
          source: z.enum(['from-input', 'additional-purchase']).optional(),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export const ShareLinkSchema = z
  .object({
    id: z.string(),
    planId: z.string(),
    token: z.string(),
    expiresAt: z.string().nullable().optional(),
  })
  .passthrough();

export function expectValid<T>(schema: z.ZodType<T>, value: unknown) {
  const res = schema.safeParse(value);
  if (!res.success) {
    throw new Error('Schema validation failed: ' + JSON.stringify(res.error.format(), null, 2));
  }
}

