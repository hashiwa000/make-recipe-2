import { FastifyPluginCallback } from 'fastify';
import parseIngredientsRoute from './parse-ingredients';
import plansRoutes from './plans';
import uiRoutes from './ui';

const routes: FastifyPluginCallback = (app, _opts, done) => {
  app.get('/', async () => ({ ok: true }));
  app.register(parseIngredientsRoute);
  app.register(plansRoutes);
  app.register(uiRoutes);
  done();
};

export default routes;
