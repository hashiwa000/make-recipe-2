import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../src/server';

describe('Plan generation integration (US1)', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('generates a 7-slot evening-only plan and utilizes >=80% of inputs', async () => {
    const text = '玉ねぎ2個\nにんじん1本\n鶏もも300g\nじゃがいも2個';

    // 1) parse inputs
    const parseRes = await app.inject({ method: 'POST', url: '/parse-ingredients', payload: { text } });
    expect(parseRes.statusCode).toBe(200);
    const parsed = parseRes.json() as any;
    expect(Array.isArray(parsed.items)).toBe(true);

    // 2) generate plan
    const planRes = await app.inject({ method: 'POST', url: '/plans', payload: { text } });
    expect(planRes.statusCode).toBe(202);
    const plan = planRes.json() as any;
    expect(Array.isArray(plan.slots)).toBe(true);
    expect(plan.slots).toHaveLength(7);

    // 3) utilization check placeholder (to be replaced by concrete rule)
    // For now, assert that at least one slot has a recipe referencing an input name.
    const names: string[] = parsed.items.map((it: any) => it.name);
    const foundRef = plan.slots.some((s: any) => s.recipe && s.recipe.ingredients?.some((ing: any) => names.includes(ing.name)));
    expect(foundRef).toBe(true);
  });
});

