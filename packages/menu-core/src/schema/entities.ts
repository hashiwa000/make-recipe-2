import { z } from 'zod';

export const CuisineRatioSchema = z.object({
  japanese: z.number().min(0),
  western: z.number().min(0),
  chinese: z.number().min(0),
});

export const UserProfileSchema = z.object({
  id: z.string(),
  peopleCount: z.number().int().min(1),
  preferences: z.object({
    cuisines: CuisineRatioSchema,
    excludeIngredients: z.array(z.string()),
  }),
  allergies: z.array(z.string()),
  budgetPerWeekJPY: z.number().min(0),
  maxCookTimeMin: z.number().min(0),
  maxCaloriesPerMeal: z.number().min(0),
  tz: z.string(),
});

export const IngredientUnitEnum = z.enum([
  'g',
  'ml',
  '個',
  '大さじ',
  '小さじ',
  '枚',
  '本',
  '杯',
]);

export const IngredientRefSchema = z.object({
  ingredientId: z.string(),
  name: z.string(),
  quantity: z.number().min(0),
  unit: IngredientUnitEnum,
});

export const NutritionSchema = z
  .object({
    calories: z.number(),
    protein_g: z.number(),
    fat_g: z.number(),
    carbs_g: z.number(),
  })
  .nullable();

export const RecipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  ingredients: z.array(IngredientRefSchema).min(1),
  steps: z.array(z.string()),
  estimatedTimeMin: z.number().min(0),
  nutrition: NutritionSchema,
  source: z.enum(['llm', 'user']),
});

export const MealSlotSchema = z.object({
  id: z.string(),
  date: z.string(),
  period: z.literal('evening'),
  recipe: RecipeSchema.nullable(),
  notes: z.string().nullable(),
  locked: z.boolean(),
});

export const PlanSchema = z.object({
  id: z.string(),
  weekStartDate: z.string(),
  timezone: z.string(),
  slots: z.array(MealSlotSchema).length(7),
  lockedSlotIds: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  ownerProfileId: z.string().nullable(),
});

export const ShoppingCategoryEnum = z.enum([
  'vegetables',
  'meat',
  'fish',
  'dairy',
  'grains',
  'seasonings',
  'others',
]);

export const ShoppingItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  totalQuantity: z.number().min(0),
  unit: IngredientUnitEnum,
  category: ShoppingCategoryEnum,
  source: z.enum(['from-input', 'additional-purchase']),
});

export const ShareLinkSchema = z.object({
  id: z.string(),
  planId: z.string(),
  token: z.string(),
  expiresAt: z.string().nullable(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type IngredientRef = z.infer<typeof IngredientRefSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
export type MealSlot = z.infer<typeof MealSlotSchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type ShoppingItem = z.infer<typeof ShoppingItemSchema>;
export type ShareLink = z.infer<typeof ShareLinkSchema>;

