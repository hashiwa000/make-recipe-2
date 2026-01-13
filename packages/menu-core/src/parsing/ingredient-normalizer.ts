// Ingredient normalizer: converts free text tokens to canonical IngredientRef
import { IngredientRef } from '../schema/entities';

export type RawToken = { name: string; quantity?: number; unit?: string };

const UNIT_MAP: Record<string, IngredientRef['unit']> = {
  g: 'g',
  gr: 'g',
  グラム: 'g',
  ml: 'ml',
  ミリリットル: 'ml',
  個: '個',
  本: '本',
  枚: '枚',
  大さじ: '大さじ',
  小さじ: '小さじ',
  杯: '杯',
};

export function normalizeToken(token: RawToken): IngredientRef {
  const name = token.name.trim();
  const unit = (token.unit && UNIT_MAP[token.unit]) || (token.unit as any) || '個';
  const quantity = token.quantity ?? 1;
  return {
    ingredientId: name, // simple placeholder id
    name,
    quantity,
    unit,
  };
}

