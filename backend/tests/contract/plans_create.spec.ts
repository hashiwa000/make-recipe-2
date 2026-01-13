import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../src/server';

describe('POST /plans (contract)', () => {
  const payload = {
    text: '玉ねぎ2個 と 鶏もも 300g',
    constraints: {
      maxCookTimeMin: 60,
    },
  };
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 202 with Plan schema (7 evening slots)', async () => {
    const res = await app.inject({ method: 'POST', url: '/plans', payload });
    expect(res.statusCode).toBe(202);
    const plan = res.json() as any;
    expect(plan).toHaveProperty('id');
    expect(Array.isArray(plan.slots)).toBe(true);
    expect(plan.slots).toHaveLength(7);
    for (const slot of plan.slots) {
      expect(slot).toHaveProperty('id');
      expect(slot).toHaveProperty('date');
      expect(slot).toHaveProperty('period');
      expect(slot.period).toBe('evening');
      expect(slot).toHaveProperty('locked');
    }
  });
});

