import { NodeTracerProvider } from '@opentelemetry/node';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { InstrumentationOption, registerInstrumentations } from '@opentelemetry/instrumentation';
import { TelemetryBase } from '../common/interfaces';
import { getTracingConfig, TracingConfig } from './config';

export class Tracing implements TelemetryBase<void> {
  private provider?: NodeTracerProvider;
  private readonly config: TracingConfig;
  public constructor(private readonly insturmentations?: InstrumentationOption[]) {
    this.config = getTracingConfig();
  }

  public start(): void {
    const { version, isEnabled, ...exporterConfig } = this.config;

    if (!isEnabled) {
      return;
    }

    this.provider = new NodeTracerProvider();

    registerInstrumentations({ tracerProvider: this.provider, instrumentations: this.insturmentations });

    const exporter = new CollectorTraceExporter({
      ...exporterConfig,
      attributes: { 'service.version': version },
    });

    // consider batch processor
    this.provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    this.provider.register();
  }

  public async stop(): Promise<void> {
    await this.provider?.shutdown();
  }
}
