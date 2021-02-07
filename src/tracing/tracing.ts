import { NodeTracerProvider } from '@opentelemetry/node';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { Logger, NoopTracerProvider, Tracer } from '@opentelemetry/api';
import { TelemetryBase } from '../common/interfaces';
import { getTracingConfig, TracingConfig } from './config';

export class Tracing implements TelemetryBase<Tracer> {
  private provider?: NodeTracerProvider;
  private readonly config: TracingConfig;
  public constructor(private readonly tracerName: string, private readonly logger?: Logger) {
    this.config = getTracingConfig();
  }

  public start(): Tracer {
    const { isEnabled, version, serviceName, ...exporterConfig } = this.config;

    if (!isEnabled) {
      const provider = new NoopTracerProvider();
      return provider.getTracer(this.tracerName);
    }

    this.provider = new NodeTracerProvider({
      logger: this.logger,
      logLevel: exporterConfig.loglevel,
      // be sure to disable old plugins
      plugins: {
        http: { enabled: false, path: '@opentelemetry/plugin-http' },
        https: { enabled: false, path: '@opentelemetry/plugin-https' },
      },
    });

    const exporter = new CollectorTraceExporter({
      ...exporterConfig,
      logger: this.logger,
      attributes: { 'service.version': version, 'service.name': serviceName },
    });

    const httpInstrumentation = new HttpInstrumentation({ logger: this.logger });
    httpInstrumentation.enable();

    this.provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    this.provider.register();

    return this.provider.getTracer(this.tracerName);
  }

  public async stop(): Promise<void> {
    await this.provider?.shutdown();
  }
}
