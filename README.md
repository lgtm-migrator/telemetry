# Telemetry
## Motive
This package goal is to make the experience of configuring and working with OpenTelemetry easier.
## Tracing
The following code shows a simple example of how to work with the package. please notice that you need to manually install any auto-instrumentation library that you require.

```typescript
import { Tracing } from './tracing';

const tracing = new Tracing('my-tracer-name');

const tracer = tracing.start();

const span = tracer.startSpan('some-action');

span.setAttribute('some-attribute');

// DO STUFF

span.end();

tracing.stop().then(() => console.log('done'));
```
### configuration
| name |allowed value| default value | description
|---|---|---|---|
|TELEMETRY_TRACING_ENABLED|'true', 'false'|'false'|Should Tracing be enabled| 
|TELEMETRY_SERVICE_NAME|string|from package.json| The service name
|TELEMETRY_SERVICE_VERSION|string| from package.json| The service version
|TELEMETRY_TRACING_URL<span style="color:red">*</span>|string||The URL to the OpenTelemetry Collector
|TELEMETRY_HOST_NAME|string||The host name
|TELEMETRY_TRACING_LOGLEVEL| 'DEBUG', 'INFO', 'WARN' 'ERROR'||the log level of the internal opentelemetry modules

<span style="color:red">*</span> required (only when tracing is enabled). 