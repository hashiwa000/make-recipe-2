import { FastifyPluginCallback } from 'fastify';

const loggerPlugin: FastifyPluginCallback = (app, _opts, done) => {
  app.addHook('onRequest', async (req) => {
    app.log.info({ method: req.method, url: req.url }, 'request');
  });
  app.addHook('onResponse', async (req, reply) => {
    app.log.info({ statusCode: reply.statusCode, url: req.url }, 'response');
  });
  done();
};

export default loggerPlugin;

