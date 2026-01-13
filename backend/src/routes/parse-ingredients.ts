import { FastifyPluginCallback } from 'fastify';
import { parseInputText } from '../../../packages/menu-core/src/parsing/parse-input';

const parseIngredientsRoute: FastifyPluginCallback = (app, _opts, done) => {
  app.post('/parse-ingredients', async (req, reply) => {
    const body = req.body as any;
    const text = body?.text ?? '';
    const items = parseInputText(String(text));
    return reply.status(200).send({ items });
  });
  done();
};

export default parseIngredientsRoute;

