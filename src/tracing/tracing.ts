import { NodeTracerProvider } from '@opentelemetry/node';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { InstrumentationOption, registerInstrumentations } from '@opentelemetry/instrumentation';
import { NoopTracerProvider, Tracer } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { TelemetryBase } from '../common/interfaces';
import { getTracingConfig, TracingConfig } from './config';

export class Tracing implements TelemetryBase<Tracer> {
  private provider?: NodeTracerProvider;
  private readonly config: TracingConfig;
  public constructor(private readonly tracerName: string, private readonly insturmentations?: InstrumentationOption[]) {
    this.config = getTracingConfig();
  }

  public start(): Tracer {
    const { isEnabled, version, serviceName, ...exporterConfig } = this.config;

    if (!isEnabled) {
      const provider = new NoopTracerProvider();
      return provider.getTracer(this.tracerName);
    }

    this.provider = new NodeTracerProvider();

    registerInstrumentations({ tracerProvider: this.provider, instrumentations: this.insturmentations });

    const exporter = new CollectorTraceExporter({
      ...exporterConfig,
      serviceName,
      attributes: { 'service.version': version },
    });

    // consider batch processor
    this.provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    this.provider.register({ contextManager: new AsyncHooksContextManager() });

    return this.provider.getTracer(this.tracerName);
  }

  public async stop(): Promise<void> {
    await this.provider?.shutdown();
  }
}
