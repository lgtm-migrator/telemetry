import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { ParentBasedSampler, TraceIdRatioBasedSampler } from '@opentelemetry/core';
import { getNodeAutoInstrumentations, InstrumentationConfigMap } from '@opentelemetry/auto-instrumentations-node';
import { BatchSpanProcessor, ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { InstrumentationOption, registerInstrumentations } from '@opentelemetry/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import * as api from '@opentelemetry/api';
import { TelemetryBase } from '../common/interfaces';
import { getTracingConfig, TracingConfig } from './config';

export class Tracing implements TelemetryBase<void> {
  private provider?: NodeTracerProvider;
  private readonly config: TracingConfig;
  public constructor(
    private readonly instrumentations?: InstrumentationOption[],
    private readonly autoInstrumentationsConfigMap?: InstrumentationConfigMap,
    private readonly attributes?: api.Attributes,
    private readonly debug?: boolean
  ) {
    this.config = getTracingConfig();
  }

  public start(): void {
    if (!this.config.isEnabled) {
      return;
    }
    const { version, serviceName, traceRatio, ...exporterConfig } = this.config;
    this.provider = new NodeTracerProvider({
      sampler: new ParentBasedSampler({
        root: new TraceIdRatioBasedSampler(traceRatio),
      }),
      resource: new Resource({
        ...{
          [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
          [SemanticResourceAttributes.SERVICE_VERSION]: version,
        },
        ...this.attributes,
      }),
    });

    const exporter = new OTLPTraceExporter(exporterConfig);

    this.provider.addSpanProcessor(new BatchSpanProcessor(exporter));

    if (this.debug === true) {
      api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);
      this.provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
    }

    this.provider.register();

    registerInstrumentations({
      instrumentations: [
        ...(getNodeAutoInstrumentations({
          ...this.autoInstrumentationsConfigMap,
          '@opentelemetry/instrumentation-pino': { enabled: false },
        }) as InstrumentationOption[]),
        ...(this.instrumentations ?? []),
      ],
    });
  }

  public async stop(): Promise<void> {
    await this.provider?.shutdown();
  }
}
