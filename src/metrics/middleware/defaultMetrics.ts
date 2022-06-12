import { Registry, collectDefaultMetrics } from 'prom-client';
import * as express from 'express';

export function defaultMetricsMiddleware(prefix?: string, labels?: Record<string, string>): express.RequestHandler {
  const register = new Registry();
  collectDefaultMetrics({ register, labels });
  return async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (error) {
      return next(error);
    }
  };
}
