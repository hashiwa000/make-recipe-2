import Fastify from 'fastify';
import logger from './middleware/logger';
import errorHandler from './middleware/error-handler';
import routes from './routes/index';

export async function buildServer() {
  const app = Fastify({ logger: true });
  app.register(logger);
  app.register(errorHandler);
  app.register(routes);
  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}

// Start server when executed directly
if (process.argv[1] && process.argv[1].includes('server')) {
  buildServer()
    .then((app) =>
      app.listen({
        port: process.env.PORT ? Number(process.env.PORT) : 3000,
        host: '0.0.0.0',
      }),
    )
    .then((address) => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on ${address}`);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    });
}
