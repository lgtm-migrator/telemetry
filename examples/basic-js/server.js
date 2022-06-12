const { Tracing, Metrics } = require('@map-colonies/telemetry');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const metricsApi = require('@opentelemetry/api-metrics');

const ignoredPaths = /^.*\/v1\/metrics.*$/;

const tracing = new Tracing(
  undefined,
  {
    '@opentelemetry/instrumentation-http': {
      ignoreOutgoingRequestHook: (req) => ignoredPaths.test(req.path),
    },
  },
  { [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: 'TEST' },
  true
);
tracing.start();

process.on('SIGTERM', async () => {
  await tracing.stop();
});

// const metrics = new Metrics({ [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: 'TEST' });
// metrics.start();

const express = require('express');
const app = express();

const counter = metricsApi.metrics.getMeter('test').createCounter('test_counter', { x: 'd' });

app.get('/', (req, res) => {
  counter.add(1);

  res.json({ x: 'd' });
});

app.listen(8080, () => console.log('server listening on 8080'));
