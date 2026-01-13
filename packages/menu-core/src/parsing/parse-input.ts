import { IngredientRef } from '../schema/entities';
import { normalizeToken } from './ingredient-normalizer';

const LINE_RE = /^(?<name>[^0-9\s]+)\s*(?<qty>\d+(?:\.\d+)?)?\s*(?<unit>個|本|枚|g|ml|大さじ|小さじ|杯)?/;

export function parseInputText(text: string): IngredientRef[] {
  const lines = text
    .split(/\r?\n|、|,|\s+と\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const items: IngredientRef[] = [];
  for (const line of lines) {
    const m = LINE_RE.exec(line);
    if (!m || !m.groups) continue;
    const name = m.groups.name.trim();
    const qty = m.groups.qty ? Number(m.groups.qty) : 1;
    const unit = (m.groups.unit as any) || (name.match(/g$/i) ? 'g' : undefined);
    items.push(normalizeToken({ name, quantity: qty, unit }));
  }
  return items;
}

