import { NodeTracerConfig, NodeTracerProvider } from '@opentelemetry/node';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { SimpleSpanProcessor, Tracer } from '@opentelemetry/tracing';
import { CollectorExporterConfigBase } from '@opentelemetry/exporter-collector/build/src/types';

export class Tracing {
  private provider?: NodeTracerProvider;
  public constructor(
    private readonly tracerName: string,
    private readonly providerConfig?: NodeTracerConfig,
    private readonly exporterConfig?: CollectorExporterConfigBase
  ) {}

  public start(): Tracer {
    this.provider = new NodeTracerProvider(this.providerConfig);
    const exporter = new CollectorTraceExporter(this.exporterConfig);
    this.provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    this.provider.register();

    return this.provider.getTracer(this.tracerName);
  }

  public async shutdown(): Promise<void> {
    await this.provider?.shutdown();
  }
}
