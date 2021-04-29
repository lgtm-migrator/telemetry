const { Tracing, Metrics } = require('@map-colonies/telemetry');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');

new Tracing('aaaa', [new ExpressInstrumentation(), new HttpInstrumentation({ ignoreOutgoingUrls: [/^.*\/v1\/metrics.*$/] })]).start();

const meter = new Metrics('test_meter').start();

const counter = meter.createCounter('test_counter', { x: 'd' });

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  counter.add(1);
  res.json({ x: 'd' });
});

app.listen(8080, () => console.log('server listening on 8080'));
