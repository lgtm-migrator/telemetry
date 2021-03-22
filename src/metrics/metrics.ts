import { CollectorMetricExporter } from '@opentelemetry/exporter-collector';
import { MeterProvider, MetricExporter, Meter as OtelMeter } from '@opentelemetry/metrics';
import { TelemetryBase } from '../common/interfaces';
import { Meter, MeterWrapper } from './meterWrapper';
import { getMetricsConfig, MetricsConfig } from './config';

export class Metrics implements TelemetryBase<Meter> {
  private provider?: MeterProvider;
  private meter?: OtelMeter;
  private readonly config: MetricsConfig;
  public constructor(private readonly meterName: string) {
    this.config = getMetricsConfig();
  }

  public start(): Meter {
    const { isEnabled, version, sendInterval, ...exporterConfig } = this.config;

    let exporter: MetricExporter | undefined;

    if (isEnabled) {
      exporter = new CollectorMetricExporter(exporterConfig);
    }
    this.provider = new MeterProvider({ exporter, interval: sendInterval });
    this.meter = this.provider.getMeter(this.meterName);
    return new MeterWrapper(this.meter, exporterConfig.serviceName as string);
  }

  public async stop(): Promise<void> {
    await this.provider?.shutdown();
    await this.meter?.shutdown();
  }
}
