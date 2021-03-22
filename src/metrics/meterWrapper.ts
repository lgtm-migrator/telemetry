import {
  MetricOptions,
  ObserverResult,
  BatchObserverResult,
  BoundBaseObserver,
  BoundValueRecorder,
  BoundCounter,
  BatchObserverOptions,
} from '@opentelemetry/api-metrics';
import { Meter as OtelMeter } from '@opentelemetry/metrics';
import { BatchObserver } from '@opentelemetry/metrics/build/src/BatchObserver';

const SERVICE_NAME_KEY = 'serviceName';

export type Labels = Record<string, string>;

export interface Meter {
  createCounter: (name: string, labels?: Labels, options?: MetricOptions) => BoundCounter;
  createValueRecorder: (name: string, labels?: Labels, options?: MetricOptions) => BoundValueRecorder;
  createUpDownCounter: (name: string, labels?: Labels, options?: MetricOptions) => BoundCounter;
  createValueObserver: (
    name: string,
    labels?: Labels,
    options?: MetricOptions,
    callback?: (observerResult: ObserverResult) => unknown
  ) => BoundBaseObserver;
  createSumObserver: (
    name: string,
    labels?: Labels,
    options?: MetricOptions,
    callback?: (observerResult: ObserverResult) => unknown
  ) => BoundBaseObserver;
  createUpDownSumObserver: (
    name: string,
    labels?: Labels,
    options?: MetricOptions,
    callback?: (observerResult: ObserverResult) => unknown
  ) => BoundBaseObserver;
  createBatchObserver: (callback: (observerResult: BatchObserverResult) => void, options?: BatchObserverOptions) => BatchObserver;
}

// its also possible to add service name with constant labels instead
export class MeterWrapper implements Meter {
  public constructor(private readonly meter: OtelMeter, private readonly serviceName: string) {}

  public createValueRecorder(name: string, labels?: Labels, options?: MetricOptions): BoundValueRecorder {
    return this.meter.createValueRecorder(name, options).bind(this.setLabels(labels));
  }

  public createCounter(name: string, labels?: Labels, options?: MetricOptions): BoundCounter {
    return this.meter.createCounter(name, options).bind(this.setLabels(labels));
  }

  public createUpDownCounter(name: string, labels?: Labels, options?: MetricOptions): BoundCounter {
    return this.meter.createUpDownCounter(name, options).bind(this.setLabels(labels));
  }

  public createValueObserver(
    name: string,
    labels?: Labels,
    options?: MetricOptions,
    callback?: (observerResult: ObserverResult) => unknown
  ): BoundBaseObserver {
    return this.meter.createValueObserver(name, options, callback).bind(this.setLabels(labels));
  }

  public createSumObserver(
    name: string,
    labels?: Labels,
    options?: MetricOptions,
    callback?: (observerResult: ObserverResult) => unknown
  ): BoundBaseObserver {
    return this.meter.createSumObserver(name, options, callback).bind(this.setLabels(labels));
  }

  public createUpDownSumObserver(
    name: string,
    labels?: Labels,
    options?: MetricOptions,
    callback?: (observerResult: ObserverResult) => unknown
  ): BoundBaseObserver {
    return this.meter.createUpDownSumObserver(name, options, callback).bind(this.setLabels(labels));
  }

  public createBatchObserver(callback: (observerResult: BatchObserverResult) => void, options?: BatchObserverOptions): BatchObserver {
    return this.meter.createBatchObserver(callback, options);
  }

  private setLabels(labels?: Labels): Labels {
    const serviceNameObject = { [SERVICE_NAME_KEY]: this.serviceName };
    if (!labels) {
      return serviceNameObject;
    }
    return { ...serviceNameObject, ...labels };
  }
}
