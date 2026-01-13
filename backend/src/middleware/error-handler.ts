import { FastifyPluginCallback } from 'fastify';

const errorHandler: FastifyPluginCallback = (app, _opts, done) => {
  app.setErrorHandler((err, _req, reply) => {
    const status = (err as any).statusCode ?? 500;
    reply.status(status).send({
      error: {
        message: err.message,
        code: (err as any).code ?? 'INTERNAL_ERROR',
      },
    });
  });
  done();
};

export default errorHandler;

