import { z } from 'zod';
import { IngredientRefSchema, UserProfileSchema } from './entities';

export const ConstraintsSchema = z.object({
  minInputUtilizationRatio: z.number().min(0).max(1).default(0.8),
  forbidAllergens: z.boolean().default(true),
  diversity: z.object({
    maxSameRecipeRatio: z.number().min(0).max(1).default(0.15),
    avoidConsecutiveCuisine: z.boolean().default(true),
  }),
});

export const ParseInputSchema = z.object({
  text: z.string(),
  locale: z.string().default('ja-JP'),
});

export const PlanRequestSchema = z.object({
  inputs: z.array(IngredientRefSchema).optional(),
  inputText: z.string().optional(),
  profile: UserProfileSchema.optional(),
  constraints: ConstraintsSchema.optional(),
});

export type Constraints = z.infer<typeof ConstraintsSchema>;
export type ParseInput = z.infer<typeof ParseInputSchema>;
export type PlanRequest = z.infer<typeof PlanRequestSchema>;

