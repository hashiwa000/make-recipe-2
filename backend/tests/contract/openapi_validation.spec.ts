import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../src/server';
import {
  IngredientParseResultSchema,
  PlanSchema,
  ShoppingListSchema,
  ShareLinkSchema,
  expectValid,
} from '../helpers/openapi-schemas';

describe('OpenAPI-like response schema validation', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;
  let planId = '';

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /parse-ingredients -> IngredientParseResult', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/parse-ingredients',
      payload: { text: '玉ねぎ2個 と 鶏もも 300g' },
    });
    expect(res.statusCode).toBe(200);
    expectValid(IngredientParseResultSchema, res.json());
  });

  it('POST /plans -> Plan (202)', async () => {
    const res = await app.inject({ method: 'POST', url: '/plans', payload: { text: '玉ねぎ2個' } });
    expect(res.statusCode).toBe(202);
    const body = res.json();
    expectValid(PlanSchema, body);
    planId = (body as any).id;
  });

  it('GET /plans/{id} -> Plan', async () => {
    const res = await app.inject({ method: 'GET', url: `/plans/${planId}` });
    expect(res.statusCode).toBe(200);
    expectValid(PlanSchema, res.json());
  });

  it('PATCH /plans/{id}/slots/{slotId} -> Plan', async () => {
    const get = await app.inject({ method: 'GET', url: `/plans/${planId}` });
    const slotId = (get.json() as any).slots[0].id as string;
    const res = await app.inject({ method: 'PATCH', url: `/plans/${planId}/slots/${slotId}` });
    expect(res.statusCode).toBe(200);
    expectValid(PlanSchema, res.json());
  });

  it('GET /plans/{id}/shopping-list -> ShoppingList', async () => {
    const res = await app.inject({ method: 'GET', url: `/plans/${planId}/shopping-list` });
    expect(res.statusCode).toBe(200);
    expectValid(ShoppingListSchema, res.json());
  });

  it('GET /plans/{id}/export.csv -> text/csv', async () => {
    const res = await app.inject({ method: 'GET', url: `/plans/${planId}/export.csv` });
    expect(res.statusCode).toBe(200);
    expect((res.headers['content-type'] || '').includes('text/csv')).toBe(true);
  });

  it('GET /plans/{id}/export.pdf -> application/pdf', async () => {
    const res = await app.inject({ method: 'GET', url: `/plans/${planId}/export.pdf` });
    expect(res.statusCode).toBe(200);
    expect((res.headers['content-type'] || '').includes('application/pdf')).toBe(true);
  });

  it('POST /plans/{id}/share -> ShareLink (201) and GET /shared/{token} -> Plan', async () => {
    const share = await app.inject({ method: 'POST', url: `/plans/${planId}/share` });
    expect(share.statusCode).toBe(201);
    const link = share.json();
    expectValid(ShareLinkSchema, link);
    const token = (link as any).token as string;
    const shared = await app.inject({ method: 'GET', url: `/shared/${token}` });
    expect(shared.statusCode).toBe(200);
    expectValid(PlanSchema, shared.json());
  });
});

