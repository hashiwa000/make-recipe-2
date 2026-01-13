import { FastifyPluginCallback } from 'fastify';
import { generatePlanFromText } from '../../../packages/menu-core/src/planner/plan-generator';
import { planStore } from '../store/plan-store';

const plansRoutes: FastifyPluginCallback = (app, _opts, done) => {
  // Create plan and persist in memory
  app.post('/plans', async (req, reply) => {
    const body = req.body as any;
    const text: string = body?.text ?? '';
    const plan = planStore.newFromText(String(text));
    return reply.status(202).send(plan);
  });

  // Retrieve plan by id
  app.get('/plans/:planId', async (req, reply) => {
    const { planId } = req.params as any;
    const plan = planStore.get(String(planId));
    if (!plan) return reply.status(404).send({ error: { message: 'Plan not found', code: 'NOT_FOUND' } });
    return reply.status(200).send(plan);
  });

  // Regenerate a specific slot
  app.patch('/plans/:planId/slots/:slotId', async (req, reply) => {
    const { planId, slotId } = req.params as any;
    const updated = planStore.regenerateSlot(String(planId), String(slotId));
    if (!updated) return reply.status(404).send({ error: { message: 'Plan or slot not found', code: 'NOT_FOUND' } });
    return reply.status(200).send(updated);
  });

  // Lock a slot
  app.post('/plans/:planId/slots/:slotId/lock', async (_req, reply) => {
    const { planId, slotId } = _req.params as any;
    const updated = planStore.lockSlot(String(planId), String(slotId));
    if (!updated) return reply.status(404).send({ error: { message: 'Plan or slot not found', code: 'NOT_FOUND' } });
    return reply.status(200).send({ ok: true });
  });

  // Shopping list aggregation
  app.get('/plans/:planId/shopping-list', async (req, reply) => {
    const { planId } = req.params as any;
    const list = planStore.shoppingList(String(planId));
    if (!list) return reply.status(404).send({ error: { message: 'Plan not found', code: 'NOT_FOUND' } });
    return reply.status(200).send(list);
  });

  // CSV export of shopping list
  app.get('/plans/:planId/export.csv', async (req, reply) => {
    const { planId } = req.params as any;
    const csv = planStore.exportCsv(String(planId));
    if (!csv) return reply.status(404).send({ error: { message: 'Plan not found', code: 'NOT_FOUND' } });
    reply.header('Content-Type', 'text/csv');
    return reply.status(200).send(csv);
  });

  // PDF export placeholder
  app.get('/plans/:planId/export.pdf', async (req, reply) => {
    const { planId } = req.params as any;
    const plan = planStore.get(String(planId));
    if (!plan) return reply.status(404).send({ error: { message: 'Plan not found', code: 'NOT_FOUND' } });
    const pdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 300]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF');
    reply.header('Content-Type', 'application/pdf');
    return reply.status(200).send(pdf);
  });

  // Create share link
  app.post('/plans/:planId/share', async (req, reply) => {
    const { planId } = req.params as any;
    const link = planStore.createShare(String(planId));
    if (!link) return reply.status(404).send({ error: { message: 'Plan not found', code: 'NOT_FOUND' } });
    return reply.status(201).send(link);
  });

  // Get shared plan by token
  app.get('/shared/:token', async (req, reply) => {
    const { token } = req.params as any;
    const plan = planStore.getShared(String(token));
    if (!plan) return reply.status(404).send({ error: { message: 'Share not found', code: 'NOT_FOUND' } });
    return reply.status(200).send(plan);
  });

  done();
};

export default plansRoutes;
