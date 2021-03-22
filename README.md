# Telemetry
## Motive
This package goal is to make the experience of configuring and working with OpenTelemetry easier.
## Tracing
The following code shows a simple example of how to work with tracing. please notice that you need to manually install any auto-instrumentation library that you require.

```typescript
import { Tracing } from '@map-colonies/telemetry';

const tracing = new Tracing('my-tracer-name');

const tracer = tracing.start();

const span = tracer.startSpan('some-action');

span.setAttribute('some-attribute');

// DO STUFF

span.end();

tracing.stop().then(() => console.log('done'));
```

## Metrics
The following code shows a simple example of how to work with metrics.

```typescript
import { Metrics } from '@map-colonies/telemetry';

const metrics = new Metrics('sample-meter');

const meter = metrics.start();

const counter = meter.createCounter('sample_counter');

counter.add(1);

metrics.stop().then(() => console.log('done'));
```
### Configuration
#### Common configuration
| name |allowed value| default value | description
|---|---|---|---|
|TELEMETRY_SERVICE_NAME|string|from package.json| The service name
|TELEMETRY_SERVICE_VERSION|string| from package.json| The service version
|TELEMETRY_HOST_NAME|string|`os.hostname()`|The host name
<br/>

#### Tracing configuration
| name |allowed value| default value | description 
|---|---|---|---|
|TELEMETRY_TRACING_ENABLED|'true', 'false'|'false'|Should Tracing be enabled
|TELEMETRY_TRACING_URL<span style="color:red">*</span>|string|http://localhost:55681/v1/trace|The URL to the OpenTelemetry Collector

<span style="color:red">*</span> required (only when tracing is enabled).
<br/>
#### Metric configuration
| name |allowed value| default value | description
|---|---|---|---|
|TELEMETRY_METRICS_ENABLED|'true', 'false'|'false'|Should Metrics be enabled| 
|TELEMETRY_METRICS_URL<span style="color:red">*</span>|string|http://localhost:55681/v1/metrics|The URL to the OpenTelemetry Collector
|TELEMETRY_METRICS_INTERVAL|number|15000|The interval in miliseconds between sending data to the collector

<span style="color:red">*</span> required (only when tracing is enabled). 
