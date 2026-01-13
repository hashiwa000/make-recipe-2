import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../src/server';

describe('POST /parse-ingredients (contract)', () => {
  const payload = { text: '玉ねぎ2個 と 鶏もも 300g' };
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 with IngredientParseResult schema', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/parse-ingredients',
      payload,
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body).toHaveProperty('items');
    expect(Array.isArray(body.items)).toBe(true);
    if (body.items.length > 0) {
      const item = body.items[0];
      expect(item).toHaveProperty('ingredientId');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('quantity');
      expect(item).toHaveProperty('unit');
    }
  });
});

