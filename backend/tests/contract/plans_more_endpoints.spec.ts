import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../src/server';

describe('Additional Plans endpoints (contract-ish)', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;
  let planId = '';

  beforeAll(async () => {
    app = await buildServer();
    const res = await app.inject({ method: 'POST', url: '/plans', payload: { text: '玉ねぎ2個\n鶏もも300g' } });
    const plan = res.json() as any;
    planId = plan.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /plans/{planId} returns a plan', async () => {
    const res = await app.inject({ method: 'GET', url: `/plans/${planId}` });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.id).toBe(planId);
  });

  it('POST /plans/{planId}/slots/{slotId}/lock locks and returns 200', async () => {
    const get = await app.inject({ method: 'GET', url: `/plans/${planId}` });
    const plan = get.json() as any;
    const slotId: string = plan.slots[0].id;
    const res = await app.inject({ method: 'POST', url: `/plans/${planId}/slots/${slotId}/lock` });
    expect(res.statusCode).toBe(200);
  });

  it('GET /plans/{planId}/shopping-list returns aggregated items', async () => {
    const res = await app.inject({ method: 'GET', url: `/plans/${planId}/shopping-list` });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(Array.isArray(body.items)).toBe(true);
  });
});

