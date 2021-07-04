import { NodeTracerProvider } from '@opentelemetry/node';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { Resource } from '@opentelemetry/resources';
import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { InstrumentationOption, registerInstrumentations } from '@opentelemetry/instrumentation';
import { TelemetryBase } from '../common/interfaces';
import { getTracingConfig, TracingConfig } from './config';

export class Tracing implements TelemetryBase<void> {
  private provider?: NodeTracerProvider;
  private readonly config: TracingConfig;
  public constructor(private readonly insturmentations?: InstrumentationOption[], private readonly userResource?: Resource) {
    this.config = getTracingConfig();
  }

  public start(): void {
    const { isEnabled } = this.config;

    if (!isEnabled) {
      return;
    }

    const { version, serviceName, ...exporterConfig } = this.config;

    let resource = new Resource({ 'service.version': version, 'service.name': serviceName });

    if (this.userResource) {
      resource = resource.merge(this.userResource);
    }

    this.provider = new NodeTracerProvider({ resource });

    registerInstrumentations({ tracerProvider: this.provider, instrumentations: this.insturmentations });

    const exporter = new CollectorTraceExporter({
      ...exporterConfig,
    });

    // consider batch processor
    this.provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    this.provider.register();
  }

  public async stop(): Promise<void> {
    await this.provider?.shutdown();
  }
}
