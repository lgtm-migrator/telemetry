import * as api from '@opentelemetry/api';
import { metrics } from '@opentelemetry/api-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { Resource } from '@opentelemetry/resources';
import { ConsoleMetricExporter, MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics-base';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { TelemetryBase } from '../common/interfaces';
import { getMetricsConfig, MetricsConfig } from './config';

export class Metrics implements TelemetryBase<void> {
  private provider?: MeterProvider;
  private readonly config: MetricsConfig;
  public constructor(private readonly attributes?: api.Attributes, private readonly debug?: boolean) {
    this.config = getMetricsConfig();
  }

  public start(): void {
    if (!this.config.isEnabled) {
      return;
    }
    const { version, sendInterval, url, serviceName, hostname } = this.config;

    const exporter = new OTLPMetricExporter({ url });

    this.provider = new MeterProvider({
      resource: new Resource({
        ...{
          [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
          [SemanticResourceAttributes.SERVICE_VERSION]: version,
          [SemanticResourceAttributes.HOST_NAME]: hostname,
        },
        ...this.attributes,
      }),
    });

    this.provider.addMetricReader(new PeriodicExportingMetricReader({ exporter, exportIntervalMillis: sendInterval }));

    if (this.debug === true) {
      api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);
      this.provider.addMetricReader(new PeriodicExportingMetricReader({ exporter: new ConsoleMetricExporter(), exportIntervalMillis: sendInterval }));
    }

    metrics.setGlobalMeterProvider(this.provider);
  }

  public async stop(): Promise<void> {
    await this.provider?.shutdown();
  }
}
